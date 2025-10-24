import React, { useState, useEffect, useRef } from 'react';
import './ScrollIndicator.css';

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Immediately hide when scrolling starts
      if (window.scrollY > 10) {
        setIsVisible(false);
      } else {
        // Only show when at the very top
        setIsVisible(true);
      }

      // Set a timeout to ensure it stays hidden during fast scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        if (window.scrollY > 10) {
          setIsVisible(false);
        }
      }, 100);
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`scroll-indicator ${!isVisible ? 'scroll-indicator--hidden' : ''}`}>
      <div className="scroll-indicator__arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default ScrollIndicator;

