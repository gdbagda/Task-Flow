import { Link } from 'react-router-dom';
import '../styles/landing.css';

const FEATURES = [
  {
    icon: '📋',
    title: 'Kanban Boards',
    description:
      'Organise your work visually with drag-and-drop Kanban boards. Create custom columns that match your workflow perfectly.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Estimates',
    description:
      'Let Gemini AI analyse your task details and suggest realistic time estimates and due dates so you never miss a deadline.',
  },
  {
    icon: '🎯',
    title: 'Priority Management',
    description:
      'Tag tasks as Low, Medium, High, or Critical. Filter and sort by priority to always know what to work on next.',
  },
  {
    icon: '🔍',
    title: 'Powerful Filtering',
    description:
      'Search, filter by priority or tag, and sort by due date or order. Find any task instantly across all your boards.',
  },
  {
    icon: '🌙',
    title: 'Dark Mode',
    description:
      'Switch between light and dark themes. Your preference is remembered across sessions automatically.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description:
      'Works beautifully on every screen — desktop, tablet, and mobile. Manage your projects from anywhere.',
  },
];

const STATS = [
  { value: '10x', label: 'Faster Planning' },
  { value: '100%', label: 'Responsive Design' },
  { value: 'AI', label: 'Smart Estimates' },
  { value: '∞', label: 'Boards & Tasks' },
];

const Landing: React.FC = () => {
  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <Link to="/" className="landing-nav-brand">
          <div className="landing-nav-logo">⚡</div>
          <span className="landing-nav-name">TaskFlow</span>
        </Link>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-nav-ghost">Sign in</Link>
          <Link to="/register" className="btn-nav-primary">Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨</span>
            <span>Powered by Gemini AI</span>
          </div>
          <h1 className="hero-title">
            Manage projects
            <br />
            <span className="hero-title-accent">smarter, not harder</span>
          </h1>
          <p className="hero-subtitle">
            TaskFlow combines Kanban boards with AI-powered effort estimation.
            Plan confidently, prioritise effectively, and ship on time — every time.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-hero-primary">
              <span>Start for free</span>
              <span>→</span>
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="landing-stats">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <div className="stat-item-value">{stat.value}</div>
            <div className="stat-item-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Everything you need to ship faster</h2>
          <p className="section-subtitle">
            A complete project management toolkit — from task creation to AI-driven
            estimation — all in one place.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2 className="landing-cta-title">
            Ready to take control of your projects?
          </h2>
          <p className="landing-cta-subtitle">
            Join TaskFlow today and bring clarity to your workflow.
            No credit card required.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-hero-primary">
              Create your free account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-footer-text">
          © {new Date().getFullYear()} TaskFlow. Built with MERN + Gemini AI.
        </span>
        <span className="landing-footer-text">
          Smart Task & Project Manager
        </span>
      </footer>
    </div>
  );
};

export default Landing;