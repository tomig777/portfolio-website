import React, { useState, useEffect } from 'react';
import './Header.css';
import GlassSurface from './GlassSurface';
import { useTheme } from '../contexts/ThemeContext';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
                
                <div className="header__logo">
                  <img 
                    src={isDarkMode ? logoDark : logoLight} 
                    alt="Logo" 
                    className="header__logo-img"
                  />
                </div>
                
                <ul className="header__menu header__menu--right">
                  <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
                  <li><button onClick={() => scrollToSection('resume')}>Resume</button></li>
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
