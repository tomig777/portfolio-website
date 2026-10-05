import React, { useState, useEffect, useRef } from 'react';
import './WebsiteTestHeader.css';
import logoDark from '../assets/web-optimized/logo-dark.webp';
import { useFocusScope } from '../hooks/useFocusScope';
import { prefersReducedMotion } from '../utils/pageTransition';
import { formatBudapestClock } from '../utils/clock';

const headerThemeOptions = [
  { id: 'violet', number: '1', name: 'Violet' },
  { id: 'red', number: '2', name: 'Red' }
];

const WebsiteTestHeader = ({
  onGalleryClick,
  onGalleryPrepare,
  onLogoClick,
  onNavigate,
  onProjectPicker,
  themePreset = 'violet',
  onThemePresetChange,
  menuReturnToken = 0,
  forceCollapsed = false,
  onMenuScrollLock,
  mobilePreview = false,
  showThemeControls = true
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [isMenuRestored, setIsMenuRestored] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const menuRef = useRef(null);
  const themeGroupRef = useRef(null);
  const themeTriggerRef = useRef(null);
  const focusThemeOptionsRef = useRef(false);
  const closeTimerRef = useRef(null);
  const scrollLockRef = useRef(null);
  const onMenuScrollLockRef = useRef(onMenuScrollLock);
  const [timeStr, setTimeStr] = useState('');
  const activeTheme = headerThemeOptions.find((theme) => theme.id === themePreset) || headerThemeOptions[0];
  const isCollapsed = isScrolled || forceCollapsed;
  const togglePreviewTheme = () => {
    if (!mobilePreview) return;
    onThemePresetChange?.(themePreset === 'red' ? 'violet' : 'red');
  };

  useEffect(() => {
    onMenuScrollLockRef.current = onMenuScrollLock;
  }, [onMenuScrollLock]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const updateClock = () => {
      setTimeStr(formatBudapestClock(new Date()));
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollContainer = e.target;
      const mainScrollContainer = document.querySelector('.wt-scroll-container');
      if (scrollContainer !== document && scrollContainer !== mainScrollContainer) return;
      const scrollY = scrollContainer === document ? window.scrollY : (scrollContainer.scrollTop || 0);
      setIsScrolled(scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, true);
    const mainScrollContainer = document.querySelector('.wt-scroll-container');
    setIsScrolled((mainScrollContainer?.scrollTop || 0) > 40);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      const scrollLock = scrollLockRef.current;
      if (scrollLock) {
        scrollLockRef.current = null;
      }
      onMenuScrollLockRef.current?.(false);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    // Redirect 'about' to 'contact' since About section is removed for now
    const targetId = sectionId === 'about' ? 'contact' : sectionId;
    const element = document.getElementById(targetId);
    const scrollContainer = document.querySelector('.wt-scroll-container');
    // Contact scene lives at the end of the pinned transition — scroll to page bottom
    if (targetId === 'contact' && scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    if (element && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = targetId === 'work' ? 100 : 0;
      const targetScrollTop = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - offset;
      
      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGalleryClick = () => {
    if (onGalleryClick) {
      onGalleryClick();
    }
  };

  const handleGalleryPrepare = () => {
    if (onGalleryPrepare) onGalleryPrepare();
  };

  const navigateToPage = (page, origin = 'header') => {
    if (onNavigate) {
      onNavigate(page, origin);
      return;
    }
    scrollToSection(page);
  };

  const scrollHomeDirectly = () => {
    const scrollContainer = document.querySelector('.wt-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMenu = (restoreInstantly = false) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const scrollContainer = document.querySelector('.wt-scroll-container');
    if (scrollContainer && !scrollLockRef.current) {
      scrollLockRef.current = {
        container: scrollContainer,
        scrollTop: scrollContainer.scrollTop,
      };
      onMenuScrollLockRef.current?.(true);
    }

    setIsMenuClosing(false);
    setIsMenuRestored(restoreInstantly);
    setThemePickerOpen(false);
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    if (closeTimerRef.current) return;
    setIsMenuClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
      setIsMenuRestored(false);
      const scrollLock = scrollLockRef.current;
      if (scrollLock) {
        scrollLockRef.current = null;
      }
      onMenuScrollLockRef.current?.(false);
      closeTimerRef.current = null;
    }, prefersReducedMotion() ? 0 : 760);
  };

  useEffect(() => {
    if (menuReturnToken > 0) {
      openMenu(true);
    }
  }, [menuReturnToken]);

  const returnToProjectPicker = () => {
    if (onProjectPicker) onProjectPicker();
  };

  const handleMenuNavigation = (page) => {
    if (isMenuClosing) return;
    closeMenu();
    if (page === 'home') {
      if (onLogoClick) onLogoClick();
      else scrollHomeDirectly();
      return;
    }
    if (page === 'gallery') {
      handleGalleryClick();
      return;
    }
    navigateToPage(page, 'menu');
  };

  useFocusScope(menuRef, { active: isMenuOpen, initialFocus: '.menu-drop__action--center', fallbackFocus: '.header__more-btn', onEscape: closeMenu });

  useEffect(() => {
    if (!themePickerOpen) return undefined;
    if (focusThemeOptionsRef.current) {
      themeGroupRef.current?.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
      focusThemeOptionsRef.current = false;
    }
    const closeOutside = event => {
      if (!themeGroupRef.current?.contains(event.target)) setThemePickerOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [themePickerOpen]);

  // Pointer Proximity & Angle tracker for laser border glow effect
  const handlePointerMove = (e) => {
    const box = e.currentTarget;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    const edge = Math.min(Math.max(0.4 + 0.6 * (1 / Math.min(kx, ky)), 0.4), 1);
    
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    
    box.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    box.style.setProperty('--cursor-angle', `${degrees.toFixed(3)}deg`);
  };

  const handlePointerLeave = (e) => {
    const box = e.currentTarget;
    box.style.setProperty('--edge-proximity', '0');
  };

  return (
    <>
    <header className={`wt-site-header ${isCollapsed ? 'wt-site-header--scrolled' : ''} ${isMenuOpen ? 'wt-site-header--menu-open' : ''}`} aria-label="Main navigation">
      <div className="wt-site-header__container">
        <div className="header__three-sections">
          
          {/* Section 1: Logo Box */}
          <div 
            className="header__glass-box header__logo-box"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <button type="button" className="wt-site-header__logo" onClick={scrollToTop} aria-label="Home">
              <img 
                src={logoDark} 
                alt="Logo" 
                className="wt-site-header__logo-img"
              />
            </button>
            <span className="edge-light" />
          </div>

          {/* Section 2: Menu Links Box (disappears on scroll) */}
          <div 
            className="header__glass-box header__menu-box"
            inert={isCollapsed ? true : undefined}
            aria-hidden={isCollapsed ? true : undefined}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <div className="header__menu-links">
              <button type="button" tabIndex={isCollapsed ? -1 : undefined} onClick={() => navigateToPage('work')} className="nav-link-btn">
                <span className="roll-text">
                  <span className="roll-text__original">Work</span>
                  <span className="roll-text__copy" aria-hidden="true">Work</span>
                </span>
              </button>
              <button type="button" tabIndex={isCollapsed ? -1 : undefined} onClick={() => navigateToPage('about')} className="nav-link-btn">
                <span className="roll-text">
                  <span className="roll-text__original">About</span>
                  <span className="roll-text__copy" aria-hidden="true">About</span>
                </span>
              </button>
              <button type="button" tabIndex={isCollapsed ? -1 : undefined} onClick={() => navigateToPage('contact')} className="nav-link-btn">
                <span className="roll-text">
                  <span className="roll-text__original">Contact</span>
                  <span className="roll-text__copy" aria-hidden="true">Contact</span>
                </span>
              </button>
              <button
                type="button"
                tabIndex={isCollapsed ? -1 : undefined}
                onClick={handleGalleryClick}
                onPointerEnter={handleGalleryPrepare}
                onPointerDown={handleGalleryPrepare}
                onFocus={handleGalleryPrepare}
                className="nav-link-btn"
              >
                <span className="roll-text">
                  <span className="roll-text__original">Gallery</span>
                  <span className="roll-text__copy" aria-hidden="true">Gallery</span>
                </span>
              </button>
            </div>
            <span className="edge-light" />
          </div>

          {/* Section 3: Three Dots Box */}
          <div 
            className="header__glass-box header__more-box"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <button
              className="header__more-btn"
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'More options'}
              aria-expanded={isMenuOpen}
              aria-controls="portfolio-menu"
              onClick={isMenuOpen ? closeMenu : () => openMenu(false)}
            >
              <div className="dots-icon">
                <span className="dot-item dot-item--left" />
                <span className="dot-item dot-item--center" />
                <span className="dot-item dot-item--right" />
                <span className="dot-item dot-item--top" />
                <span className="dot-item dot-item--bottom" />
              </div>
            </button>
            <span className="edge-light" />
          </div>

        </div>
      </div>
    </header>
    {showThemeControls && (
    <div className={`wt-header-theme-controls${mobilePreview ? ' wt-header-theme-controls--mobile-preview' : ''}`} aria-label="Header appearance">
      <div
        ref={themeGroupRef}
        className={`header__glass-box wt-header-theme-controls__group${themePickerOpen ? ' is-open' : ''}`}
        onPointerEnter={event => { if (!mobilePreview && event.pointerType === 'mouse') setThemePickerOpen(true); }}
        onPointerMove={handlePointerMove}
        onPointerLeave={event => {
          handlePointerLeave(event);
          if (!event.currentTarget.contains(document.activeElement)) setThemePickerOpen(false);
        }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setThemePickerOpen(false); }}
        onKeyDown={event => {
          if (event.key === 'Escape' && themePickerOpen) {
            event.preventDefault();
            event.stopPropagation();
            setThemePickerOpen(false);
            themeTriggerRef.current?.focus({ preventScroll: true });
          }
        }}
      >
        <button
          ref={themeTriggerRef}
          type="button"
          className="wt-header-theme-trigger"
          aria-label={mobilePreview ? `Toggle theme. Current theme: ${activeTheme.name}` : `Open theme picker. Current theme: ${activeTheme.name}`}
          aria-expanded={mobilePreview ? undefined : themePickerOpen}
          aria-controls={mobilePreview ? undefined : 'portfolio-theme-options'}
          tabIndex={!mobilePreview && themePickerOpen ? -1 : undefined}
          onClick={mobilePreview ? togglePreviewTheme : () => {
            focusThemeOptionsRef.current = true;
            setThemePickerOpen(open => !open);
          }}
        >
          <span className="wt-header-theme-trigger__number">{activeTheme.number}</span>
        </button>
        {!mobilePreview && (
          <div id="portfolio-theme-options" className="wt-header-theme-options" inert={!themePickerOpen ? true : undefined} aria-hidden={!themePickerOpen ? true : undefined}>
            {headerThemeOptions.map((theme, index) => (
              <button
                key={theme.id}
                type="button"
                className={`wt-header-theme-button${themePreset === theme.id ? ' is-active' : ''}`}
                style={{ '--theme-option-index': index }}
                aria-label={`Use ${theme.name.toLowerCase()} header theme`}
                aria-pressed={themePreset === theme.id}
                tabIndex={themePickerOpen ? undefined : -1}
                onClick={() => {
                  onThemePresetChange?.(theme.id);
                  setThemePickerOpen(false);
                  themeTriggerRef.current?.focus({ preventScroll: true });
                }}
              >
                {theme.number}
              </button>
            ))}
          </div>
        )}
        <span className="edge-light" />
      </div>
    </div>
    )}
    {isMenuOpen && (
      <div
        ref={menuRef}
        id="portfolio-menu"
        className={`menu-drop${isMenuClosing ? ' menu-drop--closing' : ''}${isMenuRestored ? ' menu-drop--restored' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio menu"
        aria-busy={isMenuClosing}
        data-lenis-prevent
      >
        <div className="menu-drop__top">
          <button 
            type="button" 
            className="menu-drop__action menu-drop__action--extra"
            onClick={returnToProjectPicker}
          >
            <span>Extra</span>
          </button>
          <button 
            type="button" 
            className="menu-drop__action menu-drop__action--center" 
            onClick={closeMenu} 
            aria-label="Close menu"
          >
            <span className="menu-drop__dots">...</span>
            <span className="menu-drop__close-icon" aria-hidden="true">
              {[
                [0, 0], [4, 0],
                [1, 1], [3, 1],
                [2, 2],
                [1, 3], [3, 3],
                [0, 4], [4, 4]
              ].map(([x, y]) => (
                <i
                  className="menu-drop__close-dot"
                  key={`${x}-${y}`}
                  style={{ '--dot-x': x, '--dot-y': y }}
                />
              ))}
            </span>
          </button>
          <button 
            type="button" 
            className="menu-drop__action menu-drop__action--contact"
            onClick={() => handleMenuNavigation('contact')}
          >
            <span>Contact Me <span className="green-dot">•</span></span>
          </button>
        </div>

        <div className="menu-drop__content">
          <div className="menu-drop__layout">
            {/* Left Column: Huge Links */}
            <div className="menu-drop__nav-column">
              <button type="button" onClick={() => handleMenuNavigation('home')} className="menu-drop__nav-link">
                Home
              </button>
              <button type="button" onClick={() => handleMenuNavigation('gallery')} className="menu-drop__nav-link">
                Gallery
              </button>
              <button type="button" onClick={() => handleMenuNavigation('work')} className="menu-drop__nav-link">
                Work
              </button>
              <button type="button" onClick={() => handleMenuNavigation('about')} className="menu-drop__nav-link">
                About
              </button>
              <button type="button" onClick={() => handleMenuNavigation('contact')} className="menu-drop__nav-link">
                Contact
              </button>
            </div>

            {/* Right Column: Socials */}
            <div className="menu-drop__info-column">
              <div className="menu-drop__socials-block">
                <span className="menu-drop__socials-title">Social</span>
                <div className="menu-drop__socials-list">
                  <a href="https://www.instagram.com/arhivetkg/" target="_blank" rel="noopener noreferrer">Instagram</a>
                  <a href="https://www.linkedin.com/in/tamasgal77/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          <div className="menu-drop__clock">
            {timeStr}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default WebsiteTestHeader;
