import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import API, {
  checkBackendHealth,
  clearStoredAuth,
  setStoredAuth,
} from "../api";
import { useToast } from "./ToastContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { success, error, info } = useToast();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
  const [shareId, setShareId] = useState(localStorage.getItem("shareId") || "");
  const [publicListEnabled, setPublicListEnabled] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, byStatus: {} });
  const [backendOnline, setBackendOnline] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const favoriteIds = new Set(favorites.map((f) => f.imdbID));

  const checkHealth = useCallback(async () => {
    const ok = await checkBackendHealth();
    setBackendOnline(ok);
    return ok;
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setLoadingFavorites(true);
    try {
      const [favRes, statsRes] = await Promise.all([
        API.get("/favorites"),
        API.get("/favorites/stats"),
      ]);
      setFavorites(favRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        error("Session expired. Please log in again.");
      } else {
        error("Could not load your movie log.");
      }
    } finally {
      setLoadingFavorites(false);
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get("/auth/profile");
      setShareId(res.data.shareId);
      setPublicListEnabled(res.data.publicListEnabled);
      localStorage.setItem("shareId", res.data.shareId);
    } catch {
      /* profile optional on first load */
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleLogout = useCallback(async () => {
    try {
      if (token) await API.post("/auth/logout");
    } catch {
      /* ignore */
    }
    clearStoredAuth();
    setToken("");
    setUsername("");
    setShareId("");
    setFavorites([]);
    setStats({ total: 0, avgRating: 0, byStatus: {} });
    info("Logged out");
  }, [token, info]);

  const logoutRef = useRef(handleLogout);
  logoutRef.current = handleLogout;

  useEffect(() => {
    const onLogout = () => logoutRef.current();
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  useEffect(() => {
    if (token) {
      fetchFavorites();
      fetchProfile();
    }
  }, [token, fetchFavorites, fetchProfile]);

  const handleLogin = (data) => {
    setStoredAuth(data);
    setToken(data.token);
    setUsername(data.username);
    if (data.shareId) {
      setShareId(data.shareId);
      localStorage.setItem("shareId", data.shareId);
    }
    setPublicListEnabled(data.publicListEnabled ?? true);
    success(`Welcome back, ${data.username}!`);
  };

  const saveFavorite = async (movie, fields) => {
    if (!token) {
      error("Login required to save movies.");
      return false;
    }
    if (!backendOnline) {
      error("Backend offline. Start the server and try again.");
      return false;
    }
    if (favoriteIds.has(movie.imdbID)) {
      info("This title is already in your log. Open My Log to edit it.");
      return false;
    }
    try {
      await API.post("/favorites", {
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster?.startsWith?.("data:") ? "" : movie.Poster || "",
        imdbID: movie.imdbID,
        mediaType: movie.Type === "tv" ? "tv" : "movie",
        rating: fields.rating,
        notes: fields.notes,
        status: fields.status,
        tags: fields.tags || [],
        watchDate: fields.watchDate || undefined,
      });
      await fetchFavorites();
      success("Added to your movie log!");
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save";
      if (msg.toLowerCase().includes("already")) {
        info("Already in your log — check My Log to update it.");
      } else {
        error(msg);
      }
      return false;
    }
  };

  const updateFavorite = async (id, fields) => {
    try {
      await API.patch(`/favorites/${id}`, fields);
      await fetchFavorites();
      success("Updated successfully!");
      return true;
    } catch (err) {
      error(err.response?.data?.error || "Failed to update");
      return false;
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await API.delete(`/favorites/${id}`);
      await fetchFavorites();
      success("Removed from your log");
      return true;
    } catch (err) {
      error("Failed to delete");
      return false;
    }
  };

  const updateShareSettings = async (payload) => {
    try {
      const res = await API.patch("/auth/share", payload);
      setShareId(res.data.shareId);
      setPublicListEnabled(res.data.publicListEnabled);
      localStorage.setItem("shareId", res.data.shareId);
      success("Share settings updated");
      return res.data;
    } catch (err) {
      error(err.response?.data?.error || "Failed to update share settings");
      return null;
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Year",
      "Type",
      "Rating",
      "Status",
      "Tags",
      "Notes",
      "Watch Date",
      "Added",
    ];
    const rows = favorites.map((f) => [
      f.title,
      f.year,
      f.mediaType || "movie",
      f.rating,
      f.status,
      (f.tags || []).join(";"),
      f.notes || "",
      f.watchDate ? new Date(f.watchDate).toLocaleDateString() : "",
      new Date(f.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movie-log-${username}.csv`;
    a.click();
    success("CSV exported");
  };

  return (
    <AppContext.Provider
      value={{
        token,
        username,
        shareId,
        publicListEnabled,
        favorites,
        stats,
        favoriteIds,
        backendOnline,
        loadingFavorites,
        handleLogin,
        handleLogout,
        fetchFavorites,
        saveFavorite,
        updateFavorite,
        deleteFavorite,
        updateShareSettings,
        exportToCSV,
        checkHealth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
