import React, { useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const PerformanceOptimized = ({ 
  children, 
  fallback = null, 
  pauseWhenHidden = true,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  });
  const [shouldRender, setShouldRender] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Start rendering when element comes into view
    if (isIntersecting && !shouldRender) {
      setShouldRender(true);
    }
  }, [isIntersecting, shouldRender]);

  useEffect(() => {
    // Pause animations when not visible (if pauseWhenHidden is true)
    if (pauseWhenHidden) {
      setIsPaused(!isIntersecting);
    }
  }, [isIntersecting, pauseWhenHidden]);

  // Don't render until element is in view
  if (!shouldRender) {
    return (
      <div ref={ref} style={{ minHeight: '100vh' }}>
        {fallback}
      </div>
    );
  }

  // Render with pause state
  return (
    <div ref={ref} data-paused={isPaused}>
      {React.cloneElement(children, { paused: isPaused })}
    </div>
  );
};

export default PerformanceOptimized;
