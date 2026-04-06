import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getRoleColor } from '../../utils/helpers';
import './DashboardLayout.css';

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
  );
};

export default DashboardLayout;
