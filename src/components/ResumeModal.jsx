import React, { useEffect } from 'react';
import './ResumeModal.css';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeModal = ({ onClose }) => {
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

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/resume.pdf.pdf';
        link.download = 'Tamas-Gal-Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AnimatePresence>
            <motion.div
                className="resume-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Animated background gradient */}
                <div className="resume-modal__bg" />

                {/* Close button */}
                <button className="resume-modal__close" onClick={onClose}>
                    <span className="resume-modal__close-line" />
                    <span className="resume-modal__close-line" />
                </button>

                {/* Main content container */}
                <div className="resume-modal__container">
                    {/* Left side - Info & Skills */}
                    <motion.div
                        className="resume-modal__left"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="resume-modal__scrollable">
                            <h1 className="resume-modal__title">RESUME</h1>
                            <p className="resume-modal__subtitle">Creative Professional</p>
                            <div className="resume-modal__divider" />

                            <div className="resume-modal__info">
                                <h3>Tamas Gal</h3>
                                <p>Motion Designer & Visual Artist</p>
                            </div>

                            <section className="resume-modal__section">
                                <h2>About</h2>
                                <p className="resume-modal__about-text">
                                    Passionate creative professional with expertise in motion design, visual effects, and brand identity.
                                    I bring ideas to life through compelling visual storytelling and innovative design solutions.
                                </p>
                            </section>

                            <section className="resume-modal__section">
                                <h2>Skills</h2>
                                <div className="resume-modal__skills">
                                    <span className="resume-modal__skill">After Effects</span>
                                    <span className="resume-modal__skill">Premiere Pro</span>
                                    <span className="resume-modal__skill">Photoshop</span>
                                    <span className="resume-modal__skill">Illustrator</span>
                                    <span className="resume-modal__skill">Cinema 4D</span>
                                    <span className="resume-modal__skill">Blender</span>
                                    <span className="resume-modal__skill">Figma</span>
                                    <span className="resume-modal__skill">DaVinci Resolve</span>
                                </div>
                            </section>

                            <button className="resume-modal__download" onClick={handleDownload}>
                                <span className="resume-modal__download-icon">↓</span>
                                Download PDF
                            </button>
                        </div>
                    </motion.div>

                    {/* Right side - Experience & Education */}
                    <motion.div
                        className="resume-modal__right"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="resume-modal__scrollable">
                            <section className="resume-modal__section">
                                <h2>Experience</h2>
                                <div className="resume-modal__item">
                                    <span className="resume-modal__year">2023 - Present</span>
                                    <h4>Senior Motion Designer</h4>
                                    <p>Creating stunning visual experiences and motion graphics for various clients and projects.</p>
                                </div>
                                <div className="resume-modal__item">
                                    <span className="resume-modal__year">2021 - 2023</span>
                                    <h4>Visual Designer</h4>
                                    <p>Developed brand identities and visual systems for digital and print media.</p>
                                </div>
                                <div className="resume-modal__item">
                                    <span className="resume-modal__year">2019 - 2021</span>
                                    <h4>Junior Designer</h4>
                                    <p>Started career working on various design projects and learning industry best practices.</p>
                                </div>
                            </section>

                            <section className="resume-modal__section">
                                <h2>Education</h2>
                                <div className="resume-modal__item">
                                    <span className="resume-modal__year">2015 - 2019</span>
                                    <h4>Bachelor of Fine Arts</h4>
                                    <p>Specialization in Digital Media and Motion Graphics</p>
                                </div>
                            </section>

                            <section className="resume-modal__section">
                                <h2>Contact</h2>
                                <div className="resume-modal__contact">
                                    <p>📧 tamas@example.com</p>
                                    <p>📍 Location</p>
                                    <p>🔗 linkedin.com/in/tamasgal</p>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="resume-modal__footer">
                            <span>Press ESC to close</span>
                            <div className="resume-modal__footer-line" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ResumeModal;

