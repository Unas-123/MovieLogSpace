const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require('mongoose');

dotenv.config();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movieDB')
    .then(() => console.log('🍃 MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/favorites', require('./routes/favorite.routes'));
app.use('/api/tmdb', require('./routes/tmdb.routes'));
app.use('/api/public', require('./routes/public.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'Server is running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
