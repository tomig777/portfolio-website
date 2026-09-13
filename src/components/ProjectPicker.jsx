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
const MobilePreview = lazy(() => import('./MobilePreview'));
const WebsiteArchive = lazy(() => import('../pages/Home'));
const RouletteGame = lazy(() => import('./RouletteGame'));
const RacingGame = lazy(() => import('./RacingGame'));

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
  { id: 'archive-preview', text: 'Archive Preview', image: imgLanyard },
  { id: 'roulette',      text: 'Roulette',        image: imgLanyard },
  { id: 'racing',        text: 'One Lap',         image: imgLanyard },
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
      return <MobilePreview />;
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
    case 'roulette':
      return <RouletteGame />;
    case 'racing':
      return <RacingGame />;
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
  const [passwordPrompt, setPasswordPrompt] = useState(null);
  const [archiveChoiceOpen, setArchiveChoiceOpen] = useState(false);
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
    if (projectId === 'archive-preview') {
      setPasswordPrompt(projectId);
      return;
    }

    setActiveProject(projectId);
  }, []);

  const handlePasswordClose = useCallback(() => {
    setPasswordPrompt(null);
  }, []);

  const verifyArchivePassword = useCallback(async (password) => {
    if (password !== '2330') throw new Error('That code does not match.');
  }, []);

  const openPasswordProject = useCallback(() => {
    setPasswordPrompt(null);
    setArchiveChoiceOpen(true);
  }, []);

  const chooseArchivePreview = useCallback((choice) => {
    setArchiveChoiceOpen(false);
    setActiveProject(choice === '1' ? 'minigame' : 'website-archive');
  }, []);

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (passwordPrompt) return;
        if (archiveChoiceOpen) {
          setArchiveChoiceOpen(false);
          return;
        }
        else if (activeProject) handleBackToGrid();
        else handleGoHome();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, archiveChoiceOpen, passwordPrompt, handleBackToGrid, handleGoHome]);

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
        <button className="pp-home-btn" onClick={handleGoHome} aria-label="Back to the portfolio">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          <span>Back</span>
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
          accessibleTitle="Archive Preview password"
          brand="Portfolio / Protected access"
          idleMessage="Type the four-digit project code"
          footerNote="Protected project / Archive Preview"
          variant="dark-popup"
          onSubmit={verifyArchivePassword}
          onSuccess={openPasswordProject}
          onCancel={handlePasswordClose}
        />
      )}

      {archiveChoiceOpen && (
        <div className="pp-password-overlay pp-archive-choice-overlay" role="dialog" aria-modal="true" aria-labelledby="pp-archive-choice-title">
          <div className="pp-password-card pp-archive-choice-card">
            <p className="pp-password-label">Access granted</p>
            <h2 className="pp-password-title" id="pp-archive-choice-title">Choose an archive preview</h2>
            <p className="pp-archive-choice-copy">Select the version you want to explore.</p>
            <div className="pp-archive-choice-buttons">
              <button type="button" onClick={() => chooseArchivePreview('1')}><span>1</span><small>Mobile preview</small></button>
              <button type="button" onClick={() => chooseArchivePreview('2')}><span>2</span><small>Website archive</small></button>
            </div>
            <button type="button" className="pp-password-close pp-archive-choice-cancel" aria-label="Close archive choices" onClick={() => setArchiveChoiceOpen(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPicker;
