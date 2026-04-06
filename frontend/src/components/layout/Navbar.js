import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getRoleColor } from '../../utils/helpers';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, canListProperty, isSupport } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const roleColor   = getRoleColor(user?.role);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-mark">🏛</div>
          <span className="logo-text">Prop<span>Finder</span></span>
        </Link>

        {/* Nav links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/properties?listingType=Sale"        className="nav-link">Buy</Link>
          <Link to="/properties?listingType=Rent"        className="nav-link">Rent</Link>
          <Link to="/properties?propertyType=Commercial" className="nav-link">Commercial</Link>
          <Link to="/about"                              className="nav-link">About</Link>
          {canListProperty && (
            <Link to="/dashboard/list-property" className="nav-link-cta">+ List Property</Link>
          )}
        </div>

        {/* Right */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-dropdown" ref={dropRef}>
              <button className="user-btn" onClick={() => setDropOpen(d => !d)}>
                <div className="user-avatar" style={{ background: roleColor }}>
                  {user.profilePic ? <img src={user.profilePic} alt="" /> : getInitials(`${user.firstName} ${user.lastName}`)}
                </div>
                <div className="user-btn-text">
                  <span className="user-name">{user.firstName}</span>
                  <span className="user-role-badge" style={{ color: roleColor }}>{user.role}</span>
                </div>
                <span className={`chevron ${dropOpen ? 'up' : ''}`}>▾</span>
              </button>

              {dropOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dh-avatar" style={{ background: roleColor }}>
                      {user.profilePic ? <img src={user.profilePic} alt="" /> : getInitials(`${user.firstName} ${user.lastName}`)}
                    </div>
                    <div>
                      <p className="dropdown-name">{user.firstName} {user.lastName}</p>
                      <span className="dropdown-role">{user.role}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/dashboard"         className="dropdown-item">⊞  Dashboard</Link>
                  <Link to="/dashboard/profile" className="dropdown-item">○  My Profile</Link>
                  {!isSupport && !isAdmin && <>
                    <Link to="/dashboard/favorites" className="dropdown-item">♡  Saved</Link>
                    <Link to="/dashboard/inquiries" className="dropdown-item">◈  Inquiries</Link>
                    <Link to="/dashboard/visits"    className="dropdown-item">⊡  Visits</Link>
                  </>}
                  {canListProperty && <>
                    <div className="dropdown-divider" />
                    <Link to="/dashboard/my-properties"  className="dropdown-item">⊟  My Listings</Link>
                    <Link to="/dashboard/list-property"  className="dropdown-item">+  List Property</Link>
                    <Link to="/dashboard/owner-inquiries" className="dropdown-item">◈  Received Inquiries</Link>
                  </>}
                  {(isSupport || isAdmin) && <>
                    <div className="dropdown-divider" />
                    <Link to="/dashboard/support" className="dropdown-item">⊙  Support</Link>
                  </>}
                  {isAdmin && <>
                    <div className="dropdown-divider" />
                    <Link to="/admin" className="dropdown-item admin-link">⚙  Admin Panel</Link>
                  </>}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>→  Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setMenuOpen(m => !m)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
