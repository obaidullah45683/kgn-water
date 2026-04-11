// routes/coupons.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/auth');

// ─────────────────────────────────────────
// PUBLIC: Validate a coupon code
// POST /api/coupons/validate
// ─────────────────────────────────────────
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required.' });

    const [rows] = await db.query(
      'SELECT * FROM coupons WHERE code = ? AND active = 1', [code.toUpperCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const coupon = rows[0];

    // Check usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        description: coupon.description
      }
    });

  } catch (err) {
    console.error('POST /coupons/validate error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Get all coupons
// GET /api/coupons
// ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return res.json({ success: true, coupons });
  } catch (err) {
    console.error('GET /coupons error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Create a coupon
// POST /api/coupons
// ─────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { code, discount, description, max_uses, expires_at } = req.body;

    if (!code || !discount) {
      return res.status(400).json({ success: false, message: 'Code and discount are required.' });
    }
    if (discount < 1 || discount > 100) {
      return res.status(400).json({ success: false, message: 'Discount must be between 1 and 100.' });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate
    const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    await db.query(
      'INSERT INTO coupons (code, discount, description, max_uses, expires_at) VALUES (?, ?, ?, ?, ?)',
      [cleanCode, discount, description || null, max_uses || null, expires_at || null]
    );

    return res.status(201).json({ success: true, message: 'Coupon created successfully.' });

  } catch (err) {
    console.error('POST /coupons error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Toggle coupon active/inactive
// PATCH /api/coupons/:id/toggle
// ─────────────────────────────────────────
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    await db.query('UPDATE coupons SET active = NOT active WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Coupon status updated.' });
  } catch (err) {
    console.error('PATCH /coupons toggle error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────
// ADMIN: Delete a coupon
// DELETE /api/coupons/:id
// ─────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    return res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    console.error('DELETE /coupons error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
