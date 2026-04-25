import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import FlowingMenu from './FlowingMenu';
import './ProjectPicker.css';

/* Asset images for placeholders */
import imgPortrait from '../assets/portrait-1.png';
import imgCard from '../assets/szia.png';
import imgKep from '../assets/kep9.png';
import imgPort from '../assets/port1.jpg';
import imgCard1 from '../assets/card-1.jpeg';
import imgLogo from '../assets/logo-dark.png';
import imgLanyard from '../assets/lanyard.png';

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
   Project definitions
   ──────────────────────────────────────────── */
const PROJECTS = [
  { id: 'ascii-portrait', text: 'ASCII Portrait', image: imgPortrait },
  { id: 'ascii-vortex',   text: 'ASCII Vortex',   image: imgKep },
  { id: 'island-escape',  text: 'Island Escape',  image: imgCard },
  { id: 'creative-hub',   text: 'Creative Hub',   image: imgPort },
  { id: 'color-picker',   text: 'Color Studio',   image: imgCard1 },
  { id: 'pixel-canvas',   text: 'Pixel Canvas',   image: imgLogo },
  { id: 'sound-viz',      text: 'Sound Waves',    image: imgLanyard },
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

  /* ── Full-page flowing menu ── */
  const menuItems = PROJECTS.map((p) => ({
    link: '#',
    text: p.text,
    image: p.image,
    onClick: () => handleSelectProject(p.id),
  }));

  return (
    <div className="pp-page">
      <button className="pp-home-btn" onClick={handleGoHome}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L5 8L10 13" />
        </svg>
      </button>

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
  );
};

export default ProjectPicker;
