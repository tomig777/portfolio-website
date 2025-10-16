import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero" ref={heroRef}>
      <div className="hero__content">
        <div className="hero__text">
          <h1 className="hero__title">
            <span className="hero__greeting">Hello, I'm</span>
            <span className="hero__name">Your Name</span>
            <span className="hero__role">Full Stack Developer</span>
          </h1>
          <p className="hero__description">
            I create beautiful, functional, and user-centered digital experiences 
            that bring ideas to life through code and design.
          </p>
          <div className="hero__buttons">
            <button className="btn btn--primary" onClick={scrollToProjects}>
              View My Work
            </button>
            <button className="btn btn--secondary">
              Download CV
            </button>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__image">
            <div className="hero__placeholder">
              <span>Your Photo</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hero__scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
};

export default Hero;
