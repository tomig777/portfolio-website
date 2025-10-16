import { useEffect, useState } from 'react';
import { detectDevicePerformance, getPerformanceSettings } from '../utils/performance';

const PerformanceWrapper = ({ children, fallback = null }) => {
  const [performance, setPerformance] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const perf = detectDevicePerformance();
    const perfSettings = getPerformanceSettings(perf);
    
    setPerformance(perf);
    setSettings(perfSettings);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If low performance device, show fallback
  if (performance.isLowPerformance && fallback) {
    return fallback;
  }

  // If medium performance, show simplified version
  if (performance.isMediumPerformance) {
    return (
      <div style={{ opacity: 0.8 }}>
        {children}
      </div>
    );
  }

  // High performance - show full version
  return children;
};

export default PerformanceWrapper;
