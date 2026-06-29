import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: 'var(--bg-app)',
      color: 'var(--text-primary)',
    }}
  >
    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌊</div>
    <h1
      style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        letterSpacing: '-0.02em',
      }}
    >
      Page not found
    </h1>
    <p
      style={{
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
        maxWidth: '360px',
        lineHeight: 1.6,
      }}
    >
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/dashboard"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--color-primary)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        fontWeight: 600,
        fontSize: 'var(--text-base)',
        textDecoration: 'none',
        transition: 'background 200ms ease, transform 200ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary-hover)';
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary)';
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
      }}
    >
      ← Back to Dashboard
    </Link>
  </div>
);

export default NotFound;