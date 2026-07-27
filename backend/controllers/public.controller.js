const User = require('../models/User');
const Favorite = require('../models/Favorite');

exports.getPublicWatchlist = async (req, res) => {
    try {
        const user = await User.findOne({ shareId: req.params.shareId }).select('username publicListEnabled shareId');
        if (!user || !user.publicListEnabled) {
            return res.status(404).json({ error: 'Watchlist not found or is private' });
        }

        const favorites = await Favorite.find({ userId: user._id })
            .select('title year poster imdbID mediaType rating status notes tags watchDate createdAt')
            .sort({ createdAt: -1 });

        res.json({
            username: user.username,
            shareId: user.shareId,
            favorites,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load public watchlist' });
    }
};