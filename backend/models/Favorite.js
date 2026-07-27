const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    year: String,
    poster: String,
    
    imdbID: { type: String, required: true },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        default: 'movie',
    },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    notes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['planned', 'watching', 'watched'],
        default: 'watched',
    },
    watchDate: Date,
    tags: [{ type: String }],
}, { timestamps: true });

FavoriteSchema.index({ userId: 1, imdbID: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);