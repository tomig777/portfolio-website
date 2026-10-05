import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ColorBends.css';
import { createAnimationLoop } from '../utils/animationLoop';
import useGraphicsActivity from '../hooks/useGraphicsActivity';

const MAX_COLORS = 8;

const fragmentShader = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(
    p.x * uRot.x - p.y * uRot.y,
    p.x * uRot.y + p.y * uRot.x
  );
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = uPointer - rp;
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;

    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }

    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;

    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }

    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  col *= uIntensity;

  if (uNoise > 0.0001) {
    float n = fract(
      sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233)))
      * 43758.5453123
    );
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = uTransparent > 0 ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const colorToVector = (hex) => {
  const normalized = hex.replace('#', '').trim();
  const values = normalized.length === 3
    ? [
        parseInt(normalized[0] + normalized[0], 16),
        parseInt(normalized[1] + normalized[1], 16),
        parseInt(normalized[2] + normalized[2], 16)
      ]
    : [
        parseInt(normalized.slice(0, 2), 16),
        parseInt(normalized.slice(2, 4), 16),
        parseInt(normalized.slice(4, 6), 16)
      ];

  return new THREE.Vector3(values[0] / 255, values[1] / 255, values[2] / 255);
};

export default function ColorBends({
  className = '',
  style,
  rotation = 90,
  speed = 0.2,
  colors = [],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.15,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  active = true
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const activeRef = useRef(active);
  const materialRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const rotationRef = useRef(rotation);
  const autoRotateRef = useRef(autoRotate);
  const settingsRef = useRef({});
  const { ready, running } = useGraphicsActivity(containerRef, active);
  const pointerTargetRef = useRef(new THREE.Vector2(0, 0));
  const pointerCurrentRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    activeRef.current = running;
    frameRef.current?.setActive(running);
  }, [running]);

  useEffect(() => {
    settingsRef.current = { rotation, autoRotate, speed, colors, transparent, scale, frequency,
      warpStrength, mouseInfluence, parallax, noise, iterations, intensity, bandWidth };
    const material = materialRef.current;
    rotationRef.current = rotation;
    autoRotateRef.current = autoRotate;
    if (!material) return;
    for (const [name, value] of Object.entries({ Speed: speed, Scale: scale, Frequency: frequency,
      WarpStrength: warpStrength, MouseInfluence: mouseInfluence, Parallax: parallax, Noise: noise,
      Iterations: iterations, Intensity: intensity, BandWidth: bandWidth })) material.uniforms[`u${name}`].value = value;
    const palette = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(colorToVector);
    material.uniforms.uColors.value.forEach((color, index) => {
      if (palette[index]) color.copy(palette[index]);
      else color.set(0, 0, 0);
    });
    material.uniforms.uColorCount.value = palette.length;
    material.uniforms.uTransparent.value = transparent ? 1 : 0;
    rendererRef.current?.setClearColor(0x000000, transparent ? 0 : 1);
    if (mouseInfluence === 0 && parallax === 0) {
      pointerTargetRef.current.set(0, 0);
      pointerCurrentRef.current.set(0, 0);
      material.uniforms.uPointer.value.set(0, 0);
    }
  }, [rotation, autoRotate, speed, colors, transparent, scale, frequency, warpStrength,
    mouseInfluence, parallax, noise, iterations, intensity, bandWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !ready) return undefined;
    const { speed, colors: initialColors, transparent, scale, frequency, warpStrength, mouseInfluence,
      parallax, noise, iterations, intensity, bandWidth } = settingsRef.current;
    const colors = (initialColors || []).filter(Boolean).slice(0, MAX_COLORS);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const colorUniforms = Array.from(
      { length: MAX_COLORS },
      (_, index) => colors[index] ? colorToVector(colors[index]) : new THREE.Vector3(0, 0, 0)
    );
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: Math.min(colors.length, MAX_COLORS) },
        uColors: { value: colorUniforms },
        uTransparent: { value: transparent ? 1 : 0 },
        uScale: { value: scale },
        uFrequency: { value: frequency },
        uWarpStrength: { value: warpStrength },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: mouseInfluence },
        uParallax: { value: parallax },
        uNoise: { value: noise },
        uIterations: { value: iterations },
        uIntensity: { value: intensity },
        uBandWidth: { value: bandWidth }
      },
      premultipliedAlpha: true,
      transparent: true
    });
    materialRef.current = material;

    scene.add(new THREE.Mesh(geometry, material));

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: true
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1 : 1.5));
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const nextWidth = container.clientWidth || 1;
      const nextHeight = container.clientHeight || 1;
      frameRef.current?.setMaxFps(window.innerWidth <= 768 ? 30 : 60);
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1 : 1.5);
      if (width === nextWidth && height === nextHeight && renderer.getPixelRatio() === dpr) return;
      width = nextWidth;
      height = nextHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      material.uniforms.uCanvas.value.set(width, height);
    };

    handleResize();

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(container);
      resizeObserverRef.current = observer;
    } else {
      window.addEventListener('resize', handleResize);
    }

    const renderFrame = () => {
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      material.uniforms.uTime.value = elapsed;

      const degrees = (rotationRef.current % 360) + autoRotateRef.current * elapsed;
      const radians = (degrees * Math.PI) / 180;
      material.uniforms.uRot.value.set(Math.cos(radians), Math.sin(radians));

      const pointerCurrent = pointerCurrentRef.current;
      const pointerTarget = pointerTargetRef.current;
      pointerCurrent.lerp(pointerTarget, Math.min(1, delta * 8));
      material.uniforms.uPointer.value.copy(pointerCurrent);

      renderer.render(scene, camera);
    };

    const animation = createAnimationLoop(renderFrame, {
      maxFps: window.innerWidth <= 768 ? 30 : 60,
      active: activeRef.current
    });
    frameRef.current = animation;
    const handlePointerMove = event => {
      const settings = settingsRef.current;
      if (!activeRef.current || (settings.mouseInfluence === 0 && settings.parallax === 0)) return;
      const rect = container.getBoundingClientRect();
      pointerTargetRef.current.set(
        ((event.clientX - rect.left) / (rect.width || 1)) * 2 - 1,
        -(((event.clientY - rect.top) / (rect.height || 1)) * 2 - 1)
      );
    };
    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      animation.dispose();
      container.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      frameRef.current = null;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      materialRef.current = null;
      rendererRef.current = null;
    };
  }, [ready]);

  return (
    <div
      ref={containerRef}
      className={`color-bends-container ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}
