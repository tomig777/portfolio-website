import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import VideoBackground from '../components/VideoBackground';
import TiltedCard from '../components/TiltedCard';
import ScrollIndicator from '../components/ScrollIndicator';
import ProfileCard from '../components/ProfileCard';
import Folder from '../components/Folder';
import ErrorBoundary from '../components/ErrorBoundary';
import WorkModal from '../components/WorkModal';
import ResumeModal from '../components/ResumeModal';
import PerformanceOptimized from '../components/PerformanceOptimized';
import StarConstellation from '../components/StarConstellation';
import { Suspense, lazy } from 'react';
import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects, SiAdobepremierepro, SiFigma, SiBlender, SiAdobelightroom, SiDavinciresolve, SiInstagram, SiLinkedin, SiAdobeaudition, SiAutodesk, SiCinema4D, SiThreedotjs } from 'react-icons/si';
import { HiMail } from 'react-icons/hi';
import cardImage from '../assets/card-1.jpeg';
import portraitImage from '../assets/portrait-1.png';
import nukeLogo from '../assets/nuke_logo2.png';
import substanceLogo from '../assets/substance_logo.png';

const Lanyard = lazy(() => import('../components/Lanyard'));

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
  { node: <SiDavinciresolve />, title: "DaVinci Resolve" },
  { node: <SiBlender />, title: "Blender" },
  { node: <div className="skill-icon-mask" style={{ WebkitMaskImage: `url(${nukeLogo})`, maskImage: `url(${nukeLogo})` }} />, title: "Nuke" },
  { node: <SiFigma />, title: "Figma" },
  { node: <SiCinema4D />, title: "Cinema 4D" },
  { node: <div className="skill-icon-mask" style={{ WebkitMaskImage: `url(${substanceLogo})`, maskImage: `url(${substanceLogo})`, width: '64px', height: '64px' }} />, title: "Substance Painter" },
];

const socialItems = [
  <a key="instagram" href="https://www.instagram.com/tomig976/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <SiInstagram />
  </a>,
  <a key="linkedin" href="https://www.linkedin.com/in/tamasgal77/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <SiLinkedin />
  </a>,
  <a key="email" href="mailto:tamasgaldesign@gmail.com" aria-label="Email">
    <HiMail />
  </a>
];

const Home = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const aboutTitleRef = useRef(null);
  const contactTitleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.3 }
    );

    if (aboutTitleRef.current) observer.observe(aboutTitleRef.current);
    if (contactTitleRef.current) observer.observe(contactTitleRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <div className="plasma-background">
        <VideoBackground
          opacity={0.8}
        />
      </div>
      <Header onResumeClick={() => setShowResumeModal(true)} />

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
            A BUDAPEST BASED HUNGARIAN CREATIVE DESIGNER SPECIALIZING IN 3D VISUALIZATION, VECTOR ILLUSTRATION,<br />
            AND SOCIAL MEDIA CONTENT, WITH A PASSION FOR WEB AND USER INTERFACE DESIGN.
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
              showTooltip={false}
              displayOverlayContent={false}
              projectName="Project 1"
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
              showTooltip={false}
              displayOverlayContent={false}
              projectName="Project 2"
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
              showTooltip={false}
              displayOverlayContent={false}
              projectName="Project 3"
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
              showTooltip={false}
              displayOverlayContent={false}
              projectName="Project 4"
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
              showTooltip={false}
              displayOverlayContent={false}
              projectName="Project 5"
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
              showTooltip={false}
              displayOverlayContent={false}
              projectName="Project 6"
            />
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <h2 className="about-title breathe-title" ref={aboutTitleRef}>
          <span className="meta-text">about</span>
        </h2>
        <p className="section-subtitle">here is a little bit about myself</p>
      </section>

      <section id="about-card" className="profile-section">
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
          Hi, I'm Tomi, a Media Designer who loves exploring all sides of creativity. What started as self-taught video editing has evolved into a versatile skillset spanning 3D design, motion, 2D graphics, VFX, and a growing interest in UI. I am a perfectionist who favors clean aesthetics and obsesses over pixel-perfect details, striving to create work that is not just seen, but admired for being well put together. In my downtime, you can usually find me taking photos, gaming with friends, or hanging out with my cats.
        </p>
      </section>

      <section className="skills-section">
        <div className="skills-container">
          <div className="skills-row skills-row--adobe">
            {adobeLogos.map((logo, index) => (
              <div
                key={index}
                className="skill-item"
                title={logo.title}
                style={{ cursor: 'default' }}
              >
                {logo.node}
              </div>
            ))}
          </div>
          <div className="skills-row skills-row--other">
            {otherLogos.map((logo, index) => (
              <div
                key={index}
                className="skill-item"
                title={logo.title}
                style={{ cursor: 'default' }}
              >
                {logo.node}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <h2 className="contact-title breathe-title" ref={contactTitleRef}>
          <span className="meta-text">contact</span>
        </h2>
        <p className="section-subtitle">let's make something cool together</p>
      </section>

      <section id="contact-folder" className="folder-section">
        <StarConstellation side="left" />

        <div className="folder-container">
          <Folder size={2} color="#b19eef" className="custom-folder" items={socialItems} />
          <div className="folder-base-line" />
        </div>

        <StarConstellation side="right" />
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

      {showResumeModal && (
        <ResumeModal
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </div>
  );
};

export default Home;

