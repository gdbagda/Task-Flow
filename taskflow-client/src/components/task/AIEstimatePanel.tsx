import React, { useState } from 'react';
import axiosInstance from '../../api/axios';
import type { TaskEstimate } from '../../types';
import { formatDate, extractErrorMessage } from '../../utils/helpers';

interface AIEstimatePanelProps {
  title: string;
  description: string;
  taskId?: string;
  boardId?: string;
  onApply: (estimatedHours: number, dueDate: string) => void;
}

const AIEstimatePanel: React.FC<AIEstimatePanelProps> = ({
  title,
  description,
  taskId,
  boardId,
  onApply,
}) => {
  const [estimate, setEstimate] = useState<TaskEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const fetchEstimate = async () => {
    if (!title.trim() || title.trim().length < 2) {
      setError('Please enter a task title (at least 2 characters) before getting an estimate.');
      return;
    }

    setIsLoading(true);
    setError('');
    setEstimate(null);
    setApplied(false);

    try {
      let data: { estimate: TaskEstimate };

      if (taskId && boardId) {
        // Existing task: use task-specific endpoint
        const res = await axiosInstance.get(
          `/ai/boards/${boardId}/tasks/${taskId}/estimate`
        );
        data = res.data;
      } else {
        // New task: use quick estimate
        const res = await axiosInstance.post('/ai/estimate', {
          title: title.trim(),
          description: description.trim(),
        });
        data = res.data;
      }

      setEstimate(data.estimate);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!estimate) return;
    onApply(estimate.estimatedHours, estimate.suggestedDueDate);
    setApplied(true);
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span>🤖</span>
          <span>AI Estimation</span>
          <span className="ai-badge">✨ Gemini</span>
        </div>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)' }}
          onClick={fetchEstimate}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Estimating…' : estimate ? 'Re-estimate' : 'Get AI Estimate'}
        </button>
      </div>

      <div className="ai-panel-body">
        {/* Loading */}
        {isLoading && (
          <div className="ai-loading">
            <div style={{
              width: 20, height: 20,
              border: '2px solid var(--border-color)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0,
            }} />
            <span>Analysing task with Gemini AI…</span>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="alert alert-error" style={{ margin: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!estimate && !isLoading && !error && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-3) 0' }}>
            Click "Get AI Estimate" to get smart effort and due date suggestions for this task.
          </p>
        )}

        {/* Estimate results */}
        {estimate && !isLoading && (
          <>
            {/* Confidence */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <span className={`ai-confidence ${estimate.confidence}`}>
                {estimate.confidence === 'high' ? '✓' : estimate.confidence === 'medium' ? '~' : '?'}
                {' '}{estimate.confidence} confidence
              </span>
              {estimate.isFallback && (
                <p className="ai-fallback-note" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
                  ⚠️ AI service unavailable — showing rule-based fallback estimate.
                </p>
              )}
            </div>

            {/* Main numbers */}
            <div className="ai-estimate-grid">
              <div className="ai-estimate-item">
                <div className="ai-estimate-value">{estimate.estimatedHours}h</div>
                <div className="ai-estimate-label">Estimated hours</div>
              </div>
              <div className="ai-estimate-item">
                <div className="ai-estimate-value" style={{ fontSize: 'var(--text-base)' }}>
                  {formatDate(estimate.suggestedDueDate)}
                </div>
                <div className="ai-estimate-label">Suggested due date</div>
              </div>
            </div>

            {/* Breakdown */}
            {estimate.breakdown && (
              <div className="ai-breakdown">
                {Object.entries(estimate.breakdown).map(([key, val]) => (
                  <div key={key} className="ai-breakdown-item">
                    <span className="ai-breakdown-label" style={{ textTransform: 'capitalize' }}>{key}</span>
                    <span className="ai-breakdown-value">{val}h</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reason */}
            <div className="ai-reason">
              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                REASONING
              </strong>
              {estimate.reason}
            </div>

            {/* Apply button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ai-apply-btn"
                onClick={handleApply}
                disabled={applied}
              >
                {applied ? '✓ Applied to form' : '↑ Apply to task'}
              </button>
              {applied && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
                  Hours and due date filled in above ↑
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIEstimatePanel;