const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: '🚀 CCMS API is running' });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════');
});