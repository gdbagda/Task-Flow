import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/ui/FormInput';
import type { LoginFormData } from '../types';
import { extractErrorMessage, extractFieldErrors } from '../utils/helpers';
import '../styles/auth.css';

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const initialForm: LoginFormData = { email: '', password: '' };
const initialErrors: Partial<LoginFormData> = {};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormData>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>(initialErrors);
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    // Clear field error on change
    if (fieldErrors[id as keyof LoginFormData]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (globalError) setGlobalError('');
  };

  const validate = (): boolean => {
    const errors: Partial<LoginFormData> = {};
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!form.password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGlobalError('');

    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const serverFieldErrors = extractFieldErrors(err);
      if (Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors as Partial<LoginFormData>);
      } else {
        setGlobalError(extractErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left Panel ── */}
      <div className="auth-panel-left">
        <div className="auth-panel-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">⚡</div>
            <span className="auth-brand-name">TaskFlow</span>
          </div>
          <h2 className="auth-panel-title">
            Welcome back to your workspace
          </h2>
          <p className="auth-panel-subtitle">
            Sign in to access your boards, tasks, and AI-powered estimates.
            Your team is waiting.
          </p>
          <div className="auth-features">
            {[
              'AI-powered effort estimation',
              'Kanban boards with custom columns',
              'Priority management & filtering',
              'Dark mode & responsive design',
            ].map((f) => (
              <div key={f} className="auth-feature-item">
                <div className="auth-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-panel-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Sign in</h1>
            <p className="auth-form-subtitle">
              Enter your credentials to continue
            </p>
          </div>

          {globalError && (
            <div className="alert alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={fieldErrors.email}
              required
              autoComplete="email"
              icon={<UserIcon />}
            />
            <FormInput
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={fieldErrors.password}
              required
              autoComplete="current-password"
              icon={<LockIcon />}
            />

            <button
              type="submit"
              className="btn-auth"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          <p className="auth-form-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;