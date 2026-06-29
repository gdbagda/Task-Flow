import type { Priority } from '../types';

// ─── Date Formatting ──────────────────────────────────────────────────────────
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateInput = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const isOverdue = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due < now;
};

export const isDueSoon = (dateStr: string | null, days = 3): boolean => {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + days);
  now.setHours(0, 0, 0, 0);
  return due >= now && due <= soon;
};

// ─── Priority Helpers ─────────────────────────────────────────────────────────
export const priorityOrder: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const priorityLabel: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// ─── String Helpers ───────────────────────────────────────────────────────────
export const truncate = (str: string, maxLen: number): string => {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
};

export const initials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ─── Error Extraction ─────────────────────────────────────────────────────────
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'Something went wrong';
  const err = error as {
    response?: { data?: { message?: string; errors?: Record<string, string> } };
    message?: string;
  };
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.errors) {
    return Object.values(err.response.data.errors).join('. ');
  }
  if (err.message) return err.message;
  return 'Something went wrong';
};

export const extractFieldErrors = (
  error: unknown
): Record<string, string> => {
  const err = error as {
    response?: { data?: { errors?: Record<string, string> } };
  };
  return err?.response?.data?.errors || {};
};

// ─── Color Helpers ────────────────────────────────────────────────────────────
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '99, 102, 241';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

export const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#64748b',
];