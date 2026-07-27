const Favorite = require('../models/Favorite');

exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const { title, year, poster, imdbID, rating, notes, status, tags, watchDate, mediaType } = req.body;

        if (!title || !imdbID) {
            return res.status(400).json({ error: 'Title and media ID are required' });
        }

        const type = mediaType === 'tv' ? 'tv' : 'movie';

        const existing = await Favorite.findOne({ userId: req.user.userId, imdbID });
        if (existing) {
            return res.status(400).json({ error: 'Title already in your favorites' });
        }

        const newFav = new Favorite({
            userId: req.user.userId,
            title,
            year,
            poster,
            imdbID,
            mediaType: type,
            rating: Number(rating) || 5,
            notes: notes || '',
            status: status || 'watched',
            tags: Array.isArray(tags) ? tags : [],
            watchDate: watchDate ? new Date(watchDate) : undefined,
        });

        await newFav.save();
        res.status(201).json(newFav);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Title already in your favorites' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.updateFavorite = async (req, res) => {
    try {
        const { rating, notes, status, watchDate, tags } = req.body;
        const update = {};
        if (rating !== undefined) update.rating = rating;
        if (notes !== undefined) update.notes = notes;
        if (status !== undefined) update.status = status;
        if (tags !== undefined) update.tags = tags;
        if (watchDate !== undefined) {
            update.watchDate = watchDate ? new Date(watchDate) : null;
        }

        const updated = await Favorite.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: update },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: 'Favorite not found or unauthorized' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update favorite' });
    }
};

exports.deleteFavorite = async (req, res) => {
    try {
        const deleted = await Favorite.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deleted) return res.status(404).json({ error: 'Favorite not found or unauthorized' });
        res.json({ message: 'Successfully removed from favorites' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete favorite' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.userId });

        const total = favorites.length;
        const movies = favorites.filter((f) => (f.mediaType || 'movie') !== 'tv').length;
        const tv = favorites.filter((f) => f.mediaType === 'tv').length;
        const avgRating = total ? (favorites.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1) : 0;

        const byStatus = {
            planned: favorites.filter(f => f.status === 'planned').length,
            watching: favorites.filter(f => f.status === 'watching').length,
            watched: favorites.filter(f => f.status === 'watched').length
        };

        res.json({ total, movies, tv, avgRating, byStatus });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};