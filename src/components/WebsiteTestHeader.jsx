import React, { useState, useEffect, useRef } from 'react';
import './WebsiteTestHeader.css';
import logoDark from '../assets/logo-dark.png';

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
  const closeTimerRef = useRef(null);
  const scrollLockRef = useRef(null);
  const onMenuScrollLockRef = useRef(onMenuScrollLock);
  const [timeStr, setTimeStr] = useState('');
  const activeTheme = headerThemeOptions.find((theme) => theme.id === themePreset) || headerThemeOptions[0];
  const togglePreviewTheme = () => {
    if (!mobilePreview) return;
    onThemePresetChange?.(themePreset === 'red' ? 'violet' : 'red');
  };

  useEffect(() => {
    onMenuScrollLockRef.current = onMenuScrollLock;
  }, [onMenuScrollLock]);

  useEffect(() => {
    const updateClock = () => {
      const options = {
        timeZone: 'Europe/Budapest',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const parts = formatter.formatToParts(new Date());
      const h = parts.find(p => p.type === 'hour').value;
      const m = parts.find(p => p.type === 'minute').value;
      const s = parts.find(p => p.type === 'second').value;
      setTimeStr(`${h}:${m}:${s} (GMT+2)`);
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

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
        window.removeEventListener('keydown', scrollLock.preventScrollKeys);
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
      const preventScrollKeys = (event) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
          event.preventDefault();
        }
      };

      scrollLockRef.current = {
        container: scrollContainer,
        scrollTop: scrollContainer.scrollTop,
        preventScrollKeys
      };
      window.addEventListener('keydown', preventScrollKeys, { passive: false });
      onMenuScrollLockRef.current?.(true);
    }

    setIsMenuClosing(false);
    setIsMenuRestored(restoreInstantly);
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
      setIsMenuRestored(false);
      const scrollLock = scrollLockRef.current;
      if (scrollLock) {
        window.removeEventListener('keydown', scrollLock.preventScrollKeys);
        scrollLockRef.current = null;
      }
      onMenuScrollLockRef.current?.(false);
      closeTimerRef.current = null;
    }, 760);
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
    <header className={`wt-site-header ${isScrolled || forceCollapsed ? 'wt-site-header--scrolled' : ''} ${isMenuOpen ? 'wt-site-header--menu-open' : ''}`}>
      <div className="wt-site-header__container">
        <div className="header__three-sections">
          
          {/* Section 1: Logo Box */}
          <div 
            className="header__glass-box header__logo-box"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <button className="wt-site-header__logo" onClick={scrollToTop} aria-label="Scroll to top">
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
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <div className="header__menu-links">
              <button onClick={() => navigateToPage('work')} className="nav-link-btn">
                <span className="roll-text">
                  <span className="roll-text__original">Work</span>
                  <span className="roll-text__copy">Work</span>
                </span>
              </button>
              <button onClick={() => navigateToPage('about')} className="nav-link-btn">
                <span className="roll-text">
                  <span className="roll-text__original">About</span>
                  <span className="roll-text__copy">About</span>
                </span>
              </button>
              <button onClick={() => navigateToPage('contact')} className="nav-link-btn">
                <span className="roll-text">
                  <span className="roll-text__original">Contact</span>
                  <span className="roll-text__copy">Contact</span>
                </span>
              </button>
              <button
                onClick={handleGalleryClick}
                onPointerEnter={handleGalleryPrepare}
                onPointerDown={handleGalleryPrepare}
                onFocus={handleGalleryPrepare}
                className="nav-link-btn"
              >
                <span className="roll-text">
                  <span className="roll-text__original">Gallery</span>
                  <span className="roll-text__copy">Gallery</span>
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
        className="header__glass-box wt-header-theme-controls__group"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <button
          type="button"
          className="wt-header-theme-trigger"
          aria-label={mobilePreview ? `Toggle theme. Current theme: ${activeTheme.name}` : `Open theme picker. Current theme: ${activeTheme.name}`}
          aria-haspopup={mobilePreview ? undefined : 'true'}
          onClick={mobilePreview ? togglePreviewTheme : undefined}
        >
          <span className="wt-header-theme-trigger__number">{activeTheme.number}</span>
        </button>
        {!mobilePreview && (
          <div className="wt-header-theme-options">
            {headerThemeOptions.map((theme, index) => (
              <button
                key={theme.id}
                type="button"
                className={`wt-header-theme-button${themePreset === theme.id ? ' is-active' : ''}`}
                style={{ '--theme-option-index': index }}
                aria-label={`Use ${theme.name.toLowerCase()} header theme`}
                aria-pressed={themePreset === theme.id}
                onClick={(event) => {
                  onThemePresetChange?.(theme.id);
                  event.currentTarget.blur();
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
        className={`menu-drop${isMenuClosing ? ' menu-drop--closing' : ''}${isMenuRestored ? ' menu-drop--restored' : ''}`}
        aria-hidden={isMenuClosing ? 'true' : 'false'}
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
              <button onClick={() => handleMenuNavigation('home')} className="menu-drop__nav-link">
                Home
              </button>
              {mobilePreview && (
                <button onClick={() => handleMenuNavigation('gallery')} className="menu-drop__nav-link">
                  Gallery
                </button>
              )}
              <button onClick={() => handleMenuNavigation('work')} className="menu-drop__nav-link">
                Work
              </button>
              <button onClick={() => handleMenuNavigation('about')} className="menu-drop__nav-link">
                About
              </button>
              <button onClick={() => handleMenuNavigation('contact')} className="menu-drop__nav-link">
                Contact
              </button>
            </div>

            {/* Right Column: Contact & Socials */}
            <div className="menu-drop__info-column">
              {!mobilePreview && (
              <div className="menu-drop__contact-block">
                <ul className="menu-drop__contact-list">
                  <li>+36 20 000 00 00</li>
                  <li><span>Contact Me</span></li>
                  <li><span>Available for select collaborations</span></li>
                </ul>
              </div>
              )}

              <div className="menu-drop__socials-block">
                <span className="menu-drop__socials-title">Social</span>
                <div className="menu-drop__socials-list">
                  <span>Instagram</span>
                  <span>LinkedIn</span>
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
