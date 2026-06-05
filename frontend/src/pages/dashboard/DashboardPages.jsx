import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { favoriteAPI, inquiryAPI, visitAPI, paymentAPI, supportAPI, propertyAPI } from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ROLE_META } from '../../config/roles';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════
// DASHBOARD OVERVIEW
// ═══════════════════════════════════════
export const DashboardOverview = () => {
  const { user, permissions, canListProperty, canUseBuyerJourney, canManageLeads, isAdmin, isSupport, isAgent } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const roleMeta = ROLE_META[user?.role] || ROLE_META.BUYER;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (canUseBuyerJourney) {
          const [favRes, inqRes, visRes] = await Promise.all([
            favoriteAPI.getMy(),
            inquiryAPI.getMy(),
            visitAPI.getMy(),
          ]);
          setStats({
            favorites: favRes.data.data?.length || 0,
            inquiries: inqRes.data.data?.length || 0,
            visits: visRes.data.data?.length || 0,
          });
        } else if (canManageLeads) {
          const [propRes, inqRes, visRes] = await Promise.all([
            propertyAPI.getAll({ limit: 100 }),
            inquiryAPI.getReceived(),
            visitAPI.getOwner(),
          ]);
          const listings = propRes.data.data || [];
          const inquiries = inqRes.data.data || [];
          const visits = visRes.data.data || [];
          setStats({
            listings: listings.length,
            pendingListings: listings.filter(p => p.approvalStatus === 'Pending').length,
            inquiries: inquiries.length,
            pendingInquiries: inquiries.filter(i => i.status === 'Pending').length,
            visits: visits.length,
            pendingVisits: visits.filter(v => v.status === 'Requested').length,
          });
        } else if (isSupport) {
          const ticketRes = await supportAPI.getAll();
          setStats({ tickets: ticketRes.data.data?.length || 0 });
        }
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, [canUseBuyerJourney, canManageLeads, isSupport, isAdmin]);

  const statCards = (() => {
    if (canUseBuyerJourney) {
      return [
        { label: 'Saved Properties', value: stats.favorites, icon: '❤️', link: '/dashboard/favorites', color: '#ef4444' },
        { label: 'My Inquiries', value: stats.inquiries, icon: '💬', link: '/dashboard/inquiries', color: '#3b82f6' },
        { label: 'Scheduled Visits', value: stats.visits, icon: '📅', link: '/dashboard/visits', color: '#10b981' },
      ];
    }
    if (canManageLeads) {
      return [
        { label: isAdmin ? 'All Listings' : 'My Listings', value: stats.listings, icon: '🏘️', link: '/dashboard/my-properties', color: '#8b5cf6' },
        { label: 'Pending Approval', value: stats.pendingListings, icon: '⏳', link: '/dashboard/my-properties', color: '#f59e0b' },
        { label: isAgent ? 'Client Inquiries' : 'Received Inquiries', value: stats.inquiries, icon: '💬', link: '/dashboard/owner-inquiries', color: '#3b82f6' },
        { label: 'Visit Requests', value: stats.visits, icon: '📋', link: '/dashboard/owner-visits', color: '#10b981' },
      ];
    }
    if (isSupport) {
      return [
        { label: 'Support Tickets', value: stats.tickets, icon: '🎫', link: '/dashboard/support', color: '#6b7280' },
      ];
    }
    return [];
  })();

  const quickLinks = [
    { to: '/properties', icon: '🔍', label: 'Browse Properties', show: !isSupport },
    { to: '/dashboard/favorites', icon: '❤️', label: 'Saved Properties', show: canUseBuyerJourney },
    { to: '/dashboard/inquiries', icon: '💬', label: 'My Inquiries', show: canUseBuyerJourney },
    { to: '/dashboard/visits', icon: '📅', label: 'My Visits', show: canUseBuyerJourney },
    { to: '/dashboard/payments', icon: '💳', label: 'Payments', show: canUseBuyerJourney },
    { to: '/dashboard/list-property', icon: '➕', label: 'List Property', show: canListProperty, highlight: true },
    { to: '/dashboard/my-properties', icon: '🏘️', label: isAdmin ? 'All Listings' : 'My Listings', show: canManageLeads },
    { to: '/dashboard/owner-inquiries', icon: '💬', label: isAgent ? 'Client Inquiries' : 'Received Inquiries', show: canManageLeads },
    { to: '/dashboard/owner-visits', icon: '📋', label: 'Visit Requests', show: canManageLeads },
    { to: '/dashboard/support', icon: '🎫', label: isSupport ? 'Support Desk' : 'Support Tickets', show: true },
    { to: '/admin', icon: '⚙️', label: 'Admin Panel', show: isAdmin, highlight: true },
  ].filter(l => l.show);

  return (
    <>
      <style>{componentStyles}</style>
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
              &nbsp; {roleMeta.tagline}
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
    </>
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
    <li>✅ List properties for Sale or Rent + manage leads</li>
    <li>✅ Also browse, save & inquire on other properties (like a buyer)</li>
    <li>✅ Receive and respond to buyer inquiries</li>
    <li>✅ Approve or reject visit requests on your listings</li>
    <li>⏳ New listings require Admin approval before going live</li>
  </ul>
);
const AgentInfo = () => (
  <ul className="cap-list">
    <li>✅ List properties on behalf of property owners</li>
    <li>✅ Manage client inquiries from your listings</li>
    <li>✅ Approve or reject visit requests on your listings</li>
    <li>✅ Professional agent dashboard (separate from buyer tools)</li>
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
    <>
      <style>{componentStyles}</style>
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
    </>
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
    <>
      <style>{componentStyles}</style>
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
    </>
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
    <>
      <style>{componentStyles}</style>
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
    </>
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
    <>
      <style>{componentStyles}</style>
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
    </>
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
    <>
      <style>{componentStyles}</style>
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
    </>
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

const componentStyles = `/* ══ DASHBOARD PAGES ══ */

/* Overview */
.overview-page { display: flex; flex-direction: column; gap: 20px; }

.welcome-banner {
  background: var(--navy); border-radius: var(--radius-lg);
  padding: 24px 28px; display: flex; align-items: center;
  justify-content: space-between; gap: 20px; flex-wrap: wrap;
}
.wb-left { display: flex; align-items: center; gap: 16px; }
.wb-role-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
  background: rgba(255,255,255,0.1);
}
.welcome-banner h1 { font-size: 20px; color: white; margin-bottom: 5px; }
.welcome-banner p  { font-size: 13px; color: rgba(255,255,255,0.55); margin: 0; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.wb-role-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; color: white; font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card {
  background: white; border-radius: var(--radius-lg);
  padding: 18px; border: 1px solid var(--border-light);
  display: flex; align-items: center; gap: 14px;
  transition: var(--transition); box-shadow: var(--shadow-xs);
}
.stat-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.stat-icon { width: 46px; height: 46px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.stat-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--text); line-height: 1; }
.stat-label { font-size: 11px; color: var(--text-muted); margin-top: 3px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-arrow { margin-left: auto; color: var(--border); font-size: 16px; }

/* Quick actions */
.quick-actions-card { background: white; border-radius: var(--radius-lg); padding: 20px 22px; border: 1px solid var(--border-light); box-shadow: var(--shadow-xs); }
.quick-actions-card h2 { font-size: 16px; margin-bottom: 16px; }
.quick-links-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.quick-link-card {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  background: var(--bg); border: 1.5px solid var(--border-light);
  border-radius: var(--radius); transition: var(--transition); cursor: pointer;
}
.quick-link-card:hover { border-color: var(--navy); background: var(--primary-light); }
.quick-link-card.highlight { background: var(--primary-light); border-color: rgba(15,45,82,0.2); }
.ql-icon  { font-size: 18px; flex-shrink: 0; }
.ql-label { font-size: 12px; font-weight: 600; color: var(--text-body); flex: 1; }
.ql-arrow { color: var(--text-muted); font-size: 13px; }

/* Role info panel */
.role-info-panel { border-radius: var(--radius-lg); border: 1px solid; overflow: hidden; }
.rip-header { padding: 12px 18px; font-weight: 700; font-size: 13px; border-bottom: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.6); }
.rip-body  { padding: 14px 18px; }
.cap-list  { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.cap-list li { font-size: 13px; color: var(--text-body); display: flex; gap: 8px; line-height: 1.4; }

/* Favourites */
.fav-property-card { background: white; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-light); transition: var(--transition); display: block; box-shadow: var(--shadow-xs); }
.fav-property-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border); }
.fpc-img { position: relative; padding-top: 58%; overflow: hidden; background: var(--bg); isolation: isolate; }
.fpc-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s var(--ease); }
.fav-property-card:hover .fpc-img img { transform: scale(1.05); }
.fpc-badge { position: absolute; top: 10px; left: 10px; }
.fpc-body  { padding: 14px; }
.fpc-price { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--navy); }
.fpc-title { font-size: 13px; font-weight: 600; color: var(--text); margin: 4px 0 3px; line-height: 1.4; }
.fpc-loc   { font-size: 11px; color: var(--text-muted); margin-bottom: 7px; }
.fpc-meta  { font-size: 11px; color: var(--text-muted); }

/* Visits */
.visits-list { display: flex; flex-direction: column; gap: 12px; }
.visit-card { background: white; border-radius: var(--radius-lg); padding: 16px; border: 1px solid var(--border-light); display: grid; grid-template-columns: 84px 1fr auto; gap: 14px; align-items: center; box-shadow: var(--shadow-xs); }
.vc-img { width: 84px; height: 62px; border-radius: var(--radius); overflow: hidden; flex-shrink: 0; }
.vc-img img { width: 100%; height: 100%; object-fit: cover; }
.vc-title { font-weight: 700; font-size: 13px; color: var(--text); display: block; margin-bottom: 5px; }
.vc-title:hover { color: var(--navy); }
.vc-info p { font-size: 12px; color: var(--text-muted); margin: 2px 0; }
.vc-status { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; }

/* Tickets */
.tickets-list { display: flex; flex-direction: column; gap: 10px; }
.ticket-card { background: white; border-radius: var(--radius-lg); padding: 16px 18px; border: 1px solid var(--border-light); border-left: 3px solid var(--border); box-shadow: var(--shadow-xs); }
.ticket-card.priority-high   { border-left-color: var(--danger); }
.ticket-card.priority-medium { border-left-color: var(--warning); }
.ticket-card.priority-low    { border-left-color: var(--success); }
.ticket-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.ticket-subject { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 3px; }
.ticket-meta    { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.priority-dot   { padding: 1px 7px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.priority-high   { background: #FEF2F2; color: var(--danger); }
.priority-medium { background: #FFFBEB; color: var(--warning); }
.priority-low    { background: #ECFDF5; color: var(--success); }
.ticket-desc     { font-size: 13px; color: var(--text-light); line-height: 1.6; }
.ticket-response { margin-top: 10px; padding: 10px 12px; background: #ECFDF5; border-radius: 8px; border-left: 2px solid var(--success); }
.ticket-response strong { font-size: 10px; color: var(--success); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px; }
.ticket-response p { font-size: 12px; color: var(--text-body); margin: 0; }

/* Table */
.dash-table { width: 100%; border-collapse: collapse; }
.dash-table th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-muted); background: var(--bg); border-bottom: 1px solid var(--border); white-space: nowrap; }
.dash-table td { padding: 12px 14px; border-bottom: 1px solid var(--border-light); font-size: 13px; vertical-align: middle; }
.dash-table tr:last-child td { border-bottom: none; }
.dash-table tr:hover td { background: var(--off-white); }
.table-link { color: var(--navy); font-weight: 600; }
.table-link:hover { text-decoration: underline; }

/* Modal */
.modal-property-title { font-weight: 600; color: var(--navy); font-size: 13px; margin-bottom: 16px; padding: 9px 12px; background: var(--primary-light); border-radius: 8px; }

/* Empty */
.empty-state { text-align: center; padding: 56px 20px; }
.empty-icon  { font-size: 52px; margin-bottom: 14px; opacity: 0.35; }
.empty-state h3 { font-size: 18px; margin-bottom: 7px; color: var(--text); }
.empty-state p  { color: var(--text-muted); font-size: 13px; }

/* Dash page header */
.dash-page-header { margin-bottom: 22px; }
.dash-page-header h1 { font-size: 24px; }
.dash-page-header p  { color: var(--text-muted); margin-top: 4px; font-size: 13px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(9,29,55,0.5); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
.modal { background: white; border-radius: var(--radius-xl); max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s var(--ease); box-shadow: var(--shadow-xl); }
.modal-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); }
.modal-header h2 { font-size: 18px; }
.modal-body   { padding: 20px 24px; }
.modal-footer { padding: 0 24px 20px; display: flex; gap: 10px; justify-content: flex-end; }
.modal-close  { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 6px; }
.modal-close:hover { background: var(--bg); color: var(--text); }
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

.fw-700 { font-weight: 700; }
.text-navy { color: var(--navy); }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .quick-links-grid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 768px)  { .stats-grid { grid-template-columns: 1fr 1fr; } .quick-links-grid { grid-template-columns: repeat(2,1fr); } .visit-card { grid-template-columns: 1fr; } .wb-left { flex-direction: column; align-items: flex-start; } .welcome-banner { flex-direction: column; align-items: flex-start; } }
`;

