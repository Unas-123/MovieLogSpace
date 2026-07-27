export const POSTER_PLACEHOLDER =
    'data:image/svg+xml,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect fill="#1e293b" width="300" height="450"/>
      <text x="150" y="220" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="48">🎬</text>
      <text x="150" y="260" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">No poster</text>
    </svg>`
    );

export function getPosterUrl(poster) {
    if (!poster || poster === 'N/A' || poster === 'null') return POSTER_PLACEHOLDER;
    return poster;
}

export function normalizeMovie(movie) {
    if (!movie) return null;
    return {
        imdbID: movie.imdbID || String(movie.id),
        Title: movie.Title || movie.title,
        Year: movie.Year || movie.year || '',
        Poster: getPosterUrl(movie.Poster || movie.poster),
        Type: movie.Type || movie.type || 'movie',
        overview: movie.overview || '',
    };
}

export function favoriteToMovie(fav) {
    return {
        imdbID: fav.imdbID,
        Title: fav.title,
        Year: fav.year,
        Poster: getPosterUrl(fav.poster),
        Type: fav.mediaType === 'tv' ? 'tv' : 'movie',
    };
}

export const STATUS_OPTIONS = [
    { value: 'planned', label: 'Planned' },
    { value: 'watching', label: 'Watching' },
    { value: 'watched', label: 'Watched' },
];

export const DEFAULT_REVIEW = {
    rating: 5,
    notes: '',
    status: 'watched',
    tags: [],
    watchDate: '',
};
