// routes/products.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/auth');

// ─────────────────────────────────────────
// PUBLIC: Get all available products
// GET /api/products
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT id, name, description, price, unit FROM products WHERE available = 1 ORDER BY id ASC'
    );
    return res.json({ success: true, products });
  } catch (err) {
    console.error('GET /products error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Get stats summary
// GET /api/products/stats
// ─────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const [[{ total_orders }]]   = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ pending }]]        = await db.query("SELECT COUNT(*) as pending FROM orders WHERE status = 'new'");
    const [[{ total_revenue }]]  = await db.query("SELECT COALESCE(SUM(total),0) as total_revenue FROM orders WHERE status != 'cancelled'");
    const [[{ today_orders }]]   = await db.query("SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = CURDATE()");

    return res.json({
      success: true,
      stats: { total_orders, pending, total_revenue, today_orders }
    });
  } catch (err) {
    console.error('GET /products/stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Add a new product
// POST /api/products
// ─────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, unit } = req.body;
    if (!name || !price || !unit) {
      return res.status(400).json({ success: false, message: 'Name, price, and unit are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO products (name, description, price, unit) VALUES (?, ?, ?, ?)',
      [name, description || null, price, unit]
    );

    return res.status(201).json({ success: true, message: 'Product added.', id: result.insertId });
  } catch (err) {
    console.error('POST /products error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Toggle product availability
// PATCH /api/products/:id/toggle
// ─────────────────────────────────────────
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    await db.query('UPDATE products SET available = NOT available WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Product availability updated.' });
  } catch (err) {
    console.error('PATCH /products toggle error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
