import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import MoviePoster from '../common/MoviePoster';
import EditModal from '../common/EditModal';
import SkeletonGrid from '../common/SkeletonGrid';
import { STATUS_OPTIONS } from '../../utils/movie';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Date added (newest)' },
    { value: 'oldest', label: 'Date added (oldest)' },
    { value: 'rating-high', label: 'Rating (high)' },
    { value: 'rating-low', label: 'Rating (low)' },
    { value: 'year', label: 'Year' },
    { value: 'title', label: 'Title A–Z' },
];

export default function MyLog() {
    const { favorites, loadingFavorites, updateFavorite, deleteFavorite } = useApp();
    const [statusFilter, setStatusFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [editingFavorite, setEditingFavorite] = useState(null);

    const allTags = useMemo(() => {
        const tags = new Set();
        favorites.forEach((f) => (f.tags || []).forEach((t) => tags.add(t)));
        return [...tags].sort();
    }, [favorites]);

    const filtered = useMemo(() => {
        let list = [...favorites];
        if (statusFilter !== 'all') {
            list = list.filter((f) => f.status === statusFilter);
        }
        if (tagFilter) {
            list = list.filter((f) => (f.tags || []).includes(tagFilter));
        }
        list.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'rating-high':
                    return (b.rating || 0) - (a.rating || 0);
                case 'rating-low':
                    return (a.rating || 0) - (b.rating || 0);
                case 'year':
                    return (b.year || '').localeCompare(a.year || '');
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        return list;
    }, [favorites, statusFilter, tagFilter, sortBy]);

    const handleDelete = async (id) => {
        if (!confirm('Remove this movie from your log?')) return;
        await deleteFavorite(id);
    };

    if (loadingFavorites) return <SkeletonGrid />;

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                    <option value="">All tags</option>
                    {allTags.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {favorites.length === 0 && (
                <p className="text-center py-20 text-slate-400">
                    No movies yet. Discover trending titles or search to build your log!
                </p>
            )}

            {favorites.length > 0 && filtered.length === 0 && (
                <p className="text-center py-16 text-slate-500">No movies match your filters</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map((fav) => (
                    <div key={fav._id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                        <MoviePoster src={fav.poster} alt={fav.title} className="w-full aspect-2/3 object-cover rounded-lg mb-3" />
                        <h4 className="font-bold text-lg line-clamp-2">{fav.title}</h4>
                        <p className="text-slate-400 text-sm capitalize">{fav.year} • {fav.mediaType === 'tv' ? 'TV' : 'Movie'} • {fav.status}</p>
                        <p className="text-yellow-400 text-sm">{'★'.repeat(fav.rating || 0)}</p>
                        {fav.watchDate && (
                            <p className="text-xs text-slate-500 mt-1">
                                Watched {new Date(fav.watchDate).toLocaleDateString()}
                            </p>
                        )}
                        {(fav.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {fav.tags.map((t) => (
                                    <span key={t} className="text-xs px-2 py-0.5 bg-slate-800 rounded text-cyan-300">{t}</span>
                                ))}
                            </div>
                        )}
                        {fav.notes && <p className="text-sm mt-2 text-slate-300 line-clamp-2">&quot;{fav.notes}&quot;</p>}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setEditingFavorite(fav)}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(fav._id)}
                                className="flex-1 py-2 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/10"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <EditModal
                isOpen={!!editingFavorite}
                onClose={() => setEditingFavorite(null)}
                favorite={editingFavorite}
                onSave={(fields) => updateFavorite(editingFavorite._id, fields)}
            />
        </div>
    );
}
