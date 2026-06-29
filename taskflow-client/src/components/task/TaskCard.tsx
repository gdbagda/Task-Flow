import React, { useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import {
  formatDate,
  isOverdue,
  isDueSoon,
  priorityLabel,
} from "../../utils/helpers";

interface TaskCardProps {
  task: Task;
  columns: string[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (taskId: string, status: string) => void;
  onArchive: (task: Task) => void;
}

const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columns,
  onEdit,
  onDelete,
  onMove,
  onArchive,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const overdue = isOverdue(task.dueDate);
  const dueSoon = !overdue && isDueSoon(task.dueDate);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cardClass = [
    "task-card",
    overdue ? "overdue" : "",
    dueSoon ? "due-soon" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cardClass}
      onClick={(e) => {
        if ((e.target as Element).closest(".task-card-menu")) return;
        if ((e.target as Element).closest(".task-move-select")) return;
        onEdit(task);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit(task);
      }}
      aria-label={`Task: ${task.title}`}
    >
      {/* Header */}
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>

        {/* Three-dot menu */}
        <div ref={menuRef} className="task-card-menu">
          <button
            className="task-card-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
            aria-label="Task options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <DotsIcon />
          </button>

          {menuOpen && (
            <div className="task-card-dropdown" role="menu">
              <button
                className="task-dropdown-item"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                  setMenuOpen(false);
                }}
              >
                <EditIcon /> Edit
              </button>
              <button
                className="task-dropdown-item"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(task);
                  setMenuOpen(false);
                }}
              >
                <ArchiveIcon /> Archive
              </button>
              <button
                className="task-dropdown-item danger"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                  setMenuOpen(false);
                }}
              >
                <TrashIcon /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="task-tag">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="task-tag">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="task-card-footer">
        <span className={`priority-badge ${task.priority}`}>
          {task.priority === "critical"
            ? "🟣"
            : task.priority === "high"
              ? "🔴"
              : task.priority === "medium"
                ? "🟡"
                : "🟢"}{" "}
          {priorityLabel[task.priority]}
        </span>

        {task.dueDate && (
          <span
            className={`task-card-meta ${overdue ? "overdue" : dueSoon ? "due-soon" : ""}`}
          >
            <ClockIcon />
            {overdue ? "Overdue · " : dueSoon ? "Due soon · " : ""}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Move to column */}
      {columns.length > 1 && (
        <div
          style={{ marginTop: "var(--space-2)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <select
            className="task-move-select"
            value={task.status}
            onChange={(e) => onMove(task._id, e.target.value)}
            aria-label="Move task to column"
            title="Move to column"
          >
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Estimated hours */}
      {task.estimatedHours != null && (
        <div
          style={{
            marginTop: "var(--space-2)",
            fontSize: "var(--text-xs)",
            color: "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ⏱ {task.estimatedHours}h estimated
        </div>
      )}
    </article>
  );
};

export default TaskCard;
