import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BoardCard from '../components/board/BoardCard';
import BoardForm from '../components/board/BoardForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useBoards } from '../hooks/useBoards';
import { useAuth } from '../contexts/AuthContext';
import type { Board, BoardFormData } from '../types';
import { extractErrorMessage } from '../utils/helpers';
import '../styles/dashboard.css';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const BoardSkeleton: React.FC = () => (
  <div className="board-card-skeleton">
    <div className="skeleton skeleton-accent" />
    <div className="skeleton-body">
      <div className="skeleton" style={{ height: 20, width: '70%' }} />
      <div className="skeleton" style={{ height: 14, width: '90%' }} />
      <div className="skeleton" style={{ height: 14, width: '60%', marginTop: 4 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 99 }} />
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    boards,
    isLoading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    archiveBoard,
  } = useBoards();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('taskflow_sidebar_collapsed') === 'true';
  });

  // Modal state
  const [boardFormOpen, setBoardFormOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; board: Board | null }>({
    open: false,
    board: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCollapse = useCallback(() => {
    setSidebarCollapsed((p) => {
      const next = !p;
      localStorage.setItem('taskflow_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const handleCreateBoard = async (data: BoardFormData) => {
    try {
      const board = await createBoard(data);
      toast.success(`"${board.title}" created!`);
      navigate(`/board/${board._id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const handleEditBoard = async (data: BoardFormData) => {
    if (!editingBoard) return;
    try {
      await updateBoard(editingBoard._id, data);
      toast.success('Board updated');
      setEditingBoard(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const handleDeleteBoard = async () => {
    if (!deleteModal.board) return;
    setIsDeleting(true);
    try {
      await deleteBoard(deleteModal.board._id);
      toast.success('Board deleted');
      setDeleteModal({ open: false, board: null });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveBoard = async (board: Board) => {
    try {
      await archiveBoard(board._id);
      toast.success(`"${board.title}" archived`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const mainStyle: React.CSSProperties = {
    marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    paddingTop: 'var(--navbar-height)',
    transition: 'margin-left var(--transition-slow)',
  };

  return (
    <div className="page-wrapper">
      <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onCollapse={handleCollapse}
        boards={boards}
        onNewBoard={() => { setEditingBoard(null); setBoardFormOpen(true); }}
      />

      <main style={mainStyle} aria-label="Dashboard content">
        <div className="dashboard-page">
          {/* Header */}
          <div className="dashboard-header">
            <div className="dashboard-header-text">
              <h1>{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Here's an overview of your project boards</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => { setEditingBoard(null); setBoardFormOpen(true); }}
            >
              <PlusIcon />
              New Board
            </button>
          </div>

          {/* Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>📋</div>
              <div>
                <div className="stat-card-value">{boards.length}</div>
                <div className="stat-card-label">Active Boards</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>✅</div>
              <div>
                <div className="stat-card-value">
                  {boards.reduce((sum, b) => sum + (b.taskCount ?? 0), 0)}
                </div>
                <div className="stat-card-label">Total Tasks</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>🤖</div>
              <div>
                <div className="stat-card-value">AI</div>
                <div className="stat-card-label">Smart Estimates</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>🎯</div>
              <div>
                <div className="stat-card-value">
                  {boards.reduce((sum, b) => sum + b.columns.length, 0)}
                </div>
                <div className="stat-card-label">Total Columns</div>
              </div>
            </div>
          </div>

          {/* Boards Section */}
          <div className="boards-section-header">
            <h2 className="boards-section-title">
              My Boards
              {!isLoading && (
                <span className="boards-count-badge">{boards.length}</span>
              )}
            </h2>
          </div>

          <div className="boards-grid">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <BoardSkeleton key={i} />)
            ) : boards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No boards yet</h3>
                <p>
                  Create your first board to start organising your tasks with
                  Kanban columns and AI-powered estimates.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => { setEditingBoard(null); setBoardFormOpen(true); }}
                >
                  <PlusIcon /> Create your first board
                </button>
              </div>
            ) : (
              <>
                {boards.map((board) => (
                  <BoardCard
                    key={board._id}
                    board={board}
                    onEdit={(b) => { setEditingBoard(b); setBoardFormOpen(true); }}
                    onDelete={(b) => setDeleteModal({ open: true, board: b })}
                    onArchive={handleArchiveBoard}
                  />
                ))}
                {/* New board card */}
                <button
                  className="board-card-new"
                  onClick={() => { setEditingBoard(null); setBoardFormOpen(true); }}
                  aria-label="Create new board"
                >
                  <div className="board-card-new-icon">+</div>
                  <span className="board-card-new-label">Create new board</span>
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Board Form Modal */}
      <BoardForm
        isOpen={boardFormOpen}
        onClose={() => { setBoardFormOpen(false); setEditingBoard(null); }}
        onSubmit={editingBoard ? handleEditBoard : handleCreateBoard}
        editBoard={editingBoard}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, board: null })}
        onConfirm={handleDeleteBoard}
        title="Delete this board?"
        message={`"${deleteModal.board?.title}" and all its tasks will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete board"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;