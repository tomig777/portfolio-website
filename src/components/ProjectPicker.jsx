import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectPicker.css';

/* ────────────────────────────────────────────
   Lazy-loaded project components
   Each lives in its own chunk — nothing loads
   until the user picks it.
   ──────────────────────────────────────────── */
const AsciiFluidVortex = lazy(() => import('./AsciiFluidVortex'));
const AsciiPortrait = lazy(() => import('./AsciiPortrait'));

// Placeholder components for future projects
const ComingSoon = ({ name }) => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #0f0f1a 0%, #000 100%)',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: "'Inter', sans-serif",
    gap: '12px',
  }}>
    <span style={{ fontSize: '3rem' }}>🚧</span>
    <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0ece4', margin: 0 }}>{name}</h2>
    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>Coming Soon</p>
  </div>
);

/* ────────────────────────────────────────────
   Project definitions
   ──────────────────────────────────────────── */
const PROJECTS = [
  {
    id: 'ascii-portrait',
    name: 'ASCII Portrait',
    description: 'Interactive portrait rendered in ASCII with mouse tracking',
    icon: '👤',
    tag: 'Effect',
    colors: {
      glow: 'rgba(200, 200, 220, 0.1)',
      iconBg: 'rgba(200, 200, 220, 0.1)',
      iconColor: '#c8c8dc',
    },
  },
  {
    id: 'ascii-vortex',
    name: 'ASCII Vortex',
    description: 'Interactive fluid simulation rendered in ASCII characters',
    icon: '〰',
    tag: 'Simulation',
    colors: {
      glow: 'rgba(102, 126, 234, 0.1)',
      iconBg: 'rgba(102, 126, 234, 0.12)',
      iconColor: '#7b93f5',
    },
  },
  {
    id: 'island-escape',
    name: 'Island Escape',
    description: 'A 3D adventure minigame — escape the island',
    icon: '🏝',
    tag: 'Minigame',
    colors: {
      glow: 'rgba(72, 199, 142, 0.1)',
      iconBg: 'rgba(72, 199, 142, 0.12)',
      iconColor: '#48c78e',
    },
  },
  {
    id: 'creative-hub',
    name: 'Creative Hub',
    description: 'ASCII art, dither, gradient & photo editing tools',
    icon: '✦',
    tag: 'Creative',
    colors: {
      glow: 'rgba(234, 179, 102, 0.1)',
      iconBg: 'rgba(234, 179, 102, 0.12)',
      iconColor: '#eab366',
    },
  },
  {
    id: 'color-picker',
    name: 'Color Studio',
    description: 'Advanced color picker with palette generation',
    icon: '◐',
    tag: 'Tool',
    colors: {
      glow: 'rgba(234, 102, 178, 0.1)',
      iconBg: 'rgba(234, 102, 178, 0.12)',
      iconColor: '#ea66b2',
    },
  },
  {
    id: 'pixel-canvas',
    name: 'Pixel Canvas',
    description: 'Draw pixel art with exportable sprites',
    icon: '▦',
    tag: 'Creative',
    colors: {
      glow: 'rgba(102, 217, 234, 0.1)',
      iconBg: 'rgba(102, 217, 234, 0.12)',
      iconColor: '#66d9ea',
    },
  },
  {
    id: 'sound-viz',
    name: 'Sound Waves',
    description: 'Audio-reactive visualizer using your microphone',
    icon: '♫',
    tag: 'Audio',
    colors: {
      glow: 'rgba(178, 102, 234, 0.1)',
      iconBg: 'rgba(178, 102, 234, 0.12)',
      iconColor: '#b266ea',
    },
  },
];

/* ────────────────────────────────────────────
   Render the correct lazy component
   ──────────────────────────────────────────── */
const renderProject = (projectId, onBack) => {
  switch (projectId) {
    case 'ascii-portrait':
      return <AsciiPortrait onBack={onBack} />;
    case 'ascii-vortex':
      return <AsciiFluidVortex onBack={onBack} />;
    case 'island-escape':
      return <ComingSoon name="Island Escape" />;
    case 'creative-hub':
      return <ComingSoon name="Creative Hub" />;
    case 'color-picker':
      return <ComingSoon name="Color Studio" />;
    case 'pixel-canvas':
      return <ComingSoon name="Pixel Canvas" />;
    case 'sound-viz':
      return <ComingSoon name="Sound Waves" />;
    default:
      return null;
  }
};

/* ────────────────────────────────────────────
   Back Arrow SVG
   ──────────────────────────────────────────── */
const BackArrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L5 8L10 13" />
  </svg>
);

/* ════════════════════════════════════════════
   ProjectPicker — Full Page Component
   ════════════════════════════════════════════ */
const ProjectPicker = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(null);
  const [isClosingProject, setIsClosingProject] = useState(false);

  // Navigate back to the main portfolio
  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Go back from active project to grid
  const handleBackToGrid = useCallback(() => {
    setIsClosingProject(true);
    setTimeout(() => {
      setActiveProject(null);
      setIsClosingProject(false);
    }, 280);
  }, []);

  // Open a project
  const handleSelectProject = useCallback((projectId) => {
    setActiveProject(projectId);
  }, []);

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeProject) {
          handleBackToGrid();
        } else {
          handleGoHome();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, handleBackToGrid, handleGoHome]);

  /* ── Active project fullscreen view ── */
  if (activeProject) {
    return (
      <div className={`project-picker-active ${isClosingProject ? 'closing' : ''}`}>
        <button className="project-picker-back" onClick={handleBackToGrid}>
          <BackArrow />
          Back to Projects
        </button>
        <Suspense fallback={
          <div className="project-picker-loading">
            <div className="project-picker-spinner" />
            Loading project…
          </div>
        }>
          {renderProject(activeProject, handleBackToGrid)}
        </Suspense>
      </div>
    );
  }

  /* ── Full-page project grid ── */
  return (
    <div className="project-picker-page">
      <div className="project-picker-page-inner">
        <button className="project-picker-home-btn" onClick={handleGoHome}>
          <BackArrow />
          Back to Portfolio
        </button>

        <div className="project-picker-header">
          <span className="project-picker-eyebrow">Secret Lab</span>
          <h1 className="project-picker-title">Choose a Project</h1>
          <p className="project-picker-subtitle">Experiments, tools & creative toys</p>
        </div>

        <div className="project-picker-grid">
          {PROJECTS.map((project, index) => (
            <button
              key={project.id}
              className="project-picker-card"
              onClick={() => handleSelectProject(project.id)}
              style={{
                '--card-glow': project.colors.glow,
                '--card-icon-bg': project.colors.iconBg,
                '--card-icon-color': project.colors.iconColor,
                animationDelay: `${0.15 + index * 0.06}s`,
              }}
            >
              <div className="project-picker-icon">{project.icon}</div>
              <span className="project-picker-card-name">{project.name}</span>
              <span className="project-picker-card-desc">{project.description}</span>
              <span className="project-picker-card-tag">{project.tag}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectPicker;
