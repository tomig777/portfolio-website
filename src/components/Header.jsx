import React, { useState, useEffect } from 'react';
import './Header.css';
import GlassSurface from './GlassSurface';
import logoDark from '../assets/logo-dark.png';

const Header = ({ onResumeClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    // Map nav items to actual section IDs and offsets
    let targetId = sectionId;
    let offset = 80; // Default offset for header height

    if (sectionId === 'about') {
      targetId = 'about-card'; // Scroll to card, not title
      offset = 85; // Slightly higher
    } else if (sectionId === 'work') {
      offset = 50; // Scroll a bit lower for work
    } else if (sectionId === 'contact') {
      targetId = 'contact-folder'; // Scroll to folder, not title
      offset = 200; // More space above folder to scroll higher
    }

    const element = document.getElementById(targetId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleResumeClick = () => {
    if (onResumeClick) {
      onResumeClick();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
        <div className="header__container">
          <GlassSurface
            width="100%"
            height={80}
            borderRadius={40}
            brightness={30}
            opacity={0.15}
            blur={15}
            displace={5}
            backgroundOpacity={0.1}
            saturation={1.2}
            distortionScale={-120}
            redOffset={8}
            greenOffset={12}
            blueOffset={18}
            className="header__glass"
          >
            <div className="header__content">
              <nav className={`header__nav ${isMobileMenuOpen ? 'header__nav--open' : ''}`}>
                <ul className="header__menu header__menu--left">
                  <li><button onClick={() => scrollToSection('about')}>About</button></li>
                  <li><button onClick={() => scrollToSection('work')}>Work</button></li>
                </ul>

                <button className="header__logo" onClick={scrollToTop} aria-label="Scroll to top">
                  <img
                    src={logoDark}
                    alt="Logo"
                    className="header__logo-img"
                  />
                </button>

                <ul className="header__menu header__menu--right">
                  <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
                  <li><button onClick={handleResumeClick}>Resume</button></li>
                </ul>
              </nav>

              <button
                className="header__mobile-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </GlassSurface>
        </div>
      </header>
    </>
  );
};

export default Header;

