import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlowingMenu from './FlowingMenu';
import ErrorBoundary from './ErrorBoundary';
import ClickSpark from './ClickSpark';
import BubblePasswordGate from './BubblePasswordGate';
import ProjectChoiceDialog from './ProjectChoiceDialog';
import { PROJECT_ENTRIES, PROJECT_CHOICE_GROUPS, getProjectSelection, getAvailableProjectChoice } from '../utils/projectCatalog';
import { runRouteTransition } from '../utils/pageTransition';
import { useFocusScope } from '../hooks/useFocusScope';
import './ProjectPicker.css';

/* Assets */
import imgLanyard from '../assets/web-optimized/lanyard.webp';
import logo from '../assets/web-optimized/logo-light.webp';

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
  <main className="pp-coming-soon" aria-label={`${name} coming soon`}>
    <span className="pp-coming-soon-label">Coming Soon</span>
    <h2 className="pp-coming-soon-name">{name}</h2>
    <div className="pp-coming-soon-line" />
  </main>
);

/* ────────────────────────────────────────────
   Project definitions
   ──────────────────────────────────────────── */
const PROJECTS = PROJECT_ENTRIES.map(project => ({ ...project, image: imgLanyard }));

/* ────────────────────────────────────────────
   Render the correct lazy component
   ──────────────────────────────────────────── */
const renderProject = (projectId, onBack) => {
  switch (projectId) {
    case 'ascii-vortex':
      return <AsciiFluidVortex onBack={onBack} />;
    case 'sketch-relay':
      return <SketchRelay />;
    case 'mobile-preview':
      return <MobilePreview />;
    case 'fun-project':
      return <ComingSoon name="Fun Project" />;
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
  const [choiceGroup, setChoiceGroup] = useState(null);
  const activePageRef = useRef(null);
  const homeButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const lastProjectRef = useRef(null);
  const restoreGridFocusRef = useRef(false);

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
    if (closeTimerRef.current) return;
    setIsClosingProject(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      restoreGridFocusRef.current = true;
      setActiveProject(null);
      setIsClosingProject(false);
    }, 280);
  }, []);

  const handleSelectProject = useCallback((projectId) => {
    const selection = getProjectSelection(projectId);
    if (!selection) return;
    lastProjectRef.current = projectId;
    if (selection.kind === 'password') {
      setPasswordPrompt(projectId);
      return;
    }
    if (selection.kind === 'selector') {
      setChoiceGroup(selection.group);
      return;
    }
    setActiveProject(selection.projectId);
  }, []);

  const handlePasswordClose = useCallback(() => {
    setPasswordPrompt(null);
  }, []);

  const verifyArchivePassword = useCallback(async (password) => {
    if (password !== '2330') throw new Error('That code does not match.');
  }, []);

  const openPasswordProject = useCallback(() => {
    setPasswordPrompt(null);
    setChoiceGroup('archive');
  }, []);

  const chooseProject = useCallback((choiceId) => {
    const projectId = getAvailableProjectChoice(choiceGroup, choiceId);
    if (!projectId) return;
    setChoiceGroup(null);
    setActiveProject(projectId);
  }, [choiceGroup]);

  useFocusScope(activePageRef, { active: Boolean(activeProject), scopeKey: activeProject, initialFocus: 'root', onEscape: handleBackToGrid, trap: false, isolate: false, restoreFocus: false });

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);
  useEffect(() => { homeButtonRef.current?.closest('.pp-page')?.focus({ preventScroll: true }); }, []);

  // Fullscreen projects and password/choice dialogs own their own Escape key.
  useEffect(() => {
    if (activeProject || choiceGroup || passwordPrompt) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleGoHome();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, choiceGroup, passwordPrompt, handleGoHome]);

  useEffect(() => {
    if (activeProject) activePageRef.current?.scrollTo({ top: 0, left: 0 });
    else if (restoreGridFocusRef.current) {
      document.querySelector(`[data-project-id="${lastProjectRef.current}"]`)?.focus({ preventScroll: true });
      restoreGridFocusRef.current = false;
    }
  }, [activeProject]);

  /* ── Active project fullscreen view ── */
  if (activeProject) {
    const isScrollableProject = ['website-archive', 'roulette', 'racing'].includes(activeProject);
    return (
      <div
        ref={activePageRef}
        className={`pp-active ${isScrollableProject ? 'pp-active--scrollable ' : ''}${isClosingProject ? 'pp-closing' : ''}`}
        data-lenis-prevent={isScrollableProject ? '' : undefined}
      >
        <button type="button" className="pp-back-btn" onClick={handleBackToGrid} disabled={isClosingProject} aria-label="Back to extras">
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
    id: p.id,
    link: '#',
    text: p.text,
    image: p.image,
    onClick: () => handleSelectProject(p.id),
  }));

  return (
    <div className="pp-page" tabIndex={-1}>
      <div className="pp-top-bar">
        <button ref={homeButtonRef} type="button" className="pp-home-btn" onClick={handleGoHome} aria-label="Back to the portfolio">
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

      {PROJECT_CHOICE_GROUPS[choiceGroup] && (
        <ProjectChoiceDialog
          {...PROJECT_CHOICE_GROUPS[choiceGroup]}
          onChoose={chooseProject}
          onClose={() => setChoiceGroup(null)}
        />
      )}
    </div>
  );
};

export default ProjectPicker;
