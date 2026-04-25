import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectPicker.css';

/* ────────────────────────────────────────────
   Lazy-loaded project components
   ──────────────────────────────────────────── */
const AsciiFluidVortex = lazy(() => import('./AsciiFluidVortex'));
const AsciiPortrait = lazy(() => import('./AsciiPortrait'));

// Placeholder for future projects
const ComingSoon = ({ name }) => (
  <div className="pp-coming-soon">
    <span className="pp-coming-soon-label">Coming Soon</span>
    <h2 className="pp-coming-soon-name">{name}</h2>
    <div className="pp-coming-soon-line" />
  </div>
);

/* ────────────────────────────────────────────
   Project definitions — no emojis, no colors
   ──────────────────────────────────────────── */
const PROJECTS = [
  {
    id: 'ascii-portrait',
    name: 'ASCII Portrait',
    description: 'Interactive portrait rendered in ASCII with mouse tracking',
    tag: 'Effect',
    index: '01',
  },
  {
    id: 'ascii-vortex',
    name: 'ASCII Vortex',
    description: 'Interactive fluid simulation rendered in ASCII characters',
    tag: 'Simulation',
    index: '02',
  },
  {
    id: 'island-escape',
    name: 'Island Escape',
    description: 'A 3D adventure minigame — escape the island',
    tag: 'Minigame',
    index: '03',
  },
  {
    id: 'creative-hub',
    name: 'Creative Hub',
    description: 'ASCII art, dither, gradient & photo editing tools',
    tag: 'Creative',
    index: '04',
  },
  {
    id: 'color-picker',
    name: 'Color Studio',
    description: 'Advanced color picker with palette generation',
    tag: 'Tool',
    index: '05',
  },
  {
    id: 'pixel-canvas',
    name: 'Pixel Canvas',
    description: 'Draw pixel art with exportable sprites',
    tag: 'Creative',
    index: '06',
  },
  {
    id: 'sound-viz',
    name: 'Sound Waves',
    description: 'Audio-reactive visualizer using your microphone',
    tag: 'Audio',
    index: '07',
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

/* ════════════════════════════════════════════
   ProjectPicker — Full Page Component
   ════════════════════════════════════════════ */
const ProjectPicker = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(null);
  const [isClosingProject, setIsClosingProject] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleBackToGrid = useCallback(() => {
    setIsClosingProject(true);
    setTimeout(() => {
      setActiveProject(null);
      setIsClosingProject(false);
    }, 280);
  }, []);

  const handleSelectProject = useCallback((projectId) => {
    setActiveProject(projectId);
  }, []);

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeProject) handleBackToGrid();
        else handleGoHome();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, handleBackToGrid, handleGoHome]);

  /* ── Active project fullscreen view ── */
  if (activeProject) {
    return (
      <div className={`pp-active ${isClosingProject ? 'pp-closing' : ''}`}>
        <button className="pp-back-btn" onClick={handleBackToGrid}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          Back
        </button>
        <Suspense fallback={
          <div className="pp-loading">
            <div className="pp-loading-bar" />
          </div>
        }>
          {renderProject(activeProject, handleBackToGrid)}
        </Suspense>
      </div>
    );
  }

  /* ── Full-page project list ── */
  return (
    <div className="pp-page">
      <nav className="pp-nav">
        <button className="pp-nav-back" onClick={handleGoHome}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
        </button>
        <span className="pp-nav-label">Projects</span>
      </nav>

      <div className="pp-content">
        <header className="pp-header">
          <h1 className="pp-title">Lab</h1>
          <p className="pp-desc">Experiments & creative tools</p>
        </header>

        <div className="pp-list">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              className={`pp-item ${hoveredId && hoveredId !== project.id ? 'pp-item--dimmed' : ''}`}
              onClick={() => handleSelectProject(project.id)}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className="pp-item-index">{project.index}</span>
              <div className="pp-item-info">
                <span className="pp-item-name">{project.name}</span>
                <span className="pp-item-desc">{project.description}</span>
              </div>
              <span className="pp-item-tag">{project.tag}</span>
              <svg className="pp-item-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4L13 10L7 16" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectPicker;
