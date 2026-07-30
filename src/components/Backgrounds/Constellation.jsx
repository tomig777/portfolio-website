import { useEffect, useRef } from 'react';

const Constellation = ({
  color = '#b19eef',
  speed = 1.0,
  density = 80,
  opacity = 0.5,
  lineDistance = 120,
  interactive = true
}) => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: null, y: null, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Helper to parse hex/color to rgb
    const getRGB = (colorStr) => {
      // Create temporary element to parse standard CSS colors
      const temp = document.createElement('div');
      temp.style.color = colorStr;
      document.body.appendChild(temp);
      const computed = window.getComputedStyle(temp).color;
      document.body.removeChild(temp);
      
      const match = computed.match(/\d+/g);
      return match ? match.slice(0, 3).join(', ') : '177, 158, 239';
    };

    const rgbColor = getRGB(color);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * speed * 1.5;
        this.vy = (Math.random() - 0.5) * speed * 1.5;
        this.radius = Math.random() * 2.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Clamp to screen bounds
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;

        // Mouse reaction
        if (interactive && mousePos.current.x !== null) {
          const dx = mousePos.current.x - this.x;
          const dy = mousePos.current.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mousePos.current.radius) {
            // Gently pull particles toward cursor
            const force = (mousePos.current.radius - dist) / mousePos.current.radius;
            this.vx += (dx / dist) * force * 0.05;
            this.vy += (dy / dist) * force * 0.05;

            // Speed limit
            const currentSpeed = Math.hypot(this.vx, this.vy);
            const limit = speed * 2 + 1;
            if (currentSpeed > limit) {
              this.vx = (this.vx / currentSpeed) * limit;
              this.vy = (this.vy / currentSpeed) * limit;
            }
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbColor}, ${opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000) * (density / 50);
      const safeCount = Math.min(Math.max(particleCount, 20), 250);
      for (let i = 0; i < safeCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < lineDistance) {
            // Fade lines as they get further apart
            const lineOpacity = (1 - dist / lineDistance) * opacity * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgbColor}, ${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw line to mouse
        if (interactive && mousePos.current.x !== null) {
          const dx = particles[i].x - mousePos.current.x;
          const dy = particles[i].y - mousePos.current.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mousePos.current.radius) {
            const lineOpacity = (1 - dist / mousePos.current.radius) * opacity * 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mousePos.current.x, mousePos.current.y);
            ctx.strokeStyle = `rgba(${rgbColor}, ${lineOpacity})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      drawLines();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mousePos.current.x = null;
      mousePos.current.y = null;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    handleResize(); // Initialize sizes & particles
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [color, speed, density, opacity, lineDistance, interactive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto',
        display: 'block'
      }}
    />
  );
};

export default Constellation;
