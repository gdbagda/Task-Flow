import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import TagInput from '../ui/TagInput';
import AIEstimatePanel from './AIEstimatePanel';
import type { Board, Task, TaskFormData } from '../../types';
import { formatDateInput } from '../../utils/helpers';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  board: Board;
  editTask?: Task | null;
  defaultStatus?: string;
}

const initialForm = (board: Board, task?: Task | null, defaultStatus?: string): TaskFormData => ({
  title: task?.title || '',
  description: task?.description || '',
  status: task?.status || defaultStatus || board.columns[0] || '',
  priority: task?.priority || 'medium',
  dueDate: formatDateInput(task?.dueDate || null),
  estimatedHours: task?.estimatedHours != null ? String(task.estimatedHours) : '',
  tags: task?.tags || [],
});

interface TaskErrors {
  title?: string;
  status?: string;
  priority?: string;
  estimatedHours?: string;
  dueDate?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  board,
  editTask,
  defaultStatus,
}) => {
  const [form, setForm] = useState<TaskFormData>(initialForm(board, editTask, defaultStatus));
  const [errors, setErrors] = useState<TaskErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(board, editTask, defaultStatus));
      setErrors({});
      setIsSubmitting(false);
      setShowAI(false);
    }
  }, [isOpen, editTask, board, defaultStatus]);

  const set = (field: keyof TaskFormData, value: string | string[]) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field as keyof TaskErrors]) {
      setErrors((p) => ({ ...p, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const e: TaskErrors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 2) e.title = 'Title must be at least 2 characters';
    else if (form.title.trim().length > 200) e.title = 'Title cannot exceed 200 characters';
    if (!form.status) e.status = 'Status is required';
    if (form.estimatedHours && isNaN(Number(form.estimatedHours))) {
      e.estimatedHours = 'Must be a number';
    } else if (Number(form.estimatedHours) < 0) {
      e.estimatedHours = 'Cannot be negative';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      onClose();
    } catch {
      // errors handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIApply = (estimatedHours: number, dueDate: string) => {
    setForm((p) => ({
      ...p,
      estimatedHours: String(estimatedHours),
      dueDate: dueDate,
    }));
  };

  const inputClass = (field: keyof TaskErrors) =>
    `form-input${errors[field] ? ' error' : ''}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? 'Edit Task' : 'Create New Task'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                {editTask ? 'Saving…' : 'Creating…'}
              </>
            ) : (
              editTask ? 'Save changes' : 'Create task'
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="task-form-grid">
          {/* Title — full width */}
          <div className="form-group task-form-full">
            <label className="form-label" htmlFor="task-title">
              Task title <span aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              className={inputClass('title')}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Design the login screen"
              maxLength={200}
              autoFocus
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Description — full width */}
          <div className="form-group task-form-full">
            <label className="form-label" htmlFor="task-description">
              Description
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 4 }}>(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="task-form-textarea"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Add more details about this task…"
              maxLength={2000}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">
              Column / Status <span aria-hidden="true">*</span>
            </label>
            <select
              id="task-status"
              className={inputClass('status')}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {board.columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            {errors.status && <p className="form-error">{errors.status}</p>}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="form-input"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
              <option value="critical">🟣 Critical</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              className={inputClass('dueDate')}
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
            {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
          </div>

          {/* Estimated Hours */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-hours">Estimated Hours</label>
            <input
              id="task-hours"
              type="number"
              className={inputClass('estimatedHours')}
              value={form.estimatedHours}
              onChange={(e) => set('estimatedHours', e.target.value)}
              placeholder="e.g. 8"
              min="0"
              max="1000"
              step="0.5"
            />
            {errors.estimatedHours && <p className="form-error">{errors.estimatedHours}</p>}
          </div>

          {/* Tags — full width */}
          <div className="form-group task-form-full">
            <label className="form-label">
              Tags
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 4 }}>
                (press Enter to add, max 10)
              </span>
            </label>
            <TagInput
              tags={form.tags}
              onChange={(tags) => set('tags', tags)}
              maxTags={10}
            />
          </div>
        </div>

        {/* AI Panel toggle */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => setShowAI((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2) 0',
              fontWeight: 'var(--font-medium)',
            }}
          >
            <span>{showAI ? '▾' : '▸'}</span>
            <span>🤖 {showAI ? 'Hide' : 'Show'} AI Estimation</span>
          </button>

          {showAI && (
            <AIEstimatePanel
              title={form.title}
              description={form.description}
              taskId={editTask?._id}
              boardId={editTask?.board}
              onApply={handleAIApply}
            />
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;