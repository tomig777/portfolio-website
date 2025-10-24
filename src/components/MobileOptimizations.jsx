import { useEffect } from 'react';
import { detectDevicePerformance, getPerformanceSettings } from '../utils/performance';

const MobileOptimizations = () => {
  useEffect(() => {
    const performance = detectDevicePerformance();
    const settings = getPerformanceSettings(performance);

    // Apply mobile-specific optimizations
    if (settings.enableMobileOptimizations) {
      // Reduce motion for users who prefer it
      if (settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--animation-iteration-count', '1');
      }

      // Optimize touch interactions
      document.body.style.touchAction = 'manipulation';
      
      // Reduce visual effects on mobile
      if (performance.isMobile) {
        document.documentElement.style.setProperty('--blur-amount', '2px');
        document.documentElement.style.setProperty('--shadow-intensity', '0.5');
      }

      // Add mobile-specific viewport meta tag if not present
      if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
      }

      // Optimize font loading for mobile
      if (performance.isMobile) {
        document.documentElement.style.fontDisplay = 'swap';
      }
    }

    // Add performance class to body for CSS targeting
    if (performance.isLowPerformance) {
      document.body.classList.add('low-performance');
    } else if (performance.isMediumPerformance) {
      document.body.classList.add('medium-performance');
    } else {
      document.body.classList.add('high-performance');
    }

    // Add mobile class for mobile-specific styles
    if (performance.isMobile) {
      document.body.classList.add('mobile-device');
    }

  }, []);

  return null; // This component doesn't render anything
};

export default MobileOptimizations;

