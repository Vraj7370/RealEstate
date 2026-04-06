const crypto = require('crypto');
const User   = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { deleteImage, getPublicIdFromUrl } = require('../middleware/upload');
const {
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordChangedEmail,
} = require('../config/email');

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, gender, city, state } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const publicRoles = ['BUYER', 'OWNER', 'AGENT'];
    const userRole = publicRoles.includes(role) ? role : 'BUYER';

    const user = await User.create({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.toLowerCase().trim(),
      password,
      phone:  phone  || '',
      role:   userRole,
      gender: gender || '',
      city:   city   || '',
      state:  state  || '',
    });

    // ── Send welcome email (non-blocking — don't fail registration if email fails) ──
    sendWelcomeEmail({
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      role:      user.role,
    }).catch(err => console.error('Welcome email failed (non-critical):', err.message));

    sendTokenResponse(user, 201, res, `Welcome to PropFinder, ${user.firstName}! 🎉`);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE PROFILE  (Cloudinary pic via middleware)
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, gender, address, city, state, pincode } = req.body;
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName  !== undefined) updateData.lastName  = lastName.trim();
    if (phone     !== undefined) updateData.phone     = phone;
    if (gender    !== undefined) updateData.gender    = gender;
    if (address   !== undefined) updateData.address   = address;
    if (city      !== undefined) updateData.city      = city;
    if (state     !== undefined) updateData.state     = state;
    if (pincode   !== undefined) updateData.pincode   = pincode;

    if (req.uploadedFile) {
      const oldUser = await User.findById(req.user.id);
      if (oldUser?.profilePic) {
        const oldId = getPublicIdFromUrl(oldUser.profilePic);
        if (oldId) await deleteImage(oldId).catch(() => {});
      }
      updateData.profilePic = req.uploadedFile.url;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD  (logged-in user)
// ─────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    // Confirmation email (non-blocking)
    sendPasswordChangedEmail({ email: user.email, firstName: user.firstName })
      .catch(err => console.error('Password changed email failed:', err.message));

    sendTokenResponse(user, 200, res, 'Password changed successfully');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// REMOVE PROFILE PIC
// ─────────────────────────────────────────────
exports.removeProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user?.profilePic) {
      const publicId = getPublicIdFromUrl(user.profilePic);
      if (publicId) await deleteImage(publicId).catch(() => {});
      await User.findByIdAndUpdate(req.user.id, { profilePic: '' });
    }
    res.json({ success: true, message: 'Profile picture removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD — Step 1: Send OTP
// POST /api/auth/forgot-password
// Body: { email }
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Please provide your email address' });

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetOTP +resetOTPExpire +resetOTPAttempts');

    // Always return success — never reveal if email exists (security)
    const GENERIC_SUCCESS = {
      success: true,
      message: 'If an account exists with this email, you will receive an OTP shortly.',
    };

    if (!user) return res.json(GENERIC_SUCCESS);
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is blocked. Contact support.' });

    // Rate limit: don't allow resend if OTP still valid and recent
    const now = Date.now();
    if (user.resetOTPExpire && user.resetOTPExpire > now) {
      const remaining = Math.ceil((user.resetOTPExpire - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `OTP already sent. Please wait ${remaining} minute(s) before requesting again.`,
      });
    }

    // Generate OTP, store hashed in DB, return plain to send via email
    const otp = user.generateResetOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    await sendOTPEmail({ email: user.email, firstName: user.firstName, otp });

    res.json(GENERIC_SUCCESS);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// VERIFY OTP — Step 2: Validate OTP
// POST /api/auth/verify-otp
// Body: { email, otp }
// Returns a short-lived reset token if OTP correct
// ─────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetOTP +resetOTPExpire +resetOTPAttempts');

    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    // Check expiry
    if (!user.resetOTPExpire || user.resetOTPExpire < Date.now())
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    // Brute-force protection — max 5 wrong attempts
    if (user.resetOTPAttempts >= 5) {
      user.resetOTP         = undefined;
      user.resetOTPExpire   = undefined;
      user.resetOTPAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({
        success: false,
        message: 'Too many wrong attempts. Please request a new OTP.',
      });
    }

    // Hash the submitted OTP and compare
    const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (hashedOTP !== user.resetOTP) {
      user.resetOTPAttempts += 1;
      await user.save({ validateBeforeSave: false });
      const remaining = 5 - user.resetOTPAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
      });
    }

    // OTP is correct — generate a short-lived reset token (JWT, 15 min)
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Clear OTP from DB — one-time use
    user.resetOTP         = undefined;
    user.resetOTPExpire   = undefined;
    user.resetOTPAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken, // frontend uses this to call resetPassword
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'OTP verification failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// RESET PASSWORD — Step 3: Set new password
// POST /api/auth/reset-password
// Body: { resetToken, newPassword, confirmPassword }
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    // Verify reset token
    let decoded;
    try {
      const jwt = require('jsonwebtoken');
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Reset session expired. Please start again.' });
    }

    if (decoded.purpose !== 'password-reset')
      return res.status(400).json({ success: false, message: 'Invalid reset token' });

    const user = await User.findById(decoded.id).select('+password');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();

    // Confirmation email (non-blocking)
    sendPasswordChangedEmail({ email: user.email, firstName: user.firstName })
      .catch(err => console.error('Password reset email failed:', err.message));

    res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// CREATE STAFF  (Admin only)
// ─────────────────────────────────────────────
exports.createStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    if (!['ADMIN', 'SUPPORT'].includes(role))
      return res.status(400).json({ success: false, message: 'Use ADMIN or SUPPORT for staff roles' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      firstName, lastName,
      email: email.toLowerCase(),
      password, phone: phone || '', role,
    });

    // Welcome email for staff too
    sendWelcomeEmail({ email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role })
      .catch(err => console.error('Staff welcome email failed:', err.message));

    res.status(201).json({ success: true, message: `${role} account created`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
