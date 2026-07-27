const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    signup,
    login,
    refresh,
    logout,
    getProfile,
    updateShareSettings,
} = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.patch('/share', authMiddleware, updateShareSettings);

module.exports = router;
