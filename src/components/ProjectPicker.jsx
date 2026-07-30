import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlowingMenu from './FlowingMenu';
import ErrorBoundary from './ErrorBoundary';
import ClickSpark from './ClickSpark';
import BubblePasswordGate from './BubblePasswordGate';
import { runRouteTransition } from '../utils/pageTransition';
import './ProjectPicker.css';

/* Assets */
import imgLanyard from '../assets/lanyard.png';
import logo from '../assets/logo-light.png';

/* ────────────────────────────────────────────
   Lazy-loaded project components
   ──────────────────────────────────────────── */
const AsciiFluidVortex = lazy(() => import('./AsciiFluidVortex'));
const MusicPlayer = lazy(() => import('./MusicPlayer'));
const SketchRelay = lazy(() => import('./SketchRelay'));
const GradientDrift = lazy(() => import('./GradientDrift'));
const WebsiteArchive = lazy(() => import('../pages/Home'));

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
  { id: 'music-player',   text: 'Music Player',   image: imgLanyard },
  { id: 'sketch-relay',   text: 'Sketch Relay',   image: imgLanyard },
  { id: 'gradient-drift', text: 'Gradient Drift', image: imgLanyard },
  { id: 'minigame',       text: 'Pocket Arcade',  image: imgLanyard },
  { id: 'website-archive', text: 'Website Archive', image: imgLanyard },
];

/* ────────────────────────────────────────────
   Render the correct lazy component
   ──────────────────────────────────────────── */
const renderProject = (projectId, onBack) => {
  switch (projectId) {
    case 'ascii-vortex':
      return <AsciiFluidVortex onBack={onBack} />;
    case 'sketch-relay':
      return <SketchRelay />;
    case 'minigame':
      return <ComingSoon name="Pocket Arcade" />;
    case 'music-player':
      return <MusicPlayer />;
    case 'gradient-drift':
      return <GradientDrift />;
    case 'website-archive':
      return (
        <ClickSpark sparkColor="#667eea" sparkSize={12} sparkRadius={20} sparkCount={8} duration={500}>
          <WebsiteArchive />
        </ClickSpark>
      );
    default:
      return null;
  }
};

/* ════════════════════════════════════════════
   ProjectPicker — Full Page Component
   ════════════════════════════════════════════ */
const ProjectPicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeProject, setActiveProject] = useState(null);
  const [isClosingProject, setIsClosingProject] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const activePageRef = useRef(null);

  const handleGoHome = useCallback(() => {
    const returnToMenu = location.state?.returnToMenu === true;
    const scrollTop = location.state?.scrollTop || 0;

    runRouteTransition(() => {
      navigate('/', {
        state: returnToMenu
          ? { reopenMenu: true, scrollTop }
          : null
      });
    });
  }, [location.state, navigate]);

  const handleBackToGrid = useCallback(() => {
    setIsClosingProject(true);
    setTimeout(() => {
      setActiveProject(null);
      setIsClosingProject(false);
    }, 280);
  }, []);

  const handleSelectProject = useCallback((projectId) => {
    if (projectId === 'website-archive') {
      setPasswordPrompt(true);
      return;
    }

    setActiveProject(projectId);
  }, []);

  const handlePasswordClose = useCallback(() => {
    setPasswordPrompt(false);
  }, []);

  const verifyArchivePassword = useCallback(async (password) => {
    if (password !== '2330') throw new Error('That code does not match.');
  }, []);

  const openWebsiteArchive = useCallback(() => {
    setPasswordPrompt(false);
    setActiveProject('website-archive');
  }, []);

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (passwordPrompt) return;
        else if (activeProject) handleBackToGrid();
        else handleGoHome();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, passwordPrompt, handleBackToGrid, handleGoHome, handlePasswordClose]);

  useEffect(() => {
    if (activeProject) activePageRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeProject]);

  /* ── Active project fullscreen view ── */
  if (activeProject) {
    return (
      <div
        ref={activePageRef}
        className={`pp-active ${activeProject === 'website-archive' ? 'pp-active--scrollable ' : ''}${isClosingProject ? 'pp-closing' : ''}`}
        style={activeProject === 'website-archive' ? { overflowX: 'hidden', overflowY: 'auto' } : undefined}
      >
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
        <BubblePasswordGate
          accessibleTitle="Website Archive password"
          brand="Portfolio / Archive access"
          idleMessage="Type the four-digit archive code"
          footerNote="Protected project / Website Archive"
          variant="dark-popup"
          onSubmit={verifyArchivePassword}
          onSuccess={openWebsiteArchive}
          onCancel={handlePasswordClose}
        />
      )}
    </div>
  );
};

export default ProjectPicker;
