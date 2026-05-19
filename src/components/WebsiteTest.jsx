import React, { useState, useEffect, useLayoutEffect, useRef, Suspense, lazy } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import Header from './Header';
import VideoBackground from './VideoBackground';
import WorkModal from './WorkModal';
import ResumeModal from './ResumeModal';
import ScrollIndicator from './ScrollIndicator';
import ErrorBoundary from './ErrorBoundary';

import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects, SiAdobepremierepro, SiFigma, SiBlender, SiAdobelightroom, SiDavinciresolve, SiInstagram, SiLinkedin, SiAdobeaudition, SiAutodesk, SiCinema4D } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';

import card1Image from '../assets/szia.png';
import portraitImage from '../assets/portrait-2.png';
import kep9 from '../assets/kep9.png';
import nukeLogo from '../assets/nuke_logo2.png';
import substanceLogo from '../assets/substance_logo.png';

import './WebsiteTest.css';

gsap.registerPlugin(ScrollTrigger);

const Lanyard = lazy(() => import('./Lanyard'));
const Folder = lazy(() => import('./Folder'));

const adobeLogos = [
  { node: <SiAdobeillustrator />, title: "Adobe Illustrator" },
  { node: <SiAdobephotoshop />, title: "Adobe Photoshop" },
  { node: <SiAdobepremierepro />, title: "Adobe Premiere Pro" },
  { node: <SiAdobeaftereffects />, title: "Adobe After Effects" },
  { node: <SiAdobeaudition />, title: "Adobe Audition" },
  { node: <SiAdobelightroom />, title: "Adobe Lightroom" },
];

const otherLogos = [
  { node: <SiAutodesk />, title: "Autodesk Maya" },
  { node: <SiFigma />, title: "Figma" },
  { node: <SiBlender />, title: "Blender" },
  { node: <SiDavinciresolve />, title: "DaVinci Resolve" },
  { node: <div className="skill-icon-mask" style={{ WebkitMaskImage: `url(${nukeLogo})`, maskImage: `url(${nukeLogo})`, width: '44px', height: '44px' }} />, title: "Nuke" },
  { node: <SiCinema4D />, title: "Cinema 4D" },
  { node: <div className="skill-icon-mask" style={{ WebkitMaskImage: `url(${substanceLogo})`, maskImage: `url(${substanceLogo})`, width: '50px', height: '50px' }} />, title: "Substance Painter" },
];

const skillLogos = [...adobeLogos, ...otherLogos];

const socialItems = [
  <a key="instagram" href="https://www.instagram.com/arhivetkg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <SiInstagram />
  </a>,
  <a key="linkedin" href="https://www.linkedin.com/in/tamasgal77/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <SiLinkedin />
  </a>,
  <a key="email" href="mailto:tamasgaldesign@gmail.com" aria-label="Email">
    <HiMail />
  </a>
];

const WebsiteTest = ({ onBack }) => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [skillOffset, setSkillOffset] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSkillOffset((current) => (current + 1) % skillLogos.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  // Preload gallery image
  useEffect(() => {
    const img = new Image();
    img.src = kep9;
  }, []);

  const [showResumeModal, setShowResumeModal] = useState(false);

  // Sync left column height with dynamic card height for pixel-perfect alignment
  useEffect(() => {
    const syncHeight = () => {
      const card = document.querySelector('.wt-project-card');
      const leftCol = document.querySelector('.wt-projects-left');
      if (card && leftCol) {
        leftCol.style.height = `${card.offsetHeight}px`;
      }
    };
    syncHeight();
    window.addEventListener('resize', syncHeight);
    return () => window.removeEventListener('resize', syncHeight);
  }, []);

  // GSAP Animations
  useLayoutEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return undefined;

    const ctx = gsap.context(() => {
    // 1. Sticky Cards Scale effect
    const cards = gsap.utils.toArray('.project-card-anim');
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return; // Last card doesn't scale down
      
      ScrollTrigger.create({
        trigger: card,
        scroller: scrollContainer,
        start: 'top 20%', // When it sticks
        endTrigger: cards[i + 1],
        end: 'top 20%', // When the next card hits the sticky point
        scrub: true,
        animation: gsap.to(card, { scale: 0.92, ease: 'none' })
      });
    });

    // 2. Pinned Text Sequence
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.wt-blur-section',
        scroller: scrollContainer,
        start: 'top top',
        end: '+=250%', // Pin for 250% viewport height to leave more scrolling time
        pin: true,
        scrub: 1.5
      }
    });

    textTl.fromTo('.wt-word-1', 
      { filter: 'blur(16px)', opacity: 0, x: 30 },
      { filter: 'blur(0px)', opacity: 1, x: 0, stagger: 0.15, ease: 'none' }
    )
    .to('.wt-word-1', 
      { filter: 'blur(10px)', opacity: 0, x: -30, stagger: 0.1, ease: 'none' }, 
      "+=0.8" // Hold a bit before fading out
    )
    .fromTo('.wt-word-2', 
      { filter: 'blur(16px)', opacity: 0, x: 30 },
      { filter: 'blur(0px)', opacity: 1, x: 0, stagger: 0.15, ease: 'none' },
      "<0.2"
    )
    .to({}, { duration: 1.5 }); // Hold longer at the end before unpinning

    // 3. About Grid Reveal
    gsap.fromTo('.wt-about-anim',
      { y: 130, opacity: 0, filter: 'blur(12px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.wt-about-section',
          scroller: scrollContainer,
          start: 'top 78%',
          end: 'top 28%',
          scrub: 1.2
        }
      }
    );

    // 4. Contact Section Reveal
    gsap.fromTo('.wt-contact-anim',
      { y: 50, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.wt-contact-section',
          scroller: scrollContainer,
          start: 'top 80%',
          end: 'center 60%',
          scrub: 1
        }
      }
    );

    }, scrollContainer);

    return () => ctx.revert();
  }, []);

  const visibleSkillCount = isMobile ? 4 : 5;
  const visibleSkills = Array.from({ length: visibleSkillCount }, (_, index) => {
    return skillLogos[(skillOffset + index) % skillLogos.length];
  });

  return (
    <div className="App wt-scroll-container" ref={containerRef} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      {onBack && (
        <button 
          onClick={onBack} 
          style={{
            position: 'fixed', top: '20px', left: '20px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '6px', 
            background: 'rgba(10,10,10,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', 
            padding: '8px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, 
            backdropFilter: 'blur(12px)', cursor: 'pointer'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8L10 13" /></svg>
          Back
        </button>
      )}

      {/* ─── Hero Section ─── */}
      <div className="plasma-background">
        <VideoBackground opacity={0.8} />
      </div>
      <Header onResumeClick={() => setShowResumeModal(true)} />

      <section className="hero-section">
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className="lanyard-container">
              <Lanyard position={isMobile ? [0, 0, 35] : [0, 0, 20]} gravity={[0, -40, 0]} />
            </div>
          </Suspense>
        </ErrorBoundary>

        <div className="hero-text">
          <h1 className="hero-text__name">
            <span className="hero-text__line">TAMAS</span>
            <span className="hero-text__line">GAL</span>
          </h1>
          <p className="hero-text__subtitle">
            A BUDAPEST BASED HUNGARIAN CREATIVE DESIGNER SPECIALIZING IN 3D VISUALIZATION, VECTOR ILLUSTRATION,<br />
            AND SOCIAL MEDIA CONTENT, WITH A PASSION FOR WEB AND USER INTERFACE DESIGN.
          </p>
        </div>
        <ScrollIndicator />
      </section>

      {/* ─── 1. Sticky Projects Section ─── */}
      <section id="work" className="wt-projects-section">
        <div className="wt-projects-container">
          <div className="wt-projects-left">
            <div>
              <p className="section-label">Work</p>
              <h2 className="section-title">Selected<br/>Projects</h2>
            </div>
            <div style={{color: 'rgba(255,255,255,0.5)', maxWidth: '400px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <p>A collection of my latest works ranging from 3D visualization to UI design. Scroll to explore the details.</p>
              <p>Each project is approached with a unique perspective, ensuring that the final result not only looks stunning but also serves its functional purpose perfectly.</p>
            </div>
          </div>
          
          <div className="wt-projects-right">
            {[1, 2, 3, 4, 5, 6].map((num, index) => (
              <React.Fragment key={num}>
                <div className="wt-project-card project-card-anim" onClick={() => setSelectedWork(num)} style={{ cursor: 'pointer' }}>
                  <img src={card1Image} alt={`Project ${num}`} className="wt-project-card-image" loading="lazy" />
                  <div className="wt-project-card-overlay">
                    <h3 className="wt-project-card-title">Project {num}</h3>
                  </div>
                </div>
                {/* Spacer between cards to create scroll distance without affecting sticky bounding box calculations */}
                {index < 5 && <div style={{ height: '50vh', width: '100%', flexShrink: 0 }} aria-hidden="true"></div>}
              </React.Fragment>
            ))}
            {/* Invisible spacer to extend the content box, allowing Project 6 to stay sticky for an extra 90vh */}
            <div style={{ height: '90vh', width: '100%', flexShrink: 0 }} aria-hidden="true"></div>
          </div>
        </div>
      </section>

      {/* ─── 2. Text Blur Section ─── */}
      <section className="wt-blur-section">
        <h2 className="wt-blur-text wt-text-1">
          {['Clean', 'aesthetics', 'pixel', 'perfect', 'details.'].map((word, i) => (
            <span key={i} className={`wt-blur-word wt-word-1 ${i > 1 ? 'wt-blur-highlight' : ''}`}>{word}</span>
          ))}
        </h2>
        <h2 className="wt-blur-text wt-text-2">
          {['Crafting', 'dynamic', 'digital', 'experiences.'].map((word, i) => (
            <span key={i} className={`wt-blur-word wt-word-2 ${i > 1 ? 'wt-blur-highlight' : ''}`}>{word}</span>
          ))}
        </h2>
      </section>

      {/* ─── 3. About Me Section ─── */}
      <section id="about" className="wt-about-section">
        <div className="about-combined-section">
          <div className="wt-about-panel wt-about-anim">
            <div className="wt-about-panel-inner">
              <div className="wt-about-photo-wrap">
                <div className="wt-about-photo-glow" aria-hidden="true" />
                <img src={portraitImage} alt="Tamas Gal portrait" className="wt-about-photo" loading="lazy" />
              </div>

              <div className="wt-about-copy">
                <div className="wt-about-kicker">
                  <span>Get To Know Me</span>
                  <i aria-hidden="true" />
                </div>

                <h2 className="wt-about-title">
                  Media Designer
                  <span>& Creative Problem Solver</span>
                </h2>

                <p className="wt-about-bio">
                  I'm Tomi, a Budapest based Media Designer with a versatile creative skillset spanning 3D design, motion, 2D graphics, VFX, UI experiments, and social media content.
                </p>
                <p className="wt-about-bio">
                  I like clean aesthetics, functional details, and work that feels carefully put together from the first glance to the final pixel.
                </p>

                <div className="wt-tools-block">
                  <p className="wt-tools-label">Tools I Use</p>
                  <div className="wt-skills-rotator" aria-label="Software skills">
                    {visibleSkills.map((logo, index) => (
                      <div
                        key={`${logo.title}-${skillOffset}-${index}`}
                        className="skill-item"
                        title={logo.title}
                        style={{ cursor: 'pointer', '--skill-index': index }}
                      >
                        {logo.node}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <a href="#work" className="wt-work-link">
              <span>View My Work</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M4 11L11 4M11 4H5.5M11 4V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 4. Contact Section ─── */}
      <section id="contact" className="wt-contact-section">
        <div className="wt-contact-layout wt-contact-anim">
          <div className="wt-contact-folder-panel">
            <p className="wt-contact-label">Contact</p>
            <div className="folder-container wt-contact-folder-container">
              <Suspense fallback={<div style={{ minHeight: '280px' }}/>}>
                <Folder size={isMobile ? 1.35 : 2.1} color="#667eea" className="custom-folder" items={socialItems} />
              </Suspense>
              <div className="folder-base-line" />
            </div>
            <p className="wt-contact-folder-note">Open the folder for quick links.</p>
          </div>

          <div className="wt-contact-copy">
            <p className="wt-contact-eyebrow">Let's Chat</p>
            <h2 className="wt-contact-title">Have a project, role, or weird visual idea?</h2>
            <p className="wt-contact-intro">
              I am open to selected freelance work, design collaborations, internships, and creative conversations around 3D, motion, UI, and social content.
            </p>

            <div className="wt-contact-details" aria-label="Contact details">
              <a className="wt-contact-detail" href="mailto:tamasgaldesign@gmail.com">
                <span>Email</span>
                <strong>tamasgaldesign@gmail.com</strong>
              </a>
              <div className="wt-contact-detail">
                <span>Location</span>
                <strong>Budapest, Hungary</strong>
              </div>
              <div className="wt-contact-detail">
                <span>Focus</span>
                <strong>3D, motion, UI, content</strong>
              </div>
            </div>

            <div className="wt-contact-actions">
              <a className="wt-contact-primary" href="mailto:tamasgaldesign@gmail.com">
                Start a conversation
              </a>
              <button className="wt-contact-secondary" type="button" onClick={onBack}>
                Back to projects
              </button>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p className="footer-text">Created by Tamas Gal - All rights reserved</p>
        </footer>
      </section>

      {/* Modals */}
      {selectedWork && (
        <WorkModal workId={selectedWork} onClose={() => setSelectedWork(null)} />
      )}
      {showResumeModal && (
        <ResumeModal onClose={() => setShowResumeModal(false)} />
      )}
    </div>
  );
};

export default WebsiteTest;
