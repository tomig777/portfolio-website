import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './CreativeScrollBio.css';

gsap.registerPlugin(ScrollTrigger);

const CreativeScrollBio = ({ scrollContainerRef }) => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  // SVG and DOM element references for animations
  const sparkCircle1 = useRef(null);
  const sparkCircle2 = useRef(null);
  const gridLines = useRef([]);
  const cubeWireframe = useRef(null);
  const vertexPoints = useRef([]);

  useEffect(() => {
    const scrollerElement = document.querySelector('.wt-scroll-container') || scrollContainerRef.current;
    if (!scrollerElement || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Create a master timeline pinned to the scroll duration
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller: scrollerElement,
          start: 'top top',
          end: '+=350%', // Pin section for 350% viewport heights of scroll
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Initially set up state for scenes
      gsap.set('.csb-scene', { autoAlpha: 0, scale: 0.95 });
      gsap.set('.csb-word', { autoAlpha: 0, y: 15, filter: 'blur(8px)' });
      
      // Scene 1: Initial state
      gsap.set('.csb-scene-1', { autoAlpha: 1, scale: 1 });
      
      // Scene 1 Text Reveal
      masterTl.to('.csb-scene-1 .csb-word', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.08,
        ease: 'power2.out',
        duration: 1
      });

      // Scene 1 Visuals - Rotate/Scale floating orbital circles
      masterTl.fromTo([sparkCircle1.current, sparkCircle2.current],
        { strokeDashoffset: 500, rotation: 0 },
        { strokeDashoffset: 0, rotation: (i) => i === 0 ? 360 : -360, duration: 1.5, ease: 'power1.inOut' },
        '<'
      );

      // Transition Scene 1 -> Scene 2
      masterTl.to('.csb-scene-1', { autoAlpha: 0, scale: 0.92, filter: 'blur(10px)', duration: 0.8 })
        .to('.csb-scene-2', { autoAlpha: 1, scale: 1, duration: 0.8 }, '-=0.4');

      // Scene 2 Text Reveal
      masterTl.to('.csb-scene-2 .csb-word', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.08,
        ease: 'power2.out',
        duration: 1
      });

      // Scene 2 Visuals - Float in the 4 skill badges from different angles with 3D rotation
      masterTl.fromTo('.csb-badge',
        { autoAlpha: 0, y: 40, rotationX: -45, rotationY: 30, scale: 0.8 },
        { autoAlpha: 1, y: 0, rotationX: 0, rotationY: 0, scale: 1, stagger: 0.15, ease: 'back.out(1.5)', duration: 1.2 },
        '-=0.8'
      );

      // Transition Scene 2 -> Scene 3
      masterTl.to('.csb-scene-2', { autoAlpha: 0, scale: 0.92, filter: 'blur(10px)', duration: 0.8 })
        .to('.csb-scene-3', { autoAlpha: 1, scale: 1, duration: 0.8 }, '-=0.4');

      // Scene 3 Text Reveal
      masterTl.to('.csb-scene-3 .csb-word', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.08,
        ease: 'power2.out',
        duration: 1
      });

      // Scene 3 Visuals - Grid aligning and snapping cube vertices into place
      // Misaligned initial state for cube and vertices
      gsap.set(cubeWireframe.current, { rotation: 15, scale: 0.85, x: 12, y: -10 });
      gsap.set(vertexPoints.current, { 
        x: (i) => [10, -8, 12, -15, 6, -11, 14, -7][i] || 0,
        y: (i) => [-8, 12, -14, 8, -12, 10, -5, 11][i] || 0,
        autoAlpha: 0.4
      });

      // Scroll makes grid glow, lines align, and vertices snap to (0,0) offset
      masterTl.to('.csb-grid-line', {
        stroke: '#4f46e5',
        opacity: 0.45,
        duration: 0.8
      }, '-=0.6');

      masterTl.to(cubeWireframe.current, {
        rotation: 0,
        scale: 1,
        x: 0,
        y: 0,
        ease: 'elastic.out(1.2, 0.75)',
        duration: 1.4
      }, '-=0.3');

      masterTl.to(vertexPoints.current, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        fill: '#60a5fa',
        ease: 'elastic.out(1.2, 0.75)',
        duration: 1.4
      }, '<');

      // Flash glow on snapping perfect alignment
      masterTl.fromTo('.csb-pixel-flash',
        { scale: 0.2, autoAlpha: 0 },
        { scale: 1.8, autoAlpha: 0.8, duration: 0.4, ease: 'power2.out' },
        '-=0.8'
      );
      masterTl.to('.csb-pixel-flash', { autoAlpha: 0, duration: 0.3 });

      // Transition Scene 3 -> Scene 4
      masterTl.to('.csb-scene-3', { autoAlpha: 0, scale: 0.92, filter: 'blur(10px)', duration: 0.8 })
        .to('.csb-scene-4', { autoAlpha: 1, scale: 1, duration: 0.8 }, '-=0.4');

      // Scene 4 Text Reveal
      masterTl.to('.csb-scene-4 .csb-word', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.08,
        ease: 'power2.out',
        duration: 1
      });

      // Scene 4 Visuals - Fading in hobbies (Camera, Controller, Cat) sequentially
      masterTl.fromTo('.csb-hobby-item',
        { autoAlpha: 0, scale: 0.7, y: 30 },
        { autoAlpha: 1, scale: 1, y: 0, stagger: 0.25, ease: 'back.out(1.7)', duration: 1.2 },
        '-=0.8'
      );

      // Final pause to appreciate
      masterTl.to({}, { duration: 1.2 });

      // Recalculate ScrollTrigger measurements
      ScrollTrigger.refresh();

    }, sectionRef);

    // Give a minor delay to let the browser paint the DOM changes before recalculating scroll positions
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimer);
    };
  }, [scrollContainerRef]);

  return (
    <section id="about" className="csb-section" ref={sectionRef}>
      <div className="csb-stage" ref={containerRef}>
        
        {/* SCENE 1: Creative Spirit */}
        <div className="csb-scene csb-scene-1">
          <div className="csb-content-grid">
            <div className="csb-text-column">
              <span className="csb-eyebrow">01 / Creative Philosophy</span>
              <h2 className="csb-heading">
                {["Exploring", "all", "sides", "of"].map((word, i) => (
                  <span key={i} className="csb-word">{word}&nbsp;</span>
                ))}
                <span className="csb-word csb-highlight">creativity.</span>
              </h2>
              <p className="csb-desc csb-word">
                Hi, I'm Tomi. What started as self-taught video editing has evolved into a multi-dimensional journey across the fields of design.
              </p>
            </div>
            
            <div className="csb-visual-column">
              <div className="csb-canvas-box">
                <svg className="csb-spark-svg" viewBox="0 0 400 400">
                  <defs>
                    <linearGradient id="sparkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="sparkGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Decorative glowing orbits */}
                  <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <circle cx="200" cy="200" r="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  
                  {/* Animated path */}
                  <circle 
                    ref={sparkCircle1}
                    cx="200" cy="200" r="135" 
                    fill="none" 
                    stroke="url(#sparkGrad1)" 
                    strokeWidth="3.5" 
                    strokeDasharray="400 200"
                    filter="url(#glow)"
                    transform-origin="200 200"
                  />
                  <circle 
                    ref={sparkCircle2}
                    cx="200" cy="200" r="85" 
                    fill="none" 
                    stroke="url(#sparkGrad2)" 
                    strokeWidth="2.5" 
                    strokeDasharray="250 150"
                    filter="url(#glow)"
                    transform-origin="200 200"
                  />
                  
                  {/* Center glowing core */}
                  <circle cx="200" cy="200" r="15" fill="#a78bfa" filter="url(#glow)" className="csb-core-pulse" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* SCENE 2: The Skillset */}
        <div className="csb-scene csb-scene-2">
          <div className="csb-content-grid">
            <div className="csb-text-column">
              <span className="csb-eyebrow">02 / Skill Spectrum</span>
              <h2 className="csb-heading">
                {["A", "versatile", "skillset", "across"].map((word, i) => (
                  <span key={i} className="csb-word">{word}&nbsp;</span>
                ))}
                <span className="csb-word csb-highlight">mediums.</span>
              </h2>
              <p className="csb-desc csb-word">
                Visual engineering requires different tools for different moments. I bridge the gaps between motion, dimension, and viewport.
              </p>
            </div>
            
            <div className="csb-visual-column">
              <div className="csb-badge-grid">
                <div className="csb-badge csb-badge-3d">
                  <span className="csb-badge-icon">⬡</span>
                  <h3>3D Design</h3>
                  <p>Maya / Cinema 4D / Blender</p>
                </div>
                <div className="csb-badge csb-badge-motion">
                  <span className="csb-badge-icon">✦</span>
                  <h3>Motion</h3>
                  <p>After Effects / Premiere</p>
                </div>
                <div className="csb-badge csb-badge-vfx">
                  <span className="csb-badge-icon">⚙</span>
                  <h3>VFX</h3>
                  <p>Nuke / Substance Painter</p>
                </div>
                <div className="csb-badge csb-badge-ui">
                  <span className="csb-badge-icon">▢</span>
                  <h3>UI & Web</h3>
                  <p>Figma / Frontend Dev</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCENE 3: Perfectionist (Grid Snapping) */}
        <div className="csb-scene csb-scene-3">
          <div className="csb-content-grid">
            <div className="csb-text-column">
              <span className="csb-eyebrow">03 / Production Standards</span>
              <h2 className="csb-heading">
                {["Obsessing", "over", "pixel-perfect"].map((word, i) => (
                  <span key={i} className="csb-word">{word}&nbsp;</span>
                ))}
                <span className="csb-word csb-highlight">details.</span>
              </h2>
              <p className="csb-desc csb-word">
                Favoring clean aesthetics, balanced composition, and precise spacing to create digital products that feel premium and robust.
              </p>
            </div>
            
            <div className="csb-visual-column">
              <div className="csb-canvas-box">
                <svg className="csb-grid-svg" viewBox="0 0 400 400">
                  <defs>
                    <pattern id="dotPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.12)" />
                    </pattern>
                  </defs>
                  
                  {/* Grid dots background */}
                  <rect width="400" height="400" fill="url(#dotPattern)" />
                  
                  {/* Neon laser crosshairs (aligning) */}
                  <line className="csb-grid-line" x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                  <line className="csb-grid-line" x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(79, 70, 229, 0.15)" strokeWidth="1" />
                  
                  {/* Pinned visual flash */}
                  <circle className="csb-pixel-flash" cx="200" cy="200" r="50" fill="none" stroke="#6366f1" strokeWidth="2.5" filter="url(#glow)" />
                  
                  {/* Wireframe shape which snaps on scroll */}
                  <g ref={cubeWireframe} transform-origin="200 200">
                    {/* Front Face */}
                    <rect x="130" y="130" width="140" height="140" fill="none" stroke="#a5b4fc" strokeWidth="2" opacity="0.8" />
                    {/* Back Face */}
                    <rect x="160" y="100" width="140" height="140" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.4" />
                    {/* Connecting corner lines */}
                    <line x1="130" y1="130" x2="160" y2="100" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                    <line x1="270" y1="130" x2="300" y2="100" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                    <line x1="130" y1="270" x2="160" y2="240" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                    <line x1="270" y1="270" x2="300" y2="240" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                  </g>

                  {/* Corner Vertex Snappers */}
                  <circle ref={el => vertexPoints.current[0] = el} cx="130" cy="130" r="5" fill="#f43f5e" transform-origin="130 130" />
                  <circle ref={el => vertexPoints.current[1] = el} cx="270" cy="130" r="5" fill="#f43f5e" transform-origin="270 130" />
                  <circle ref={el => vertexPoints.current[2] = el} cx="270" cy="270" r="5" fill="#f43f5e" transform-origin="270 270" />
                  <circle ref={el => vertexPoints.current[3] = el} cx="130" cy="270" r="5" fill="#f43f5e" transform-origin="130 270" />
                  
                  <circle ref={el => vertexPoints.current[4] = el} cx="160" cy="100" r="4" fill="#a855f7" transform-origin="160 100" />
                  <circle ref={el => vertexPoints.current[5] = el} cx="300" cy="100" r="4" fill="#a855f7" transform-origin="300 100" />
                  <circle ref={el => vertexPoints.current[6] = el} cx="300" cy="240" r="4" fill="#a855f7" transform-origin="300 240" />
                  <circle ref={el => vertexPoints.current[7] = el} cx="160" cy="240" r="4" fill="#a855f7" transform-origin="160 240" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* SCENE 4: Off-duty / Hobbies */}
        <div className="csb-scene csb-scene-4">
          <div className="csb-content-grid">
            <div className="csb-text-column">
              <span className="csb-eyebrow">04 / Behind the Screens</span>
              <h2 className="csb-heading">
                {["Off-duty", "hobbies", "and"].map((word, i) => (
                  <span key={i} className="csb-word">{word}&nbsp;</span>
                ))}
                <span className="csb-word csb-highlight">companionship.</span>
              </h2>
              <p className="csb-desc csb-word">
                When I close my editor, you can find me taking analog/digital photos, gaming with friends, or sharing my desk with my cats.
              </p>
            </div>
            
            <div className="csb-visual-column">
              <div className="csb-hobbies-container">
                {/* Camera Card */}
                <div className="csb-hobby-item csb-hobby-camera">
                  <svg viewBox="0 0 64 64" className="csb-hobby-svg">
                    <circle cx="32" cy="36" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M50 20H44L40 14H24L20 20H14C10.7 20 8 22.7 8 26V48C8 51.3 10.7 54 14 54H50C53.3 54 56 51.3 56 48V26C56 22.7 53.3 20 50 20Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                    <circle cx="48" cy="27" r="2.5" fill="currentColor" />
                  </svg>
                  <span>Photography</span>
                </div>
                
                {/* Gamepad Card */}
                <div className="csb-hobby-item csb-hobby-gaming">
                  <svg viewBox="0 0 64 64" className="csb-hobby-svg">
                    <rect x="8" y="18" width="48" height="30" rx="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    {/* D-Pad */}
                    <path d="M18 33H26M22 29V37" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Buttons */}
                    <circle cx="41" cy="30" r="2" fill="currentColor" />
                    <circle cx="46" cy="35" r="2" fill="currentColor" />
                  </svg>
                  <span>Gaming</span>
                </div>

                {/* Cat Card */}
                <div className="csb-hobby-item csb-hobby-cat">
                  <svg viewBox="0 0 64 64" className="csb-hobby-svg">
                    {/* Cozy sleeping cat silhouette */}
                    <path d="M46,46 C46,51 38,52 32,52 C23,52 16,46 16,36 C16,28 22,24 28,24 C30,24 32,25 34,26 C35.5,22 38,20 41,20 C45,20 48,24 47,30 C49.5,31 51,33.5 51,37 C51,41.5 48.5,45.5 46,46 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Ears */}
                    <path d="M28,24 L25,17 L21,21 Z" fill="currentColor" />
                    <path d="M34,26 L38,18 L41,22 Z" fill="currentColor" />
                    {/* Wagging Tail tail-path animation */}
                    <path className="csb-cat-tail" d="M47,44 C53,44 57,39 57,30 C57,26 55,25 53,27" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>My Cats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default CreativeScrollBio;
