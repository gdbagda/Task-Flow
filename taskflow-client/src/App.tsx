import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/global.css';

// ── Lazy page imports ──────────────────────────────────────────────────────
const Landing    = React.lazy(() => import('./pages/Landing'));
const Login      = React.lazy(() => import('./pages/Login'));
const Register   = React.lazy(() => import('./pages/Register'));
const Dashboard  = React.lazy(() => import('./pages/Dashboard'));
const BoardPage  = React.lazy(() => import('./pages/BoardPage'));
const NotFound   = React.lazy(() => import('./pages/NotFound'));

// ── Loading fallback ───────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  </div>
);

// ── Protected Route ────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ── Public Only Route (redirect if already logged in) ─────────────────────
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Inner App (needs AuthContext) ──────────────────────────────────────────
const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/board/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

// ── Root App ───────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '380px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-accent)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-danger)',
                  secondary: 'white',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;