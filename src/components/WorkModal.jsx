import React, { useEffect } from 'react';
import './WorkModal.css';
import kep9 from '../assets/kep9.png';
import { motion, AnimatePresence } from 'framer-motion';
import CircularGallery from './CircularGallery';
import ShinyText from './ShinyText';

const WorkModal = ({ workId, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
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
              <div style={{ width: '100%', height: '60vh', position: 'relative' }}>
                <CircularGallery 
                  items={Array(12).fill({ image: kep9, text: '' })}
                  bend={3} 
                  textColor="#ffffff" 
                  borderRadius={0.05} 
                  font="14px 'Hyperspace Race Capsule', 'Druk', sans-serif"
                  scrollEase={0.02}
                  scrollSpeed={2}
                />
              </div>
              <div style={{ padding: '60px 40px', color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h2 className="modal-title" style={{ fontSize: '2.5rem', marginBottom: '10px', fontFamily: "'Outfit', sans-serif", textTransform: 'none' }}>
                  <ShinyText text={`Project ${workId} Info`} disabled={false} speed={2} />
                </h2>
                <div className="modal-divider" style={{ marginBottom: '30px', width: '80px', height: '2px', background: 'rgba(255,255,255,0.2)' }} />
                <p className="modal-text" style={{ fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px' }}>
                  This interactive gallery explores the development of Project {workId}. I wanted to create a sense of depth and physics using WebGL.
                  <br /><br />
                  Scroll horizontally (or drag) to explore the gallery. Click on any image to open it in a full-screen preview. More project details and case studies will be added here soon.
                </p>
                <div className="modal-tags" style={{ justifyContent: 'center', marginTop: '40px' }}>
                  <span className="modal-tag">WebGL</span>
                  <span className="modal-tag">React</span>
                  <span className="modal-tag">Animation</span>
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