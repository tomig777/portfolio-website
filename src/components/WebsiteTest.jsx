import { useState, useEffect, useRef, Suspense, lazy } from 'react';
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

import './WebsiteTest.css';

gsap.registerPlugin(ScrollTrigger);

const Lanyard = lazy(() => import('./Lanyard'));
const ProfileCard = lazy(() => import('./ProfileCard'));
const Folder = lazy(() => import('./Folder'));

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

  // GSAP Animations
  useGSAP(() => {
    // 1. Pinned Text Sequence
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.wt-blur-section',
        scroller: containerRef.current,
        start: 'top top',
        end: '+=150%', // Pin for 150% viewport height
        pin: true,
        scrub: 1
      }
    });

    textTl.fromTo('.wt-word-1', 
      { filter: 'blur(16px)', opacity: 0, x: 30 },
      { filter: 'blur(0px)', opacity: 1, x: 0, stagger: 0.15, ease: 'power2.out' }
    )
    .to('.wt-word-1', 
      { filter: 'blur(10px)', opacity: 0, x: -30, stagger: 0.1, ease: 'power2.in' }, 
      "+=0.5"
    )
    .fromTo('.wt-word-2', 
      { filter: 'blur(16px)', opacity: 0, x: 30 },
      { filter: 'blur(0px)', opacity: 1, x: 0, stagger: 0.15, ease: 'power2.out' },
      "<0.2"
    )
    .to({}, { duration: 0.5 }); // Hold at the end

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
          trigger: '.wt-about-grid',
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
          {['Clean', 'aesthetics', '—', 'pixel', 'perfect', 'details.'].map((word, i) => (
            <span key={i} className={`wt-blur-word wt-word-1 ${i > 2 ? 'wt-blur-highlight' : ''}`}>{word}</span>
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
            <p className="section-label">Work</p>
            <h2 className="section-title">Selected<br/>Projects</h2>
            <p style={{color: 'rgba(255,255,255,0.5)', marginTop: '2rem', maxWidth: '300px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif'}}>
              A collection of my latest works ranging from 3D visualization to UI design. Scroll to explore.
            </p>
          </div>
          
          <div className="wt-projects-right">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="wt-project-card project-card-anim" onClick={() => setSelectedWork(num)} style={{ cursor: 'pointer' }}>
                <img src={card1Image} alt={`Project ${num}`} className="wt-project-card-image" loading="lazy" />
                <div className="wt-project-card-overlay">
                  <h3 className="wt-project-card-title">Project {num}</h3>
                </div>
              </div>
            ))}
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

        <div className="wt-about-grid">
          <div className="wt-about-pill wt-about-pill--large wt-about-anim">
            <p>Hi, I'm Tomi, a Media Designer who loves exploring all sides of creativity. What started as self-taught video editing has evolved into a versatile skillset spanning 3D design, motion, 2D graphics, VFX, and a growing interest in UI.</p>
          </div>
          
          <div className="wt-about-profile wt-about-anim">
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

          <div className="wt-about-pill wt-about-pill--medium wt-about-anim">
            <p>I am a perfectionist who favors clean aesthetics and obsesses over pixel-perfect details, striving to create work that is not just seen, but admired for being well put together.</p>
          </div>

          <div className="wt-about-pill wt-about-pill--small wt-about-anim">
            <p>In my downtime, you can usually find me taking photos, gaming with friends, or hanging out with my cats.</p>
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
