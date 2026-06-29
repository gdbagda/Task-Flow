import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Board } from '../../types';
import '../../styles/sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onCollapse: () => void;
  boards: Board[];
  onNewBoard: () => void;
}

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onCollapse,
  boards,
  onNewBoard,
}) => {
  const location = useLocation();

  const sidebarClasses = [
    'sidebar',
    isCollapsed ? 'collapsed' : '',
    isOpen ? 'mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses} aria-label="Main navigation">
        {/* Header */}
        <div className="sidebar-header">
          <span className="sidebar-section-label">Navigation</span>
          <button
            className="sidebar-collapse-btn"
            onClick={onCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeftIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Primary navigation">
          <Link
            to="/dashboard"
            className={`sidebar-nav-item ${
              location.pathname === '/dashboard' ? 'active' : ''
            }`}
            onClick={onClose}
            title="Dashboard"
          >
            <span className="sidebar-nav-icon" aria-hidden="true">
              <GridIcon />
            </span>
            <span className="sidebar-nav-label">Dashboard</span>
          </Link>
        </nav>

        {/* Boards Section */}
        {!isCollapsed && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-boards-header">
              <span className="sidebar-boards-title">My Boards</span>
              <button
                className="sidebar-new-btn"
                onClick={() => { onNewBoard(); onClose(); }}
                aria-label="Create new board"
                title="New board"
              >
                <PlusIcon />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '0 var(--space-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}
            >
              {boards.length === 0 ? (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    padding: 'var(--space-3)',
                    textAlign: 'center',
                  }}
                >
                  No boards yet
                </p>
              ) : (
                boards.map((board) => (
                  <Link
                    key={board._id}
                    to={`/board/${board._id}`}
                    className={`sidebar-board-item ${
                      location.pathname === `/board/${board._id}` ? 'active' : ''
                    }`}
                    onClick={onClose}
                    title={board.title}
                  >
                    <span
                      className="sidebar-board-dot"
                      style={{ background: board.color }}
                      aria-hidden="true"
                    />
                    <span className="sidebar-board-name">{board.title}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;