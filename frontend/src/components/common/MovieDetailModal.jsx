import React, { useState, useEffect } from 'react';
import API from '../../api';
import MoviePoster from './MoviePoster';
import SkeletonGrid from './SkeletonGrid';

export default function MovieDetailModal({ movie, isOpen, onClose, onAdd }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !movie) return;
        setLoading(true);
        const type = movie.Type === 'tv' ? 'tv' : 'movie';
        API.get(`/tmdb/${type}/${movie.imdbID}/details`)
            .then((res) => setDetails(res.data))
            .catch(() => setDetails(null))
            .finally(() => setLoading(false));
    }, [isOpen, movie]);

    if (!isOpen || !movie) return null;

    const trailerUrl = details?.trailerKey
        ? `https://www.youtube.com/watch?v=${details.trailerKey}`
        : null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {loading ? (
                    <div className="p-8"><SkeletonGrid count={1} /></div>
                ) : (
                    <>
                        {details?.backdrop && (
                            <div
                                className="h-40 bg-cover bg-center rounded-t-2xl opacity-60"
                                style={{ backgroundImage: `url(${details.backdrop})` }}
                            />
                        )}
                        <div className="p-6 -mt-8 relative">
                            <div className="flex gap-4">
                                <MoviePoster
                                    src={details?.poster || movie.Poster}
                                    alt={movie.Title}
                                    className="w-28 h-42 object-cover rounded-xl border-2 border-slate-800 shadow-xl"
                                />
                                <div className="pt-8">
                                    <h2 className="text-2xl font-black">{details?.title || movie.Title}</h2>
                                    <p className="text-slate-400 mt-1">
                                        {details?.year || movie.Year}
                                        {details?.runtime ? ` • ${details.runtime} min` : ''}
                                        {details?.rating ? ` • ★ ${details.rating.toFixed(1)}` : ''}
                                    </p>
                                    {details?.genres?.length > 0 && (
                                        <p className="text-cyan-400/80 text-sm mt-2">{details.genres.join(' • ')}</p>
                                    )}
                                </div>
                            </div>

                            {details?.overview && (
                                <p className="mt-6 text-slate-300 leading-relaxed">{details.overview}</p>
                            )}

                            {trailerUrl && (
                                <a
                                    href={trailerUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-4 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/40"
                                >
                                    ▶ Watch trailer on YouTube
                                </a>
                            )}

                            {details?.cast?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-bold text-slate-400 mb-3">Cast</h3>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {details.cast.map((c) => (
                                            <div key={c.name} className="shrink-0 w-20 text-center">
                                                {c.profile ? (
                                                    <img src={c.profile} alt={c.name} className="w-16 h-16 rounded-full object-cover mx-auto" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-xl">👤</div>
                                                )}
                                                <p className="text-xs mt-1 font-medium truncate">{c.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{c.character}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <button onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl hover:bg-slate-700">
                                    Close
                                </button>
                                {onAdd && (
                                    <button
                                        onClick={() => onAdd(movie)}
                                        className="flex-1 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-600"
                                    >
                                        Add to log
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
