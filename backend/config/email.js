const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────────────────────
// Create transporter — supports Gmail + any SMTP provider
// ─────────────────────────────────────────────────────────────
const createTransporter = () => {
  // Gmail shortcut
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,   // 16-char App Password
      },
    });
  }

  // Generic SMTP (Mailgun, SendGrid, Zoho, Office365, etc.)
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

// ─────────────────────────────────────────────────────────────
// Send email helper — used by all email functions
// ─────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'PropFinder'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // fallback plain text
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to} — Message ID: ${info.messageId}`);
  return info;
};

// ─────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────

// Base wrapper (professional layout)
const emailWrapper = (content, previewText = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropFinder</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2D4059 0%, #C84B31 100%); padding: 32px 40px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.5px; }
    .header-logo span { color: #F4A261; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #4a5568; margin-bottom: 16px; }
    .otp-box { background: linear-gradient(135deg, #C84B31 0%, #a03826 100%); border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0; }
    .otp-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
    .otp-code { font-size: 44px; font-weight: 900; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .otp-expiry { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 10px; }
    .btn { display: inline-block; background: #C84B31; color: white !important; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 20px 0; }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
    .warning-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #92400e; margin: 16px 0; }
    .footer { text-align: center; padding: 24px 40px; }
    .footer-text { font-size: 12px; color: #94a3b8; line-height: 1.7; }
    .footer-links { margin-top: 12px; }
    .footer-links a { color: #C84B31; font-size: 12px; text-decoration: none; margin: 0 8px; }
    .role-badge { display: inline-block; padding: 4px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; margin-left: 8px; }
    .badge-buyer { background: #dcfce7; color: #166534; }
    .badge-owner { background: #fef3c7; color: #92400e; }
    .badge-agent { background: #dbeafe; color: #1e40af; }
    .feature-row { display: flex; align-items: flex-start; gap: 14px; margin: 14px 0; }
    .feature-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
    .feature-text strong { display: block; font-size: 14px; color: #1a1a2e; margin-bottom: 2px; }
    .feature-text span { font-size: 13px; color: #718096; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">🏠 Prop<span>Finder</span></div>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:6px;">India's Trusted Real Estate Platform</p>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">
        © ${new Date().getFullYear()} PropFinder. All rights reserved.<br>
        This email was sent to you because you have an account on PropFinder.
      </p>
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </div>
    </div>
  </div>
</body>
</html>`;

// ── WELCOME EMAIL ──────────────────────────────────────────
const ROLE_FEATURES = {
  BUYER: [
    { icon: '🔍', title: 'Browse Properties', desc: 'Search thousands of verified listings across India' },
    { icon: '❤️', title: 'Save Favourites', desc: 'Shortlist properties for easy comparison' },
    { icon: '📅', title: 'Schedule Visits', desc: 'Book property viewings at your convenience' },
    { icon: '💬', title: 'Contact Owners', desc: 'Send inquiries directly to property owners' },
  ],
  OWNER: [
    { icon: '🏠', title: 'List Your Property', desc: 'Reach millions of buyers and renters' },
    { icon: '📊', title: 'Track Performance', desc: 'Monitor views, inquiries and visit requests' },
    { icon: '✅', title: 'Manage Inquiries', desc: 'Respond to buyer inquiries from one dashboard' },
    { icon: '📅', title: 'Approve Visits', desc: 'Control who visits your property and when' },
  ],
  AGENT: [
    { icon: '🏘️', title: 'Post Properties', desc: 'List properties on behalf of multiple owners' },
    { icon: '📋', title: 'Manage Pipeline', desc: 'Track all your leads and inquiries' },
    { icon: '🤝', title: 'Connect Buyers', desc: 'Bridge buyers and sellers seamlessly' },
    { icon: '📈', title: 'Grow Your Business', desc: 'Build your professional agent profile' },
  ],
};

exports.sendWelcomeEmail = async ({ email, firstName, lastName, role }) => {
  const features = ROLE_FEATURES[role] || ROLE_FEATURES.BUYER;
  const roleLabel = role === 'BUYER' ? 'Buyer' : role === 'OWNER' ? 'Property Owner' : 'Agent';
  const badgeClass = `badge-${role.toLowerCase()}`;

  const featureRows = features.map(f => `
    <div class="feature-row">
      <div class="feature-icon">${f.icon}</div>
      <div class="feature-text">
        <strong>${f.title}</strong>
        <span>${f.desc}</span>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="body">
      <p class="greeting">Welcome to PropFinder, ${firstName}! 🎉</p>
      <p class="text">
        Your account has been created successfully as a 
        <span class="role-badge ${badgeClass}">${roleLabel}</span>
      </p>
      <p class="text">Here's what you can do on PropFinder:</p>
      ${featureRows}
      <div class="divider"></div>
      <p class="text"><strong>Your account details:</strong></p>
      <p class="text" style="background:#f8fafc;padding:14px 16px;border-radius:8px;font-family:monospace;font-size:13px;">
        📧 Email: ${email}<br>
        👤 Role: ${roleLabel}<br>
        🔒 Password: As you set during registration
      </p>
      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="btn">
          Go to My Dashboard →
        </a>
      </div>
      <div class="warning-box">
        ⚠️ If you did not create this account, please ignore this email or contact support immediately.
      </div>
    </div>`;

  return sendEmail({
    to: email,
    subject: `🏠 Welcome to PropFinder, ${firstName}! Your account is ready`,
    html: emailWrapper(content, `Welcome ${firstName}! Your PropFinder account is ready.`),
  });
};

// ── OTP EMAIL ──────────────────────────────────────────────
exports.sendOTPEmail = async ({ email, firstName, otp }) => {
  const content = `
    <div class="body">
      <p class="greeting">Password Reset Request</p>
      <p class="text">Hi ${firstName},</p>
      <p class="text">
        We received a request to reset the password for your PropFinder account 
        associated with <strong>${email}</strong>.
      </p>
      <p class="text">Use the OTP below to reset your password:</p>
      
      <div class="otp-box">
        <p class="otp-label">Your One-Time Password (OTP)</p>
        <p class="otp-code">${otp}</p>
        <p class="otp-expiry">⏱ Valid for 10 minutes only</p>
      </div>

      <div class="warning-box">
        <strong>🔒 Security Tips:</strong><br>
        • Never share this OTP with anyone — PropFinder will never ask for it<br>
        • This OTP expires in <strong>10 minutes</strong><br>
        • If you didn't request this, your password remains unchanged
      </div>
      
      <div class="divider"></div>
      <p class="text" style="font-size:13px;color:#94a3b8;">
        If you did not request a password reset, please ignore this email. 
        Your account is safe and no changes have been made.
      </p>
    </div>`;

  return sendEmail({
    to: email,
    subject: `🔐 PropFinder Password Reset OTP — ${otp}`,
    html: emailWrapper(content, `Your PropFinder password reset OTP is: ${otp}. Valid for 10 minutes.`),
  });
};

// ── PASSWORD CHANGED CONFIRMATION EMAIL ───────────────────
exports.sendPasswordChangedEmail = async ({ email, firstName }) => {
  const content = `
    <div class="body">
      <p class="greeting">Password Changed Successfully ✅</p>
      <p class="text">Hi ${firstName},</p>
      <p class="text">
        Your PropFinder account password was successfully changed on 
        <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })} IST</strong>.
      </p>
      <div class="warning-box">
        <strong>⚠️ Wasn't you?</strong><br>
        If you did not make this change, your account may be compromised.
        Please <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="color:#C84B31;">login immediately</a> 
        and change your password, or contact our support team.
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="btn">
          Login to My Account
        </a>
      </div>
    </div>`;

  return sendEmail({
    to: email,
    subject: '🔒 Your PropFinder Password Was Changed',
    html: emailWrapper(content, 'Your PropFinder password has been changed successfully.'),
  });
};

module.exports = { ...module.exports, sendEmail };
