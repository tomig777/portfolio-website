import React, { useEffect, useState } from 'react';
import './Loader.css';
import logoDark from '../assets/logo-dark.png';

const Loader = ({ onLoadingComplete }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Keep loader for 2 seconds, then start fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // Unmount visually after fade out (2.8s total)
    const completeTimer = setTimeout(() => {
      onLoadingComplete();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className={`loader-container ${isFading ? 'loader-fade-out' : ''}`}>
      <div className="loader-content">
        <img src={logoDark} alt="Loading..." className="loader-logo" />
        <div className="loader-progress">
          <div className="loader-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
