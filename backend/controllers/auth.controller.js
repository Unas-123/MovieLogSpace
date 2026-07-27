const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signAccessToken, signRefreshToken, hashToken, JWT_SECRET } = require('../utils/tokens');

async function ensureShareId(user) {
    if (!user.shareId) {
        const crypto = require('crypto');
        user.shareId = crypto.randomBytes(8).toString('hex');
    }
}

async function issueTokens(user) {
    await ensureShareId(user);
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    return { token, refreshToken, username: user.username, shareId: user.shareId, publicListEnabled: user.publicListEnabled };
}

exports.signup = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password || password.length < 6) {
            return res.status(400).json({ error: 'Username and password (min 6 chars) required' });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) return res.status(400).json({ error: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username: username.toLowerCase(), password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Account created successfully! Please log in.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during signup' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const tokens = await issueTokens(user);
        res.json(tokens);
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const payload = jwt.verify(refreshToken, JWT_SECRET);
        if (payload.type !== 'refresh') {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const user = await User.findById(payload.userId);
        if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
            return res.status(403).json({ error: 'Invalid or revoked refresh token' });
        }

        const tokens = await issueTokens(user);
        res.json(tokens);
    } catch (err) {
        res.status(403).json({ error: 'Session expired. Please log in again.' });
    }
};

exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user) {
            user.refreshTokenHash = null;
            await user.save();
        }
        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('username shareId publicListEnabled');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            username: user.username,
            shareId: user.shareId,
            publicListEnabled: user.publicListEnabled,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load profile' });
    }
};

exports.updateShareSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (typeof req.body.publicListEnabled === 'boolean') {
            user.publicListEnabled = req.body.publicListEnabled;
        }
        if (req.body.regenerateShareId) {
            const crypto = require('crypto');
            user.shareId = crypto.randomBytes(8).toString('hex');
        }
        await user.save();

        res.json({
            shareId: user.shareId,
            publicListEnabled: user.publicListEnabled,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update share settings' });
    }
};
