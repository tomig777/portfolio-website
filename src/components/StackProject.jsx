import React, { useState, useEffect, Suspense, lazy } from 'react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import Header from './Header';
import VideoBackground from './VideoBackground';
import ShinyText from './ShinyText';
import ScrollIndicator from './ScrollIndicator';
import ErrorBoundary from './ErrorBoundary';
import StarConstellation from './StarConstellation';
import { useNavigate } from 'react-router-dom';
import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects, SiAdobepremierepro, SiFigma, SiBlender, SiAdobelightroom, SiDavinciresolve, SiInstagram, SiLinkedin, SiAdobeaudition, SiAutodesk, SiCinema4D } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';
import card1Image from '../assets/szia.png';
import portraitImage from '../assets/portrait-1.png';
import nukeLogo from '../assets/nuke_logo2.png';
import substanceLogo from '../assets/substance_logo.png';
import './StackProject.css';

const Lanyard = lazy(() => import('./Lanyard'));
const BorderGlow = lazy(() => import('./BorderGlow'));
const ProfileCard = lazy(() => import('./ProfileCard'));
const Folder = lazy(() => import('./Folder'));
const ZenPond = lazy(() => import('./ZenPond'));
const WorkModal = lazy(() => import('./WorkModal'));
const ResumeModal = lazy(() => import('./ResumeModal'));

/* ── Skill logos ── */
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

const StackProject = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedWork, setSelectedWork] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="stack-portfolio">
      {/* Back button */}
      {onBack && (
        <button className="stack-project-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          Back
        </button>
      )}

      {/* ─── Header ─── */}
      <Header onResumeClick={() => setShowResumeModal(true)} />

      <ScrollStack
        itemDistance={60}
        itemScale={0.02}
        itemStackDistance={24}
        stackPosition="20%"
        scaleEndPosition="10%"
        baseScale={0.88}
        rotationAmount={0}
        blurAmount={1.5}
      >
        {/* ─── Hero (regular child, NOT a ScrollStackItem — just scrolls normally) ─── */}
        <section className="stack-hero-section">
          <div className="stack-hero-bg">
            <VideoBackground opacity={0.6} />
          </div>
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <div className="stack-lanyard-container">
                <Lanyard position={isMobile ? [0, 0, 35] : [0, 0, 20]} gravity={[0, -40, 0]} />
              </div>
            </Suspense>
          </ErrorBoundary>
          <div className="stack-hero-text">
            <h1 className="stack-hero-name">
              <span>TAMAS</span>
              <span>GAL</span>
            </h1>
            <p className="stack-hero-subtitle">
              A BUDAPEST BASED HUNGARIAN CREATIVE DESIGNER SPECIALIZING IN 3D VISUALIZATION, VECTOR ILLUSTRATION, AND SOCIAL MEDIA CONTENT.
            </p>
          </div>
          <ScrollIndicator />
        </section>

        {/* ─── CARD 2: Projects ─── */}
        <ScrollStackItem itemClassName="stack-card--projects">
          <div className="stack-section-inner">
            <section className="cards-section" style={{ padding: '80px 2rem 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{width: '100%', maxWidth: '1400px', margin: '0 auto', marginBottom: '40px'}}>
                <p className="section-label">Work</p>
                <h2 className="section-title">Selected Projects</h2>
              </div>
              <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
                <div className="cards-container" style={{ margin: '0 auto' }}>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num} onClick={() => setSelectedWork(num)} style={{ cursor: 'pointer' }}>
                      <BorderGlow
                        className={num % 2 === 1 ? 'tilt-right' : 'tilt-left'}
                        edgeSensitivity={30}
                        glowColor="225 80 75"
                        backgroundColor="#0a0a12"
                        borderRadius={16}
                        glowRadius={40}
                        glowIntensity={1}
                        coneSpread={25}
                        animated={false}
                        colors={['#667eea', '#5a7ef5', '#4f8fff']}
                      >
                        <div className="project-card-wrapper">
                          <img src={card1Image} alt={`Project ${num}`} loading="lazy" decoding="async" className="project-card-image" />
                          <div className="project-card-overlay">
                            <span className="project-card-label">Project {num}</span>
                          </div>
                        </div>
                      </BorderGlow>
                    </div>
                  ))}
                </div>
              </Suspense>
            </section>
          </div>
        </ScrollStackItem>

        {/* ─── CARD 3: About Me ─── */}
        <ScrollStackItem itemClassName="stack-card--about">
          <div className="stack-section-inner">
            <section id="about" className="about-section">
              <div style={{width: '100%', padding: '0 2rem'}}>
                <p className="section-label">About</p>
                <h2 className="section-title">
                  <ShinyText text="Get To Know Me" speed={2.5} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" />
                </h2>
              </div>
            </section>

            <section className="about-combined-section">
              <div className="about-content-wrapper">
                <div className="bio-container">
                  <p className="bio-text">Hi, I'm Tomi, a Media Designer who loves exploring all sides of creativity.</p>
                  <p className="bio-text">What started as self-taught video editing has evolved into a versatile skillset spanning 3D design, motion, 2D graphics, VFX, and a growing interest in UI.</p>
                  <p className="bio-text">I am a perfectionist who favors clean aesthetics and obsesses over pixel-perfect details, striving to create work that is not just seen, but admired for being well put together.</p>
                  <p className="bio-text">In my downtime, you can usually find me taking photos, gaming with friends, or hanging out with my cats.</p>
                </div>
                <div id="about-card" className="profile-container">
                  <Suspense fallback={<div style={{ width: '100%', maxWidth: '300px', height: '450px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }} />}>
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
              </div>
            </section>

            <section className="skills-section">
              <div className="skills-container">
                <div className="skills-row skills-row--adobe">
                  {adobeLogos.map((logo, index) => (
                    <div key={index} className="skill-item" title={logo.title} style={{ cursor: 'default' }}>{logo.node}</div>
                  ))}
                </div>
                <div className="skills-row skills-row--other">
                  {otherLogos.map((logo, index) => (
                    <div key={index} className="skill-item" title={logo.title} style={{ cursor: 'default' }}>{logo.node}</div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </ScrollStackItem>

        {/* ─── CARD 4: Zen Pond ─── */}
        <ScrollStackItem itemClassName="stack-card--pond">
          <div className="stack-pond-inner">
            <Suspense fallback={<div style={{ height: '100%', background: '#000' }} />}>
              <ZenPond />
            </Suspense>
          </div>
        </ScrollStackItem>

        {/* ─── CARD 5: Contact ─── */}
        <ScrollStackItem itemClassName="stack-card--contact">
          <div className="stack-section-inner" style={{ padding: '0', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'space-between' }}>
            <section id="contact" className="contact-section">
              <div style={{width: '100%', padding: '0 2rem'}}>
                <p className="section-label">Get in Touch</p>
                <h2 className="section-title">
                  <ShinyText text="Let's Chat" speed={2.5} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" />
                </h2>
              </div>
            </section>

            <section id="contact-folder" className="folder-section" style={{ flex: 1 }}>
              <StarConstellation side="left" onEasterEgg={() => navigate('/projects')} />
              <div className="folder-container">
                <Suspense fallback={<div style={{ minHeight: '50vh' }}/>}>
                  <Folder size={isMobile ? 1.4 : 2} color="#667eea" className="custom-folder" items={socialItems} />
                </Suspense>
                <div className="folder-base-line" />
              </div>
              <StarConstellation side="right" onEasterEgg={() => navigate('/projects')} />
            </section>

            <footer className="footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <p className="footer-text">Created by Tamas Gal - All rights reserved</p>
            </footer>
          </div>
        </ScrollStackItem>
      </ScrollStack>

      {/* Work Modal */}
      {selectedWork && (
        <Suspense fallback={null}>
          <WorkModal workId={selectedWork} onClose={() => setSelectedWork(null)} />
        </Suspense>
      )}

      {/* Resume Modal */}
      {showResumeModal && (
        <Suspense fallback={null}>
          <ResumeModal onClose={() => setShowResumeModal(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default StackProject;
