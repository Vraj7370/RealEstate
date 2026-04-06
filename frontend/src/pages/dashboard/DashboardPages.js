import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { favoriteAPI, inquiryAPI, visitAPI, paymentAPI, supportAPI } from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './DashboardPages.css';

// ═══════════════════════════════════════
// ROLE BADGE COLORS
// ═══════════════════════════════════════
const ROLE_META = {
  ADMIN:   { icon: '👑', color: '#8b5cf6', label: 'Administrator' },
  OWNER:   { icon: '🏠', color: '#f59e0b', label: 'Property Owner' },
  AGENT:   { icon: '🤝', color: '#3b82f6', label: 'Real Estate Agent' },
  BUYER:   { icon: '🛒', color: '#10b981', label: 'Buyer / Tenant' },
  SUPPORT: { icon: '🎫', color: '#ef4444', label: 'Support Staff' },
};

// ═══════════════════════════════════════
// DASHBOARD OVERVIEW
// ═══════════════════════════════════════
export const DashboardOverview = () => {
  const { user, canListProperty, isAdmin, isSupport } = useAuth();
  const [stats, setStats] = useState({ favorites: 0, inquiries: 0, visits: 0 });
  const [loading, setLoading] = useState(true);

  const roleMeta = ROLE_META[user?.role] || ROLE_META.BUYER;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [favRes, inqRes, visRes] = await Promise.all([
          favoriteAPI.getMy(),
          inquiryAPI.getMy(),
          visitAPI.getMy(),
        ]);
        setStats({
          favorites: favRes.data.data?.length || 0,
          inquiries: inqRes.data.data?.length || 0,
          visits:    visRes.data.data?.length || 0,
        });
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Stat cards per role
  const statCards = [
    { label: 'Saved Properties', value: stats.favorites, icon: '❤️', link: '/dashboard/favorites', color: '#ef4444', show: !isSupport },
    { label: 'My Inquiries',     value: stats.inquiries, icon: '💬', link: '/dashboard/inquiries', color: '#3b82f6', show: true },
    { label: 'Visit Requests',   value: stats.visits,    icon: '📅', link: '/dashboard/visits',    color: '#10b981', show: !isSupport },
    { label: 'Support Tickets',  value: 0,               icon: '🎫', link: '/dashboard/support',   color: '#f59e0b', show: true },
  ].filter(s => s.show);

  // Quick action links per role
  const quickLinks = [
    { to: '/properties',              icon: '🔍', label: 'Browse Properties', show: true },
    { to: '/dashboard/favorites',     icon: '❤️', label: 'Saved Properties',  show: !isSupport && !isAdmin },
    { to: '/dashboard/inquiries',     icon: '💬', label: 'My Inquiries',       show: true },
    { to: '/dashboard/visits',        icon: '📅', label: 'My Visits',          show: !isSupport },
    { to: '/dashboard/payments',      icon: '💳', label: 'Payments',           show: !isSupport },
    { to: '/dashboard/support',       icon: '🎫', label: 'Support Tickets',    show: true },
    { to: '/dashboard/list-property', icon: '➕', label: 'List Property',      show: canListProperty, highlight: true },
    { to: '/dashboard/my-properties', icon: '🏘️', label: 'My Listings',        show: canListProperty },
    { to: '/dashboard/owner-inquiries', icon: '💬', label: 'Received Inquiries', show: canListProperty },
    { to: '/dashboard/owner-visits',    icon: '📋', label: 'Visit Requests',     show: canListProperty },
    { to: '/admin',                   icon: '⚙️', label: 'Admin Panel',        show: isAdmin, highlight: true },
  ].filter(l => l.show);

  return (
    <div className="overview-page">
      {/* Welcome banner */}
      <div className="welcome-banner" style={{ borderLeftColor: roleMeta.color }}>
        <div className="wb-left">
          <div className="wb-role-icon" style={{ background: roleMeta.color + '20', color: roleMeta.color }}>
            {roleMeta.icon}
          </div>
          <div>
            <h1>Welcome back, {user?.firstName}! 👋</h1>
            <p>
              <span className="wb-role-badge" style={{ background: roleMeta.color }}>
                {roleMeta.icon} {roleMeta.label}
              </span>
              &nbsp; Here's a summary of your account activity.
            </p>
          </div>
        </div>
        <Link to="/dashboard/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="stats-grid">
          {statCards.map(s => (
            <Link key={s.label} to={s.link} className="stat-card">
              <div className="stat-icon" style={{ background: s.color + '18', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              <div className="stat-arrow">→</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h2>Quick Actions</h2>
        <div className="quick-links-grid">
          {quickLinks.map(l => (
            <Link key={l.to} to={l.to} className={`quick-link-card ${l.highlight ? 'highlight' : ''}`}>
              <span className="ql-icon">{l.icon}</span>
              <span className="ql-label">{l.label}</span>
              <span className="ql-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Role-specific info panel */}
      <div className="role-info-panel" style={{ borderColor: roleMeta.color + '40', background: roleMeta.color + '08' }}>
        <div className="rip-header" style={{ color: roleMeta.color }}>
          {roleMeta.icon} Your {roleMeta.label} Capabilities
        </div>
        <div className="rip-body">
          {user?.role === 'BUYER'   && <BuyerInfo />}
          {user?.role === 'OWNER'   && <OwnerInfo />}
          {user?.role === 'AGENT'   && <AgentInfo />}
          {user?.role === 'SUPPORT' && <SupportInfo />}
          {user?.role === 'ADMIN'   && <AdminInfo />}
        </div>
      </div>
    </div>
  );
};

const BuyerInfo = () => (
  <ul className="cap-list">
    <li>✅ Browse and search thousands of verified properties</li>
    <li>✅ Save properties to your favourites list</li>
    <li>✅ Send inquiries directly to owners / agents</li>
    <li>✅ Schedule property visits at your convenience</li>
    <li>✅ Write reviews and rate properties</li>
    <li>✅ Raise support tickets for help</li>
  </ul>
);
const OwnerInfo = () => (
  <ul className="cap-list">
    <li>✅ List unlimited properties for Sale or Rent</li>
    <li>✅ Manage all your property listings</li>
    <li>✅ Receive and respond to buyer inquiries</li>
    <li>✅ Approve or reject visit requests</li>
    <li>✅ Track property views and performance</li>
    <li>⏳ New listings require Admin approval before going live</li>
  </ul>
);
const AgentInfo = () => (
  <ul className="cap-list">
    <li>✅ Post properties on behalf of owners</li>
    <li>✅ Manage inquiries and visit requests</li>
    <li>✅ Build your professional agent profile</li>
    <li>✅ Access full buyer pipeline management</li>
    <li>⏳ New listings require Admin approval before going live</li>
  </ul>
);
const SupportInfo = () => (
  <ul className="cap-list">
    <li>✅ View and manage all customer support tickets</li>
    <li>✅ Respond to open and in-progress tickets</li>
    <li>✅ Close resolved tickets</li>
    <li>✅ View all user inquiries</li>
    <li>🔒 Property listing and admin functions are restricted</li>
  </ul>
);
const AdminInfo = () => (
  <ul className="cap-list">
    <li>✅ Full access to all platform features</li>
    <li>✅ Approve or reject property listings</li>
    <li>✅ Block / activate user accounts</li>
    <li>✅ Manage support tickets and inquiries</li>
    <li>✅ View platform-wide statistics and analytics</li>
    <li>✅ Create SUPPORT and ADMIN staff accounts</li>
  </ul>
);

// ═══════════════════════════════════════
// MY FAVORITES
// ═══════════════════════════════════════
export const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoriteAPI.getMy()
      .then(({ data }) => setFavorites(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="dash-page-header">
        <h1>Saved Properties</h1>
        <p>{favorites.length} properties saved</p>
      </div>
      {favorites.length === 0 ? (
        <EmptyState icon="❤️" title="No saved properties yet" desc="Browse properties and tap the heart icon to save them here">
          <Link to="/properties" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Properties</Link>
        </EmptyState>
      ) : (
        <div className="grid grid-3">
          {favorites.map(f => f.propertyId && (
            <Link key={f._id} to={`/properties/${f.propertyId._id}`} className="fav-property-card">
              <div className="fpc-img">
                <img
                  src={f.propertyId.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
                  alt={f.propertyId.title}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'; }}
                />
                <span className={`fpc-badge badge badge-${f.propertyId.listingType?.toLowerCase()}`}>
                  {f.propertyId.listingType}
                </span>
              </div>
              <div className="fpc-body">
                <div className="fpc-price">{formatPrice(f.propertyId.price)}</div>
                <p className="fpc-title">{f.propertyId.title}</p>
                <p className="fpc-loc">📍 {f.propertyId.location?.city}, {f.propertyId.location?.state}</p>
                <p className="fpc-meta">
                  {f.propertyId.bedrooms > 0 && `🛏 ${f.propertyId.bedrooms}  `}
                  {f.propertyId.area && `📐 ${f.propertyId.area?.toLocaleString()} sqft`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// MY INQUIRIES
// ═══════════════════════════════════════
export const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { canListProperty, isAdmin } = useAuth();

  useEffect(() => {
    inquiryAPI.getMy()
      .then(({ data }) => setInquiries(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="dash-page-header">
        <h1>My Inquiries</h1>
        <p>{inquiries.length} inquiries sent</p>
      </div>
      {inquiries.length === 0 ? (
        <EmptyState icon="💬" title="No inquiries yet" desc="Browse a property and click 'Send Inquiry' to contact the owner">
          <Link to="/properties" className="btn btn-primary" style={{ marginTop: 16 }}>Find Properties</Link>
        </EmptyState>
      ) : (
        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>City</th>
                <th>Price</th>
                <th>My Message</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inq => (
                <tr key={inq._id}>
                  <td>
                    <Link to={`/properties/${inq.propertyId?._id}`} className="table-link">
                      {inq.propertyId?.title?.slice(0, 35) || 'N/A'}
                    </Link>
                  </td>
                  <td>{inq.propertyId?.location?.city || '—'}</td>
                  <td className="fw-700 text-primary">{inq.propertyId?.price ? formatPrice(inq.propertyId.price) : '—'}</td>
                  <td style={{ maxWidth: 200, color: 'var(--text-light)', fontSize: 12 }}>
                    {inq.message?.slice(0, 60)}{inq.message?.length > 60 && '…'}
                  </td>
                  <td>
                    <span className={`badge ${
                      inq.status === 'Pending'   ? 'badge-pending' :
                      inq.status === 'Contacted' ? 'badge-rent' : 'badge-approved'
                    }`}>{inq.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(inq.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// MY VISITS
// ═══════════════════════════════════════
export const MyVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    visitAPI.getMy()
      .then(({ data }) => setVisits(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    try {
        await visitAPI.updateStatus(id, { status: 'Cancelled' });
      setVisits(v => v.map(x => x._id === id ? { ...x, status: 'Cancelled' } : x));
      toast.success('Visit cancelled');
    } catch {
      toast.error('Failed to cancel visit');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="dash-page-header">
        <h1>My Visit Requests</h1>
        <p>{visits.length} visits scheduled</p>
      </div>
      {visits.length === 0 ? (
        <EmptyState icon="📅" title="No visits scheduled" desc="Open any property page and click 'Schedule Visit' to book a viewing" />
      ) : (
        <div className="visits-list">
          {visits.map(v => {
            const statusClass =
              v.status === 'Approved'  ? 'badge-approved' :
              v.status === 'Rejected'  ? 'badge-rejected' :
              v.status === 'Completed' ? 'badge-available' :
              v.status === 'Cancelled' ? 'badge-rejected' : 'badge-pending';
            return (
              <div key={v._id} className="visit-card">
                <div className="vc-img">
                  <img
                    src={v.propertyId?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'}
                    alt=""
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'; }}
                  />
                </div>
                <div className="vc-info">
                  <Link to={`/properties/${v.propertyId?._id}`} className="vc-title">
                    {v.propertyId?.title || 'Property'}
                  </Link>
                  <p>📍 {v.propertyId?.location?.city}, {v.propertyId?.location?.state}</p>
                  <p>📅 <strong>{formatDate(v.visitDate)}</strong> at <strong>{v.visitTime}</strong></p>
                  {v.ownerId && (
                    <p>👤 Owner: {v.ownerId.firstName} {v.ownerId.lastName}
                      {v.ownerId.phone && ` · 📞 ${v.ownerId.phone}`}
                    </p>
                  )}
                  {v.notes && <p>📝 {v.notes}</p>}
                </div>
                <div className="vc-status">
                  <span className={`badge ${statusClass}`}>{v.status}</span>
                  {v.status === 'Requested' && (
                    <button className="btn btn-sm btn-danger" style={{ marginTop: 10 }} onClick={() => handleCancel(v._id)}>
                      Cancel Visit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// MY PAYMENTS
// ═══════════════════════════════════════
export const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getMy()
      .then(({ data }) => setPayments(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const totalSpent = payments.filter(p => p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div>
      <div className="dash-page-header">
        <h1>Payment History</h1>
        <p>{payments.length} transactions · Total paid: <strong style={{ color: 'var(--primary)' }}>{formatPrice(totalSpent)}</strong></p>
      </div>
      {payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" desc="Your payment history will appear here after transactions" />
      ) : (
        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td><code style={{ fontSize: 11, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{p.transactionId}</code></td>
                  <td style={{ maxWidth: 200 }}>{p.propertyId?.title?.slice(0, 30) || '—'}</td>
                  <td className="fw-700 text-primary">{formatPrice(p.amount)}</td>
                  <td>{p.paymentMethod}</td>
                  <td>
                    <span className={`badge ${
                      p.status === 'Completed' ? 'badge-approved' :
                      p.status === 'Failed'    ? 'badge-rejected' : 'badge-pending'
                    }`}>{p.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(p.paymentDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// SUPPORT TICKETS
// ═══════════════════════════════════════
export const SupportTickets = () => {
  const { isAdmin, isSupport } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const [respondId, setRespondId] = useState(null);
  const [respondForm, setRespondForm] = useState({ response: '', status: 'InProgress' });

  const isStaff = isAdmin || isSupport;

  useEffect(() => {
    const fn = isStaff ? supportAPI.getAll : supportAPI.getMy;
    fn().then(({ data }) => setTickets(data.data || [])).finally(() => setLoading(false));
  }, [isStaff]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await supportAPI.create(form);
      setTickets(t => [data.data, ...t]);
      setShowForm(false);
      setForm({ subject: '', description: '', priority: 'Medium' });
      toast.success('Support ticket created!');
    } catch { toast.error('Failed to create ticket'); }
    setSubmitting(false);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supportAPI.respond(respondId, respondForm);
      setTickets(t => t.map(x => x._id === respondId ? data.data : x));
      setRespondId(null);
      toast.success('Response sent!');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="dash-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{isStaff ? 'All Support Tickets' : 'My Support Tickets'}</h1>
          <p>{tickets.length} tickets{isStaff ? ' from all users' : ''}</p>
        </div>
        {!isStaff && (
          <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>
            {showForm ? '✕ Cancel' : '+ New Ticket'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && !isStaff && (
        <div className="dash-card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Create Support Ticket</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input className="form-control" required placeholder="Brief description of your issue"
                value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={4} required placeholder="Describe your issue in detail..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Respond Modal */}
      {respondId && (
        <div className="modal-overlay" onClick={() => setRespondId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Respond to Ticket</h2>
              <button className="modal-close" onClick={() => setRespondId(null)}>✕</button>
            </div>
            <form onSubmit={handleRespond}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select className="form-control" value={respondForm.status}
                    onChange={e => setRespondForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="InProgress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Response *</label>
                  <textarea className="form-control" rows={5} required
                    placeholder="Type your response to the user…"
                    value={respondForm.response}
                    onChange={e => setRespondForm(f => ({ ...f, response: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setRespondId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Response</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <EmptyState icon="🎫" title="No tickets yet" desc="Create a ticket if you need help with anything" />
      ) : (
        <div className="tickets-list">
          {tickets.map(t => (
            <div key={t._id} className={`ticket-card priority-${t.priority?.toLowerCase()}`}>
              <div className="ticket-header">
                <div>
                  <p className="ticket-subject">{t.subject}</p>
                  <div className="ticket-meta">
                    {isStaff && t.userId && (
                      <span>👤 {t.userId.firstName} {t.userId.lastName} · </span>
                    )}
                    <span>{formatDate(t.createdAt)}</span>
                    <span className={`priority-dot priority-${t.priority?.toLowerCase()}`}>{t.priority}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${
                    t.status === 'Open'       ? 'badge-pending' :
                    t.status === 'InProgress' ? 'badge-rent' : 'badge-approved'
                  }`}>{t.status}</span>
                  {isStaff && t.status !== 'Closed' && (
                    <button className="btn btn-sm btn-outline" onClick={() => {
                      setRespondId(t._id);
                      setRespondForm({ response: t.response || '', status: 'InProgress' });
                    }}>Reply</button>
                  )}
                </div>
              </div>
              <p className="ticket-desc">{t.description}</p>
              {t.response && (
                <div className="ticket-response">
                  <strong>📨 Support Response:</strong>
                  <p>{t.response}</p>
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
// SHARED UI HELPERS
// ═══════════════════════════════════════
const PageLoader = () => (
  <div className="page-loader"><div className="spinner" /></div>
);

const EmptyState = ({ icon, title, desc, children }) => (
  <div className="empty-state">
    <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
    {children}
  </div>
);
