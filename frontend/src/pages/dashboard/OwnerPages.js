import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI, authAPI, visitAPI, inquiryAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate, CITIES, STATES_OF_INDIA } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './OwnerPages.css';

// ═══════════════════════════════════════
// MY PROPERTIES
// ═══════════════════════════════════════
export const MyProperties = () => {
  const { isAdmin } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyAPI.getAll({ limit: 100 })
      .then(({ data }) => setProperties(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
    try {
      await propertyAPI.delete(id);
      setProperties(p => p.filter(x => x._id !== id));
      toast.success('Property deleted successfully');
    } catch {
      toast.error('Failed to delete property');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="owner-page-header">
        <div>
          <h1>My Property Listings</h1>
          <p>{properties.length} properties · {properties.filter(p => p.approvalStatus === 'Approved').length} approved</p>
        </div>
        <Link to="/dashboard/list-property" className="btn btn-primary">
          ➕ Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏘️</div>
          <h3>No properties listed yet</h3>
          <p>Start listing your properties to reach potential buyers and tenants</p>
          <Link to="/dashboard/list-property" className="btn btn-primary" style={{ marginTop: 20 }}>
            List Your First Property
          </Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="listing-summary">
            {[
              { label: 'Total',    value: properties.length,                                               color: '#3b82f6' },
              { label: 'Approved', value: properties.filter(p => p.approvalStatus === 'Approved').length,  color: '#10b981' },
              { label: 'Pending',  value: properties.filter(p => p.approvalStatus === 'Pending').length,   color: '#f59e0b' },
              { label: 'Rejected', value: properties.filter(p => p.approvalStatus === 'Rejected').length,  color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="ls-card" style={{ borderTopColor: s.color }}>
                <div className="ls-val" style={{ color: s.color }}>{s.value}</div>
                <div className="ls-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type / Listing</th>
                  <th>Price</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Views</th>
                  <th>Listed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="prop-table-item">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80'}
                          alt=""
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80'; }}
                        />
                        <span>{p.title?.slice(0, 30)}{p.title?.length > 30 ? '…' : ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className="type-cell">{p.propertyType}</span>
                      <span className={`badge badge-${p.listingType?.toLowerCase()}`} style={{ marginLeft: 6 }}>{p.listingType}</span>
                    </td>
                    <td className="fw-700 text-primary">{formatPrice(p.price)}</td>
                    <td style={{ fontSize: 12 }}>{p.location?.city}, {p.location?.state}</td>
                    <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                    <td>
                      <span className={`badge ${
                        p.approvalStatus === 'Approved' ? 'badge-approved' :
                        p.approvalStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'
                      }`}>{p.approvalStatus}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>👁 {p.views || 0}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/properties/${p._id}`} className="btn btn-sm btn-outline">View</Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// OWNER — VISIT REQUESTS (RECEIVED)
// ═══════════════════════════════════════
export const OwnerVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    visitAPI.getOwner()
      .then(({ data }) => setVisits(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await visitAPI.updateStatus(id, { status });
      setVisits(v => v.map(x => x._id === id ? { ...x, status } : x));
      toast.success(`Visit ${status.toLowerCase()}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const statuses = ['All', 'Requested', 'Approved', 'Completed', 'Rejected'];
  const filtered = filter === 'All' ? visits : visits.filter(v => v.status === filter);

  return (
    <div>
      <div className="owner-page-header">
        <div>
          <h1>Visit Requests Received</h1>
          <p>{visits.length} total · {visits.filter(v => v.status === 'Requested').length} pending your action</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs-bar">
        {statuses.map(s => (
          <button key={s} className={`filter-tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s} {s !== 'All' && <span className="tab-count">{visits.filter(v => v.status === s).length}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3>No {filter !== 'All' ? filter.toLowerCase() : ''} visit requests</h3>
          <p>Visit requests from buyers will appear here once you list properties</p>
        </div>
      ) : (
        <div className="owner-visits-list">
          {filtered.map(v => (
            <div key={v._id} className={`ov-card ${v.status === 'Requested' ? 'ov-card-active' : ''}`}>
              <div className="ov-buyer-section">
                <div className="ov-avatar">{v.buyerId?.firstName?.[0]}{v.buyerId?.lastName?.[0]}</div>
                <div className="ov-buyer-info">
                  <p className="ov-buyer-name">{v.buyerId?.firstName} {v.buyerId?.lastName}</p>
                  <p className="ov-buyer-contact">
                    {v.buyerId?.phone && <span>📞 {v.buyerId.phone}</span>}
                    {v.buyerId?.email && <span> · ✉️ {v.buyerId.email}</span>}
                  </p>
                </div>
                <span className={`badge ${
                  v.status === 'Requested'  ? 'badge-pending' :
                  v.status === 'Approved'   ? 'badge-approved' :
                  v.status === 'Completed'  ? 'badge-available' : 'badge-rejected'
                }`}>{v.status}</span>
              </div>

              <div className="ov-property-section">
                {v.propertyId?.images?.[0] && (
                  <img
                    src={v.propertyId.images[0]}
                    alt=""
                    className="ov-prop-img"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100'; }}
                  />
                )}
                <div>
                  <Link to={`/properties/${v.propertyId?._id}`} className="ov-prop-title">
                    {v.propertyId?.title}
                  </Link>
                  <p className="ov-prop-meta">
                    📅 <strong>{formatDate(v.visitDate)}</strong> at <strong>{v.visitTime}</strong>
                    {v.notes && <> · 📝 {v.notes}</>}
                  </p>
                </div>
              </div>

              {v.status === 'Requested' && (
                <div className="ov-actions">
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(v._id, 'Approved')}>
                    ✓ Approve Visit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(v._id, 'Rejected')}>
                    ✕ Reject
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(v._id, 'Completed')}>
                    ✓ Mark Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// PROFILE  (with Cloudinary pic upload)
// ═══════════════════════════════════════
export const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [picPreview, setPicPreview]   = useState(user?.profilePic || null);
  const [picFile, setPicFile]         = useState(null);
  const [picLoading, setPicLoading]   = useState(false);
  const [removing, setRemoving]       = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    gender:    user?.gender    || '',
    address:   user?.address   || '',
    city:      user?.city      || '',
    state:     user?.state     || '',
    pincode:   user?.pincode   || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading]     = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Pick a new pic (preview only — not uploaded yet) ──
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  // ── Upload pic to Cloudinary via backend ──
  const handleUploadPic = async () => {
    if (!picFile) return;
    setPicLoading(true);
    try {
      const { data } = await authAPI.updateProfile({ profilePic: picFile });
      updateUser(data.user);
      setPicFile(null);
      toast.success('Profile picture updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setPicLoading(false);
  };

  // ── Remove pic ──
  const handleRemovePic = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    setRemoving(true);
    try {
      await authAPI.removeProfilePic();
      updateUser({ ...user, profilePic: '' });
      setPicPreview(null);
      setPicFile(null);
      toast.success('Profile picture removed');
    } catch { toast.error('Failed to remove picture'); }
    setRemoving(false);
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully! 🔒');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect current password');
    }
    setPwLoading(false);
  };

  const roleColors = { ADMIN: '#8b5cf6', OWNER: '#f59e0b', AGENT: '#3b82f6', BUYER: '#10b981', SUPPORT: '#ef4444' };
  const roleColor  = roleColors[user?.role] || 'var(--primary)';
  const initials   = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="profile-page">
      <div className="dash-page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account security</p>
      </div>

      {/* Profile hero card */}
      <div className="profile-hero-card">
        {/* ── Avatar upload zone ── */}
        <div className="phc-avatar-wrap">
          <div
            className="phc-avatar"
            style={{ background: picPreview ? 'transparent' : roleColor, cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            {picPreview
              ? <img src={picPreview} alt="Profile" />
              : initials
            }
            <div className="phc-avatar-overlay">📷</div>
          </div>
          <div className="phc-role-badge" style={{ background: roleColor }}>{user?.role}</div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handlePicChange}
          />
        </div>

        <div className="phc-info">
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p className="phc-email">✉️ {user?.email}</p>
          {user?.phone && <p className="phc-phone">📞 {user.phone}</p>}
          {user?.city && <p className="phc-location">📍 {user.city}{user?.state && `, ${user.state}`}</p>}
          <p className="phc-since">🗓 Member since {formatDate(user?.createdAt)}</p>

          {/* Pic action buttons — show when file picked or pic exists */}
          <div className="pic-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 {picPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            {picFile && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleUploadPic}
                disabled={picLoading}
              >
                {picLoading ? 'Uploading…' : '✓ Save Photo'}
              </button>
            )}
            {picPreview && !picFile && (
              <button
                type="button"
                className="btn btn-sm"
                style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                onClick={handleRemovePic}
                disabled={removing}
              >
                {removing ? 'Removing…' : '🗑 Remove'}
              </button>
            )}
          </div>

          {picFile && (
            <p className="pic-hint">👆 Click "Save Photo" to upload to Cloudinary</p>
          )}
        </div>

        <div className="phc-stats">
          <div className="phc-stat"><span>{user?.role}</span><label>Account Type</label></div>
          <div className="phc-stat"><span>{user?.isActive ? '✅ Active' : '🔴 Blocked'}</span><label>Status</label></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
          👤 Personal Info
        </button>
        <button className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          🔒 Change Password
        </button>
      </div>

      {activeTab === 'personal' && (
        <div className="dash-card">
          <h3 className="form-section-title">Personal Information</h3>
          <form onSubmit={handleProfile}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" placeholder="9876543210" maxLength={10}
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input className="form-control" placeholder="Flat no, Building, Street, Area"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-control" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-control" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select State</option>
                  {STATES_OF_INDIA.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" placeholder="400001" maxLength={6}
                  value={form.pincode} onChange={e => set('pincode', e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="dash-card">
          <h3 className="form-section-title">Change Password</h3>
          <div className="security-info">
            🔒 Your password must be at least 6 characters long. Choose a strong password that you don't use elsewhere.
          </div>
          <form onSubmit={handlePassword} style={{ maxWidth: 440 }}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input type="password" className="form-control" required placeholder="Enter your current password"
                value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input type="password" className="form-control" required minLength={6} placeholder="Min. 6 characters"
                value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input type="password" className="form-control" required placeholder="Re-enter new password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                style={{ borderColor: pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? '#ef4444' : '' }}
              />
              {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-secondary" disabled={pwLoading}>
                {pwLoading ? 'Changing…' : '🔒 Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// OWNER / AGENT — RECEIVED INQUIRIES
// ═══════════════════════════════════════
export const ReceivedInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [selected, setSelected]   = useState(null); // for detail modal

  useEffect(() => {
    inquiryAPI.getReceived()
      .then(({ data }) => setInquiries(data.data || []))
      .catch(() => toast.error('Could not load inquiries'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await inquiryAPI.updateStatus(id, { status });
      setInquiries(prev => prev.map(x => x._id === id ? { ...x, status } : x));
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
      toast.success(`Inquiry marked as "${status}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const STATUSES = ['All', 'Pending', 'Contacted', 'Closed'];
  const filtered = filter === 'All' ? inquiries : inquiries.filter(i => i.status === filter);

  const pendingCount   = inquiries.filter(i => i.status === 'Pending').length;
  const contactedCount = inquiries.filter(i => i.status === 'Contacted').length;
  const closedCount    = inquiries.filter(i => i.status === 'Closed').length;

  return (
    <div>
      {/* Page header */}
      <div className="owner-page-header">
        <div>
          <h1>Received Inquiries</h1>
          <p>
            {inquiries.length} total inquiry{inquiries.length !== 1 ? 'ies' : 'y'} from buyers
            {pendingCount > 0 && <span className="pending-alert"> · ⚠️ {pendingCount} need your response</span>}
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="inq-summary">
        {[
          { label: 'Total',     value: inquiries.length,  color: '#3b82f6' },
          { label: 'Pending',   value: pendingCount,       color: '#f59e0b' },
          { label: 'Contacted', value: contactedCount,     color: '#10b981' },
          { label: 'Closed',    value: closedCount,        color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="inq-summary-card" style={{ borderTopColor: s.color }}>
            <div className="inq-sum-val" style={{ color: s.color }}>{s.value}</div>
            <div className="inq-sum-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs-bar">
        {STATUSES.map(s => (
          <button
            key={s}
            className={`filter-tab-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
            {s !== 'All' && (
              <span className="tab-count">
                {inquiries.filter(i => i.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
          <h3>No {filter !== 'All' ? filter.toLowerCase() : ''} inquiries yet</h3>
          <p>When buyers inquire about your properties, they will appear here</p>
        </div>
      ) : (
        <div className="received-inq-list">
          {filtered.map(inq => (
            <div
              key={inq._id}
              className={`ri-card ${inq.status === 'Pending' ? 'ri-card-new' : ''}`}
              onClick={() => setSelected(inq)}
            >
              {/* Property thumbnail */}
              <div className="ri-prop-img">
                <img
                  src={inq.propertyId?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120'}
                  alt=""
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120'; }}
                />
              </div>

              {/* Buyer info */}
              <div className="ri-buyer">
                <div className="ri-buyer-avatar">
                  {inq.buyerId?.profilePic
                    ? <img src={inq.buyerId.profilePic} alt="" />
                    : `${inq.buyerId?.firstName?.[0] || '?'}${inq.buyerId?.lastName?.[0] || ''}`
                  }
                </div>
                <div>
                  <p className="ri-buyer-name">
                    {inq.buyerId?.firstName} {inq.buyerId?.lastName}
                    {inq.status === 'Pending' && <span className="new-badge">NEW</span>}
                  </p>
                  <p className="ri-buyer-contact">
                    {inq.buyerId?.email && <span>✉️ {inq.buyerId.email}</span>}
                    {inq.buyerId?.phone && <span> · 📞 {inq.buyerId.phone}</span>}
                    {inq.contactPhone && inq.contactPhone !== inq.buyerId?.phone && (
                      <span> · 📱 {inq.contactPhone}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Property info */}
              <div className="ri-property">
                <p className="ri-prop-title">{inq.propertyId?.title?.slice(0, 45)}</p>
                <p className="ri-prop-loc">📍 {inq.propertyId?.location?.city}, {inq.propertyId?.location?.state}</p>
                {inq.propertyId?.price && (
                  <p className="ri-prop-price">{formatPrice(inq.propertyId.price)}</p>
                )}
              </div>

              {/* Message preview */}
              <div className="ri-message">
                <p>"{inq.message?.slice(0, 80)}{inq.message?.length > 80 ? '…' : ''}"</p>
                <span className="ri-date">{formatDate(inq.createdAt)}</span>
              </div>

              {/* Status + quick actions */}
              <div className="ri-actions" onClick={e => e.stopPropagation()}>
                <span className={`badge ${
                  inq.status === 'Pending'   ? 'badge-pending' :
                  inq.status === 'Contacted' ? 'badge-approved' : 'badge-rejected'
                }`}>{inq.status}</span>

                {inq.status === 'Pending' && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => updateStatus(inq._id, 'Contacted')}
                  >
                    ✓ Mark Contacted
                  </button>
                )}
                {inq.status === 'Contacted' && (
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ border: '1px solid var(--border)' }}
                    onClick={() => updateStatus(inq._id, 'Closed')}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal inq-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Inquiry Detail</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Property */}
              <div className="inq-modal-prop">
                <img
                  src={selected.propertyId?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120'}
                  alt=""
                  onError={e => { e.target.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120'; }}
                />
                <div>
                  <p className="imp-title">{selected.propertyId?.title}</p>
                  <p className="imp-loc">📍 {selected.propertyId?.location?.city}</p>
                  <Link to={`/properties/${selected.propertyId?._id}`} className="btn btn-sm btn-outline" style={{ marginTop: 6 }}>
                    View Property
                  </Link>
                </div>
              </div>

              {/* Buyer */}
              <div className="inq-modal-section">
                <h4>Buyer Details</h4>
                <div className="imd-grid">
                  <div><label>Name</label><p>{selected.buyerId?.firstName} {selected.buyerId?.lastName}</p></div>
                  <div><label>Email</label><p><a href={`mailto:${selected.buyerId?.email}`}>{selected.buyerId?.email}</a></p></div>
                  <div><label>Phone</label><p><a href={`tel:${selected.contactPhone || selected.buyerId?.phone}`}>{selected.contactPhone || selected.buyerId?.phone || '—'}</a></p></div>
                  <div><label>City</label><p>{selected.buyerId?.city || '—'}</p></div>
                </div>
              </div>

              {/* Message */}
              <div className="inq-modal-section">
                <h4>Message from Buyer</h4>
                <div className="inq-message-box">{selected.message}</div>
                <p className="inq-date-note">Received on {formatDate(selected.createdAt)}</p>
              </div>

              {/* Status */}
              <div className="inq-modal-section">
                <h4>Current Status</h4>
                <span className={`badge ${
                  selected.status === 'Pending'   ? 'badge-pending' :
                  selected.status === 'Contacted' ? 'badge-approved' : 'badge-rejected'
                }`} style={{ fontSize: 14, padding: '6px 14px' }}>{selected.status}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              {selected.status === 'Pending' && (
                <button className="btn btn-success" onClick={() => updateStatus(selected._id, 'Contacted')}>
                  ✓ Mark as Contacted
                </button>
              )}
              {selected.status === 'Contacted' && (
                <button className="btn btn-outline" onClick={() => updateStatus(selected._id, 'Closed')}>
                  Mark as Closed
                </button>
              )}
              {selected.buyerId?.phone && (
                <a href={`tel:${selected.contactPhone || selected.buyerId.phone}`} className="btn btn-primary">
                  📞 Call Buyer
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
