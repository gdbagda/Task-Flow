// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

// ─── Board ────────────────────────────────────────────────────────────────────
export interface Board {
  _id: string;
  title: string;
  description: string;
  color: string;
  columns: string[];
  owner: string;
  isArchived: boolean;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Suggestion ────────────────────────────────────────────────────────────
export interface AISuggestion {
  estimatedHours: number | null;
  suggestedDueDate: string | null;
  reason: string;
  generatedAt: string | null;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  dueDate: string | null;
  estimatedHours: number | null;
  aiSuggestion: AISuggestion;
  board: string;
  owner: string;
  order: number;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Grouped Tasks ────────────────────────────────────────────────────────────
export type GroupedTasks = Record<string, Task[]>;

// ─── AI Estimate ──────────────────────────────────────────────────────────────
export interface EstimateBreakdown {
  planning: number;
  implementation: number;
  testing: number;
  review: number;
}

export interface TaskEstimate {
  estimatedHours: number;
  suggestedDueDate: string;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  breakdown: EstimateBreakdown;
  isFallback: boolean;
  generatedAt: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────
export interface ApiError {
  success: false;
  message?: string;
  errors?: Record<string, string>;
}

export interface AuthResponse {
  success: true;
  token: string;
  user: User;
  message: string;
}

export interface BoardsResponse {
  success: true;
  count: number;
  boards: Board[];
}

export interface TasksResponse {
  success: true;
  count: number;
  tasks: Task[];
  grouped: GroupedTasks;
  columns: string[];
}

// ─── Form State Types ─────────────────────────────────────────────────────────
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface BoardFormData {
  title: string;
  description: string;
  color: string;
  columns: string[];
}

export interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: Priority;
  dueDate: string;
  estimatedHours: string;
  tags: string[];
}

// ─── Filter & Sort State ──────────────────────────────────────────────────────
export interface TaskFilters {
  search: string;
  priority: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  tag: string;
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// ─── Theme Context ────────────────────────────────────────────────────────────
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}