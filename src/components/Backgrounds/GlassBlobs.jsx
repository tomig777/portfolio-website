import { useEffect, useRef, useState } from 'react';

const GlassBlobs = ({
  colorTheme = 'purple', // 'purple', 'neon', 'sunset'
  speed = 1.0,
  blur = 60,
  opacity = 0.65,
  blobCount = 4
}) => {
  const containerRef = useRef(null);
  const [blobs, setBlobs] = useState([]);

  useEffect(() => {
    // Determine colors
    let colors = [];
    switch (colorTheme) {
      case 'sunset':
        colors = ['#ff0844', '#ffb199', '#f12711', '#f5af19', '#e65c00'];
        break;
      case 'neon':
        colors = ['#00f2fe', '#00ff87', '#38ef7d', '#ffe259', '#ff007f'];
        break;
      case 'purple':
      default:
        colors = ['#b19eef', '#8665f7', '#4d2db7', '#ff79c6', '#8be9fd'];
        break;
    }

    // Initialize blobs
    const initialBlobs = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < blobCount; i++) {
      initialBlobs.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed * 3,
        vy: (Math.random() - 0.5) * speed * 3,
        size: Math.random() * 250 + 200, // Size between 200px and 450px
        color: colors[i % colors.length]
      });
    }

    setBlobs(initialBlobs);
  }, [colorTheme, speed, blobCount]);

  useEffect(() => {
    let animationFrameId;
    let currentBlobs = [...blobs];

    if (currentBlobs.length === 0) return;

    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      currentBlobs = currentBlobs.map((blob) => {
        let x = blob.x + blob.vx;
        let y = blob.y + blob.vy;

        // Bounce horizontally
        let vx = blob.vx;
        if (x < -blob.size / 2) {
          x = -blob.size / 2;
          vx = Math.abs(blob.vx);
        } else if (x > width - blob.size / 2) {
          x = width - blob.size / 2;
          vx = -Math.abs(blob.vx);
        }

        // Bounce vertically
        let vy = blob.vy;
        if (y < -blob.size / 2) {
          y = -blob.size / 2;
          vy = Math.abs(blob.vy);
        } else if (y > height - blob.size / 2) {
          y = height - blob.size / 2;
          vy = -Math.abs(blob.vy);
        }

        return {
          ...blob,
          x,
          y,
          vx,
          vy
        };
      });

      setBlobs(currentBlobs);
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobs.length]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        backgroundColor: '#05050a',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {blobs.map((blob) => (
        <div
          key={blob.id}
          style={{
            position: 'absolute',
            left: `${blob.x}px`,
            top: `${blob.y}px`,
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            borderRadius: '50%',
            backgroundColor: blob.color,
            opacity: opacity * 0.45,
            willChange: 'transform, left, top',
            filter: 'blur(30px)' // Pre-blur each blob
          }}
        />
      ))}
      {/* Full-screen Glass Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backdropFilter: `blur(${blur}px) saturate(1.4)`,
          background: 'rgba(0, 0, 0, 0.2)',
          zIndex: 2
        }}
      />
    </div>
  );
};

export default GlassBlobs;
