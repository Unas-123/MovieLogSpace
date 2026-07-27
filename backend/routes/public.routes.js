const express = require('express');
const router = express.Router();
const { getPublicWatchlist } = require('../controllers/public.controller');

router.get('/watchlist/:shareId', getPublicWatchlist);

module.exports = router;
