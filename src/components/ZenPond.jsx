import { useEffect, useRef } from 'react';
import './ZenPond.css';
import ShinyText from './ShinyText';

const ZenPond = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    let w, h;
    const ripples = [];
    const skipStones = [];
    const fishes = [];
    const fireflies = [];
    let grainImageData = null;
    let staticCanvas = null; // Replaces plantsCanvas to hold both rocks and plants
    let animationFrameId;

    // Store rock definitions so they persist across renders
    let rockDefs = [];

    /* ─── Helper: Get random point on Capsule/Stadium boundary ─── */
    function getRandomEdgePoint(cw, ch, depth) {
      const r = ch / 2;
      const straightLen = Math.max(0, cw - ch);
      const semiCircLen = Math.PI * r;
      const totalPerim = straightLen * 2 + semiCircLen * 2;
      
      let p = Math.random() * totalPerim;
      let edgeX, edgeY, cx, cy;
      
      if (p < straightLen) {
        edgeX = r + p; edgeY = 0; cx = edgeX; cy = r;
      } else if (p < straightLen * 2) {
        edgeX = r + (p - straightLen); edgeY = ch; cx = edgeX; cy = r;
      } else if (p < straightLen * 2 + semiCircLen) {
        const angle = Math.PI / 2 + (Math.PI * (p - straightLen * 2) / semiCircLen);
        edgeX = r + Math.cos(angle) * r; edgeY = r + Math.sin(angle) * r; cx = r; cy = r;
      } else {
        const angle = -Math.PI / 2 + (Math.PI * (p - straightLen * 2 - semiCircLen) / semiCircLen);
        edgeX = cw - r + Math.cos(angle) * r; edgeY = r + Math.sin(angle) * r; cx = cw - r; cy = r;
      }

      return {
        px: cx + (edgeX - cx) * depth,
        py: cy + (edgeY - cy) * depth
      };
    }

    /* ─── Resize ─── */
    function resize() {
      const rect = wrapper.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      w = canvas.width = rect.width * devicePixelRatio;
      h = canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
      generateGrain();
      
      // Generate static placements once per resize
      generateRockDefs(rect.width, rect.height);
      generateStaticLayer(rect.width, rect.height);

      if (!fishSpawned) {
        for (let i = 0; i < 4; i++) fishes.push(new Fish());
        fishSpawned = true;
      }

      if (fireflies.length === 0) {
        for (let i = 0; i < 18; i++) fireflies.push(new Firefly(rect.width, rect.height));
      }
    }

    /* ─── Grain texture (heavy and organic) ─── */
    function generateGrain() {
      const cw = wrapper.getBoundingClientRect().width;
      const ch = wrapper.getBoundingClientRect().height;
      if (cw === 0 || ch === 0) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = cw;
      offscreen.height = ch;
      const offCtx = offscreen.getContext('2d');

      const imgData = offCtx.createImageData(cw, ch);
      for (let i = 0; i < imgData.data.length; i += 4) {
        // Create a heavier grain by alternating lightness
        const v = Math.random() < 0.5 ? 20 : 60;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v + 20; // Slight blue tint to noise
        imgData.data[i + 3] = 25 + Math.random() * 20; // more visible noise
      }
      offCtx.putImageData(imgData, 0, 0);
      grainImageData = offscreen;
    }

    /* ─── Generate Rock Definitions ─── */
    function generateRockDefs(cw, ch) {
      rockDefs = [];
      const numClusters = 6 + Math.floor(Math.random() * 3);
      for (let c = 0; c < numClusters; c++) {
        // Base center point on edge with slight inset
        const base = getRandomEdgePoint(cw, ch, 0.94);
        const count = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < count; i++) {
          // Spread rocks around the cluster center
          const px = base.px + (Math.random() - 0.5) * 30;
          const py = base.py + (Math.random() - 0.5) * 30;
          const size = 6 + Math.random() * 12;
          const aspect = 0.5 + Math.random() * 0.4;
          const rot = Math.random() * Math.PI;
          const darkness = 0.3 + Math.random() * 0.4;
          rockDefs.push({ px, py, size, aspect, rot, darkness });
        }
      }
    }

    /* ─── Draw Single Rock ─── */
    function drawRock(pCtx, r) {
      pCtx.save();
      pCtx.translate(r.px, r.py);
      pCtx.rotate(r.rot);

      // Shadow
      pCtx.beginPath();
      pCtx.ellipse(2, 2, r.size * 1.1, r.size * r.aspect * 1.1, 0, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(0, 0, 0, 0.3)`;
      pCtx.fill();

      // Body
      pCtx.beginPath();
      pCtx.ellipse(0, 0, r.size, r.size * r.aspect, 0, 0, Math.PI * 2);
      const base = Math.floor(40 + r.darkness * 40);
      const grad = pCtx.createLinearGradient(-r.size, -r.size * r.aspect, r.size, r.size * r.aspect);
      grad.addColorStop(0, `rgb(${base + 25}, ${base + 22}, ${base + 18})`);
      grad.addColorStop(1, `rgb(${base - 5}, ${base - 8}, ${base - 12})`);
      pCtx.fillStyle = grad;
      pCtx.fill();

      // Specular highlight
      pCtx.beginPath();
      pCtx.ellipse(-r.size * 0.2, -r.size * r.aspect * 0.25, r.size * 0.5, r.size * r.aspect * 0.3, -0.3, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(180, 175, 165, 0.15)`;
      pCtx.fill();

      pCtx.restore();
    }

    /* ─── Draw Single Plant ─── */
    function drawPlant(pCtx, x, y, scale) {
      const height = (25 + Math.random() * 40) * scale;
      const sway = (Math.random() - 0.5) * 15 * scale;
      const green = 60 + Math.floor(Math.random() * 40);
      const alpha = 0.6 + Math.random() * 0.4;

      pCtx.beginPath();
      pCtx.moveTo(x, y);
      pCtx.quadraticCurveTo(x + sway * 0.5, y - height * 0.5, x + sway, y - height);
      pCtx.strokeStyle = `rgba(${50 + Math.random() * 30}, ${green}, ${40 + Math.random() * 30}, ${alpha})`;
      pCtx.lineWidth = (1 + Math.random()) * scale;
      pCtx.lineCap = 'round';
      pCtx.stroke();

      if (Math.random() > 0.5) {
        const fluffY = y - height * (0.6 + Math.random() * 0.3);
        const fluffX = x + sway * (1 - (y - fluffY) / height);
        pCtx.beginPath();
        pCtx.moveTo(fluffX, fluffY + 4 * scale);
        pCtx.lineTo(fluffX, fluffY - 4 * scale);
        pCtx.strokeStyle = `rgba(${90 + Math.random() * 30}, ${50 + Math.random() * 20}, ${30 + Math.random() * 15}, ${alpha})`;
        pCtx.lineCap = 'round';
        pCtx.lineWidth = 3 * scale;
        pCtx.stroke();
      }
    }

    /* ─── Generate Static Layer (Rocks + Plants) ─── */
    function generateStaticLayer(cw, ch) {
      if (cw === 0 || ch === 0) return;

      staticCanvas = document.createElement('canvas');
      staticCanvas.width = cw;
      staticCanvas.height = ch;
      const pCtx = staticCanvas.getContext('2d');

      // Draw rocks
      for (const r of rockDefs) {
        drawRock(pCtx, r);
      }

      // Draw plants clustered around rocks
      for (const r of rockDefs) {
        const clusterSize = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < clusterSize; i++) {
          const offsetX = (Math.random() - 0.5) * r.size * 3;
          const offsetY = (Math.random() - 0.5) * r.size * 2;
          drawPlant(pCtx, r.px + offsetX, r.py + offsetY, 0.4 + Math.random() * 0.5);
        }
      }

      // Draw sparse plants randomly along exact stadium perimeter
      for (let i = 0; i < 40; i++) {
        const pt = getRandomEdgePoint(cw, ch, 0.98 + Math.random() * 0.04);
        drawPlant(pCtx, pt.px, pt.py, 0.3 + Math.random() * 0.5);
      }
    }

    /* ─── Firefly ─── */
    class Firefly {
      constructor(cw, ch) {
        this.cw = cw;
        this.ch = ch;
        this.reset();
      }
      reset() {
        const pt = getRandomEdgePoint(this.cw, this.ch, Math.random() * 0.85);
        this.x = pt.px;
        this.y = pt.py;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.01 + Math.random() * 0.02;
        this.size = 1 + Math.random() * 1.5;
        this.maxAlpha = 0.3 + Math.random() * 0.6;
      }
      update() {
        this.phase += this.speed;
        this.x += this.vx + Math.sin(this.phase * 1.3) * 0.2;
        this.y += this.vy + Math.cos(this.phase * 0.9) * 0.15;

        if (Math.random() < 0.01) {
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
        }

        const r = this.ch / 2;
        // Approximate bounce back towards center
        if (this.x < 0 || this.x > this.cw || this.y < 0 || this.y > this.ch) {
           this.vx += (this.cw / 2 - this.x) * 0.002;
           this.vy += (this.ch / 2 - this.y) * 0.002;
        }
      }
      draw() {
        const glow = (Math.sin(this.phase * 2) + 1) * 0.5;
        const alpha = glow * this.maxAlpha;
        if (alpha < 0.05) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 150, ${alpha * 0.15})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 255, 180, ${alpha})`;
        ctx.fill();
      }
    }

    class Ripple {
      constructor(x, y, maxRadius = 80) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = maxRadius + Math.random() * 20;
        this.alpha = 0.6;
        this.lineWidth = 2;
        this.speed = 0.8 + Math.random() * 0.3;
        this.done = false;
      }
      update() {
        this.radius += this.speed;
        this.alpha -= 0.005;
        this.lineWidth = Math.max(0.3, 2 - (this.radius / this.maxRadius) * 2);
        if (this.alpha <= 0 || this.radius >= this.maxRadius) {
          this.done = true;
        }
      }
      draw() {
        if (this.done) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140, 180, 255, ${this.alpha})`;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        if (this.radius > 5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180, 210, 255, ${this.alpha * 0.4})`;
          ctx.lineWidth = this.lineWidth * 0.5;
          ctx.stroke();
        }
      }
    }

    class SkipStone {
      constructor(startX, startY) {
        this.bounces = 0;
        this.maxBounces = 3 + Math.floor(Math.random() * 3); 
        this.done = false;

        this.x = startX;
        this.y = startY; 
        this.z = 0; 

        this.vx = (Math.random() - 0.5) * 1.5; 
        this.vy = -1.5 - Math.random() * 1.5; 
        this.vz = 4 + Math.random() * 2; 

        this.gravity = 0.25;
        this.radius = 4;
        this.alpha = 1;
        this.trail = [];

        this.createRipple();
      }
      createRipple() {
        ripples.push(new Ripple(this.x, this.y, 40 + Math.random() * 30));
      }
      update() {
        if (this.done) return;

        this.trail.push({ x: this.x, y: this.y, z: this.z, alpha: 0.5 });
        if (this.trail.length > 8) this.trail.shift();
        this.trail.forEach(t => (t.alpha *= 0.85));

        this.x += this.vx;
        this.y += this.vy;
        this.vz -= this.gravity;
        this.z += this.vz;

        if (this.z <= 0 && this.vz < 0) {
          this.bounces++;
          if (this.bounces >= this.maxBounces) {
            ripples.push(new Ripple(this.x, this.y, 60 + Math.random() * 30));
            this.done = true;
            return;
          }
          this.z = 0;
          this.vz = Math.abs(this.vz) * (0.6 - this.bounces * 0.05); 
          this.vy *= 0.9; 
          this.vx *= 0.9;
          this.createRipple();
        }

        this.alpha = Math.max(0, 1 - this.bounces * 0.15);
        this.radius = Math.max(1.5, 4 - this.bounces * 0.4);

        if (this.y < -20) this.done = true;
      }
      draw() {
        if (this.done) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha * 0.3})`;
        ctx.fill();

        const drawY = this.y - this.z;

        this.trail.forEach(t => {
          ctx.beginPath();
          ctx.arc(t.x, t.y - t.z, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 230, 255, ${t.alpha * this.alpha})`;
          ctx.fill();
        });

        ctx.save();
        ctx.translate(this.x, drawY);
        ctx.rotate(this.x * 0.05); // Spin as it moves X

        ctx.beginPath();
        // Squashed ellipse (1.6x wider) for that classic flat skipping stone
        ctx.ellipse(0, 0, this.radius * 1.6, this.radius * 0.8, 0, 0, Math.PI * 2);
        
        const stoneGrad = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
        stoneGrad.addColorStop(0, `rgba(140, 145, 150, ${this.alpha})`); // Lit top edge
        stoneGrad.addColorStop(1, `rgba(60, 65, 75, ${this.alpha})`);    // shadowed bottom
        
        ctx.fillStyle = stoneGrad;
        ctx.fill();

        // Subtle specular highlight on the upper curve
        ctx.beginPath();
        ctx.ellipse(-this.radius * 0.2, -this.radius * 0.3, this.radius * 0.9, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.15})`;
        ctx.fill();

        ctx.restore();
      }
    }

    function drawWater() {
      const cw = wrapper.getBoundingClientRect().width;
      const ch = wrapper.getBoundingClientRect().height;

      const grad = ctx.createLinearGradient(0, 0, 0, ch);
      grad.addColorStop(0, '#2b4d66');
      grad.addColorStop(0.5, '#355c7a');
      grad.addColorStop(1, '#2c4a63');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      if (grainImageData) {
        ctx.drawImage(grainImageData, 0, 0);
      }
    }

    /* ─── Shadow Fish ─── */
    class Fish {
      constructor() {
        // Store positions as normalized 0-1 fractions of the pond
        this.nx = 0.15 + Math.random() * 0.7;
        this.ny = 0.2 + Math.random() * 0.6;
        this.size = 8 + Math.random() * 12;
        this.baseSpeed = 0.0005 + Math.random() * 0.0005; // normalized speed
        this.speed = this.baseSpeed;
        this.angle = Math.random() * Math.PI * 2;
        this.turnSpeed = (Math.random() - 0.5) * 0.02;
        this.alpha = 0.08 + Math.random() * 0.07;
        this.tailPhase = Math.random() * Math.PI * 2;
        this.fleeing = false;
      }
      flee(stoneNX, stoneNY) {
        const dist = Math.hypot(this.nx - stoneNX, this.ny - stoneNY);
        if (dist < 0.18) {
          this.angle = Math.atan2(this.ny - stoneNY, this.nx - stoneNX) + (Math.random() - 0.5) * 0.6;
          this.speed = 0.004 + Math.random() * 0.003;
          this.fleeing = true;
        }
      }
      update() {
        this.tailPhase += this.fleeing ? 0.2 : 0.08;
        if (this.speed > this.baseSpeed) {
          this.speed *= 0.97;
          if (this.speed <= this.baseSpeed + 0.00005) {
            this.speed = this.baseSpeed;
            this.fleeing = false;
          }
        }
        if (!this.fleeing) {
          this.angle += this.turnSpeed;
          if (Math.random() < 0.01) {
            this.turnSpeed = (Math.random() - 0.5) * 0.02;
          }
        }
        this.nx += Math.cos(this.angle) * this.speed;
        this.ny += Math.sin(this.angle) * this.speed;
        // Keep fish within the pond ellipse (centered at 0.5, 0.5)
        const dx = (this.nx - 0.5) / 0.38;
        const dy = (this.ny - 0.5) / 0.38;
        if (dx * dx + dy * dy > 1) {
          this.angle = Math.atan2(0.5 - this.ny, 0.5 - this.nx) + (Math.random() - 0.5) * 0.5;
        }
      }
      draw(pondW, pondH) {
        const px = this.nx * pondW;
        const py = this.ny * pondH;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.alpha;
        
        // Body – elongated teardrop
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1a2a3a';
        ctx.fill();
        
        // Tail with subtle wag
        const tailWag = Math.sin(this.tailPhase) * 4;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.lineTo(-this.size * 1.4, tailWag - this.size * 0.3);
        ctx.lineTo(-this.size * 1.4, tailWag + this.size * 0.3);
        ctx.closePath();
        ctx.fillStyle = '#1a2a3a';
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function animate() {
      const cw = wrapper.getBoundingClientRect().width;
      const ch = wrapper.getBoundingClientRect().height;
      if (cw > 0 && ch > 0) {
        ctx.clearRect(0, 0, cw, ch);

        drawWater();

        // Fish shadows (under rocks/plants)
        for (const fish of fishes) {
          fish.update();
          fish.draw(cw, ch);
        }

        // Static Rocks + Plants
        if (staticCanvas) {
          ctx.drawImage(staticCanvas, 0, 0);
        }

        // Fireflies
        for (const ff of fireflies) {
          ff.update();
          ff.draw();
        }

        // Ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          ripples[i].update();
          ripples[i].draw();
          if (ripples[i].done) ripples.splice(i, 1);
        }

        // Skipping Stones
        for (let i = skipStones.length - 1; i >= 0; i--) {
          skipStones[i].update();
          skipStones[i].draw();
          if (skipStones[i].done) skipStones.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Use a ResizeObserver to perfectly catch the final CSS layout!
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          resize();
        }
      }
    });
    resizeObserver.observe(wrapper);

    animate();

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX || e.pageX;
      const clickY = e.clientY || e.pageY;
      const x = clickX - rect.left;
      const y = clickY - rect.top;
      skipStones.push(new SkipStone(x, y));
      // Scare nearby fish (convert to normalized coords)
      const nx = x / rect.width;
      const ny = y / rect.height;
      for (const fish of fishes) {
        fish.flee(nx, ny);
      }
    };

    const handleTouch = (e) => {
      if (!e.touches || !e.touches[0]) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      skipStones.push(new SkipStone(x, y));
      // Scare nearby fish (convert to normalized coords)
      const nx = x / rect.width;
      const ny = y / rect.height;
      for (const fish of fishes) {
        fish.flee(nx, ny);
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="zen-pond-section">
      <div className="container">
        <div style={{width: '100%', marginBottom: '2.5rem'}}>
          <p className="section-label">Take a Breath</p>
          <h2 className="section-title">
            <ShinyText
              text="The Zen Pond"
              speed={2.5}
              delay={0}
              color="#b5b5b5"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
            />
          </h2>
        </div>
        <p className="zen-instruction">Click on the water to skip a stone</p>
        <div className="zen-pond-wrapper" ref={wrapperRef}>
          <canvas className="zen-canvas" ref={canvasRef}></canvas>
        </div>
      </div>
    </section>
  );
};

export default ZenPond;
