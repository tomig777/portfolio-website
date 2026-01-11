import React, { useEffect, useState } from 'react';
import './WorkModal.css';
import cardImage from '../assets/card-1.jpeg';
import { motion, AnimatePresence } from 'framer-motion';

const WorkModal = ({ workId, onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { title: 'Overview', id: 'overview' },
    { title: 'Process', id: 'process' },
    { title: 'Results', id: 'results' },
  ];

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

        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose}>
          <span className="modal-close-line" />
          <span className="modal-close-line" />
        </button>

        {/* Main content container */}
        <div className="modal-container">
          {/* Left side - Hero image */}
          <motion.div
            className="modal-hero"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="modal-hero-image-wrapper">
              <img src={cardImage} alt={`Project ${workId}`} className="modal-hero-image" />
              <div className="modal-hero-overlay" />
            </div>
            <div className="modal-project-number">
              <span className="modal-number-label">Project</span>
              <span className="modal-number-value">0{workId}</span>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            className="modal-content"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Navigation tabs */}
            <div className="modal-tabs">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  className={`modal-tab ${activeSection === index ? 'active' : ''}`}
                  onClick={() => setActiveSection(index)}
                >
                  <span className="modal-tab-number">0{index + 1}</span>
                  <span className="modal-tab-text">{section.title}</span>
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="modal-scrollable">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="modal-section"
              >
                {activeSection === 0 && (
                  <>
                    <h1 className="modal-title">Project Title</h1>
                    <p className="modal-subtitle">Visual Design / Brand Identity</p>
                    <div className="modal-divider" />
                    <p className="modal-text">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <p className="modal-text">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                    <div className="modal-tags">
                      <span className="modal-tag">Branding</span>
                      <span className="modal-tag">UI/UX</span>
                      <span className="modal-tag">Motion</span>
                    </div>
                  </>
                )}

                {activeSection === 1 && (
                  <>
                    <h2 className="modal-section-title">Design Process</h2>
                    <div className="modal-divider" />
                    <div className="modal-process-step">
                      <span className="modal-step-number">01</span>
                      <div className="modal-step-content">
                        <h3>Research & Discovery</h3>
                        <p>Understanding the brand, target audience, and competitive landscape through extensive research and stakeholder interviews.</p>
                      </div>
                    </div>
                    <div className="modal-process-step">
                      <span className="modal-step-number">02</span>
                      <div className="modal-step-content">
                        <h3>Ideation & Concepts</h3>
                        <p>Exploring multiple creative directions and developing initial concepts based on research insights.</p>
                      </div>
                    </div>
                    <div className="modal-process-step">
                      <span className="modal-step-number">03</span>
                      <div className="modal-step-content">
                        <h3>Refinement & Delivery</h3>
                        <p>Iterating on the chosen direction, refining details, and preparing final deliverables.</p>
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 2 && (
                  <>
                    <h2 className="modal-section-title">Results & Impact</h2>
                    <div className="modal-divider" />
                    <div className="modal-stats">
                      <div className="modal-stat">
                        <span className="modal-stat-value">150%</span>
                        <span className="modal-stat-label">Engagement Increase</span>
                      </div>
                      <div className="modal-stat">
                        <span className="modal-stat-value">2.5M</span>
                        <span className="modal-stat-label">Impressions</span>
                      </div>
                      <div className="modal-stat">
                        <span className="modal-stat-value">98%</span>
                        <span className="modal-stat-label">Client Satisfaction</span>
                      </div>
                    </div>
                    <p className="modal-text">
                      The project exceeded all expectations, delivering measurable results and establishing a strong foundation for the brand's future growth.
                    </p>
                    <div className="modal-gallery">
                      <img src={cardImage} alt="Result 1" className="modal-gallery-img" />
                      <img src={cardImage} alt="Result 2" className="modal-gallery-img" />
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <span className="modal-footer-text">Press ESC to close</span>
              <div className="modal-footer-line" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkModal;