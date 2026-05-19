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
const ParticleOrb = lazy(() => import('./ParticleOrb'));
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
  { id: 'particle-orb',   text: 'Particle Orb',   image: imgLanyard },
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
    case 'particle-orb':
      return <ParticleOrb onBack={onBack} />;
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
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
    if (projectId === 'website-test') {
      setPasswordValue('');
      setPasswordError('');
      setPasswordPrompt(true);
      return;
    }

    setActiveProject(projectId);
  }, []);

  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();

    if (passwordValue === '2330') {
      setPasswordPrompt(false);
      setPasswordValue('');
      setPasswordError('');
      setActiveProject('website-test');
      return;
    }

    setPasswordError('Incorrect password');
    setPasswordValue('');
  }, [passwordValue]);

  const handlePasswordClose = useCallback(() => {
    setPasswordPrompt(false);
    setPasswordValue('');
    setPasswordError('');
  }, []);

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (passwordPrompt) handlePasswordClose();
        else if (activeProject) handleBackToGrid();
        else handleGoHome();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, passwordPrompt, handleBackToGrid, handleGoHome, handlePasswordClose]);

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

      {passwordPrompt && (
        <div className="pp-password-overlay" role="dialog" aria-modal="true" aria-labelledby="pp-password-title">
          <form className="pp-password-card" onSubmit={handlePasswordSubmit}>
            <button type="button" className="pp-password-close" onClick={handlePasswordClose} aria-label="Close password prompt">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" />
              </svg>
            </button>

            <span className="pp-password-label">Protected Project</span>
            <h2 id="pp-password-title" className="pp-password-title">Website Test</h2>
            <input
              className="pp-password-input"
              type="password"
              inputMode="numeric"
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                setPasswordError('');
              }}
              placeholder="Password"
              autoFocus
            />
            {passwordError && <p className="pp-password-error">{passwordError}</p>}
            <button className="pp-password-submit" type="submit">Enter</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectPicker;
