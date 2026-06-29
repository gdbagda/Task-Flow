import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { initials } from '../../utils/helpers';
import '../../styles/navbar.css';

interface NavbarProps {
  onMenuClick: () => void;
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar" role="banner">
      {/* Left */}
      <div className="navbar-left">
        <button
          className="navbar-hamburger"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <Link to="/dashboard" className="navbar-brand" aria-label="TaskFlow home">
          <div className="navbar-logo">⚡</div>
          <span className="navbar-brand-name">TaskFlow</span>
        </Link>
      </div>

      {/* Right */}
      <div className="navbar-right">
        {/* Theme toggle */}
        <button
          className="navbar-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* User Menu */}
        <div className="user-menu-wrapper" ref={menuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setMenuOpen((p) => !p)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="user-avatar" aria-hidden="true">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{initials(user?.name || '?')}</span>
              )}
            </div>
            <span className="user-name">{user?.name}</span>
            <span className={`user-menu-chevron ${menuOpen ? 'open' : ''}`}>
              <ChevronIcon />
            </span>
          </button>

          {menuOpen && (
            <div
              className="user-dropdown"
              role="menu"
              aria-label="User options"
            >
              <div className="user-dropdown-header">
                <div className="user-dropdown-name">{user?.name}</div>
                <div className="user-dropdown-email">{user?.email}</div>
              </div>

              <Link
                to="/dashboard"
                className="user-dropdown-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </Link>

              <div className="user-dropdown-divider" />

              <button
                className="user-dropdown-item danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;