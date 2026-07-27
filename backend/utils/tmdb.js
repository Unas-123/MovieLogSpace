const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdbFetch(path, params = {}) {
    const key = process.env.TMDB_API_KEY;
    if (!key) throw new Error('TMDB_API_KEY is not configured on the server');

    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set('api_key', key);
    Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== '') url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString());
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TMDB error ${res.status}: ${text}`);
    }
    return res.json();
}

function mapSearchResult(item) {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    return {
        imdbID: String(item.id),
        Title: item.title || item.name,
        Year: (item.release_date || item.first_air_date || '').split('-')[0] || '',
        Poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        Type: type,
        overview: item.overview || '',
    };
}

function mapTrendingResult(item, mediaType) {
    const type = mediaType || (item.title ? 'movie' : 'tv');
    return {
        imdbID: String(item.id),
        Title: item.title || item.name,
        Year: (item.release_date || item.first_air_date || '').split('-')[0] || '',
        Poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        Type: type,
        overview: item.overview || '',
    };
}

module.exports = { tmdbFetch, mapSearchResult, mapTrendingResult };
