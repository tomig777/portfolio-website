import { useState } from 'react';
import Header from '../components/Header';
import Plasma from '../components/Plasma';
import TiltedCard from '../components/TiltedCard';
import ScrollIndicator from '../components/ScrollIndicator';
import ProfileCard from '../components/ProfileCard';
import LogoLoop from '../components/LogoLoop';
import Folder from '../components/Folder';
import MetaBalls from '../components/MetaBalls';
import ErrorBoundary from '../components/ErrorBoundary';
import WorkModal from '../components/WorkModal';
import { Suspense, lazy } from 'react';
import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects, SiAdobepremierepro, SiFigma, SiBlender, SiAdobelightroom, SiDavinciresolve, SiInstagram, SiLinkedin, SiAdobeaudition, SiAutodesk, SiCinema4D } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';
import cardImage from '../assets/card-1.jpeg';
import portraitImage from '../assets/portrait-1.png';

const Lanyard = lazy(() => import('../components/Lanyard'));

const adobeLogos = [
  { node: <SiAdobeillustrator />, title: "Adobe Illustrator", href: "https://www.adobe.com/products/illustrator.html" },
  { node: <SiAdobephotoshop />, title: "Adobe Photoshop", href: "https://www.adobe.com/products/photoshop.html" },
  { node: <SiAdobepremierepro />, title: "Adobe Premiere Pro", href: "https://www.adobe.com/products/premiere.html" },
  { node: <SiAdobeaftereffects />, title: "Adobe After Effects", href: "https://www.adobe.com/products/aftereffects.html" },
  { node: <SiAdobeaudition />, title: "Adobe Audition", href: "https://www.adobe.com/products/audition.html" },
  { node: <SiAdobelightroom />, title: "Adobe Lightroom", href: "https://www.adobe.com/products/photoshop-lightroom.html" },
];

const otherLogos = [
  { node: <SiAutodesk />, title: "Autodesk Maya", href: "https://www.autodesk.com/products/maya" },
  { node: <SiDavinciresolve />, title: "DaVinci Resolve", href: "https://www.blackmagicdesign.com/products/davinciresolve" },
  { node: <SiBlender />, title: "Blender", href: "https://www.blender.org" },
  { node: <SiFigma />, title: "Figma", href: "https://www.figma.com" },
  { node: <SiCinema4D />, title: "Cinema 4D", href: "https://www.maxon.net/cinema-4d" },
];

const socialItems = [
  <a key="instagram" href="https://www.instagram.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <SiInstagram />
  </a>,
  <a key="linkedin" href="https://www.linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <SiLinkedin />
  </a>,
  <a key="email" href="mailto:your.email@example.com" aria-label="Email">
    <HiMail />
  </a>
];

const Home = () => {
  const [selectedWork, setSelectedWork] = useState(null);

  return (
    <div className="App">
      <div className="plasma-background">
        <Plasma 
          color="#b19eef"
          speed={0.5}
          direction="forward"
          scale={1.3}
          opacity={1.0}
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

      <section id="work" className="cards-section">
        <div className="cards-container">
          <div onClick={() => setSelectedWork(1)} style={{ cursor: 'pointer' }}>
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
          </div>
          <div onClick={() => setSelectedWork(2)} style={{ cursor: 'pointer' }}>
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
          </div>
          <div onClick={() => setSelectedWork(3)} style={{ cursor: 'pointer' }}>
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
          </div>
          <div onClick={() => setSelectedWork(4)} style={{ cursor: 'pointer' }}>
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
          </div>
          <div onClick={() => setSelectedWork(5)} style={{ cursor: 'pointer' }}>
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
          </div>
          <div onClick={() => setSelectedWork(6)} style={{ cursor: 'pointer' }}>
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
        </div>
      </section>

      <section id="about" className="about-section">
        <h2 className="about-title">
          <span className="about-title__small">GET TO</span>
          <span className="about-title__large">KNOW ME</span>
        </h2>
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

      <section className="skills-section">
        <div className="skills-container">
          <div className="skills-row skills-row--adobe">
            {adobeLogos.map((logo, index) => (
              <a 
                key={index}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="skill-item"
                title={logo.title}
              >
                {logo.node}
              </a>
            ))}
          </div>
          <div className="skills-row skills-row--other">
            {otherLogos.map((logo, index) => (
              <a 
                key={index}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="skill-item"
                title={logo.title}
              >
                {logo.node}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <h2 className="contact-title">
          <span className="contact-title__large">LET'S</span>
          <span className="contact-title__small">CHAT</span>
        </h2>
      </section>

      <section className="folder-section">
        <div className="folder-container">
          <div className="metaballs-wrapper metaballs-left">
            <MetaBalls
              color="#b19eef"
              cursorBallColor="#b19eef"
              cursorBallSize={2}
              ballCount={15}
              animationSize={30}
              enableMouseInteraction={true}
              enableTransparency={true}
              hoverSmoothness={0.05}
              clumpFactor={1}
              speed={0.5}
              delay={2.5}
            />
          </div>
          <Folder size={2} color="#b19eef" className="custom-folder" items={socialItems} />
          <div className="metaballs-wrapper metaballs-right">
            <MetaBalls
              color="#b19eef"
              cursorBallColor="#b19eef"
              cursorBallSize={2}
              ballCount={15}
              animationSize={30}
              enableMouseInteraction={true}
              enableTransparency={true}
              hoverSmoothness={0.05}
              clumpFactor={1}
              speed={0.3}
            />
          </div>
        </div>
      </section>

      <footer className="footer">
        <p className="footer-text">Created by Tamas Gal - All rights reserved</p>
      </footer>

      {selectedWork && (
        <WorkModal 
          workId={selectedWork} 
          onClose={() => setSelectedWork(null)} 
        />
      )}
    </div>
  );
};

export default Home;

