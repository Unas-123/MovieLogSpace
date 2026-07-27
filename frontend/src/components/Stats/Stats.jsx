import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Stats() {
    const { stats, favorites } = useApp();
    const byStatus = stats.byStatus || {};

    // Prefer API counts; fall back to client-side from favorites if older backend
    const movies =
        stats.movies ??
        favorites.filter((f) => (f.mediaType || 'movie') !== 'tv').length;
    const tv =
        stats.tv ??
        favorites.filter((f) => f.mediaType === 'tv').length;
    const total = stats.total ?? favorites.length;

    const cards = [
        { label: 'Total titles', value: total, color: 'text-cyan-400' },
        { label: 'Movies', value: movies, color: 'text-sky-400' },
        { label: 'TV series', value: tv, color: 'text-violet-400' },
        { label: 'Average rating', value: `${stats.avgRating ?? 0} ★`, color: 'text-yellow-400' },
        { label: 'Planned', value: byStatus.planned ?? 0, color: 'text-purple-400' },
        { label: 'Watching', value: byStatus.watching ?? 0, color: 'text-blue-400' },
        { label: 'Watched', value: byStatus.watched ?? 0, color: 'text-emerald-400' },
    ];

    const ratingCounts = [1, 2, 3, 4, 5].map((r) => ({
        rating: r,
        count: favorites.filter((f) => f.rating === r).length,
    }));
    const maxCount = Math.max(...ratingCounts.map((x) => x.count), 1);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {cards.map((c) => (
                    <div key={c.label} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <p className="text-slate-400 text-sm">{c.label}</p>
                        <p className={`text-4xl font-black mt-2 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-slate-300 mb-4">Rating distribution</h3>
                <div className="space-y-3">
                    {ratingCounts.map(({ rating, count }) => (
                        <div key={rating} className="flex items-center gap-3">
                            <span className="w-12 text-yellow-400">{rating} ★</span>
                            <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500/80 rounded-full transition-all"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                            </div>
                            <span className="w-8 text-slate-400 text-sm">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {total === 0 && (
                <p className="text-center py-12 text-slate-500 mt-8">
                    Add movies or series to see your stats grow
                </p>
            )}
        </div>
    );
}