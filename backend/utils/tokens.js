const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_123_CHANGE_IN_PRODUCTION';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

function signAccessToken(user) {
    return jwt.sign(
        { userId: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES }
    );
}

function signRefreshToken(user) {
    return jwt.sign(
        { userId: user._id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRES }
    );
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    JWT_SECRET,
    signAccessToken,
    signRefreshToken,
    hashToken,
};
