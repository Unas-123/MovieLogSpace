import React from 'react';
import MoviePoster from './MoviePoster';
import { useApp } from '../../context/AppContext';

export default function MovieCard({ movie, onSave, onDetails, showSave = true }) {
    const { favoriteIds } = useApp();
    const inLog = favoriteIds.has(movie.imdbID);

    return (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition group">
            <div className="relative">
                <MoviePoster
                    src={movie.Poster}
                    alt={movie.Title}
                    className="w-full aspect-2/3 object-cover"
                />
                {inLog && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold bg-emerald-500/90 text-slate-950 rounded-lg">
                        In log
                    </span>
                )}
            </div>
            <div className="p-4">
                <h4 className="font-bold line-clamp-2">{movie.Title}</h4>
                <p className="text-slate-400 text-sm mt-1">
                    {movie.Year}{movie.Type ? ` • ${movie.Type}` : ''}
                </p>
                <div className="flex gap-2 mt-4">
                    {showSave && (
                        <button
                            onClick={() => onSave(movie)}
                            className={`flex-1 py-2 font-bold rounded-lg text-sm transition ${
                                inLog
                                    ? 'bg-slate-800 text-slate-400 cursor-default'
                                    : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950'
                            }`}
                            disabled={inLog}
                        >
                            {inLog ? '✓ Saved' : '❤️ Save'}
                        </button>
                    )}
                    <button
                        onClick={() => onDetails(movie)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm"
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
}
