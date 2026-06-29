import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Board } from '../../types';
import { formatDate } from '../../utils/helpers';

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  onArchive: (board: Board) => void;
}

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const ArchiveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
  </svg>
);

const BoardCard: React.FC<BoardCardProps> = ({ board, onEdit, onDelete, onArchive }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the menu
    if ((e.target as Element).closest('.board-card-menu')) return;
    navigate(`/board/${board._id}`);
  };

  return (
    <article
      className="board-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/board/${board._id}`); }}
      aria-label={`Open board: ${board.title}`}
    >
      {/* Accent bar */}
      <div className="board-card-accent" style={{ background: board.color }} />

      <div className="board-card-body">
        {/* Top row */}
        <div className="board-card-top">
          <h3 className="board-card-title">{board.title}</h3>

          {/* Menu */}
          <div className="board-card-menu" ref={menuRef}>
            <button
              className="board-card-menu-btn"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
              aria-label="Board options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <DotsIcon />
            </button>

            {menuOpen && (
              <div className="board-card-dropdown" role="menu">
                <button
                  className="board-dropdown-item"
                  role="menuitem"
                  onClick={(e) => { e.stopPropagation(); onEdit(board); setMenuOpen(false); }}
                >
                  <EditIcon /> Edit
                </button>
                <button
                  className="board-dropdown-item"
                  role="menuitem"
                  onClick={(e) => { e.stopPropagation(); onArchive(board); setMenuOpen(false); }}
                >
                  <ArchiveIcon /> Archive
                </button>
                <button
                  className="board-dropdown-item danger"
                  role="menuitem"
                  onClick={(e) => { e.stopPropagation(); onDelete(board); setMenuOpen(false); }}
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {board.description && (
          <p className="board-card-description">{board.description}</p>
        )}

        {/* Footer */}
        <div className="board-card-footer">
          <div className="board-card-meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            {board.taskCount ?? 0} task{board.taskCount !== 1 ? 's' : ''}
          </div>
          <div className="board-card-meta">
            {formatDate(board.createdAt)}
          </div>
        </div>

        {/* Column pills */}
        <div className="board-card-columns" style={{ marginTop: 'var(--space-3)' }}>
          {board.columns.slice(0, 4).map((col) => (
            <span key={col} className="board-card-column-pill">{col}</span>
          ))}
          {board.columns.length > 4 && (
            <span className="board-card-column-pill">+{board.columns.length - 4}</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default BoardCard;