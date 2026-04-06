const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register, login, getMe,
  updateProfile, changePassword, removeProfilePic,
  forgotPassword, verifyOTP, resetPassword,
  createStaff,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfilePic } = require('../middleware/upload');

// ── Strict rate limiter for OTP endpoints ───────────────────
// Max 5 requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Auth routes ──────────────────────────────────────────────
router.post('/register',         register);
router.post('/login',            login);
router.get('/me',                protect, getMe);
router.put('/profile',           protect, uploadProfilePic, updateProfile);
router.put('/change-password',   protect, changePassword);
router.delete('/profile-pic',    protect, removeProfilePic);
router.post('/create-staff',     protect, authorize('ADMIN'), createStaff);

// ── Forgot Password — OTP Flow ───────────────────────────────
router.post('/forgot-password',  otpLimiter, forgotPassword);   // Step 1: send OTP
router.post('/verify-otp',       otpLimiter, verifyOTP);        // Step 2: verify OTP
router.post('/reset-password',   otpLimiter, resetPassword);    // Step 3: set new password

module.exports = router;
