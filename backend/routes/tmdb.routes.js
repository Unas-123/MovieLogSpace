const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    search,
    trending,
    details,
    similar,
} = require('../controllers/tmdb.controller');

router.get('/search', authMiddleware, search);
router.get('/trending', authMiddleware, trending);
router.get('/:type/:id/details', authMiddleware, details);
router.get('/:type/:id/similar', authMiddleware, similar);

module.exports = router;
