import React from 'react';
import type { Task } from '../../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  name: string;
  colorIndex: number;
  tasks: Task[];
  allColumns: string[];
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (taskId: string, status: string) => void;
  onArchiveTask: (task: Task) => void;
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const COL_COLORS = [
  '#6366f1','#f59e0b','#3b82f6','#22c55e',
  '#ec4899','#8b5cf6','#10b981','#ef4444',
  '#06b6d4','#64748b',
];

const TaskColumn: React.FC<TaskColumnProps> = ({
  name,
  colorIndex,
  tasks,
  allColumns,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onArchiveTask,
}) => {
  const dotColor = COL_COLORS[colorIndex % COL_COLORS.length];

  return (
    <div className={`kanban-column col-color-${colorIndex % 10}`}>
      {/* Header */}
      <div className="kanban-column-header">
        <div className="kanban-column-title-row">
          <span className="kanban-column-dot" style={{ background: dotColor }} aria-hidden="true" />
          <h3 className="kanban-column-name" title={name}>{name}</h3>
          <span className="kanban-column-count" aria-label={`${tasks.length} tasks`}>
            {tasks.length}
          </span>
        </div>
        <button
          className="kanban-column-add-btn"
          onClick={() => onAddTask(name)}
          aria-label={`Add task to ${name}`}
          title={`Add task to ${name}`}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Tasks */}
      <div className="kanban-column-body" role="list" aria-label={`${name} tasks`}>
        {tasks.length === 0 ? (
          <div className="kanban-column-empty">
            <span style={{ fontSize: '1.5rem' }}>📭</span>
            <p>No tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} role="listitem">
              <TaskCard
                task={task}
                columns={allColumns}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
                onArchive={onArchiveTask}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;