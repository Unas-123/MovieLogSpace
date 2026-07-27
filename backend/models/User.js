const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    refreshTokenHash: { type: String, default: null },
    shareId: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(8).toString('hex'),
    },
    publicListEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
