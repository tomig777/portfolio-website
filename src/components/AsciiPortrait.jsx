import React, { useRef, useEffect, useCallback, useState } from 'react';
import portraitImage from '../assets/portrait-1.png';
import './AsciiPortrait.css';

/* ────────────────────────────────────────────
   ASCII character ramp — darkest to brightest.
   ──────────────────────────────────────────── */
const ASCII_RAMP = ' `.-\':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@';

/* ────────────────────────────────────────────
   Color palette for depth mapping.
   Maps brightness (0–1) to an RGB color.
   Dark = deep muted blue, mid = grey-lavender,
   bright = warm white.
   ──────────────────────────────────────────── */
const COLOR_STOPS = [
  { t: 0.00, r: 10,  g: 10,  b: 18  },  // near black
  { t: 0.12, r: 28,  g: 30,  b: 52  },  // deep navy
  { t: 0.25, r: 55,  g: 58,  b: 90  },  // dark slate blue
  { t: 0.38, r: 85,  g: 90,  b: 130 },  // muted blue
  { t: 0.50, r: 120, g: 118, b: 145 },  // grey-lavender
  { t: 0.62, r: 160, g: 155, b: 170 },  // warm grey
  { t: 0.75, r: 195, g: 190, b: 200 },  // light grey
  { t: 0.87, r: 220, g: 218, b: 225 },  // near white
  { t: 1.00, r: 240, g: 238, b: 245 },  // bright white-lavender
];

function lerpColor(brightness) {
  const b = Math.max(0, Math.min(1, brightness));
  let i = 0;
  while (i < COLOR_STOPS.length - 1 && COLOR_STOPS[i + 1].t <= b) i++;
  if (i >= COLOR_STOPS.length - 1) {
    const s = COLOR_STOPS[COLOR_STOPS.length - 1];
    return [s.r, s.g, s.b];
  }
  const s0 = COLOR_STOPS[i];
  const s1 = COLOR_STOPS[i + 1];
  const f = (b - s0.t) / (s1.t - s0.t);
  return [
    Math.round(s0.r + (s1.r - s0.r) * f),
    Math.round(s0.g + (s1.g - s0.g) * f),
    Math.round(s0.b + (s1.b - s0.b) * f),
  ];
}

/* Hover accent colors — picked randomly for affected chars */
const HOVER_ACCENTS = [
  [120, 160, 255],  // bright blue
  [160, 120, 255],  // purple
  [100, 220, 240],  // cyan
  [180, 140, 255],  // lavender
  [80, 200, 220],   // teal
  [200, 170, 255],  // light purple
];

/* Simple hash for pseudo-random per-character variation */
function hashXY(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1013904223) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return (h ^ (h >> 16)) >>> 0;
}

const AsciiPortrait = ({ onBack }) => {
  const sampleCanvasRef = useRef(null);
  const renderCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const targetRotRef = useRef({ x: 0, y: 0 });
  const currentRotRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const frameCountRef = useRef(0);
  const gridRef = useRef(null); // cached pixel data
  const [loaded, setLoaded] = useState(false);

  // Resolution
  const COLS = 130;
  const FONT_SIZE = 10;
  const CHAR_WIDTH = FONT_SIZE * 0.6;   // monospace char width
  const CHAR_HEIGHT = FONT_SIZE * 1.05;  // line height

  // Rotation range
  const MAX_ROT_Y = 8;
  const MAX_ROT_X = 4;

  // Hover
  const HOVER_RADIUS = 0.12;      // normalized radius
  const HOVER_PROBABILITY = 0.35;  // chance a char in radius is affected

  // Load image and pre-compute grid
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;

      // Pre-compute the pixel grid once
      const canvas = sampleCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const aspect = img.height / img.width;
      const cols = COLS;
      const rows = Math.floor(cols * aspect * (CHAR_WIDTH / CHAR_HEIGHT));

      canvas.width = cols;
      canvas.height = rows;
      ctx.drawImage(img, 0, 0, cols, rows);
      const imageData = ctx.getImageData(0, 0, cols, rows);
      const pixels = imageData.data;

      // Build grid: brightness + alpha for each cell
      const grid = new Float32Array(cols * rows * 2); // [brightness, alpha] pairs
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const idx = (y * cols + x) * 2;
          grid[idx] = 1 - brightness; // invert: dark bg, bright subject
          grid[idx + 1] = a / 255;
        }
      }

      gridRef.current = { cols, rows, grid };
      setLoaded(true);
    };
    img.src = portraitImage;
  }, []);

  // Render loop
  useEffect(() => {
    if (!loaded || !gridRef.current) return;

    const renderCanvas = renderCanvasRef.current;
    if (!renderCanvas) return;
    const ctx = renderCanvas.getContext('2d');

    const { cols, rows, grid } = gridRef.current;

    // Size render canvas
    renderCanvas.width = Math.ceil(cols * CHAR_WIDTH);
    renderCanvas.height = Math.ceil(rows * CHAR_HEIGHT);

    ctx.font = `${FONT_SIZE}px "Courier New", "Lucida Console", "Consolas", monospace`;
    ctx.textBaseline = 'top';

    const loop = () => {
      frameCountRef.current++;
      const frame = frameCountRef.current;

      // Smooth rotation
      const tx = targetRotRef.current.x;
      const ty = targetRotRef.current.y;
      currentRotRef.current.x += (tx - currentRotRef.current.x) * 0.07;
      currentRotRef.current.y += (ty - currentRotRef.current.y) * 0.07;

      // Apply rotation to canvas wrapper
      if (renderCanvas.parentElement) {
        const rx = currentRotRef.current.x;
        const ry = currentRotRef.current.y;
        renderCanvas.parentElement.style.transform =
          `perspective(800px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      }

      // Clear
      ctx.clearRect(0, 0, renderCanvas.width, renderCanvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hoverActive = mx >= 0 && my >= 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 2;
          const brightness = grid[idx];
          const alpha = grid[idx + 1];

          // Skip transparent background
          if (alpha < 0.12 || brightness < 0.03) continue;

          // Determine character
          const charIndex = Math.floor(brightness * (ASCII_RAMP.length - 1));
          let char = ASCII_RAMP[charIndex];

          // Determine color
          let [cr, cg, cb] = lerpColor(brightness);
          let charAlpha = Math.min(1, brightness * 1.4 + 0.1);

          // Hover effect — randomized
          if (hoverActive) {
            const nx = x / cols;
            const ny = y / rows;
            const dist = Math.sqrt((nx - mx) ** 2 + (ny - my) ** 2);

            if (dist < HOVER_RADIUS) {
              const hash = hashXY(x, y, frame >> 2); // change every ~4 frames for flicker
              const chance = (hash % 1000) / 1000;

              if (chance < HOVER_PROBABILITY) {
                // Pick a random accent color
                const colorIdx = (hash >> 10) % HOVER_ACCENTS.length;
                const accent = HOVER_ACCENTS[colorIdx];

                // Mix accent with base, stronger near center
                const strength = 1 - (dist / HOVER_RADIUS);
                const mix = strength * 0.85;
                cr = Math.round(cr * (1 - mix) + accent[0] * mix);
                cg = Math.round(cg * (1 - mix) + accent[1] * mix);
                cb = Math.round(cb * (1 - mix) + accent[2] * mix);
                charAlpha = Math.min(1, charAlpha + strength * 0.3);

                // Randomly swap character for glitch feel
                if (chance < HOVER_PROBABILITY * 0.5) {
                  const altIndex = Math.min(ASCII_RAMP.length - 1,
                    charIndex + ((hash >> 16) % 12) - 4);
                  char = ASCII_RAMP[Math.max(0, altIndex)];
                }
              }
            }
          }

          ctx.fillStyle = `rgba(${cr},${cg},${cb},${charAlpha})`;
          ctx.fillText(char, x * CHAR_WIDTH, y * CHAR_HEIGHT);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loaded]);

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    const canvas = renderCanvasRef.current;
    if (!canvas) return;
    const wrapper = canvas.parentElement;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseRef.current = { x, y };

    // Rotation — based on position relative to center of viewport
    const containerRect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - containerRect.left) / containerRect.width - 0.5) * 2;
    const ny = ((e.clientY - containerRect.top) / containerRect.height - 0.5) * 2;
    targetRotRef.current = { x: -ny * MAX_ROT_X, y: nx * MAX_ROT_Y };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1 };
    targetRotRef.current = { x: 0, y: 0 };
  }, []);

  return (
    <div className="ascii-portrait-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <canvas ref={sampleCanvasRef} style={{ display: 'none' }} />

      {onBack && (
        <button className="ascii-portrait-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          Back
        </button>
      )}

      <div className="ascii-portrait-wrapper">
        {!loaded && (
          <div className="ascii-portrait-loading">
            <div className="ascii-portrait-spinner" />
            Loading portrait…
          </div>
        )}
        <div className="ascii-portrait-canvas-wrap">
          <canvas ref={renderCanvasRef} className="ascii-portrait-canvas" />
        </div>
      </div>
    </div>
  );
};

export default AsciiPortrait;
