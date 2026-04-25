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
        {/* ─── CARD 1: Hero ─── */}
        <ScrollStackItem itemClassName="stack-card--hero">
          <div className="stack-hero-inner">
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
          </div>
        </ScrollStackItem>

        {/* ─── CARD 2: Projects ─── */}
        <ScrollStackItem itemClassName="stack-card--projects">
          <div className="stack-section-inner stack-projects-inner">
            <div className="stack-section-header">
              <p className="stack-section-label">Work</p>
              <h2 className="stack-section-title">Selected Projects</h2>
            </div>
            <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
              <div className="stack-projects-grid">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="stack-project-card" onClick={() => setSelectedWork(num)}>
                    <BorderGlow
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
          </div>
        </ScrollStackItem>

        {/* ─── CARD 3: About Me ─── */}
        <ScrollStackItem itemClassName="stack-card--about">
          <div className="stack-section-inner stack-about-inner">
            <div className="stack-section-header">
              <p className="stack-section-label">About</p>
              <h2 className="stack-section-title">
                <ShinyText text="Get To Know Me" speed={2.5} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" />
              </h2>
            </div>
            <div className="stack-about-content">
              <div className="stack-about-bio">
                <p>Hi, I'm Tomi, a Media Designer who loves exploring all sides of creativity.</p>
                <p>What started as self-taught video editing has evolved into a versatile skillset spanning 3D design, motion, 2D graphics, VFX, and a growing interest in UI.</p>
                <p>I am a perfectionist who favors clean aesthetics and obsesses over pixel-perfect details.</p>
              </div>
              <div className="stack-about-card">
                <Suspense fallback={<div style={{ width: '100%', maxWidth: '260px', height: '380px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }} />}>
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
            <div className="stack-skills">
              <div className="skills-row skills-row--adobe">
                {adobeLogos.map((logo, i) => (
                  <div key={i} className="skill-item" title={logo.title}>{logo.node}</div>
                ))}
              </div>
              <div className="skills-row skills-row--other">
                {otherLogos.map((logo, i) => (
                  <div key={i} className="skill-item" title={logo.title}>{logo.node}</div>
                ))}
              </div>
            </div>
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
          <div className="stack-section-inner stack-contact-inner">
            <div className="stack-section-header">
              <p className="stack-section-label">Get in Touch</p>
              <h2 className="stack-section-title">
                <ShinyText text="Let's Chat" speed={2.5} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" />
              </h2>
            </div>
            <div className="stack-contact-folder">
              <StarConstellation side="left" onEasterEgg={() => navigate('/projects')} />
              <div className="stack-folder-container">
                <Suspense fallback={<div style={{ minHeight: '40vh' }} />}>
                  <Folder size={isMobile ? 1.4 : 2} color="#667eea" className="custom-folder" items={socialItems} />
                </Suspense>
                <div className="folder-base-line" />
              </div>
              <StarConstellation side="right" onEasterEgg={() => navigate('/projects')} />
            </div>
            <footer className="stack-footer">
              <p>Created by Tamas Gal - All rights reserved</p>
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
    </div>
  );
};

export default StackProject;
