import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, getRoleColor } from '../../utils/helpers';
import { getNavbarMenu, ROLE_META } from '../../config/roles';
import { FiSun, FiMoon } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, permissions, canListProperty } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  const roleMeta    = ROLE_META[user?.role];
  const menuItems   = user ? getNavbarMenu(permissions) : [];

  return (
    <>
      <style>{componentStyles}</style>
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-mark">🏛</div>
          <span className="logo-text">Prop<span>Finder</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/properties?listingType=Sale"        className="nav-link">Buy</Link>
          <Link to="/properties?listingType=Rent"        className="nav-link">Rent</Link>
          <Link to="/properties?propertyType=Commercial" className="nav-link">Commercial</Link>
          <Link to="/about"                              className="nav-link">About</Link>
          {canListProperty && (
            <Link to="/dashboard/list-property" className="nav-link-cta">+ List Property</Link>
          )}
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          {user ? (
            <div className="user-dropdown" ref={dropRef}>
              <button className="user-btn" onClick={() => setDropOpen(d => !d)}>
                <div className="user-avatar" style={{ background: roleColor }}>
                  {user.profilePic ? <img src={user.profilePic} alt="" /> : getInitials(`${user.firstName} ${user.lastName}`)}
                </div>
                <div className="user-btn-text">
                  <span className="user-name">{user.firstName}</span>
                  <span className="user-role-badge" style={{ color: roleColor }}>
                    {roleMeta?.label || user.role}
                  </span>
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
                      <span className="dropdown-role">{roleMeta?.label || user.role}</span>
                    </div>
                  </div>
                  {menuItems.map((item, i) =>
                    item.divider ? (
                      <div key={`div-${i}`} className="dropdown-divider" />
                    ) : (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`dropdown-item ${item.adminLink ? 'admin-link' : ''}`}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
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
    </>
  );
};


const componentStyles = `/* ══ NAVBAR — clean white + navy ══ */
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 0 var(--border-light);
}

.navbar-inner {
  display: flex; align-items: center;
  justify-content: space-between;
  height: 64px; gap: 32px;
}

.navbar-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.logo-mark {
  width: 36px; height: 36px;
  background: var(--navy);
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 21px; font-weight: 700;
  color: var(--navy); letter-spacing: -0.02em;
}

.logo-text span { color: var(--gold); }

.navbar-links {
  display: flex; align-items: center;
  gap: 2px; flex: 1; justify-content: center;
}

.nav-link {
  padding: 7px 14px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  color: var(--text-light); transition: var(--transition);
  letter-spacing: 0.01em;
}
.nav-link:hover { color: var(--navy); background: var(--primary-light); }
.nav-link.active { color: var(--navy); font-weight: 600; }

.nav-link-cta {
  padding: 7px 16px;
  background: var(--gold-pale); color: var(--warning);
  border: 1px solid var(--gold-light);
  border-radius: 8px; font-weight: 600; font-size: 14px;
  transition: var(--transition);
}
.nav-link-cta:hover { background: var(--gold); color: white; border-color: var(--gold); }

.navbar-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.auth-buttons   { display: flex; align-items: center; gap: 8px; }

.user-dropdown { position: relative; }

.user-btn {
  display: flex; align-items: center; gap: 9px;
  padding: 5px 12px 5px 5px;
  background: white; border: 1.5px solid var(--border);
  border-radius: 100px; cursor: pointer;
  transition: var(--transition);
}
.user-btn:hover { border-color: var(--navy); box-shadow: var(--shadow-sm); }

.user-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--navy); color: white;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.user-btn-text { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text); line-height: 1; }
.user-role-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1; }

.chevron { font-size: 12px; color: var(--text-muted); transition: var(--transition); }
.chevron.up { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 240px; background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
  animation: dropDown 0.18s var(--ease);
  overflow: hidden;
}
@keyframes dropDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

.dropdown-header {
  padding: 14px 16px;
  background: var(--navy); display: flex; align-items: center; gap: 12px;
}
.dh-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  color: white; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.3);
}
.dh-avatar img { width: 100%; height: 100%; object-fit: cover; }
.dropdown-name { font-size: 13px; font-weight: 600; color: white; }
.dropdown-role {
  display: inline-block; margin-top: 3px;
  padding: 2px 8px; background: rgba(201,168,76,0.25);
  color: var(--gold-light); border-radius: 4px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
}

.dropdown-divider { height: 1px; background: var(--border-light); }

.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; font-size: 13px; font-weight: 500;
  color: var(--text-body); transition: var(--transition);
  width: 100%; border: none; background: none;
  text-align: left; cursor: pointer;
}
.dropdown-item:hover { background: var(--bg); color: var(--navy); }
.admin-link  { color: #7C3AED !important; }
.admin-link:hover  { background: #F5F3FF !important; }
.logout-item { color: var(--danger) !important; }
.logout-item:hover { background: #FEF2F2 !important; }

.menu-toggle {
  display: none; flex-direction: column;
  gap: 5px; padding: 8px; background: none; border: none;
}
.menu-toggle span {
  display: block; width: 20px; height: 1.5px;
  background: var(--text-body); border-radius: 2px; transition: var(--transition);
}

@media (max-width: 900px) {
  .menu-toggle { display: flex; }
  .navbar-links {
    display: none; position: absolute;
    top: 64px; left: 0; right: 0;
    background: white; flex-direction: column;
    padding: 12px 16px 16px; gap: 4px;
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-md); z-index: 99;
  }
  .navbar-links.open { display: flex; }
  .navbar-inner { position: relative; }
  .user-btn-text { display: none; }
  .chevron { display: none; }
}

.theme-toggle-btn {
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 18px;
  padding: 0;
  outline: none;
  flex-shrink: 0;
}
.theme-toggle-btn:hover {
  border-color: var(--navy);
  background: var(--bg);
  transform: scale(1.05) rotate(15deg);
  box-shadow: var(--shadow-sm);
}
.theme-toggle-btn svg {
  display: block;
  transition: transform 0.35s var(--ease);
}
.theme-toggle-btn:active svg {
  transform: scale(0.85);
}
[data-theme='dark'] .theme-toggle-btn:hover {
  border-color: var(--gold);
  background: var(--primary-light);
  box-shadow: 0 0 12px rgba(201, 168, 76, 0.25);
}
`;

export default Navbar;
