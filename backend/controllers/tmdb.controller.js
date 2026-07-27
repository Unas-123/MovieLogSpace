const { tmdbFetch, mapSearchResult, mapTrendingResult } = require('../utils/tmdb');

exports.search = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json({ results: [] });

        const data = await tmdbFetch('/search/multi', { query: q });
        const results = (data.results || [])
            .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
            .map(mapSearchResult);

        res.json({ results });
    } catch (err) {
        res.status(502).json({ error: err.message || 'TMDB search failed' });
    }
};

exports.trending = async (req, res) => {
    try {
        const type = req.query.type === 'tv' ? 'tv' : 'movie';
        const data = await tmdbFetch(`/trending/${type}/week`);
        const results = (data.results || []).map((item) => mapTrendingResult(item, type));
        res.json({ results });
    } catch (err) {
        res.status(502).json({ error: err.message || 'TMDB trending failed' });
    }
};

exports.details = async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!['movie', 'tv'].includes(type)) {
            return res.status(400).json({ error: 'Type must be movie or tv' });
        }

        const [details, credits, videos] = await Promise.all([
            tmdbFetch(`/${type}/${id}`),
            tmdbFetch(`/${type}/${id}/credits`).catch(() => ({ cast: [] })),
            tmdbFetch(`/${type}/${id}/videos`).catch(() => ({ results: [] })),
        ]);

        const trailer = (videos.results || []).find(
            (v) => v.site === 'YouTube' && v.type === 'Trailer'
        );

        res.json({
            id: details.id,
            type,
            title: details.title || details.name,
            year: (details.release_date || details.first_air_date || '').split('-')[0] || '',
            poster: details.poster_path
                ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                : null,
            backdrop: details.backdrop_path
                ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
                : null,
            overview: details.overview || '',
            runtime: details.runtime || details.episode_run_time?.[0] || null,
            genres: (details.genres || []).map((g) => g.name),
            rating: details.vote_average,
            cast: (credits.cast || []).slice(0, 12).map((c) => ({
                name: c.name,
                character: c.character,
                profile: c.profile_path
                    ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                    : null,
            })),
            trailerKey: trailer?.key || null,
        });
    } catch (err) {
        res.status(502).json({ error: err.message || 'TMDB details failed' });
    }
};

exports.similar = async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!['movie', 'tv'].includes(type)) {
            return res.status(400).json({ error: 'Type must be movie or tv' });
        }

        const data = await tmdbFetch(`/${type}/${id}/similar`);
        const results = (data.results || [])
            .slice(0, 12)
            .map((item) => mapTrendingResult(item, type));

        res.json({ results, sourceTitle: req.query.title || '' });
    } catch (err) {
        res.status(502).json({ error: err.message || 'TMDB similar failed' });
    }
};
