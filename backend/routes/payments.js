const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// POST /api/payments/checkout - Process payment
router.post('/checkout', protect, async (req, res) => {
  try {
    const { courseId, couponCode, paymentMethod } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let amount = course.price;
    let discountAmount = 0;
    let couponApplied = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });
      if (coupon.expiryDate < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });
      if (amount < coupon.minPurchase) return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} required` });
      
      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      } else {
        discountAmount = coupon.discountValue;
      }
      amount = Math.max(0, amount - discountAmount);
      couponApplied = coupon._id;
      coupon.usedCount += 1;
      await coupon.save();
    }

    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount,
      paymentMethod: paymentMethod || 'card',
      status: 'completed', // Simulated payment success
      transactionId: uuidv4(),
      couponApplied,
      discountAmount
    });

    // Enroll user in course
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });

    res.status(201).json({ message: 'Payment successful', payment, transactionId: payment.transactionId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments - Admin: get all payments
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('course', 'title price')
      .populate('couponApplied', 'code')
      .sort('-createdAt');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/my - User: get my payments
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('course', 'title thumbnail price')
      .sort('-createdAt');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/stats - Admin: payment stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    const recentPayments = await Payment.find({ status: 'completed' })
      .populate('user', 'name').populate('course', 'title')
      .sort('-createdAt').limit(5);
    res.json({ totalRevenue: totalRevenue[0]?.total || 0, totalPayments, recentPayments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
