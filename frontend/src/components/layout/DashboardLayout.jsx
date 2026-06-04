import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getRoleColor } from '../../utils/helpers';
// Nav items per role
const getNavItems = ({ isAdmin, isOwner, isAgent, isSupport, canListProperty }) => {
  const common = [
    { to: '/dashboard',          label: '📊 Overview',         exact: true },
    { to: '/dashboard/profile',  label: '👤 My Profile' },
  ];

  const buyerItems = [
    { to: '/dashboard/favorites',  label: '❤️ Saved Properties' },
    { to: '/dashboard/inquiries',  label: '💬 My Inquiries' },
    { to: '/dashboard/visits',     label: '📅 My Visits' },
    { to: '/dashboard/payments',   label: '💳 Payments' },
    { to: '/dashboard/support',    label: '🎫 Support Tickets' },
  ];

  const ownerAgentItems = [
    { divider: true },
    { to: '/dashboard/my-properties',   label: '🏘️ My Listings' },
    { to: '/dashboard/list-property',   label: '➕ List Property' },
    { to: '/dashboard/owner-inquiries', label: '💬 Received Inquiries' },
    { to: '/dashboard/owner-visits',    label: '📋 Visit Requests' },
  ];

  const supportItems = [
    { divider: true },
    { to: '/dashboard/support',    label: '🎫 All Support Tickets' },
  ];

  if (isAdmin) {
    return [
      ...common,
      ...buyerItems,
      { divider: true },
      { to: '/dashboard/my-properties',   label: '🏘️ All Properties' },
      { to: '/dashboard/list-property',   label: '➕ List Property' },
      { to: '/dashboard/owner-inquiries', label: '💬 Received Inquiries' },
      { to: '/dashboard/owner-visits',    label: '📋 Visit Requests' },
      { divider: true },
      { to: '/admin',                   label: '⚙️ Admin Panel', adminLink: true },
    ];
  }

  if (isSupport) {
    return [
      ...common,
      ...supportItems,
      { to: '/dashboard/inquiries', label: '💬 Inquiries' },
    ];
  }

  if (isOwner || isAgent) {
    return [...common, ...buyerItems, ...ownerAgentItems];
  }

  // BUYER (default)
  return [...common, ...buyerItems];
};

const DashboardLayout = () => {
  const { user, logout, isAdmin, isOwner, isAgent, isSupport, canListProperty } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = getNavItems({ isAdmin, isOwner, isAgent, isSupport, canListProperty });
  const roleColor = getRoleColor(user?.role);

  return (
    <>
      <style>{componentStyles}</style>
    <div className="dashboard">
      <button className="sidebar-mobile-toggle" onClick={() => setSidebarOpen(s => !s)}>
        ☰ Dashboard Menu
      </button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.profilePic
              ? <img src={user.profilePic} alt="" />
              : getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)
            }
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-name">{user?.firstName} {user?.lastName}</p>
            <span className="sidebar-role" style={{ background: roleColor + '30', color: roleColor }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.divider) return <div key={`div-${i}`} className="nav-divider" />;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''} ${item.adminLink ? 'admin-nav' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
    </>
  );
};


const componentStyles = `/* ══ DASHBOARD LAYOUT ══ */
.dashboard { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 64px); background: var(--bg); }

.dashboard-sidebar {
  background: var(--navy-dark); display: flex; flex-direction: column;
  position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto;
}

/* Sidebar user */
.sidebar-user {
  padding: 20px 18px; display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-avatar {
  width: 40px; height: 40px; border-radius: 10px;
  color: white; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.15);
}
.sidebar-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sidebar-name { font-size: 13px; font-weight: 600; color: white; }
.sidebar-role {
  display: inline-block; margin-top: 3px;
  padding: 1px 7px; border-radius: 4px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
}

/* Nav */
.sidebar-nav { flex: 1; padding: 10px 10px; display: flex; flex-direction: column; gap: 1px; }

.sidebar-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px;
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.5); transition: var(--transition);
}
.sidebar-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
.sidebar-nav-item.active { background: rgba(201,168,76,0.15); color: var(--gold-light); font-weight: 600; }

.nav-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 6px 0; }

.admin-nav { color: #C4B5FD !important; }
.admin-nav:hover { background: rgba(196,181,253,0.1) !important; }
.admin-nav.active { background: rgba(196,181,253,0.15) !important; color: #C4B5FD !important; }

.sidebar-logout {
  margin: 10px 10px 16px;
  padding: 9px 12px; border-radius: 8px;
  background: rgba(185,28,28,0.12); border: 1px solid rgba(185,28,28,0.2);
  color: #FCA5A5; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: var(--transition); text-align: left;
  display: flex; align-items: center; gap: 8px;
}
.sidebar-logout:hover { background: rgba(185,28,28,0.22); }

/* Main */
.dashboard-main { padding: 28px 32px; overflow-x: hidden; }

/* Dashboard page components */
.dash-page-header { margin-bottom: 24px; }
.dash-page-header h1 { font-size: 24px; color: var(--text); }
.dash-page-header p  { color: var(--text-light); margin-top: 4px; font-size: 14px; }

.dash-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-xs); border: 1px solid var(--border-light); padding: 22px; }

.dash-table { width: 100%; border-collapse: collapse; }
.dash-table th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-muted); background: var(--bg); border-bottom: 1px solid var(--border); white-space: nowrap; }
.dash-table td { padding: 12px 14px; border-bottom: 1px solid var(--border-light); font-size: 13px; vertical-align: middle; }
.dash-table tr:last-child td { border-bottom: none; }
.dash-table tr:hover td { background: var(--off-white); }

/* Mobile toggle */
.sidebar-mobile-toggle {
  display: none; align-items: center; gap: 8px;
  padding: 12px 20px; background: var(--navy-dark);
  color: rgba(255,255,255,0.8); border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  position: sticky; top: 0; z-index: 50; width: 100%;
}

@media (max-width: 1024px) {
  .dashboard { grid-template-columns: 1fr; }
  .dashboard-sidebar {
    position: fixed; top: 0; left: -260px; height: 100vh;
    z-index: 200; width: 240px; transition: left 0.3s var(--ease);
  }
  .dashboard-sidebar.open { left: 0; }
  .sidebar-backdrop { position: fixed; inset: 0; background: rgba(9,29,55,0.5); z-index: 199; }
  .sidebar-mobile-toggle { display: flex; }
  .dashboard-main { padding: 20px 16px; }
}
`;

export default DashboardLayout;
