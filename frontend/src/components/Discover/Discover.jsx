import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import MovieCard from '../common/MovieCard';
import SkeletonGrid from '../common/SkeletonGrid';
import EditModal from '../common/EditModal';
import MovieDetailModal from '../common/MovieDetailModal';

export default function Discover() {
    const { saveFavorite, backendOnline, token } = useApp();
    const { error } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [editMovie, setEditMovie] = useState(null);

    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setMovies([]);
            return;
        }

        const timeout = setTimeout(async () => {
            if (!backendOnline) {
                error('Backend offline. Start the server and try again.');
                return;
            }
            if (!token) {
                error('Login required to search movies.');
                return;
            }
            setSearchLoading(true);
            try {
                const res = await API.get('/tmdb/search', { params: { q } });
                setMovies(res.data.results || []);
            } catch (err) {
                error(err.response?.data?.error || 'Search failed');
                setMovies([]);
            } finally {
                setSearchLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery, backendOnline, token]);

    const handleSaveClick = (movie) => setEditMovie(movie);

    const handleSave = async (fields) => {
        if (!editMovie) return false;
        return saveFavorite(editMovie, fields);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search movies or TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-5 text-lg bg-slate-900 border border-slate-700 rounded-3xl focus:ring-2 focus:ring-cyan-500 outline-none mb-8"
            />

            {!searchQuery.trim() && (
                <p className="text-center py-16 text-slate-500">Start typing to search </p>
            )}

            {searchLoading && <SkeletonGrid />}

            {!searchLoading && searchQuery.trim() && movies.length === 0 && (
                <p className="text-center py-16 text-slate-500">No results found</p>
            )}

            {!searchLoading && movies.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                        <MovieCard
                            key={`${movie.Type}-${movie.imdbID}`}
                            movie={movie}
                            onSave={handleSaveClick}
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
                onSave={handleSave}
            />
        </div>
    );
}
