import React, { useState, useEffect } from 'react';
import './Header.css';
import GlassSurface from './GlassSurface';
import logoDark from '../assets/logo-dark.png';

const Header = () => {
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
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = sectionId === 'work' ? 100 : 0; // Extra space above work section
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

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf.pdf';
    link.download = 'Tamas-Gal-Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  <li><button onClick={downloadResume}>Resume</button></li>
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
