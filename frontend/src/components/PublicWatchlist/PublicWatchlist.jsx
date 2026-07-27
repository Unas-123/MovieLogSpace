import React, { useState, useEffect } from "react";
import axios from "axios";
import MoviePoster from "../common/MoviePoster";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PublicWatchlist({ shareId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/public/watchlist/${shareId}`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Watchlist not found"),
      )
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <p className="text-center py-20 text-slate-400">Loading watchlist...</p>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">
        {data.username}&apos;s watchlist
      </h2>
      <p className="text-slate-500 mb-8">
        {data.favorites.length} titles · read-only
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.favorites.map((fav) => (
          <div
            key={fav._id}
            className="bg-slate-900 rounded-xl p-4 border border-slate-800"
          >
            <MoviePoster
              src={fav.poster}
              alt={fav.title}
              className="w-full aspect-2/3 object-cover rounded-lg mb-3"
            />
            <h4 className="font-bold">{fav.title}</h4>
            <p className="text-slate-400 text-sm capitalize">
              {fav.year} • {fav.mediaType === "tv" ? "TV" : "Movie"} •{" "}
              {fav.status}
            </p>
            <p className="text-yellow-400 text-sm">
              {"★".repeat(fav.rating || 0)}
            </p>
            {fav.notes && (
              <p className="text-sm mt-2 text-slate-400 line-clamp-2">
                {fav.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
