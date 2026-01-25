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
                        <p>Understanding the brand, target audience, and competitive landscape through extensive research and stakeholder interviews. This phase involves deep-diving into market trends, user behaviors, and identifying key opportunities for differentiation.</p>
                      </div>
                    </div>

                    <div className="modal-process-step">
                      <span className="modal-step-number">02</span>
                      <div className="modal-step-content">
                        <h3>Strategy & Planning</h3>
                        <p>Developing a comprehensive strategy that aligns with business goals. Creating detailed project timelines, resource allocation, and defining key milestones to ensure smooth execution throughout the project lifecycle.</p>
                      </div>
                    </div>

                    <div className="modal-process-step">
                      <span className="modal-step-number">03</span>
                      <div className="modal-step-content">
                        <h3>Ideation & Concepts</h3>
                        <p>Exploring multiple creative directions and developing initial concepts based on research insights. This includes mood boards, sketches, and preliminary designs that capture the essence of the brand vision.</p>
                      </div>
                    </div>

                    <div className="modal-process-step">
                      <span className="modal-step-number">04</span>
                      <div className="modal-step-content">
                        <h3>Design & Development</h3>
                        <p>Bringing concepts to life through detailed design work. Creating high-fidelity mockups, interactive prototypes, and refining visual elements to ensure pixel-perfect execution across all touchpoints.</p>
                      </div>
                    </div>

                    <div className="modal-process-step">
                      <span className="modal-step-number">05</span>
                      <div className="modal-step-content">
                        <h3>Testing & Iteration</h3>
                        <p>Rigorous testing with real users to gather feedback and insights. Iterating on designs based on user behavior data and stakeholder input to optimize the user experience.</p>
                      </div>
                    </div>

                    <div className="modal-process-step">
                      <span className="modal-step-number">06</span>
                      <div className="modal-step-content">
                        <h3>Refinement & Delivery</h3>
                        <p>Final polishing of all deliverables, ensuring consistency and quality. Preparing comprehensive documentation, asset libraries, and handoff materials for seamless implementation.</p>
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 2 && (
                  <>
                    <h1 className="modal-title">Results & Impact</h1>
                    <p className="modal-subtitle">Project Outcomes / Key Achievements</p>
                    <div className="modal-divider" />
                    <p className="modal-text">
                      The project exceeded all expectations, delivering measurable results and establishing a strong foundation for the brand's future growth.
                    </p>
                    <p className="modal-text">
                      Key metrics showed significant improvement across all channels, with notable increases in user engagement and brand recognition.
                    </p>
                    <div className="modal-tags">
                      <span className="modal-tag">150% Engagement</span>
                      <span className="modal-tag">2.5M Impressions</span>
                      <span className="modal-tag">98% Satisfaction</span>
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