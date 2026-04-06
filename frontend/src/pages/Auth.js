import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

// ═══════════════════════════════════════════════════════════
// LOGIN  (with inline forgot-password flow — 3 steps)
// ═══════════════════════════════════════════════════════════
export const Login = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/';
  const otpRefs      = useRef([]);

  // ── Panels ──
  // 'login' | 'forgot' | 'otp' | 'reset'
  const [panel, setPanel]       = useState('login');

  // ── Login form ──
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // ── Forgot password state ──
  const [fpEmail, setFpEmail]       = useState('');
  const [fpLoading, setFpLoading]   = useState(false);
  const [otpDigits, setOtpDigits]   = useState(['','','','','','']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPass, setNewPass]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ── Resend countdown ──
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.firstName}! 🎉`);
      const role = data.user.role;
      if (role === 'ADMIN') navigate('/admin', { replace: true });
      else if (role === 'SUPPORT') navigate('/dashboard/support', { replace: true });
      else navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const demoLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      login(data.user, data.token);
      toast.success(`Logged in as ${data.user.role} ✅`);
      const role = data.user.role;
      if (role === 'ADMIN') navigate('/admin', { replace: true });
      else if (role === 'SUPPORT') navigate('/dashboard/support', { replace: true });
      else navigate('/', { replace: true });
    } catch {
      toast.error('Demo login failed. Did you run: npm run seed?');
    }
    setLoading(false);
  };

  // ── STEP 1: Send OTP ───────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) { toast.error('Please enter your email address'); return; }
    setFpLoading(true);
    try {
      await authAPI.forgotPassword({ email: fpEmail.trim() });
      toast.success('OTP sent! Check your inbox (and spam folder).');
      setPanel('otp');
      setResendTimer(60); // 60-second resend cooldown
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
    setFpLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setFpLoading(true);
    try {
      await authAPI.forgotPassword({ email: fpEmail.trim() });
      toast.success('OTP resent! Check your inbox.');
      setResendTimer(60);
      setOtpDigits(['','','','','','']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
    setFpLoading(false);
  };

  // ── OTP input handling ─────────────────────────────────
  const handleOtpChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(0, 1); // only digits
    const next = [...otpDigits];
    next[i] = v;
    setOtpDigits(next);
    // Auto-advance
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
    // Auto-submit when all 6 filled
    if (v && i === 5 && next.every(d => d)) {
      setTimeout(() => handleVerifyOTP(next.join('')), 100);
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0)  otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyOTP(pasted), 100);
  };

  // ── STEP 2: Verify OTP ─────────────────────────────────
  const handleVerifyOTP = async (otpOverride) => {
    const otp = otpOverride || otpDigits.join('');
    if (otp.length !== 6) { toast.error('Please enter all 6 digits'); return; }
    setOtpLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({ email: fpEmail, otp });
      setResetToken(data.resetToken);
      toast.success('OTP verified! Set your new password.');
      setPanel('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtpDigits(['','','','','','']);
      otpRefs.current[0]?.focus();
    }
    setOtpLoading(false);
  };

  // ── STEP 3: Reset Password ─────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6)      { toast.error('Password must be at least 6 characters'); return; }
    if (newPass !== confirmPass)  { toast.error('Passwords do not match'); return; }
    setResetLoading(true);
    try {
      await authAPI.resetPassword({ resetToken, newPassword: newPass, confirmPassword: confirmPass });
      toast.success('Password reset successfully! Please login with your new password. 🎉');
      // Reset all state and go back to login
      setPanel('login');
      setFpEmail(''); setOtpDigits(['','','','','','']);
      setNewPass(''); setConfirmPass(''); setResetToken('');
      setForm(f => ({ ...f, email: fpEmail })); // pre-fill email in login form
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Please try again.');
    }
    setResetLoading(false);
  };

  // ── Helpers ────────────────────────────────────────────
  const goBack = (to) => {
    setPanel(to);
    if (to === 'login') {
      setFpEmail(''); setOtpDigits(['','','','','','']);
      setNewPass(''); setConfirmPass('');
    }
    if (to === 'forgot') setOtpDigits(['','','','','','']);
  };

  return (
    <div className="auth-page">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">🏠 PropFinder</div>

          {panel === 'login' && (
            <>
              <h1>Find Your<br />Dream Home</h1>
              <p>Access thousands of verified properties across India. Connect with owners, agents, and make your dream a reality.</p>
              <div className="auth-features">
                {['50,000+ Properties', '200+ Cities Covered', 'Verified Owners & Agents', 'Free to Browse & Inquire'].map(f => (
                  <div key={f} className="auth-feature-item"><span className="check-icon">✓</span>{f}</div>
                ))}
              </div>
            </>
          )}

          {panel === 'forgot' && (
            <>
              <h1>Forgot<br />Password?</h1>
              <p>No worries! Enter your registered email and we'll send a 6-digit OTP to reset your password.</p>
              <div className="fp-steps">
                {[
                  { n: '1', label: 'Enter Email', active: true },
                  { n: '2', label: 'Verify OTP',  active: false },
                  { n: '3', label: 'New Password', active: false },
                ].map(s => (
                  <div key={s.n} className={`fp-step ${s.active ? 'fp-step-active' : ''}`}>
                    <div className="fp-step-num">{s.n}</div>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {panel === 'otp' && (
            <>
              <h1>Check Your<br />Email 📬</h1>
              <p>We've sent a 6-digit OTP to <strong style={{color:'#F4A261'}}>{fpEmail}</strong></p>
              <p style={{marginTop:12, color:'rgba(255,255,255,0.65)', fontSize:13}}>
                Check your inbox and spam folder. OTP is valid for <strong style={{color:'white'}}>10 minutes</strong>.
              </p>
              <div className="fp-steps">
                {[
                  { n: '✓', label: 'Email Sent',   active: true, done: true },
                  { n: '2', label: 'Verify OTP',   active: true },
                  { n: '3', label: 'New Password', active: false },
                ].map(s => (
                  <div key={s.n} className={`fp-step ${s.active ? 'fp-step-active' : ''} ${s.done ? 'fp-step-done' : ''}`}>
                    <div className="fp-step-num">{s.n}</div>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {panel === 'reset' && (
            <>
              <h1>Almost<br />There! 🔐</h1>
              <p>OTP verified! Now set a new strong password for your account.</p>
              <div className="fp-steps">
                {[
                  { n: '✓', label: 'Email Sent',   done: true },
                  { n: '✓', label: 'OTP Verified', done: true },
                  { n: '3', label: 'New Password', active: true },
                ].map(s => (
                  <div key={s.n} className={`fp-step ${s.active ? 'fp-step-active' : ''} ${s.done ? 'fp-step-done' : ''}`}>
                    <div className="fp-step-num">{s.n}</div>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* ─── LOGIN FORM ─── */}
          {panel === 'login' && (
            <>
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your PropFinder account</p>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="you@example.com" required
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Password</span>
                    <button type="button" className="fp-link" onClick={() => { setFpEmail(form.email); setPanel('forgot'); }}>
                      Forgot password?
                    </button>
                  </label>
                  <div className="pass-wrap">
                    <input type={showPass ? 'text' : 'password'} className="form-control"
                      placeholder="Your password" required
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
              </form>

              <div className="auth-divider"><span>Quick demo login</span></div>
              <div className="demo-accounts">
                {[
                  { label: '👑 Admin',   email: 'admin@realestate.com',   password: 'admin123' },
                  { label: '🏠 Owner',   email: 'owner@realestate.com',   password: 'owner123' },
                  { label: '🤝 Agent',   email: 'agent@realestate.com',   password: 'agent123' },
                  { label: '🛒 Buyer',   email: 'buyer@realestate.com',   password: 'buyer123' },
                  { label: '🎫 Support', email: 'support@realestate.com', password: 'support123' },
                ].map(d => (
                  <button key={d.label} className="demo-btn" onClick={() => demoLogin(d.email, d.password)} disabled={loading}>
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="auth-switch">Don't have an account? <Link to="/register">Sign Up Free</Link></p>
            </>
          )}

          {/* ─── STEP 1: Enter Email ─── */}
          {panel === 'forgot' && (
            <>
              <button className="back-btn" onClick={() => goBack('login')}>← Back to Login</button>
              <h2 style={{ marginTop: 16 }}>Forgot Password</h2>
              <p className="auth-subtitle">Enter your registered email to receive a 6-digit OTP</p>

              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address *</label>
                  <input type="email" className="form-control" required
                    placeholder="you@example.com"
                    value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={fpLoading}>
                  {fpLoading ? 'Sending OTP…' : '📧 Send OTP →'}
                </button>
              </form>

              <div className="fp-info-box">
                <p>💡 <strong>Check your email</strong> after submitting. The OTP will expire in 10 minutes.</p>
              </div>
            </>
          )}

          {/* ─── STEP 2: Enter OTP ─── */}
          {panel === 'otp' && (
            <>
              <button className="back-btn" onClick={() => goBack('forgot')}>← Change Email</button>
              <h2 style={{ marginTop: 16 }}>Enter OTP</h2>
              <p className="auth-subtitle">
                We sent a 6-digit OTP to <strong>{fpEmail}</strong>
              </p>

              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-input ${d ? 'otp-filled' : ''}`}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                disabled={otpLoading || otpDigits.some(d => !d)}
                onClick={() => handleVerifyOTP()}
                style={{ marginTop: 8 }}
              >
                {otpLoading ? 'Verifying…' : '✓ Verify OTP'}
              </button>

              <div className="resend-row">
                <span>Didn't receive the OTP?</span>
                {resendTimer > 0 ? (
                  <span className="resend-timer">Resend in {resendTimer}s</span>
                ) : (
                  <button type="button" className="resend-btn" onClick={handleResendOTP} disabled={fpLoading}>
                    {fpLoading ? 'Sending…' : 'Resend OTP'}
                  </button>
                )}
              </div>

              <div className="fp-info-box">
                <p>💡 OTP is valid for <strong>10 minutes</strong>. You have <strong>5 attempts</strong> before the OTP is invalidated.</p>
              </div>
            </>
          )}

          {/* ─── STEP 3: Set New Password ─── */}
          {panel === 'reset' && (
            <>
              <h2>Set New Password</h2>
              <p className="auth-subtitle">Choose a strong password for your account</p>

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <div className="pass-wrap">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      className="form-control" required minLength={6}
                      placeholder="Minimum 6 characters"
                      value={newPass} onChange={e => setNewPass(e.target.value)}
                      autoFocus
                    />
                    <button type="button" className="pass-toggle" onClick={() => setShowNewPass(s => !s)}>
                      {showNewPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPass.length > 0 && (
                    <div className="password-strength">
                      <div className={`strength-bar ${newPass.length < 6 ? 'weak' : newPass.length < 10 ? 'medium' : 'strong'}`} />
                      <span>{newPass.length < 6 ? 'Too short' : newPass.length < 10 ? 'Medium' : '✓ Strong'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password" className="form-control" required
                    placeholder="Re-enter your new password"
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    style={{ borderColor: confirmPass && confirmPass !== newPass ? '#ef4444' : '' }}
                  />
                  {confirmPass && confirmPass !== newPass && (
                    <p className="field-error">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={resetLoading || !newPass || newPass !== confirmPass || newPass.length < 6}
                >
                  {resetLoading ? 'Resetting Password…' : '🔒 Reset Password →'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// REGISTER  (2-step role-based)
// ═══════════════════════════════════════════════════════════
const ROLES = [
  {
    role: 'BUYER', icon: '🛒', title: 'Buyer / Tenant',
    desc: 'Looking to buy or rent a property',
    color: '#10b981',
    perks: ['Browse all listings', 'Send inquiries to owners', 'Schedule property visits', 'Save favourites'],
  },
  {
    role: 'OWNER', icon: '🏠', title: 'Property Owner',
    desc: 'Want to sell or rent out your property',
    color: '#f59e0b',
    perks: ['List unlimited properties', 'Manage buyer inquiries', 'Approve visit requests', 'Track property performance'],
  },
  {
    role: 'AGENT', icon: '🤝', title: 'Real Estate Agent',
    desc: 'Professional agent / broker',
    color: '#3b82f6',
    perks: ['Post properties for owners', 'Manage client pipeline', 'Build your agent profile', 'Access full buyer leads'],
  },
];

export const Register = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    phone: '', role: '', gender: '', city: '',
  });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role)                    { toast.error('Please go back and select a role'); setStep(1); return; }
    if (form.password.length < 6)     { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.user, data.token);
      toast.success(data.message || 'Account created! Welcome to PropFinder 🎉');
      // Role-based redirect
      if (['OWNER', 'AGENT'].includes(data.user.role)) {
        navigate('/dashboard/list-property', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const selectedRole = ROLES.find(r => r.role === form.role);

  return (
    <div className="auth-page register-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">🏠 PropFinder</div>
          {step === 1 ? (
            <>
              <h1>Who are<br />you?</h1>
              <p>Choose your role to get a personalised experience on PropFinder.</p>
              <div className="role-preview-list">
                {ROLES.map(r => (
                  <div key={r.role} className="role-preview-item">
                    <span className="rp-icon">{r.icon}</span>
                    <div>
                      <strong>{r.title}</strong>
                      <p>{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1>Almost<br />There!</h1>
              {selectedRole && (
                <div className="selected-role-panel">
                  <div className="srp-badge" style={{ background: selectedRole.color }}>
                    {selectedRole.icon} {selectedRole.title}
                  </div>
                  <p style={{ marginTop: 12, marginBottom: 16 }}>As a <strong>{selectedRole.title}</strong> you can:</p>
                  <ul className="srp-perks">
                    {selectedRole.perks.map(p => (
                      <li key={p}><span className="check-icon">✓</span>{p}</li>
                    ))}
                  </ul>
                  <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    📧 A welcome email will be sent to your inbox after registration.
                  </p>
                  <button className="change-role-btn" onClick={() => setStep(1)}>← Change role</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <>
              <h2>Create Account</h2>
              <p className="auth-subtitle">Select your role to get started</p>
              <div className="role-selector-grid">
                {ROLES.map(r => (
                  <button key={r.role} type="button"
                    className={`role-selector-card ${form.role === r.role ? 'selected' : ''}`}
                    style={{ '--role-color': r.color }}
                    onClick={() => { set('role', r.role); setStep(2); }}
                  >
                    <div className="rsc-icon">{r.icon}</div>
                    <div className="rsc-title">{r.title}</div>
                    <div className="rsc-desc">{r.desc}</div>
                    {form.role === r.role && <div className="rsc-check">✓</div>}
                  </button>
                ))}
              </div>
              <div className="role-note">
                <span>🔒</span>
                <p>ADMIN & SUPPORT accounts are created by administrators only. Welcome email is sent automatically on signup.</p>
              </div>
              <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
            </>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <>
              <div className="step2-header">
                <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                <div>
                  <h2>Fill your details</h2>
                  <p className="auth-subtitle">
                    Registering as&nbsp;
                    <span className="role-highlight" style={{ color: selectedRole?.color }}>
                      {selectedRole?.icon} {selectedRole?.title}
                    </span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-control" required placeholder="Rahul"
                      value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-control" required placeholder="Sharma"
                      value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-control" required placeholder="you@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" placeholder="9876543210" maxLength={10}
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="pass-wrap">
                    <input type={showPass ? 'text' : 'password'} className="form-control"
                      required minLength={6} placeholder="Min. 6 characters"
                      value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="password-strength">
                      <div className={`strength-bar ${form.password.length < 6 ? 'weak' : form.password.length < 10 ? 'medium' : 'strong'}`} />
                      <span>{form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Medium' : '✓ Strong'}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input type="password" className="form-control" required placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    style={{ borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#ef4444' : '' }}
                  />
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <p className="field-error">Passwords do not match</p>
                  )}
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-control" placeholder="Mumbai"
                      value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                </div>
                <p className="terms-note">
                  By creating an account you agree to our <a href="#!">Terms</a> &amp; <a href="#!">Privacy Policy</a>.
                  A welcome email will be sent to your inbox.
                </p>
                <button type="submit" className="btn btn-primary btn-block btn-lg"
                  disabled={loading || (form.confirmPassword && form.confirmPassword !== form.password)}>
                  {loading ? 'Creating Account…' : `Create ${selectedRole?.title} Account →`}
                </button>
              </form>
              <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
