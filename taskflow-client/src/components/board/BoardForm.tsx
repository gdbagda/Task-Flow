import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import type { Board, BoardFormData } from '../../types';
import { BOARD_COLORS } from '../../utils/helpers';

interface BoardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BoardFormData) => Promise<void>;
  editBoard?: Board | null;
}

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'];

const initialForm = (board?: Board | null): BoardFormData => ({
  title: board?.title || '',
  description: board?.description || '',
  color: board?.color || BOARD_COLORS[0],
  columns: board?.columns || [...DEFAULT_COLUMNS],
});

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

const BoardForm: React.FC<BoardFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editBoard,
}) => {
  const [form, setForm] = useState<BoardFormData>(initialForm(editBoard));
  const [errors, setErrors] = useState<Partial<Record<keyof BoardFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal opens/closes or editBoard changes
  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(editBoard));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, editBoard]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 2) e.title = 'Title must be at least 2 characters';
    else if (form.title.trim().length > 100) e.title = 'Title cannot exceed 100 characters';
    if (form.columns.length === 0) e.columns = 'At least one column is required';
    const hasEmpty = form.columns.some((c) => !c.trim());
    if (hasEmpty) e.columns = 'Column names cannot be empty';
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
        columns: form.columns.map((c) => c.trim()).filter(Boolean),
      });
      onClose();
    } catch {
      // errors handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateColumn = (idx: number, val: string) => {
    setForm((p) => {
      const cols = [...p.columns];
      cols[idx] = val;
      return { ...p, columns: cols };
    });
    if (errors.columns) setErrors((p) => ({ ...p, columns: '' }));
  };

  const removeColumn = (idx: number) => {
    setForm((p) => ({
      ...p,
      columns: p.columns.filter((_, i) => i !== idx),
    }));
  };

  const addColumn = () => {
    if (form.columns.length >= 10) return;
    setForm((p) => ({ ...p, columns: [...p.columns, ''] }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editBoard ? 'Edit Board' : 'Create New Board'}
      size="md"
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
                {editBoard ? 'Saving…' : 'Creating…'}
              </>
            ) : (
              editBoard ? 'Save changes' : 'Create board'
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="board-title">
            Board title <span aria-hidden="true">*</span>
          </label>
          <input
            id="board-title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            value={form.title}
            onChange={(e) => {
              setForm((p) => ({ ...p, title: e.target.value }));
              if (errors.title) setErrors((p) => ({ ...p, title: '' }));
            }}
            placeholder="e.g. Q1 Marketing Sprint"
            maxLength={100}
            autoFocus
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="board-description">
            Description <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="board-description"
            className="form-input"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="What is this board for?"
            maxLength={500}
            rows={3}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Board color</label>
          <div className="color-picker-grid">
            {BOARD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-swatch ${form.color === color ? 'selected' : ''}`}
                style={{ background: color, color }}
                onClick={() => setForm((p) => ({ ...p, color }))}
                aria-label={`Select color ${color}`}
                aria-pressed={form.color === color}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Columns */}
        <div className="form-group">
          <label className="form-label">
            Columns <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({form.columns.length}/10)</span>
          </label>
          <div className="column-editor">
            {form.columns.map((col, idx) => (
              <div key={idx} className="column-editor-item">
                <input
                  className="column-editor-input"
                  value={col}
                  onChange={(e) => updateColumn(idx, e.target.value)}
                  placeholder={`Column ${idx + 1}`}
                  maxLength={50}
                  aria-label={`Column ${idx + 1} name`}
                />
                {form.columns.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={() => removeColumn(idx)}
                    aria-label={`Remove column ${col || idx + 1}`}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
            {form.columns.length < 10 && (
              <button
                type="button"
                className="column-add-btn"
                onClick={addColumn}
              >
                <PlusIcon /> Add column
              </button>
            )}
          </div>
          {errors.columns && <p className="form-error" style={{ marginTop: 'var(--space-2)' }}>{errors.columns}</p>}
        </div>
      </form>
    </Modal>
  );
};

export default BoardForm;