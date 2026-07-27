const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    getFavorites,
    addFavorite,
    updateFavorite,
    deleteFavorite,
    getStats,
} = require('../controllers/favorite.controller');

router.get('/stats', authMiddleware, getStats);
router.get('/', authMiddleware, getFavorites);
router.post('/', authMiddleware, addFavorite);
router.patch('/:id', authMiddleware, updateFavorite);
router.delete('/:id', authMiddleware, deleteFavorite);

module.exports = router;
