import React, { useRef, useEffect, useCallback } from 'react';
import logoDark from '../assets/logo-dark.png';

const DENSITY_CHARS = ' .:-=+*#%@';
const CHAR_COUNT = DENSITY_CHARS.length;

// --- Fluid Simulation (Stable Fluids) ---
class FluidSim {
  constructor(size) {
    this.size = size;
    this.dt = 0.15;
    this.diff = 0.0001;
    this.visc = 0.0;
    const n = size * size;
    this.s = new Float32Array(n);
    this.density = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.vx0 = new Float32Array(n);
    this.vy0 = new Float32Array(n);
  }

  IX(x, y) {
    x = Math.max(0, Math.min(this.size - 1, Math.floor(x)));
    y = Math.max(0, Math.min(this.size - 1, Math.floor(y)));
    return x + y * this.size;
  }

  addDensity(x, y, amount) {
    this.density[this.IX(x, y)] += amount;
  }

  addVelocity(x, y, amountX, amountY) {
    const idx = this.IX(x, y);
    this.vx[idx] += amountX;
    this.vy[idx] += amountY;
  }

  setBnd(b, x) {
    const N = this.size - 2;
    for (let i = 1; i <= N; i++) {
      x[this.IX(0, i)]     = b === 1 ? -x[this.IX(1, i)] : x[this.IX(1, i)];
      x[this.IX(N + 1, i)] = b === 1 ? -x[this.IX(N, i)] : x[this.IX(N, i)];
      x[this.IX(i, 0)]     = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
      x[this.IX(i, N + 1)] = b === 2 ? -x[this.IX(i, N)] : x[this.IX(i, N)];
    }
    x[this.IX(0, 0)]         = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
    x[this.IX(0, N + 1)]     = 0.5 * (x[this.IX(1, N + 1)] + x[this.IX(0, N)]);
    x[this.IX(N + 1, 0)]     = 0.5 * (x[this.IX(N, 0)] + x[this.IX(N + 1, 1)]);
    x[this.IX(N + 1, N + 1)] = 0.5 * (x[this.IX(N, N + 1)] + x[this.IX(N + 1, N)]);
  }

  linSolve(b, x, x0, a, c) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < 4; k++) {
      for (let j = 1; j < this.size - 1; j++) {
        for (let i = 1; i < this.size - 1; i++) {
          x[this.IX(i, j)] =
            (x0[this.IX(i, j)] +
              a * (x[this.IX(i + 1, j)] + x[this.IX(i - 1, j)] +
                   x[this.IX(i, j + 1)] + x[this.IX(i, j - 1)])) * cRecip;
        }
      }
      this.setBnd(b, x);
    }
  }

  diffuse(b, x, x0, diff) {
    const a = this.dt * diff * (this.size - 2) * (this.size - 2);
    this.linSolve(b, x, x0, a, 1 + 4 * a);
  }

  project(vx, vy, p, div) {
    const N = this.size - 2;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        div[this.IX(i, j)] = -0.5 * (
          vx[this.IX(i + 1, j)] - vx[this.IX(i - 1, j)] +
          vy[this.IX(i, j + 1)] - vy[this.IX(i, j - 1)]
        ) / N;
        p[this.IX(i, j)] = 0;
      }
    }
    this.setBnd(0, div);
    this.setBnd(0, p);
    this.linSolve(0, p, div, 1, 4);
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        vx[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * N;
        vy[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * N;
      }
    }
    this.setBnd(1, vx);
    this.setBnd(2, vy);
  }

  advect(b, d, d0, vx, vy) {
    const N = this.size - 2;
    const dtx = this.dt * N;
    const dty = this.dt * N;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        let tmp1 = dtx * vx[this.IX(i, j)];
        let tmp2 = dty * vy[this.IX(i, j)];
        let x = i - tmp1;
        let y = j - tmp2;
        x = Math.max(0.5, Math.min(N + 0.5, x));
        y = Math.max(0.5, Math.min(N + 0.5, y));
        const i0 = Math.floor(x);
        const i1 = i0 + 1;
        const j0 = Math.floor(y);
        const j1 = j0 + 1;
        const s1 = x - i0;
        const s0 = 1 - s1;
        const t1 = y - j0;
        const t0 = 1 - t1;
        d[this.IX(i, j)] =
          s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
          s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
      }
    }
    this.setBnd(b, d);
  }

  step() {
    const n = this.size * this.size;
    // Velocity step
    this.vx0.set(this.vx);
    this.vy0.set(this.vy);
    this.diffuse(1, this.vx, this.vx0, this.visc);
    this.diffuse(2, this.vy, this.vy0, this.visc);
    this.project(this.vx, this.vy, this.vx0, this.vy0);
    this.vx0.set(this.vx);
    this.vy0.set(this.vy);
    this.advect(1, this.vx, this.vx0, this.vx0, this.vy0);
    this.advect(2, this.vy, this.vy0, this.vx0, this.vy0);
    this.project(this.vx, this.vy, this.vx0, this.vy0);
    // Density step
    this.s.set(this.density);
    this.diffuse(0, this.density, this.s, this.diff);
    this.s.set(this.density);
    this.advect(0, this.density, this.s, this.vx, this.vy);
    // Decay density
    for (let i = 0; i < n; i++) {
      this.density[i] *= 0.96;
    }
  }
}

// --- Color interpolation ---
function getFluidColor(density, velocity) {
  const v = Math.min(1, velocity * 0.1);
  const d = Math.min(1, density * 0.05);
  const intensity = Math.max(v, d);

  if (intensity < 0.2) {
    const t = intensity / 0.2;
    return lerpColor(10, 10, 46, 0, 80, 160, t);
  } else if (intensity < 0.55) {
    const t = (intensity - 0.2) / 0.35;
    return lerpColor(0, 80, 160, 0, 230, 255, t);
  } else if (intensity < 0.85) {
    const t = (intensity - 0.55) / 0.3;
    return lerpColor(0, 230, 255, 160, 0, 230, t);
  } else {
    const t = (intensity - 0.85) / 0.15;
    return lerpColor(160, 0, 230, 220, 40, 255, t);
  }
}

function lerpColor(r1, g1, b1, r2, g2, b2, t) {
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

// --- Main Component ---
const AsciiFluidVortex = ({ onBack }) => {
  const canvasRef = useRef(null);
  const fluidRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, active: false });
  const idleTimerRef = useRef(null);
  const isIdleRef = useRef(false);
  const backBtnRef = useRef(null);
  const gridRef = useRef({ cols: 0, rows: 0, cellW: 0, cellH: 0 });
  const animRef = useRef(null);

  const FLUID_SIZE = 128;

  const setupGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = Math.max(10, Math.min(14, Math.floor(window.innerWidth / 120)));
    const cellW = fontSize * 0.6;
    const cellH = fontSize;
    gridRef.current = {
      cols: Math.floor(canvas.width / cellW),
      rows: Math.floor(canvas.height / cellH),
      cellW,
      cellH,
      fontSize,
    };
  }, []);

  useEffect(() => {
    const fluid = new FluidSim(FLUID_SIZE);
    fluidRef.current = fluid;
    setupGrid();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let mouseTimeout;

    const resetIdle = () => {
      isIdleRef.current = false;
      if (backBtnRef.current) backBtnRef.current.style.opacity = '0';
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isIdleRef.current = true;
        if (backBtnRef.current) backBtnRef.current.style.opacity = '1';
      }, 3000);
    };

    const handleMouseMove = (e) => {
      const m = mouseRef.current;
      m.px = m.x;
      m.py = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
      m.active = true;
      resetIdle();
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const m = mouseRef.current;
      m.px = m.x;
      m.py = m.y;
      m.x = touch.clientX;
      m.y = touch.clientY;
      m.active = true;
      resetIdle();
    };

    const handleResize = () => {
      setupGrid();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('resize', handleResize);
    resetIdle();

    // --- Render Loop ---
    const render = () => {
      const { cols, rows, cellW, cellH, fontSize } = gridRef.current;
      if (!cols || !rows) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      // Add mouse forces
      if (mouseRef.current.active) {
        const m = mouseRef.current;
        const fx = (m.x / canvas.width) * FLUID_SIZE;
        const fy = (m.y / canvas.height) * FLUID_SIZE;
        const dx = m.x - m.px;
        const dy = m.y - m.py;
        const speed = Math.sqrt(dx * dx + dy * dy);

        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            fluid.addDensity(fx + di, fy + dj, speed * 1);
            fluid.addVelocity(fx + di, fy + dj, dx * 0.6, dy * 0.6);
          }
        }
        m.active = false;
      }

      // Idle ambient vortices
      if (isIdleRef.current) {
        const t = performance.now() * 0.001;
        const cx1 = FLUID_SIZE * 0.3 + Math.sin(t * 0.7) * FLUID_SIZE * 0.15;
        const cy1 = FLUID_SIZE * 0.5 + Math.cos(t * 0.5) * FLUID_SIZE * 0.2;
        const cx2 = FLUID_SIZE * 0.7 + Math.cos(t * 0.6) * FLUID_SIZE * 0.15;
        const cy2 = FLUID_SIZE * 0.4 + Math.sin(t * 0.8) * FLUID_SIZE * 0.2;

        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            fluid.addDensity(cx1 + di, cy1 + dj, 3);
            fluid.addVelocity(cx1 + di, cy1 + dj, Math.cos(t * 2) * 15, Math.sin(t * 2) * 15);
            fluid.addDensity(cx2 + di, cy2 + dj, 3);
            fluid.addVelocity(cx2 + di, cy2 + dj, Math.sin(t * 1.5) * 15, -Math.cos(t * 1.5) * 15);
          }
        }
      }

      fluid.step();

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render ASCII
      ctx.textBaseline = 'top';
      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const fx = (i / cols) * (FLUID_SIZE - 2) + 1;
          const fy = (j / rows) * (FLUID_SIZE - 2) + 1;
          const idx = fluid.IX(Math.floor(fx), Math.floor(fy));

          const d = fluid.density[idx];
          const vx = fluid.vx[idx];
          const vy = fluid.vy[idx];
          const vel = Math.sqrt(vx * vx + vy * vy);

          const charIdx = Math.min(CHAR_COUNT - 1, Math.floor(Math.min(1, d * 0.1) * (CHAR_COUNT - 1)));
          if (charIdx === 0) continue; // Skip spaces for performance

          const char = DENSITY_CHARS[charIdx];
          const color = getFluidColor(d, vel);

          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = Math.min(8, vel * 0.5 + d * 0.3);
          ctx.fillText(char, i * cellW, j * cellH);
        }
      }
      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      clearTimeout(mouseTimeout);
    };
  }, [setupGrid]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100vw', height: '100vh', cursor: 'default' }}
      />
      <div
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          zIndex: 10,
          opacity: 0.7,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'translateX(-50%) scale(1)'; }}
      >
        <img
          src={logoDark}
          alt="Back to home"
          style={{ height: '36px', width: 'auto', display: 'block', pointerEvents: 'none' }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default AsciiFluidVortex;
