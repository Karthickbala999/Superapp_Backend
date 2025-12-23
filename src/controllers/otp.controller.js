const OTP = require('../models/otp.model');
const jwt = require('jsonwebtoken');

// Import models after they're initialized
let User;
try {
    const models = require('../models');
    User = models.User;
} catch (error) {
    console.error('Error importing User model:', error);
}

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate and save OTP
exports.generateOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;



        // Strict validation: Both email AND phone must match
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Both email and phone are required'
            });
        }

        const user = await User.findOne({ email, phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email and phone combination'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        console.log('Generated OTP for', email || phone, ':', otp);
        const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        try {
            await OTP.create({
                user_id: user._id,
                otp,
                type: email ? 'email' : 'phone',
                expires_at,
                is_used: false
            });
        } catch (otpError) {
            console.error('OTP DB Save Error:', otpError);
            return res.status(500).json({
                success: false,
                message: 'Failed to save OTP',
                error: otpError.message
            });
        }

        // In a production environment, you would send this OTP via email/SMS
        // For development, we'll just return it
        res.json({
            success: true,
            message: 'OTP generated successfully',
            otp // <-- This is the generated OTP
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating OTP'
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;

        // Strict validation: Both email AND phone must match
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Both email and phone are required'
            });
        }

        // Find the user by email AND phone
        const user = await User.findOne({ email, phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email and phone combination'
            });
        }

        // Find the most recent valid OTP for the user
        const otpRecord = await OTP.findOne({
            user_id: user._id,
            otp,
            expires_at: { $gt: new Date() },
            is_used: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark OTP as used
        otpRecord.is_used = true;
        await otpRecord.save();

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log('OTP: Token generated for user ID:', user.id);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP'
        });
    }
};

// Fetch latest OTP for a user (for dev auto-fill)
exports.getLatestOTP = async (req, res) => {
    try {
        const { email, phone } = req.query;
        if (!email && !phone) {
            return res.status(400).json({ success: false, message: 'Email or phone is required' });
        }
        // Strict validation: Both email AND phone must match
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Both email and phone are required'
            });
        }

        const user = await User.findOne({ email, phone });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const otpRecord = await OTP.findOne({ user_id: user._id })
            .sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(404).json({ success: false, message: 'No OTP found' });
        }
        res.json({ success: true, otp: otpRecord.otp });
    } catch (error) {
        console.error('Error fetching latest OTP:', error);
        res.status(500).json({ success: false, message: 'Error fetching latest OTP' });
    }
}; 