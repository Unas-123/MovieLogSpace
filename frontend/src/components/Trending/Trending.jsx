import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import MovieCard from '../common/MovieCard';
import SkeletonGrid from '../common/SkeletonGrid';
import EditModal from '../common/EditModal';
import MovieDetailModal from '../common/MovieDetailModal';

export default function Trending() {
    const { saveFavorite, backendOnline, token } = useApp();
    const { error } = useToast();
    const [mediaType, setMediaType] = useState('movie');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [editMovie, setEditMovie] = useState(null);

    useEffect(() => {
        if (!token || !backendOnline) {
            setLoading(false);
            return;
        }
        setLoading(true);
        API.get('/tmdb/trending', { params: { type: mediaType } })
            .then((res) => setMovies(res.data.results || []))
            .catch((err) => error(err.response?.data?.error || 'Failed to load trending'))
            .finally(() => setLoading(false));
    }, [mediaType, token, backendOnline]);

    return (
        <div>
            <div className="flex gap-2 mb-6">
                {['movie', 'tv'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setMediaType(t)}
                        className={`px-4 py-2 rounded-xl font-medium ${
                            mediaType === t ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        {t === 'movie' ? 'Movies' : 'TV Shows'}
                    </button>
                ))}
            </div>

            <p className="text-slate-500 mb-6">Popular this week</p>

            {loading && <SkeletonGrid />}
            {!loading && movies.length === 0 && (
                <p className="text-center py-16 text-slate-500">Could not load trending titles</p>
            )}
            {!loading && movies.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                        <MovieCard
                            key={`${movie.imdbID}-${mediaType}`}
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
                onAdd={(m) => { setSelectedMovie(null); setEditMovie(m); }}
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
