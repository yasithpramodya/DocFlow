const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { email, password, department, name } = req.body;

        // Create user (password hashing handled by model middleware)
        const user = await User.create({
            name: name || email.split('@')[0], // Default name from email if not provided
            email,
            password,
            department
        });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        // Send OTP Email
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD.replace(/\s+/g, '') // Remove spaces from app password
                }
            });

            const message = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'DocumentFlow Pro - Email Verification',
                text: `Your verification code is: ${otp}`
            };

            await transporter.sendMail(message);
        } catch (emailErr) {
            console.error('Email send failed:', emailErr);
            // Continue without failing the registration
        }

        res.status(200).json({
            success: true,
            data: 'Account created. Please check email or ask admin for OTP.',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });

    } catch (err) {
        // Handle duplicate key error
        if (err.code === 11000) {
           return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
             return res.status(401).json({ success: false, error: 'Please verify your email' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP' });
        }

        if (user.otpExpire < Date.now()) {
             return res.status(400).json({ success: false, error: 'OTP expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        console.log(`[ForgotPassword] Request for: ${req.body.email}`);
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            console.log(`[ForgotPassword] User not found: ${req.body.email}`);
            return res.status(404).json({ success: false, error: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        
        console.log(`[ForgotPassword] Reset URL generated: ${resetUrl}`);

        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false, 
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD.replace(/\s+/g, '')
                }
            });

            const message = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'DocumentFlow Pro - Password Reset',
                text: `You represent receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`
            };

            await transporter.sendMail(message);
            console.log(`[ForgotPassword] Email sent to: ${user.email}`);

            res.status(200).json({ success: true, data: 'Email sent', resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined });
        } catch (err) {
            console.error(`[ForgotPassword] Email send error:`, err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(`[ForgotPassword] Error:`, err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
         res.status(500).json({ success: false, error: err.message });
    }
};



// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true
    };

    res.status(statusCode)
        .json({
            success: true,
            token
        });
};
