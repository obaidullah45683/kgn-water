// routes/orders.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/auth');

// ─────────────────────────────────────────
// PUBLIC: Place a new order
// POST /api/orders
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { customer_name, phone, address, product_id, quantity, notes } = req.body;

    // Validation
    if (!customer_name || !phone || !address || !product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (quantity < 1 || quantity > 100) {
      return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 100.' });
    }

    // Fetch product details
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND available = 1', [product_id]
    );
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }
    const product = products[0];

    // Generate unique order ID
    const orderId = 'KGN' + Date.now().toString().slice(-7);
    const total   = product.price * quantity;

    // Insert order
    await db.query(
      `INSERT INTO orders (order_id, customer_name, phone, address, product_id, product_name, quantity, unit_price, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, customer_name, phone, address, product_id, product.name, quantity, product.price, total, notes || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: { order_id: orderId, product: product.name, quantity, total }
    });

  } catch (err) {
    console.error('POST /orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Get all orders (with filters)
// GET /api/orders?status=new&page=1&limit=20
// ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = [];
    let params = [];

    if (status && ['new','processing','delivered','cancelled'].includes(status)) {
      where.push('status = ?');
      params.push(status);
    }
    if (search) {
      where.push('(customer_name LIKE ? OR phone LIKE ? OR order_id LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [orders] = await db.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`, params
    );

    return res.json({ success: true, orders, total, page: parseInt(page), limit: parseInt(limit) });

  } catch (err) {
    console.error('GET /orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Update order status
// PATCH /api/orders/:id/status
// ─────────────────────────────────────────
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'processing', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, message: `Order marked as ${status}.` });

  } catch (err) {
    console.error('PATCH /orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Delete an order
// DELETE /api/orders/:id
// ─────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, message: 'Order deleted.' });

  } catch (err) {
    console.error('DELETE /orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
