import React, { Suspense, lazy } from 'react';
import './App.css';
import Header from './components/Header';
import Plasma from './components/Plasma';
import TiltedCard from './components/TiltedCard';
import ScrollIndicator from './components/ScrollIndicator';
import SplitText from './components/SplitText';
import ProfileCard from './components/ProfileCard';
import LogoLoop from './components/LogoLoop';
import Folder from './components/Folder';
import CircularText from './components/CircularText';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects, SiAdobepremierepro, SiFigma, SiBlender, SiAdobelightroom, SiDavinciresolve, SiInstagram, SiLinkedin } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';
import cardImage from './assets/card-1.jpeg';
import portraitImage from './assets/portrait-1.png';

const Lanyard = lazy(() => import('./components/Lanyard'));

const designLogos = [
  { node: <SiAdobephotoshop />, title: "Adobe Photoshop", href: "https://www.adobe.com/products/photoshop.html" },
  { node: <SiAdobeillustrator />, title: "Adobe Illustrator", href: "https://www.adobe.com/products/illustrator.html" },
  { node: <SiAdobeaftereffects />, title: "Adobe After Effects", href: "https://www.adobe.com/products/aftereffects.html" },
  { node: <SiAdobepremierepro />, title: "Adobe Premiere Pro", href: "https://www.adobe.com/products/premiere.html" },
  { node: <SiFigma />, title: "Figma", href: "https://www.figma.com" },
  { node: <SiBlender />, title: "Blender", href: "https://www.blender.org" },
  { node: <SiAdobelightroom />, title: "Adobe Lightroom", href: "https://www.adobe.com/products/photoshop-lightroom.html" },
  { node: <SiDavinciresolve />, title: "DaVinci Resolve", href: "https://www.blackmagicdesign.com/products/davinciresolve" },
];

const socialItems = [
  <a href="https://www.instagram.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <SiInstagram />
  </a>,
  <a href="https://www.linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <SiLinkedin />
  </a>,
  <a href="mailto:your.email@example.com" aria-label="Email">
    <HiMail />
  </a>
];

function AppContent() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="App">
      <div className="plasma-background">
        <Plasma 
          color={isDarkMode ? "#b19eef" : "#462496"}
          speed={0.5}
          direction="forward"
          scale={1.3}
          opacity={isDarkMode ? 0.4 : 0.3}
          mouseInteractive={true}
        />
      </div>
      <Header />
      
      <section className="hero-section">
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className="lanyard-container">
              <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
            </div>
          </Suspense>
        </ErrorBoundary>
        
        <div className="hero-text">
          <h1 className="hero-text__name">
            <span className="hero-text__line">TAMAS</span>
            <span className="hero-text__line">GAL</span>
          </h1>
          <p className="hero-text__subtitle">
            A BUDAPEST BASED HUNGARIAN CREATIVE DESIGNER SPECIALIZING IN USER INTERFACE, VISUAL EFFECTS,<br />
            SOCIAL MEDIA, BRANDING AND IDENTITY DESIGN.
          </p>
        </div>
        <ScrollIndicator />
      </section>

      <section className="cards-section">
        <div className="cards-container">
          <TiltedCard
            imageSrc={cardImage}
            altText="Project Card 1"
            captionText="Project Showcase 1"
            containerHeight="400px"
            containerWidth="400px"
            imageHeight="400px"
            imageWidth="400px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={false}
          />
          <TiltedCard
            imageSrc={cardImage}
            altText="Project Card 2"
            captionText="Project Showcase 2"
            containerHeight="400px"
            containerWidth="400px"
            imageHeight="400px"
            imageWidth="400px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={false}
          />
          <TiltedCard
            imageSrc={cardImage}
            altText="Project Card 3"
            captionText="Project Showcase 3"
            containerHeight="400px"
            containerWidth="400px"
            imageHeight="400px"
            imageWidth="400px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={false}
          />
          <TiltedCard
            imageSrc={cardImage}
            altText="Project Card 4"
            captionText="Project Showcase 4"
            containerHeight="400px"
            containerWidth="400px"
            imageHeight="400px"
            imageWidth="400px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={false}
          />
          <TiltedCard
            imageSrc={cardImage}
            altText="Project Card 5"
            captionText="Project Showcase 5"
            containerHeight="400px"
            containerWidth="400px"
            imageHeight="400px"
            imageWidth="400px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={false}
          />
          <TiltedCard
            imageSrc={cardImage}
            altText="Project Card 6"
            captionText="Project Showcase 6"
            containerHeight="400px"
            containerWidth="400px"
            imageHeight="400px"
            imageWidth="400px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={false}
          />
        </div>
      </section>

      <section className="about-section">
        <SplitText
          text="GET TO KNOW ME"
          className="about-title"
          tag="h2"
          delay={80}
          duration={0.8}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 50 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.2}
          rootMargin="-50px"
          textAlign="center"
        />
      </section>

      <section className="profile-section">
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
      </section>

      <section className="bio-section">
        <p className="bio-text">
          Hi, I'm Tomi — a creative thinker with a passion for design, storytelling, and crafting experiences that feel authentic and engaging. I enjoy bringing ideas to life through a balance of strategy, aesthetics, and emotion. My work is inspired by curiosity, attention to detail, and a drive to create things that connect with people in a meaningful way. Whether it's through visuals, motion, or words, I'm always exploring new ways to communicate ideas with clarity and impact.
        </p>
      </section>

      <section className="logoloop-section">
        <LogoLoop
          logos={designLogos}
          speed={80}
          direction="left"
          logoHeight={56}
          gap={48}
          scaleOnHover
          fadeOut
          fadeOutColor="rgba(11, 11, 11, 0)"
          ariaLabel="Design tools and software"
        />
      </section>

      <section className="contact-section">
        <SplitText
          text="LET'S CHAT"
          className="contact-title"
          tag="h2"
          delay={80}
          duration={0.8}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 50 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.2}
          rootMargin="-50px"
          textAlign="center"
        />
      </section>

      <section className="folder-section">
        <CircularText
          text="TAMAS*GAL*PORTFOLIO*"
          onHover="speedUp"
          spinDuration={20}
          className="circular-text-left"
        />
        <Folder size={2} color="#5227FF" className="custom-folder" items={socialItems} />
        <CircularText
          text="TAMAS*GAL*PORTFOLIO*"
          onHover="speedUp"
          spinDuration={20}
          className="circular-text-right"
        />
      </section>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;