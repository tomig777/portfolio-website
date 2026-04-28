import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import Header from './Header';
import VideoBackground from './VideoBackground';
import WorkModal from './WorkModal';
import ResumeModal from './ResumeModal';
import StarConstellation from './StarConstellation';
import ShinyText from './ShinyText';
import ScrollIndicator from './ScrollIndicator';
import ErrorBoundary from './ErrorBoundary';

import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects, SiAdobepremierepro, SiFigma, SiBlender, SiAdobelightroom, SiDavinciresolve, SiInstagram, SiLinkedin, SiAdobeaudition, SiAutodesk, SiCinema4D } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';

import card1Image from '../assets/szia.png';
import portraitImage from '../assets/portrait-1.png';
import kep9 from '../assets/kep9.png';
import nukeLogo from '../assets/nuke_logo2.png';
import substanceLogo from '../assets/substance_logo.png';

import './WebsiteTest.css';

gsap.registerPlugin(ScrollTrigger);

const Lanyard = lazy(() => import('./Lanyard'));
const ProfileCard = lazy(() => import('./ProfileCard'));
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
  const navigate = useNavigate();
  const [selectedWork, setSelectedWork] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
  useGSAP(() => {
    // 1. Pinned Text Sequence
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.wt-blur-section',
        scroller: containerRef.current,
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

    // 2. Sticky Cards Scale effect
    const cards = gsap.utils.toArray('.project-card-anim');
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return; // Last card doesn't scale down
      
      ScrollTrigger.create({
        trigger: card,
        scroller: containerRef.current,
        start: 'top 20%', // When it sticks
        endTrigger: cards[i + 1],
        end: 'top 20%', // When the next card hits the sticky point
        scrub: true,
        animation: gsap.to(card, { scale: 0.92, ease: 'none' })
      });
    });

    // 3. About Grid Reveal
    gsap.fromTo('.wt-about-anim',
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.wt-about-section',
          scroller: containerRef.current,
          start: 'top 85%',
          end: 'bottom 80%',
          scrub: 1
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
          scroller: containerRef.current,
          start: 'top 80%',
          end: 'center 60%',
          scrub: 1
        }
      }
    );

  }, { scope: containerRef });

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

      {/* ─── 1. Text Blur Section ─── */}
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

      {/* ─── 2. Sticky Projects Section ─── */}
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

      {/* ─── 3. About Me Section (Grid/Pills) ─── */}
      <section id="about" className="wt-about-section">
        <div className="wt-about-header">
          <p className="section-label">About</p>
          <h2 className="section-title">
            <ShinyText text="Get To Know Me" speed={2.5} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" />
          </h2>
        </div>

        <div className="about-combined-section">
          <div className="wt-about-3col wt-about-anim">
            
            {/* Column 1: Image Card */}
            <div id="about-card" className="profile-container">
              <Suspense fallback={<div style={{ width: '100%', maxWidth: '300px', height: '450px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}/>}>
                <ProfileCard
                  name="Tamas Gal"
                  title="Media Designer"
                  handle="tamasgal"
                  status="Available"
                  avatarUrl={portraitImage}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={false}
                  hideContact={true}
                  monoColor={true}
                />
              </Suspense>
            </div>

            {/* Column 2: Biography Text */}
            <div className="bio-container">
              <p className="bio-text">
                Hi, I'm Tomi, a Media Designer who loves exploring all sides of creativity.
              </p>
              <p className="bio-text">
                What started as self-taught video editing has evolved into a versatile skillset spanning 3D design, motion, 2D graphics, VFX, and a growing interest in UI.
              </p>
              <p className="bio-text">
                I am a perfectionist who favors clean aesthetics and obsesses over pixel-perfect details, striving to create work that is not just seen, but admired for being well put together.
              </p>
              <p className="bio-text">
                In my downtime, you can usually find me taking photos, gaming with friends, or hanging out with my cats.
              </p>
            </div>

            {/* Column 3: Software Icons */}
            <div className="wt-skills-column">
              {[...adobeLogos, ...otherLogos].map((logo, index) => (
                <div
                  key={index}
                  className="skill-item"
                  title={logo.title}
                  style={{ cursor: 'pointer' }}
                >
                  {logo.node}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. Contact Section ─── */}
      <section id="contact" className="wt-contact-section">
        <div style={{width: '100%', padding: '0 2rem', textAlign: 'center'}} className="wt-contact-anim">
          <p className="section-label">Get in Touch</p>
          <h2 className="section-title">
            <ShinyText text="Let's Chat" speed={2.5} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" />
          </h2>
        </div>

        <section id="contact-folder" className="folder-section wt-contact-anim" style={{ flex: 1 }}>
          <StarConstellation side="left" />
          <div className="folder-container">
            <Suspense fallback={<div style={{ minHeight: '50vh' }}/>}>
              <Folder size={isMobile ? 1.4 : 2} color="#667eea" className="custom-folder" items={socialItems} />
            </Suspense>
            <div className="folder-base-line" />
          </div>
          <StarConstellation side="right" />
        </section>

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
