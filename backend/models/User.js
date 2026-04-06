const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  phone:     { type: String, default: '' },
  role: {
    type: String,
    enum: ['ADMIN', 'AGENT', 'OWNER', 'BUYER', 'SUPPORT'],
    default: 'BUYER',
  },
  profilePic: { type: String, default: '' },
  gender:     { type: String, enum: ['Male', 'Female', 'Other', ''] },
  address:    { type: String, default: '' },
  city:       { type: String, default: '' },
  state:      { type: String, default: '' },
  pincode:    { type: String, default: '' },
  isActive:   { type: Boolean, default: true },

  // ── Password Reset via OTP ──────────────────
  resetOTP:          { type: String, select: false },   // hashed OTP stored in DB
  resetOTPExpire:    { type: Date,   select: false },   // expiry timestamp
  resetOTPAttempts:  { type: Number, default: 0, select: false }, // brute-force guard
}, { timestamps: true });

// ── Hash password before save ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Match plain password against hash ─────────────────────
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ── Generate a 6-digit OTP, hash + store it, return plain OTP ──
userSchema.methods.generateResetOTP = function () {
  // Generate random 6-digit number
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  // Store SHA-256 hash (never store plain OTP in DB)
  this.resetOTP       = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.resetOTPAttempts = 0;

  return otp; // return plain OTP to send via email
};

// ── Virtual: full name ─────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
