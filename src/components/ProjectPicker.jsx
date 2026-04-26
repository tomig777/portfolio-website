import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import FlowingMenu from './FlowingMenu';
import ErrorBoundary from './ErrorBoundary';
import './ProjectPicker.css';

/* Assets */
import imgLanyard from '../assets/lanyard.png';
import logo from '../assets/logo-light.png';

/* ────────────────────────────────────────────
   Lazy-loaded project components
   ──────────────────────────────────────────── */
const AsciiFluidVortex = lazy(() => import('./AsciiFluidVortex'));
const AsciiPortrait = lazy(() => import('./AsciiPortrait'));
const WebsiteTest = lazy(() => import('./WebsiteTest'));

// Placeholder for future projects
const ComingSoon = ({ name }) => (
  <div className="pp-coming-soon">
    <span className="pp-coming-soon-label">Coming Soon</span>
    <h2 className="pp-coming-soon-name">{name}</h2>
    <div className="pp-coming-soon-line" />
  </div>
);

/* ────────────────────────────────────────────
   Project definitions
   ──────────────────────────────────────────── */
const PROJECTS = [
  { id: 'ascii-vortex',   text: 'ASCII Vortex',   image: imgLanyard },
  { id: 'ascii-portrait', text: 'ASCII Portrait', image: imgLanyard },
  { id: 'website-test',   text: 'Website Test',   image: imgLanyard },
  { id: 'game-test',      text: 'Game Test',      image: imgLanyard },
  { id: 'creative-hub',   text: 'Creative Hub',   image: imgLanyard },
  { id: 'color-picker',   text: 'Color Studio',   image: imgLanyard },
  { id: 'pixel-canvas',   text: 'Pixel Canvas',   image: imgLanyard },
];

/* ────────────────────────────────────────────
   Render the correct lazy component
   ──────────────────────────────────────────── */
const renderProject = (projectId, onBack) => {
  switch (projectId) {
    case 'ascii-vortex':
      return <AsciiFluidVortex onBack={onBack} />;
    case 'ascii-portrait':
      return <AsciiPortrait onBack={onBack} />;
    case 'website-test':
      return <WebsiteTest onBack={onBack} />;
    case 'game-test':
      return <ComingSoon name="Game Test" />;
    case 'creative-hub':
      return <ComingSoon name="Creative Hub" />;
    case 'color-picker':
      return <ComingSoon name="Color Studio" />;
    case 'pixel-canvas':
      return <ComingSoon name="Pixel Canvas" />;
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
        <ErrorBoundary fallback={<div style={{ color: 'white', padding: '50px', fontSize: '24px', textAlign: 'center' }}>WebsiteTest Crashed. Check browser console for details.</div>}>
          <Suspense fallback={
            <div className="pp-loading">
              <div className="pp-loading-bar" />
            </div>
          }>
            {renderProject(activeProject, handleBackToGrid)}
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  /* ── Full-page flowing menu ── */
  const menuItems = PROJECTS.map((p) => ({
    link: '#',
    text: p.text,
    image: p.image,
    onClick: () => handleSelectProject(p.id),
  }));

  return (
    <div className="pp-page">
      <div className="pp-top-bar">
        <button className="pp-home-btn" onClick={handleGoHome}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
        </button>
        <img src={logo} alt="Logo" className="pp-logo" />
      </div>

      <div className="pp-menu-area">
        <FlowingMenu
          items={menuItems}
          speed={12}
          textColor="rgba(255, 255, 255, 0.85)"
          bgColor="#0a0a0a"
          marqueeBgColor="#ffffff"
          marqueeTextColor="#0a0a0a"
          borderColor="rgba(255, 255, 255, 0.08)"
        />
      </div>
    </div>
  );
};

export default ProjectPicker;
