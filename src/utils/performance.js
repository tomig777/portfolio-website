// Performance detection utilities
export const detectDevicePerformance = () => {
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for touch devices
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const isWebGLSupported = !!gl;
  
  // Check for dedicated GPU (rough estimation)
  const hasDedicatedGPU = !isMobile && !isTouch && navigator.hardwareConcurrency > 4;
  
  // Check device memory (if available)
  const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
  
  // Performance score calculation
  let performanceScore = 100;
  
  if (isMobile) performanceScore -= 40;
  if (isTouch) performanceScore -= 20;
  if (!hasDedicatedGPU) performanceScore -= 30;
  if (deviceMemory < 4) performanceScore -= 20;
  if (!isWebGLSupported) performanceScore -= 50;
  
  return {
    isMobile,
    isTouch,
    hasDedicatedGPU,
    isWebGLSupported,
    deviceMemory,
    performanceScore,
    isLowPerformance: performanceScore < 50,
    isMediumPerformance: performanceScore >= 50 && performanceScore < 80,
    isHighPerformance: performanceScore >= 80
  };
};

export const getPerformanceSettings = (performance) => {
  if (performance.isLowPerformance) {
    return {
      plasmaIterations: 15,
      plasmaQuality: 0.3,
      enablePhysics: false,
      enableComplexAnimations: false,
      enableParticles: false,
      frameRate: 30,
      enableMobileOptimizations: true,
      reduceMotion: true,
      disableWebGL: false
    };
  } else if (performance.isMediumPerformance) {
    return {
      plasmaIterations: 30,
      plasmaQuality: 0.6,
      enablePhysics: true,
      enableComplexAnimations: true,
      enableParticles: true,
      frameRate: 45,
      enableMobileOptimizations: true,
      reduceMotion: false,
      disableWebGL: false
    };
  } else {
    return {
      plasmaIterations: 60,
      plasmaQuality: 1.0,
      enablePhysics: true,
      enableComplexAnimations: true,
      enableParticles: true,
      frameRate: 60,
      enableMobileOptimizations: false,
      reduceMotion: false,
      disableWebGL: false
    };
  }
};
