const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const {
    getPartnerProfile,
    updatePartnerProfile,
    getPartnerEarnings,
    getPartnerDashboard,
    updateAvailability
} = require('../../controllers/urban-services/servicePartnerController');
const ServiceBooking = require('../../models/urban-services/serviceBooking');
const ServicePartner = require('../../models/urban-services/servicePartner');

// @desc    Get partner statistics
// @route   GET /api/urban-services/partner/stats
// @access  Private/Partner
router.get('/stats', protect, async (req, res) => {
    try {
        const partner = await ServicePartner.findOne({ user: req.user._id });

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const totalBookings = await ServiceBooking.countDocuments({ partner: partner._id });
        const completedBookings = await ServiceBooking.countDocuments({
            partner: partner._id,
            status: 'completed'
        });
        const pendingBookings = await ServiceBooking.countDocuments({
            partner: partner._id,
            status: { $in: ['pending', 'accepted', 'in_progress', 'on_the_way'] }
        });

        // Calculate earnings (you can adjust this based on your pricing model)
        const completedBookingsWithPricing = await ServiceBooking.find({
            partner: partner._id,
            status: 'completed'
        }).select('pricing');

        const totalEarnings = completedBookingsWithPricing.reduce((sum, booking) => {
            return sum + (booking.pricing?.totalAmount || booking.pricing?.amount || 0);
        }, 0);

        // Today's earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayBookings = await ServiceBooking.find({
            partner: partner._id,
            status: 'completed',
            updatedAt: { $gte: today }
        }).select('pricing');

        const todayEarnings = todayBookings.reduce((sum, booking) => {
            return sum + (booking.pricing?.totalAmount || booking.pricing?.amount || 0);
        }, 0);

        res.json({
            totalBookings,
            completedBookings,
            pendingBookings,
            totalEarnings,
            todayEarnings,
            averageRating: partner.rating || 0
        });
    } catch (error) {
        console.error('Error fetching partner stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get partner bookings
// @route   GET /api/urban-services/partner/bookings
// @access  Private/Partner
router.get('/bookings', protect, async (req, res) => {
    try {
        const partner = await ServicePartner.findOne({ user: req.user._id });

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        const { status, type, page = 1, limit = 10 } = req.query;
        let query = {};

        if (type === 'available') {
            // Show orders matching partner's categories that are not yet assigned
            // Ensure partner.categories exists
            if (!partner.categories || partner.categories.length === 0) {
                return res.json({
                    bookings: [],
                    total: 0,
                    page: 1,
                    pages: 0
                });
            }
            query = {
                $or: [{ partner: { $exists: false } }, { partner: null }],
                status: 'pending',
                category: { $in: partner.categories }
            };
        } else {
            // Default: Show bookings assigned to this partner
            query = { partner: partner._id };
            if (status) {
                query.status = status;
            }
        }

        const bookings = await ServiceBooking.find(query)
            .populate('customer', 'name phone email coordinates')
            .populate('address')
            .populate('category', 'name icon')
            .populate('service', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await ServiceBooking.countDocuments(query);

        res.json({
            bookings,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Error fetching partner bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get partner profile
// @route   GET /api/urban-services/partner/profile
// @access  Private/Partner
router.get('/profile', protect, getPartnerProfile);

// @desc    Update partner profile
// @route   PUT /api/urban-services/partner/profile
// @access  Private/Partner
router.put('/profile', protect, updatePartnerProfile);

// @desc    Get partner earnings
// @route   GET /api/urban-services/partner/earnings
// @access  Private/Partner
router.get('/earnings', protect, getPartnerEarnings);

// @desc    Get partner dashboard
// @route   GET /api/urban-services/partner/dashboard
// @access  Private/Partner
router.get('/dashboard', protect, getPartnerDashboard);

// @desc    Update partner availability
// @route   PUT /api/urban-services/partner/availability
// @access  Private/Partner
router.put('/availability', protect, updateAvailability);

module.exports = router;
