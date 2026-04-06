import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, propertyAPI, supportAPI } from '../../utils/api';
import { formatPrice, formatDate, getRoleColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './AdminPanel.css';

// ─── Tab config ───────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: '📊 Overview' },
  { id: 'pending',     label: '⏳ Pending Approval' },
  { id: 'properties',  label: '🏠 All Properties' },
  { id: 'users',       label: '👥 Users' },
  { id: 'tickets',     label: '🎫 Support Tickets' },
];

const AdminPanel = () => {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [pending,     setPending]     = useState([]);   // pending approval
  const [allProps,    setAllProps]    = useState([]);   // all properties
  const [tickets,     setTickets]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [propsLoading,setPropsLoading]= useState(false);
  const [userFilter,  setUserFilter]  = useState('');
  const [propSearch,  setPropSearch]  = useState('');
  const [respondId,   setRespondId]   = useState(null);
  const [respondText, setRespondText] = useState('');
  const [respondStatus,setRespondStatus]=useState('InProgress');

  // ── Initial load ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, pendingRes, ticketsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers({ limit: 500 }),
          propertyAPI.getAll({ approvalStatus: 'Pending', limit: 100 }),
          supportAPI.getAll(),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data || []);
        setPending(pendingRes.data.data || []);
        setTickets(ticketsRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load admin data');
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── Load all properties (lazy — only when tab opened) ──
  useEffect(() => {
    if (activeTab !== 'properties' || allProps.length > 0) return;
    setPropsLoading(true);
    propertyAPI.getAll({ limit: 200 })
      .then(({ data }) => setAllProps(data.data || []))
      .catch(() => toast.error('Failed to load properties'))
      .finally(() => setPropsLoading(false));
  }, [activeTab, allProps.length]);

  // ── Approval ──────────────────────────────────────────
  const handleApproval = async (id, approvalStatus) => {
    try {
      const { data } = await propertyAPI.updateApproval(id, { approvalStatus });
      setPending(p => p.filter(x => x._id !== id));
      setAllProps(p => p.map(x => x._id === id ? { ...x, approvalStatus } : x));
      toast.success(`Property ${approvalStatus.toLowerCase()} ✅`);
    } catch { toast.error('Failed to update approval'); }
  };

  // ── Toggle featured ───────────────────────────────────
  const handleFeatured = async (id, featured) => {
    try {
      await propertyAPI.updateApproval(id, { featured: !featured });
      setAllProps(p => p.map(x => x._id === id ? { ...x, featured: !featured } : x));
      toast.success(!featured ? 'Property marked as featured ⭐' : 'Removed from featured');
    } catch { toast.error('Failed to update featured'); }
  };

  // ── Toggle user active/blocked ────────────────────────
  const handleToggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: data.data.isActive } : x));
      toast.success(data.message);
    } catch { toast.error('Failed to update user'); }
  };

  // ── Support ticket respond ────────────────────────────
  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supportAPI.respond(respondId, { response: respondText, status: respondStatus });
      setTickets(t => t.map(x => x._id === respondId ? data.data : x));
      setRespondId(null);
      setRespondText('');
      toast.success('Response sent ✅');
    } catch { toast.error('Failed to respond'); }
  };

  // ── Filtered lists ────────────────────────────────────
  const filteredUsers = userFilter
    ? users.filter(u => u.role === userFilter)
    : users;

  const filteredProps = propSearch
    ? allProps.filter(p =>
        p.title?.toLowerCase().includes(propSearch.toLowerCase()) ||
        p.location?.city?.toLowerCase().includes(propSearch.toLowerCase())
      )
    : allProps;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h1>⚙️ Admin Panel</h1>
          <p>PropFinder Platform Management</p>
        </div>
        {pending.length > 0 && (
          <div className="pending-alert-badge">
            ⚠️ {pending.length} propert{pending.length > 1 ? 'ies' : 'y'} awaiting approval
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.id === 'pending'  && pending.length  > 0 && <span className="tab-badge">{pending.length}</span>}
            {t.id === 'tickets'  && tickets.filter(t=>t.status!=='Closed').length > 0 && (
              <span className="tab-badge">{tickets.filter(t=>t.status!=='Closed').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="admin-stats-grid">
            {[
              { label: 'Total Users',      value: stats.totalUsers,        icon: '👥', color: '#3b82f6' },
              { label: 'Total Properties', value: stats.totalProperties,   icon: '🏠', color: '#10b981' },
              { label: 'Pending Approval', value: stats.pendingProperties, icon: '⏳', color: '#f59e0b' },
              { label: 'Open Tickets',     value: stats.openTickets,       icon: '🎫', color: '#ef4444' },
              { label: 'Total Revenue',    value: formatPrice(stats.totalRevenue), icon: '💰', color: '#8b5cf6', isText: true },
              { label: 'Transactions',     value: stats.totalTransactions, icon: '💳', color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: s.color+'18', color: s.color }}>{s.icon}</div>
                <div>
                  <div className="admin-stat-val" style={{ color: s.color }}>
                    {s.isText ? s.value : s.value?.toLocaleString()}
                  </div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-cards-row">
            {/* Users by role */}
            <div className="dash-card">
              <h3 style={{ marginBottom: 20 }}>Users by Role</h3>
              <div className="role-breakdown">
                {stats.usersByRole?.map(r => (
                  <div key={r._id} className="role-row">
                    <div className="role-name" style={{ color: getRoleColor(r._id) }}>
                      <span className="role-dot" style={{ background: getRoleColor(r._id) }} />
                      {r._id}
                    </div>
                    <div className="role-bar-wrap">
                      <div className="role-bar"
                        style={{ width:`${Math.min((r.count/stats.totalUsers)*100,100)}%`, background: getRoleColor(r._id) }} />
                    </div>
                    <span className="role-count">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick pending approvals */}
            <div className="dash-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3>Pending Approval</h3>
                {pending.length > 3 && (
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('pending')}>
                    View All ({pending.length})
                  </button>
                )}
              </div>
              {pending.length === 0 ? (
                <p className="text-muted" style={{textAlign:'center',padding:'20px 0'}}>✅ All caught up! No pending properties.</p>
              ) : (
                pending.slice(0, 4).map(p => (
                  <div key={p._id} className="pending-property-row">
                    <div className="pending-prop-img">
                      <img src={p.images?.[0]||'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60'} alt=""
                        onError={e=>{e.target.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60';}} />
                    </div>
                    <div className="pending-prop-info">
                      <p className="pending-title">{p.title?.slice(0,40)}</p>
                      <p className="pending-owner">by {p.ownerId?.firstName} {p.ownerId?.lastName} · {p.location?.city}</p>
                    </div>
                    <div className="pending-actions">
                      <button className="btn btn-sm btn-success" onClick={() => handleApproval(p._id,'Approved')}>✓</button>
                      <button className="btn btn-sm btn-danger"  onClick={() => handleApproval(p._id,'Rejected')}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ PENDING APPROVAL ══ */}
      {activeTab === 'pending' && (
        <div>
          <div className="dash-page-header">
            <h2>Pending Property Approvals</h2>
            <p>{pending.length} properties awaiting your review</p>
          </div>
          {pending.length === 0 ? (
            <div className="empty-state">
              <div style={{fontSize:64,marginBottom:16}}>✅</div>
              <h3>All caught up!</h3>
              <p>No properties are waiting for approval</p>
            </div>
          ) : (
            <div className="pending-cards-grid">
              {pending.map(p => (
                <div key={p._id} className="pending-card">
                  <div className="pending-card-img">
                    <img src={p.images?.[0]||'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'} alt={p.title}
                      onError={e=>{e.target.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';}} />
                    <span className={`badge badge-${p.listingType?.toLowerCase()}`} style={{position:'absolute',top:10,left:10}}>{p.listingType}</span>
                  </div>
                  <div className="pending-card-body">
                    <p className="pending-card-title">{p.title}</p>
                    <p className="pending-card-meta">
                      📍 {p.location?.city}, {p.location?.state}<br/>
                      💰 {formatPrice(p.price)} · 📐 {p.area?.toLocaleString()} sqft · {p.propertyType}
                    </p>
                    <p className="pending-card-owner">
                      👤 {p.ownerId?.firstName} {p.ownerId?.lastName}
                      <span style={{color:'var(--text-muted)',marginLeft:6}}>({p.ownerId?.email})</span>
                    </p>
                    <p className="pending-card-date">Submitted: {formatDate(p.createdAt)}</p>
                    <Link to={`/properties/${p._id}`} target="_blank" className="btn btn-ghost btn-sm" style={{padding:'4px 10px',marginBottom:8}}>
                      👁 Preview Property
                    </Link>
                  </div>
                  <div className="pending-card-actions">
                    <button className="btn btn-success" style={{flex:1}} onClick={() => handleApproval(p._id,'Approved')}>
                      ✓ Approve
                    </button>
                    <button className="btn btn-danger"  style={{flex:1}} onClick={() => handleApproval(p._id,'Rejected')}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ ALL PROPERTIES ══ */}
      {activeTab === 'properties' && (
        <div>
          <div className="dash-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div>
              <h2>All Properties</h2>
              <p>{filteredProps.length} of {allProps.length} properties</p>
            </div>
            <input
              className="form-control"
              style={{ maxWidth: 280 }}
              placeholder="🔍 Search by title or city…"
              value={propSearch}
              onChange={e => setPropSearch(e.target.value)}
            />
          </div>
          {propsLoading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div className="dash-card" style={{ padding:0, overflow:'hidden' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Property</th><th>Price</th><th>City</th><th>Owner</th>
                    <th>Status</th><th>Approval</th><th>Featured</th><th>Views</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProps.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className="prop-table-item">
                          <img src={p.images?.[0]||'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80'} alt=""
                            onError={e=>{e.target.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=80';}} />
                          <div>
                            <span style={{fontWeight:700,fontSize:12}}>{p.title?.slice(0,28)}{p.title?.length>28?'…':''}</span>
                            <span style={{display:'block',fontSize:10,color:'var(--text-muted)'}}>{p.propertyType} · {p.listingType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="fw-700 text-primary" style={{fontSize:13}}>{formatPrice(p.price)}</td>
                      <td style={{fontSize:12}}>{p.location?.city}</td>
                      <td style={{fontSize:12}}>{p.ownerId?.firstName} {p.ownerId?.lastName}</td>
                      <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                      <td>
                        <select
                          className="status-select"
                          value={p.approvalStatus}
                          style={{
                            borderColor: p.approvalStatus==='Approved'?'#10b981':p.approvalStatus==='Rejected'?'#ef4444':'#f59e0b',
                            color: p.approvalStatus==='Approved'?'#10b981':p.approvalStatus==='Rejected'?'#ef4444':'#f59e0b',
                          }}
                          onChange={e => handleApproval(p._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={`featured-toggle ${p.featured ? 'active' : ''}`}
                          onClick={() => handleFeatured(p._id, p.featured)}
                          title={p.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          {p.featured ? '⭐' : '☆'}
                        </button>
                      </td>
                      <td style={{fontSize:12}}>👁 {p.views||0}</td>
                      <td>
                        <Link to={`/properties/${p._id}`} className="btn btn-sm btn-outline" target="_blank">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ USERS ══ */}
      {activeTab === 'users' && (
        <div>
          <div className="dash-page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div>
              <h2>All Users</h2>
              <p>{filteredUsers.length} of {users.length} users</p>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['', 'BUYER', 'OWNER', 'AGENT', 'ADMIN', 'SUPPORT'].map(r => (
                <button key={r} className={`filter-tab-btn ${userFilter===r?'active':''}`}
                  onClick={() => setUserFilter(r)}>
                  {r || 'All'} <span className="tab-count">{r ? users.filter(u=>u.role===r).length : users.length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="dash-card" style={{padding:0,overflow:'hidden'}}>
            <table className="dash-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>City</th><th>Status</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td><strong style={{fontSize:13}}>{u.firstName} {u.lastName}</strong></td>
                    <td style={{fontSize:12,color:'var(--text-light)'}}>{u.email}</td>
                    <td style={{fontSize:12}}>{u.phone||'—'}</td>
                    <td>
                      <span className="role-tag" style={{background:getRoleColor(u.role)+'20',color:getRoleColor(u.role)}}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{fontSize:12}}>{u.city||'—'}</td>
                    <td>
                      <span className={`badge ${u.isActive?'badge-approved':'badge-rejected'}`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{fontSize:11,color:'var(--text-muted)'}}>{formatDate(u.createdAt)}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`}
                        onClick={() => handleToggleUser(u._id)}
                      >
                        {u.isActive ? 'Block' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ SUPPORT TICKETS ══ */}
      {activeTab === 'tickets' && (
        <div>
          <div className="dash-page-header">
            <h2>Support Tickets</h2>
            <p>{tickets.length} total · {tickets.filter(t=>t.status==='Open').length} open · {tickets.filter(t=>t.status==='InProgress').length} in progress</p>
          </div>
          {tickets.length === 0 ? (
            <div className="empty-state"><div style={{fontSize:64}}>🎫</div><h3>No tickets</h3></div>
          ) : (
            <div className="tickets-admin-list">
              {tickets.map(t => (
                <div key={t._id} className={`ticket-admin-card priority-${t.priority?.toLowerCase()}`}>
                  <div className="tac-header">
                    <div>
                      <p className="tac-subject">{t.subject}</p>
                      <p className="tac-meta">
                        👤 {t.userId?.firstName} {t.userId?.lastName}
                        <span style={{color:'var(--text-muted)',marginLeft:6}}>{t.userId?.email}</span>
                        <span style={{marginLeft:10}}>{formatDate(t.createdAt)}</span>
                      </p>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                      <span className={`priority-dot priority-${t.priority?.toLowerCase()}`}>{t.priority}</span>
                      <span className={`badge ${t.status==='Open'?'badge-pending':t.status==='InProgress'?'badge-rent':'badge-approved'}`}>
                        {t.status}
                      </span>
                      {t.status !== 'Closed' && (
                        <button className="btn btn-sm btn-outline" onClick={() => { setRespondId(t._id); setRespondText(t.response||''); setRespondStatus('InProgress'); }}>
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="tac-desc">{t.description}</p>
                  {t.response && (
                    <div className="tac-response">
                      <strong>📨 Your Response:</strong>
                      <p>{t.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                  <select className="form-control" value={respondStatus} onChange={e => setRespondStatus(e.target.value)}>
                    <option value="InProgress">In Progress</option>
                    <option value="Closed">Closed (Resolved)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Response *</label>
                  <textarea className="form-control" rows={5} required
                    placeholder="Type your response to the user…"
                    value={respondText} onChange={e => setRespondText(e.target.value)} />
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
    </div>
  );
};

export default AdminPanel;
