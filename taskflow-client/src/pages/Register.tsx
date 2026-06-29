import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/ui/FormInput';
import type { RegisterFormData } from '../types';
import { extractErrorMessage, extractFieldErrors } from '../utils/helpers';
import '../styles/auth.css';

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

const initialForm: RegisterFormData = { name: '', email: '', password: '' };

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormData>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id as keyof RegisterErrors]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (globalError) setGlobalError('');
  };

  const validate = (): boolean => {
    const errors: RegisterErrors = {};
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (form.name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      await register(form);
      toast.success('Account created! Welcome to TaskFlow 🎉');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const serverFieldErrors = extractFieldErrors(err);
      if (Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors as RegisterErrors);
      } else {
        setGlobalError(extractErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (): { label: string; color: string; width: string } => {
    const p = form.password;
    if (!p) return { label: '', color: 'transparent', width: '0%' };
    if (p.length < 6) return { label: 'Too short', color: 'var(--color-danger)', width: '25%' };
    if (p.length < 8) return { label: 'Weak', color: 'var(--color-warning)', width: '50%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: 'var(--color-info)', width: '75%' };
    return { label: 'Strong', color: 'var(--color-success)', width: '100%' };
  };

  const strength = passwordStrength();

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
            Start managing projects the smart way
          </h2>
          <p className="auth-panel-subtitle">
            Create your free account and get access to AI-powered task estimation,
            Kanban boards, and everything you need to ship on time.
          </p>
          <div className="auth-features">
            {[
              'Free forever — no credit card needed',
              'Unlimited boards and tasks',
              'Gemini AI estimation built in',
              'Works on desktop, tablet, and mobile',
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
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-subtitle">
              Get started with your free TaskFlow account
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
              id="name"
              label="Full name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              error={fieldErrors.name}
              required
              autoComplete="name"
              icon={<UserIcon />}
            />
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
              icon={<MailIcon />}
            />
            <FormInput
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              error={fieldErrors.password}
              required
              autoComplete="new-password"
              icon={<LockIcon />}
            />

            {/* Password Strength Indicator */}
            {form.password && (
              <div style={{ marginTop: '-12px', marginBottom: '20px' }}>
                <div
                  style={{
                    height: '3px',
                    background: 'var(--bg-surface-3)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: strength.width,
                      background: strength.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 300ms ease, background 300ms ease',
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: strength.color,
                    marginTop: 'var(--space-1)',
                  }}
                >
                  {strength.label}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn-auth"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" />
                  <span>Creating account…</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          <p className="auth-form-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;