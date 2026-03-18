// server.js - KGN Waters Backend
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(cors({
  origin: '*', // In production: set to your frontend domain
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Stricter limit for order placement
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many orders. Please try again in 15 minutes.' }
});

app.use('/api/', limiter);
app.use('/api/orders', orderLimiter);

// ─────────────────────────────────────────
// Serve static frontend files
// ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/products', require('./routes/products'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KGN Waters API is running 🚰' });
});

// ─────────────────────────────────────────
// Serve frontend pages
// ─────────────────────────────────────────
app.get('/',       (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/admin',  (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin.html')));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚰 KGN Waters server running at http://localhost:${PORT}`);
  console.log(`   Frontend : http://localhost:${PORT}/`);
  console.log(`   Admin    : http://localhost:${PORT}/admin`);
  console.log(`   API      : http://localhost:${PORT}/api/health\n`);
});
