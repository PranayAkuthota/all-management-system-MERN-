const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/coupons - Admin: create coupon
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/coupons - Admin: get all coupons
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('createdBy', 'name').sort('-createdAt');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons/validate - Validate coupon (public)
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, courseId, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found or inactive' });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Usage limit reached' });
    if (amount < coupon.minPurchase) return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} required` });
    
    let discountAmount = coupon.discountType === 'percentage'
      ? (amount * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    
    res.json({ valid: true, coupon, discountAmount, finalAmount: Math.max(0, amount - discountAmount) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/coupons/:id - Admin: update coupon
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/coupons/:id - Admin: delete coupon
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
