import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './ParticleOrb.css';

const ParticleOrb = ({ onBack }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // --- Scene Setup ---
    const width = containerRef.current.clientWidth || window.innerWidth || 800;
    const height = containerRef.current.clientHeight || window.innerHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8.5; // Moved camera further back to make the orb smaller on screen

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Particles Data Generation ---
    const particleCount = 7000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorCore1 = new THREE.Color('#ff4500'); // Red-Orange
    const colorCore2 = new THREE.Color('#ff7a00'); // Orange
    const colorCore3 = new THREE.Color('#ffaa00'); // Yellow-Orange

    const colorOuter1 = new THREE.Color('#00ff66'); // Neon Green
    const colorOuter2 = new THREE.Color('#00ffcc'); // Teal Green
    const colorOuter3 = new THREE.Color('#39ff14'); // Lime Green

    for (let i = 0; i < particleCount; i++) {
      const isCore = i < 2200; // 2200 core particles, 4800 outer shell

      let r, theta, phi;
      if (isCore) {
        // High density cluster close to center (smaller radius)
        r = Math.pow(Math.random(), 2.5) * 0.45;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos((Math.random() * 2) - 1);
      } else {
        // Lower density floating shell (smaller radius)
        r = 0.55 + Math.random() * 0.95;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos((Math.random() * 2) - 1);
      }

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation
      let chosenColor;
      if (isCore) {
        const rand = Math.random();
        chosenColor = rand < 0.3 ? colorCore1 : rand < 0.75 ? colorCore2 : colorCore3;
      } else {
        const rand = Math.random();
        chosenColor = rand < 0.4 ? colorOuter1 : rand < 0.8 ? colorOuter2 : colorOuter3;
      }

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      // Size distribution (Core slightly larger/dense, Outer smaller/floating) - Significantly smaller particles
      sizes[i] = isCore ? (0.6 + Math.random() * 0.8) : (0.4 + Math.random() * 0.6);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // --- Custom Shader Material ---
    const vertexShader = `
      uniform float uTime;
      uniform vec3 uMousePos;
      uniform float uHoverRadius;
      uniform float uHoverStrength;
      attribute float aSize;
      varying vec3 vColor;
      varying float vDistanceToMouse;

      void main() {
        vColor = color;
        vec3 pos = position;

        // 1. Idle floating noise (subtle wave movement)
        pos.x += sin(uTime * 0.8 + position.y * 2.0) * 0.04;
        pos.y += cos(uTime * 0.7 + position.z * 2.0) * 0.04;
        pos.z += sin(uTime * 0.9 + position.x * 2.0) * 0.04;

        // 2. Cursor repulsion interaction
        float dist = distance(pos, uMousePos);
        vDistanceToMouse = dist;
        if (dist < uHoverRadius) {
          vec3 dir = pos - uMousePos;
          float len = length(dir);
          if (len > 0.0) {
            dir = dir / len;
          } else {
            dir = vec3(0.0, 1.0, 0.0);
          }

          // Push factor: 1.0 at hover point, 0.0 at hover boundary
          float force = 1.0 - (dist / uHoverRadius);
          
          // Displacement: outward repulsion + slight swirl/spin
          vec3 swirl = vec3(-dir.y, dir.x, sin(uTime + pos.x) * 0.2);
          pos += (dir * 0.8 + swirl * 0.3) * force * uHoverStrength;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation based on depth
        gl_PointSize = aSize * (100.0 / -mvPosition.z); // Reduced multiplier for smaller, finer particles
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;

      void main() {
        // Render round glowing points
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) {
          discard;
        }

        // Soft edges glow falloff
        float glow = smoothstep(0.5, 0.0, dist);
        
        // Intensity booster at the center of the particle
        float intensity = pow(glow, 2.0) * 1.6;

        gl_FragColor = vec4(vColor, intensity);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMousePos: { value: new THREE.Vector3(999, 999, 999) },
      uHoverRadius: { value: 1.3 }, // Reduced hover radius to match smaller scale
      uHoverStrength: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // --- Interaction Physics Variables ---
    const mouse2D = new THREE.Vector2(-999, -999);
    const mouse3D = new THREE.Vector3(999, 999, 999);
    const targetOrbPos = new THREE.Vector3(0, 0, 0);
    const currentOrbPos = new THREE.Vector3(0, 0, 0);
    const restOffset = new THREE.Vector3(0, 0, 0);

    let isMouseOver = false;
    let hoverStrength = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Helper: Project 2D coordinates to 3D world space on the Z=0 plane
    const projectMouseToZ0 = (clientX, clientY) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      mouse2D.set(x, y);

      const tempV = new THREE.Vector3(x, y, 0.5);
      tempV.unproject(camera);
      const dir = tempV.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    };

    // --- Event Listeners ---
    const handleMouseMove = (e) => {
      isMouseOver = true;
      const worldMouse = projectMouseToZ0(e.clientX, e.clientY);
      mouse3D.copy(worldMouse);

      // Convert global 3D mouse coordinate to local coordinates relative to the particle system
      const localMouse = particleSystem.worldToLocal(worldMouse.clone());
      uniforms.uMousePos.value.copy(localMouse);

      if (isDragging) {
        // Update the target drag coordinate
        targetOrbPos.copy(worldMouse);
      }
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
      if (!isDragging) {
        uniforms.uMousePos.value.set(999, 999, 999);
      }
    };

    const handleMouseDown = (e) => {
      const worldMouse = projectMouseToZ0(e.clientX, e.clientY);
      
      // Check if user clicked within the bounds of the particle system (approx radius ~2.5)
      const distanceToCenter = worldMouse.distanceTo(particleSystem.position);
      if (distanceToCenter < 2.5) {
        isDragging = true;
        setIsGrabbing(true);
        targetOrbPos.copy(worldMouse);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        setIsGrabbing(false);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 0) return;
      isMouseOver = true;
      const touch = e.touches[0];
      const worldMouse = projectMouseToZ0(touch.clientX, touch.clientY);
      mouse3D.copy(worldMouse);

      const localMouse = particleSystem.worldToLocal(worldMouse.clone());
      uniforms.uMousePos.value.copy(localMouse);

      if (isDragging) {
        targetOrbPos.copy(worldMouse);
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 0) return;
      isMouseOver = true;
      const touch = e.touches[0];
      const worldMouse = projectMouseToZ0(touch.clientX, touch.clientY);
      
      const distanceToCenter = worldMouse.distanceTo(particleSystem.position);
      if (distanceToCenter < 2.5) {
        isDragging = true;
        setIsGrabbing(true);
        targetOrbPos.copy(worldMouse);
        // Prevent scrolling on touch devices during drag
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      setIsGrabbing(false);
      uniforms.uMousePos.value.set(999, 999, 999);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      uniforms.uTime.value = elapsedTime;

      // Animate hover reaction strength (fade in/out smoothly)
      const targetStrength = isMouseOver ? 1.0 : 0.0;
      hoverStrength += (targetStrength - hoverStrength) * 0.1;
      uniforms.uHoverStrength.value = hoverStrength;

      // Subtle float oscillation when not dragged
      if (!isDragging) {
        restOffset.x = Math.sin(elapsedTime * 0.8) * 0.15;
        restOffset.y = Math.cos(elapsedTime * 0.6) * 0.15;
        
        // Glide towards resting offset position
        const restTarget = targetOrbPos.clone().add(restOffset);
        particleSystem.position.lerp(restTarget, 0.05);
      } else {
        // Follow the mouse directly with inertial lag
        particleSystem.position.lerp(targetOrbPos, 0.1);
      }

      // Smoothly rotate points over time
      particleSystem.rotation.y += 0.003;
      particleSystem.rotation.x += 0.001;

      // Rotate extra based on movement velocity (drag lag rotation)
      const diffX = particleSystem.position.x - currentOrbPos.x;
      const diffY = particleSystem.position.y - currentOrbPos.y;
      particleSystem.rotation.y += diffX * 0.08;
      particleSystem.rotation.x -= diffY * 0.08;

      currentOrbPos.copy(particleSystem.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className={`particle-orb-container ${isGrabbing ? 'grabbing' : 'grab'}`} 
      ref={containerRef}
    >
      {onBack && (
        <button className="particle-orb-back" onClick={onBack} aria-label="Go back">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          Back
        </button>
      )}
      
      <div className="particle-orb-instructions">
        <p className="orb-label-top">INTERACTIVE EXPLORATION</p>
        <h1 className="orb-title-main">PARTICLE ORB</h1>
        <p className="orb-help-text">Hover to displace particles • Click & hold to drag the core around</p>
      </div>

      <canvas ref={canvasRef} className="particle-orb-canvas" />
    </div>
  );
};

export default ParticleOrb;
