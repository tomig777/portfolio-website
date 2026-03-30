import React, { useEffect, useRef, Suspense } from 'react';
import './WorkModal.css';
import kep9 from '../assets/kep9.png';
import kapuvideo from '../assets/kapuvideo.mp4';
import starModelUrl from '../assets/star.glb';
import { motion, AnimatePresence } from 'framer-motion';
import CircularGallery from './CircularGallery';
import ShinyText from './ShinyText';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';

const InteractiveModel = () => {
  const { scene } = useGLTF(starModelUrl);
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={0.4} />
      </Center>
    </group>
  );
};

const WorkModal = ({ workId, onClose }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Track dynamic bounds for webGL configuration radii
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-fullscreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated background gradient */}
        <div className="modal-bg-gradient" />

        {/* Main content container */}
        <div className="modal-container gallery-mode" style={{ position: 'relative' }}>
          {/* Close button inside container so it aligns properly */}
          <button className="modal-close-btn" onClick={onClose} style={{ top: '20px', right: '20px', position: 'absolute' }}>
            <span className="modal-close-line" />
            <span className="modal-close-line" />
          </button>
          
          <div style={{ position: 'relative', gridColumn: '1 / -1', width: '100%', height: '100%', borderRadius: '20px', backgroundColor: '#121214', overflow: 'hidden' }}>
            <div className="modal-scrollable-subtle" style={{ position: 'absolute', top: '20px', bottom: '20px', left: 0, right: 0, overflowY: 'auto' }}>
              {/* Gallery */}
              <div style={{ width: '100%', height: '60vh', position: 'relative' }}>
                <CircularGallery 
                  items={Array(12).fill({ image: kep9, text: '' })}
                  bend={isMobile ? 0 : 3} 
                  textColor="#ffffff" 
                  borderRadius={0.05} 
                  font="14px 'Hyperspace Race Capsule', 'Druk', sans-serif"
                  scrollEase={0.02}
                  scrollSpeed={2}
                />
              </div>

              {/* Content section */}
              <div className="modal-content-section">
                <h2 className="modal-title">
                  <ShinyText text={`Project ${workId} Info`} disabled={false} speed={2} />
                </h2>
                <div className="modal-divider" />
                
                {/* Intro text */}
                <p className="modal-text">
                  This project explores the intersection of motion design and interactive media. 
                  Built with a focus on fluid animations and immersive user experiences, every element 
                  has been carefully crafted to create a seamless visual narrative.
                  <br /><br />
                  The design process involved extensive prototyping and iteration, combining 3D visualization 
                  techniques with modern web technologies. The result is a cohesive experience that pushes 
                  the boundaries of what's possible in the browser.
                </p>

                {/* Embedded Video */}
                <div className="modal-video-container">
                  <video
                    className="modal-video"
                    src={kapuvideo}
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>

                {/* Mid text */}
                <p className="modal-text">
                  The animation pipeline was built from the ground up using custom shaders and physics-based 
                  motion systems. Each component responds dynamically to user interaction, creating an organic 
                  feel that bridges the gap between static design and living artwork.
                  <br /><br />
                  Below is an interactive 3D model used during the design phase. You can rotate it freely 
                  to explore the geometry and lighting from any angle.
                </p>

                {/* 3D Asset Viewer */}
                <div className="modal-3d-viewer">
                  <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[10, 10, 10]} intensity={3} />
                    <directionalLight position={[-10, -10, -10]} intensity={1} />
                    <Environment preset="studio" />
                    <Suspense fallback={null}>
                      <InteractiveModel />
                    </Suspense>
                    <OrbitControls 
                      enableZoom={false} 
                      enablePan={false}
                      autoRotate={false}
                      dampingFactor={0.05}
                      enableDamping
                    />
                  </Canvas>
                </div>

                {/* Closing text */}
                <p className="modal-text">
                  The technical stack behind this project includes React, WebGL via OGL, and custom GLSL shaders 
                  for real-time rendering effects. Performance optimization was a key priority throughout development, 
                  ensuring smooth 60fps playback across all devices.
                  <br /><br />
                  This project represents a milestone in combining creative direction with engineering precision. 
                  More case studies, process breakdowns, and behind-the-scenes content will be added here soon.
                </p>

                <div className="modal-tags">
                  <span className="modal-tag">WebGL</span>
                  <span className="modal-tag">React</span>
                  <span className="modal-tag">Animation</span>
                  <span className="modal-tag">3D</span>
                  <span className="modal-tag">GLSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkModal;