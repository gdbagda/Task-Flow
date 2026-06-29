import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import TaskColumn from '../components/task/TaskColumn';
import TaskForm from '../components/task/TaskForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import axiosInstance from '../api/axios';
import { useBoards } from '../hooks/useBoards';
import type { Board, GroupedTasks, Task, TaskFilters, TaskFormData } from '../types';
import { extractErrorMessage } from '../utils/helpers';
import '../styles/board.css';
import '../styles/task.css';

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const initialFilters: TaskFilters = {
  search: '',
  priority: '',
  sortBy: 'order',
  sortOrder: 'asc',
  tag: '',
};

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { boards, fetchBoards } = useBoards();

  // Board state
  const [board, setBoard] = useState<Board | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);

  // Task state
  const [grouped, setGrouped]     = useState<GroupedTasks>({});
  const [columns, setColumns]     = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('taskflow_sidebar_collapsed') === 'true'
  );

  // Filters
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);

  // Task modal
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask]   = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task: Task | null }>({
    open: false, task: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch board ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!boardId) return;
    const load = async () => {
      setBoardLoading(true);
      try {
        const { data } = await axiosInstance.get(`/boards/${boardId}`);
        setBoard(data.board);
      } catch {
        toast.error('Board not found');
        navigate('/dashboard');
      } finally {
        setBoardLoading(false);
      }
    };
    load();
    fetchBoards();
  }, [boardId, navigate, fetchBoards]);

  // ── Fetch tasks ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (f: TaskFilters = filters) => {
    if (!boardId) return;
    setTasksLoading(true);
    try {
      const params: Record<string, string> = {};
      if (f.search)    params.search   = f.search;
      if (f.priority)  params.priority = f.priority;
      if (f.tag)       params.tag      = f.tag;
      if (f.sortBy)    params.sortBy   = f.sortBy;
      if (f.sortOrder) params.sortOrder = f.sortOrder;

      const { data } = await axiosInstance.get(`/boards/${boardId}/tasks`, { params });
      setGrouped(data.grouped);
      setColumns(data.columns);
      setTotalCount(data.count);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setTasksLoading(false);
    }
  }, [boardId, filters]);

  useEffect(() => {
    if (!boardLoading && board) fetchTasks();
  }, [boardLoading, board]);

  // ── Filter change ────────────────────────────────────────────────────────────
  const applyFilter = (updated: Partial<TaskFilters>) => {
    const next = { ...filters, ...updated };
    setFilters(next);
    fetchTasks(next);
  };

  // ── Create task ──────────────────────────────────────────────────────────────
  const handleCreateTask = async (formData: TaskFormData) => {
    if (!boardId || !board) return;
    try {
      await axiosInstance.post(`/boards/${boardId}/tasks`, {
        ...formData,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
        dueDate: formData.dueDate || null,
      });
      toast.success('Task created');
      fetchTasks();
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  // ── Update task ──────────────────────────────────────────────────────────────
  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!boardId || !editingTask) return;
    try {
      await axiosInstance.put(`/boards/${boardId}/tasks/${editingTask._id}`, {
        ...formData,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
        dueDate: formData.dueDate || null,
      });
      toast.success('Task updated');
      fetchTasks();
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  // ── Move task ────────────────────────────────────────────────────────────────
  const handleMoveTask = async (taskId: string, status: string) => {
    if (!boardId) return;
    try {
      await axiosInstance.patch(`/boards/${boardId}/tasks/${taskId}/move`, { status });
      // Optimistic UI update
      setGrouped((prev) => {
        const next = { ...prev };
        let movedTask: Task | undefined;
        for (const col of Object.keys(next)) {
          const idx = next[col].findIndex((t) => t._id === taskId);
          if (idx !== -1) {
            [movedTask] = next[col].splice(idx, 1);
            next[col] = [...next[col]];
            break;
          }
        }
        if (movedTask && next[status]) {
          next[status] = [...next[status], { ...movedTask, status }];
        }
        return next;
      });
    } catch (err) {
      toast.error(extractErrorMessage(err));
      fetchTasks();
    }
  };

  // ── Delete task ──────────────────────────────────────────────────────────────
  const handleDeleteTask = async () => {
    if (!boardId || !deleteModal.task) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/boards/${boardId}/tasks/${deleteModal.task._id}`);
      toast.success('Task deleted');
      setDeleteModal({ open: false, task: null });
      fetchTasks();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Archive task ─────────────────────────────────────────────────────────────
  const handleArchiveTask = async (task: Task) => {
    if (!boardId) return;
    try {
      await axiosInstance.patch(`/boards/${boardId}/tasks/${task._id}/archive`);
      toast.success('Task archived');
      fetchTasks();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // ── Open task form ───────────────────────────────────────────────────────────
  const openCreateTask = (status = '') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setTaskFormOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultStatus('');
    setTaskFormOpen(true);
  };

  const handleCollapseToggle = () => {
    setSidebarCollapsed((p) => {
      const next = !p;
      localStorage.setItem('taskflow_sidebar_collapsed', String(next));
      return next;
    });
  };

  const hasActiveFilters = filters.search || filters.priority || filters.tag;
  const mainStyle: React.CSSProperties = {
    marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    paddingTop: 'var(--navbar-height)',
    transition: 'margin-left var(--transition-slow)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (boardLoading) {
    return (
      <div className="page-wrapper">
        <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onCollapse={handleCollapseToggle}
          boards={boards}
          onNewBoard={() => navigate('/dashboard')}
        />
        <main style={mainStyle}>
          <div className="board-loading">
            <div className="board-spinner" />
            <span>Loading board…</span>
          </div>
        </main>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="page-wrapper">
      <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onCollapse={handleCollapseToggle}
        boards={boards}
        onNewBoard={() => navigate('/dashboard')}
      />

      <main style={mainStyle} aria-label={`Board: ${board.title}`}>
        <div className="board-page">
          {/* Board Header */}
          <div className="board-header">
            <div className="board-header-left">
              <Link to="/dashboard" className="board-back-btn" aria-label="Back to dashboard">
                <BackIcon /> Back
              </Link>
              <span
                className="board-color-dot"
                style={{ background: board.color }}
                aria-hidden="true"
              />
              <h1 className="board-title" title={board.title}>{board.title}</h1>
              <span className="board-task-count">{totalCount} task{totalCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="board-header-right">
              <button
                className="btn-primary"
                onClick={() => openCreateTask()}
              >
                <PlusIcon />
                <span>Add task</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="board-filter-bar">
            {/* Search */}
            <div className="filter-search-wrapper">
              <span className="filter-search-icon"><SearchIcon /></span>
              <input
                type="search"
                className="filter-search-input"
                placeholder="Search tasks…"
                value={filters.search}
                onChange={(e) => applyFilter({ search: e.target.value })}
                aria-label="Search tasks"
              />
            </div>

            {/* Priority filter */}
            <select
              className="filter-select"
              value={filters.priority}
              onChange={(e) => applyFilter({ priority: e.target.value })}
              aria-label="Filter by priority"
              title="Filter by priority"
            >
              <option value="">All priorities</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
              <option value="critical">🟣 Critical</option>
            </select>

            {/* Sort */}
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => applyFilter({ sortBy: e.target.value })}
              aria-label="Sort by"
              title="Sort by"
            >
              <option value="order">Default order</option>
              <option value="createdAt">Date created</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="title">Title A–Z</option>
            </select>

            {/* Sort direction */}
            <select
              className="filter-select"
              value={filters.sortOrder}
              onChange={(e) => applyFilter({ sortOrder: e.target.value as 'asc' | 'desc' })}
              aria-label="Sort direction"
              title="Sort direction"
            >
              <option value="asc">↑ Ascending</option>
              <option value="desc">↓ Descending</option>
            </select>

            {/* Active filters badge */}
            {hasActiveFilters && (
              <button
                className="filter-active-badge"
                onClick={() => applyFilter(initialFilters)}
                title="Clear all filters"
                aria-label="Clear all filters"
              >
                ✕ Clear filters
              </button>
            )}

            {/* Loading indicator */}
            {tasksLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                <div style={{ width: 14, height: 14, border: '2px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Loading…
              </div>
            )}
          </div>

          {/* Kanban Board */}
          <div className="kanban-board" role="region" aria-label="Kanban board">
            {columns.map((colName, idx) => (
              <TaskColumn
                key={colName}
                name={colName}
                colorIndex={idx}
                tasks={grouped[colName] || []}
                allColumns={columns}
                onAddTask={openCreateTask}
                onEditTask={openEditTask}
                onDeleteTask={(task) => setDeleteModal({ open: true, task })}
                onMoveTask={handleMoveTask}
                onArchiveTask={handleArchiveTask}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      {board && (
        <TaskForm
          isOpen={taskFormOpen}
          onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          board={board}
          editTask={editingTask}
          defaultStatus={defaultStatus}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, task: null })}
        onConfirm={handleDeleteTask}
        title="Delete this task?"
        message={`"${deleteModal.task?.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete task"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BoardPage;