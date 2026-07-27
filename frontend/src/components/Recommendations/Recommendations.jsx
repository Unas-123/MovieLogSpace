import React, { useState } from "react";
import API from "../../api";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import MovieCard from "../common/MovieCard";
import SkeletonGrid from "../common/SkeletonGrid";
import EditModal from "../common/EditModal";
import MovieDetailModal from "../common/MovieDetailModal";

export default function Recommendations() {
  const { favorites, saveFavorite } = useApp();
  const { error } = useToast();
  const [sourceId, setSourceId] = useState("");
  const [results, setResults] = useState([]);
  const [sourceTitle, setSourceTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [editMovie, setEditMovie] = useState(null);

  const loadSimilar = async (fav) => {
    setLoading(true);
    setSourceTitle(fav.title);
    const type = fav.mediaType === "tv" ? "tv" : "movie";
    try {
      const res = await API.get(`/tmdb/${type}/${fav.imdbID}/similar`, {
        params: { title: fav.title },
      });
      setResults(res.data.results || []);
    } catch (err) {
      error(err.response?.data?.error || "Failed to load recommendations");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (e) => {
    const id = e.target.value;
    setSourceId(id);
    const fav = favorites.find((f) => f._id === id);
    if (fav) loadSimilar(fav);
  };

  return (
    <div>
      <p className="text-slate-400 mb-4">
        Pick a movie from your log to see similar titles.
      </p>

      {favorites.length === 0 ? (
        <p className="text-center py-16 text-slate-500">
          Add movies to your log first to get recommendations.
        </p>
      ) : (
        <select
          value={sourceId}
          onChange={handlePick}
          className="w-full max-w-md p-4 rounded-xl bg-slate-900 border border-slate-700 text-white mb-8"
        >
          <option value="">Select a title from your log...</option>
          {favorites.map((f) => (
            <option key={f._id} value={f._id}>
              {f.title} ({f.year}){f.mediaType === "tv" ? " · TV" : ""}
            </option>
          ))}
        </select>
      )}

      {sourceTitle && (
        <h3 className="text-lg font-bold text-cyan-400 mb-4">
          Because you liked &quot;{sourceTitle}&quot;
        </h3>
      )}

      {loading && <SkeletonGrid />}
      {!loading && sourceId && results.length === 0 && (
        <p className="text-center py-12 text-slate-500">
          No similar titles found
        </p>
      )}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              onSave={setEditMovie}
              onDetails={setSelectedMovie}
            />
          ))}
        </div>
      )}

      <MovieDetailModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onAdd={(m) => {
          setSelectedMovie(null);
          setEditMovie(m);
        }}
      />
      <EditModal
        isOpen={!!editMovie}
        onClose={() => setEditMovie(null)}
        movie={editMovie}
        onSave={(fields) => saveFavorite(editMovie, fields)}
      />
    </div>
  );
}
