import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './ParticleOrb.css';

const ParticleOrb = ({ onBack }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isSplitState, setIsSplitState] = useState(false);

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
    const splitDirections = new Float32Array(particleCount);

    const color1 = new THREE.Color('#00f2fe'); // Neon blue-cyan
    const color2 = new THREE.Color('#4facfe'); // Electric cyan
    const color3 = new THREE.Color('#00ffd5'); // Luminous neon teal

    for (let i = 0; i < particleCount; i++) {
      const isCore = i < 4500; // 4500 core particles (highly dense), 2500 outer shell (sparse)

      let r, theta, phi;
      if (isCore) {
        // Inner sphere: dense distribution with latitude bands
        r = 0.44 * Math.pow(Math.random(), 0.7); // radius up to 0.44
        theta = Math.random() * Math.PI * 2;
        
        // Latitude bands
        const bands = 14;
        const bandIndex = Math.floor(Math.random() * bands);
        phi = (bandIndex / (bands - 1)) * Math.PI;
        phi += (Math.random() - 0.5) * 0.022; // slight organic noise
      } else {
        // Outer sphere: sparse distribution with latitude bands
        r = 0.85 + Math.random() * 0.55; // radius from 0.85 to 1.4
        theta = Math.random() * Math.PI * 2;
        
        // Outer bands
        const bandsOuter = 16;
        const bandIndexOuter = Math.floor(Math.random() * bandsOuter);
        phi = (bandIndexOuter / (bandsOuter - 1)) * Math.PI;
        phi += (Math.random() - 0.5) * 0.032;
      }

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation: Unified glowing electric cyan scheme for both layers
      const rand = Math.random();
      const chosenColor = rand < 0.35 ? color1 : rand < 0.7 ? color2 : color3;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      // Size distribution: Core slightly larger, Outer smaller/floating
      sizes[i] = isCore ? (0.55 + Math.random() * 0.55) : (0.4 + Math.random() * 0.4);

      // Alternate division direction: half of particles go left (-1.0), half go right (1.0)
      splitDirections[i] = i % 2 === 0 ? -1.0 : 1.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aSplitDirection', new THREE.BufferAttribute(splitDirections, 1));

    // --- Custom Shader Material ---
    const vertexShader = `
      uniform float uTime;
      uniform vec3 uMousePos;
      uniform float uHoverRadius;
      uniform float uHoverStrength;
      uniform float uSplitProgress;
      uniform float uShakeAmount;
      uniform vec3 uOrbPosA;
      uniform vec3 uOrbPosB;
      attribute float aSize;
      attribute float aSplitDirection;
      varying vec3 vColor;

      void main() {
        vColor = color;
        vec3 pos = position;

        // 1. Individual orb rotation (around its own local center before translation)
        float rotY = uTime * 0.25;
        float rotX = uTime * 0.15;
        
        float cosY = cos(rotY);
        float sinY = sin(rotY);
        mat3 rotMatY = mat3(
          cosY, 0.0, sinY,
          0.0,  1.0, 0.0,
          -sinY, 0.0, cosY
        );
        
        float cosX = cos(rotX);
        float sinX = sin(rotX);
        mat3 rotMatX = mat3(
          1.0, 0.0,  0.0,
          0.0, cosX, -sinX,
          0.0, sinX,  cosX
        );
        
        pos = rotMatY * rotMatX * pos;

        // 2. Shake vibration feedback
        if (uShakeAmount > 0.05) {
          float shakeTime = uTime * 45.0;
          pos.x += sin(shakeTime + position.y * 20.0) * 0.03 * uShakeAmount;
          pos.y += cos(shakeTime * 1.1 + position.z * 20.0) * 0.03 * uShakeAmount;
          pos.z += sin(shakeTime * 0.9 + position.x * 20.0) * 0.03 * uShakeAmount;
        }

        // 3. Idle floating noise (subtle wave movement)
        pos.x += sin(uTime * 0.8 + position.y * 2.0) * 0.04;
        pos.y += cos(uTime * 0.7 + position.z * 2.0) * 0.04;
        pos.z += sin(uTime * 0.9 + position.x * 2.0) * 0.04;

        // 4. Translate particles to their respective sub-orb centers (A or B)
        float dir = aSplitDirection;
        vec3 centerPos = (dir < 0.0) ? uOrbPosA : uOrbPosB;
        pos += centerPos;

        // 5. Liquidy Split Mitosis (neck/bridge effect between centers)
        if (uSplitProgress > 0.0) {
          vec3 midPoint = (uOrbPosA + uOrbPosB) * 0.5;
          vec3 pullDir = midPoint - pos;
          
          // bridgeFactor: particles close to the midpoint connection line are pulled
          float bridgeFactor = exp(-pow(pos.y - midPoint.y, 2.0) * 2.0 - pow(pos.z - midPoint.z, 2.0) * 2.0);
          
          if (uSplitProgress < 0.7) {
            float snapCurve = 1.0 - (uSplitProgress / 0.7);
            pos += pullDir * bridgeFactor * 0.5 * snapCurve;
          }
          
          // Fluid wobble during division
          float divisionWobble = sin(uTime * 15.0 + pos.y * 12.0) * 0.06 * sin(uSplitProgress * 3.1415);
          pos.y += divisionWobble;
          pos.x += divisionWobble * 0.5;
        }

        // 6. Cursor repulsion interaction (in world space)
        float dist = distance(pos, uMousePos);
        if (dist < uHoverRadius) {
          vec3 dirVec = pos - uMousePos;
          float len = length(dirVec);
          if (len > 0.0) {
            dirVec = dirVec / len;
          } else {
            dirVec = vec3(0.0, 1.0, 0.0);
          }

          float force = 1.0 - (dist / uHoverRadius);
          vec3 swirl = vec3(-dirVec.y, dirVec.x, sin(uTime + pos.x) * 0.2);
          pos += (dirVec * 0.6 + swirl * 0.2) * force * uHoverStrength;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation based on depth
        gl_PointSize = aSize * (100.0 / -mvPosition.z);
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
      uSplitProgress: { value: 0 },
      uShakeAmount: { value: 0 },
      uOrbPosA: { value: new THREE.Vector3(0, 0, 0) },
      uOrbPosB: { value: new THREE.Vector3(0, 0, 0) },
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
    const prevMouse3D = new THREE.Vector3(0, 0, 0);

    // Orb positional tracking
    const currentOrbPos = new THREE.Vector3(0, 0, 0);      // Merged current position
    const targetOrbPos = new THREE.Vector3(0, 0, 0);       // Merged target position
    const currentOrbPosA = new THREE.Vector3(0, 0, 0);     // Sub-orb A current position
    const targetOrbPosA = new THREE.Vector3(0, 0, 0);      // Sub-orb A target position
    const currentOrbPosB = new THREE.Vector3(0, 0, 0);     // Sub-orb B current position
    const targetOrbPosB = new THREE.Vector3(0, 0, 0);      // Sub-orb B target position
    
    const restOffset = new THREE.Vector3(0, 0, 0);

    let isMouseOver = false;
    let hoverStrength = 0;
    let isDragging = false;
    let dragTarget = 'merged'; // 'merged', 'A', or 'B'
    let shakeScore = 0;
    let isSplit = false;
    let splitProgress = 0;
    let splitTimer = 0;
    let shakeAmount = 0;

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

      // In world space calculation, mouse coordinate is just the global 3D mouse pos
      uniforms.uMousePos.value.copy(worldMouse);

      if (isDragging) {
        if (dragTarget === 'A') {
          targetOrbPosA.copy(worldMouse);
        } else if (dragTarget === 'B') {
          targetOrbPosB.copy(worldMouse);
        } else {
          targetOrbPos.copy(worldMouse);
        }
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
      
      if (isSplit) {
        // Hit-test sub-orbs A and B
        const distA = worldMouse.distanceTo(currentOrbPosA);
        const distB = worldMouse.distanceTo(currentOrbPosB);
        
        if (distA < 1.4 && distA <= distB) {
          isDragging = true;
          setIsGrabbing(true);
          dragTarget = 'A';
          targetOrbPosA.copy(worldMouse);
        } else if (distB < 1.4) {
          isDragging = true;
          setIsGrabbing(true);
          dragTarget = 'B';
          targetOrbPosB.copy(worldMouse);
        }
      } else {
        // Hit-test merged orb
        const distMerged = worldMouse.distanceTo(currentOrbPos);
        if (distMerged < 1.6) {
          isDragging = true;
          setIsGrabbing(true);
          dragTarget = 'merged';
          targetOrbPos.copy(worldMouse);
        }
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

      uniforms.uMousePos.value.copy(worldMouse);

      if (isDragging) {
        if (dragTarget === 'A') {
          targetOrbPosA.copy(worldMouse);
        } else if (dragTarget === 'B') {
          targetOrbPosB.copy(worldMouse);
        } else {
          targetOrbPos.copy(worldMouse);
        }
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 0) return;
      isMouseOver = true;
      const touch = e.touches[0];
      const worldMouse = projectMouseToZ0(touch.clientX, touch.clientY);
      
      if (isSplit) {
        const distA = worldMouse.distanceTo(currentOrbPosA);
        const distB = worldMouse.distanceTo(currentOrbPosB);
        
        if (distA < 1.4 && distA <= distB) {
          isDragging = true;
          setIsGrabbing(true);
          dragTarget = 'A';
          targetOrbPosA.copy(worldMouse);
          e.preventDefault();
        } else if (distB < 1.4) {
          isDragging = true;
          setIsGrabbing(true);
          dragTarget = 'B';
          targetOrbPosB.copy(worldMouse);
          e.preventDefault();
        }
      } else {
        const distMerged = worldMouse.distanceTo(currentOrbPos);
        if (distMerged < 1.6) {
          isDragging = true;
          setIsGrabbing(true);
          dragTarget = 'merged';
          targetOrbPos.copy(worldMouse);
          e.preventDefault();
        }
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

      // Subtle float oscillations & dragging positions
      if (isSplit) {
        // Orb A update
        if (isDragging && dragTarget === 'A') {
          currentOrbPosA.lerp(targetOrbPosA, 0.1);
        } else {
          const floatA = new THREE.Vector3(
            Math.sin(elapsedTime * 0.8) * 0.08,
            Math.cos(elapsedTime * 0.6) * 0.08,
            0
          );
          currentOrbPosA.lerp(targetOrbPosA.clone().add(floatA), 0.05);
        }

        // Orb B update
        if (isDragging && dragTarget === 'B') {
          currentOrbPosB.lerp(targetOrbPosB, 0.1);
        } else {
          const floatB = new THREE.Vector3(
            Math.sin(elapsedTime * 0.9 + 2.0) * 0.08,
            Math.cos(elapsedTime * 0.7 + 2.0) * 0.08,
            0
          );
          currentOrbPosB.lerp(targetOrbPosB.clone().add(floatB), 0.05);
        }

        // Collision Check: merge back together when brought on top of each other
        // Only run collision check when split is fully completed (splitProgress > 0.95)
        const distanceBetweenSubOrbs = currentOrbPosA.distanceTo(currentOrbPosB);
        if (distanceBetweenSubOrbs < 0.95 && splitProgress > 0.95) {
          isSplit = false;
          setIsSplitState(false);
          
          // Midpoint of collision becomes new target for merged state
          targetOrbPos.addVectors(currentOrbPosA, currentOrbPosB).multiplyScalar(0.5);
          currentOrbPos.copy(targetOrbPos);
        }
      } else {
        // Merged state updates
        if (isDragging && dragTarget === 'merged') {
          currentOrbPos.lerp(targetOrbPos, 0.1);
        } else {
          const floatMerged = new THREE.Vector3(
            Math.sin(elapsedTime * 0.8) * 0.12,
            Math.cos(elapsedTime * 0.6) * 0.12,
            0
          );
          currentOrbPos.lerp(targetOrbPos.clone().add(floatMerged), 0.05);
        }

        // Converge A and B back to the merged position
        currentOrbPosA.lerp(currentOrbPos, 0.08);
        currentOrbPosB.lerp(currentOrbPos, 0.08);
        
        targetOrbPosA.copy(currentOrbPosA);
        targetOrbPosB.copy(currentOrbPosB);
      }

      // Sync uniforms with coordinates
      uniforms.uOrbPosA.value.copy(currentOrbPosA);
      uniforms.uOrbPosB.value.copy(currentOrbPosB);

      // Track drag velocity in animate loop for shake-to-split trigger
      let mouseVelocity = 0;
      if (isDragging && isMouseOver) {
        mouseVelocity = mouse3D.distanceTo(prevMouse3D);
        
        // Fast mouse coordinate displacements boost the shakeScore (only in merged state)
        if (mouseVelocity > 0.07 && !isSplit) {
          shakeScore += mouseVelocity * 1.6;
        } else {
          shakeScore -= 0.12;
        }
      } else {
        shakeScore -= 0.2;
      }
      shakeScore = Math.max(0, Math.min(10, shakeScore));
      prevMouse3D.copy(mouse3D);

      // Animate uniform shake amount for shader jitter
      const targetShake = (isDragging && !isSplit) ? Math.min(shakeScore / 6.5, 1.0) : 0.0;
      shakeAmount += (targetShake - shakeAmount) * 0.15;
      uniforms.uShakeAmount.value = shakeAmount;

      // Split trigger (vigorously shaking builds score to threshold of 6.5)
      if (shakeScore > 6.5 && !isSplit) {
        isSplit = true;
        setIsSplitState(true);
        splitTimer = elapsedTime;
        
        // Initialize sub-orb coordinates with left/right spawn offset
        targetOrbPosA.copy(currentOrbPos).add(new THREE.Vector3(-0.9, 0, 0));
        targetOrbPosB.copy(currentOrbPos).add(new THREE.Vector3(0.9, 0, 0));
      }

      // Animate mitosis split progress
      if (isSplit) {
        splitProgress += (1.0 - splitProgress) * 0.06;
      } else {
        splitProgress += (0.0 - splitProgress) * 0.06;
      }
      uniforms.uSplitProgress.value = splitProgress;

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
        <p className="orb-label-top" style={{ color: isSplitState ? '#b800ff' : '#00aaff', textShadow: isSplitState ? '0 0 10px rgba(184, 0, 255, 0.4)' : '0 0 10px rgba(0, 170, 255, 0.4)' }}>
          {isSplitState ? "MITOSIS COMPLETE" : "INTERACTIVE EXPLORATION"}
        </p>
        <h1 className="orb-title-main">{isSplitState ? "DUAL CELLS" : "PARTICLE ORB"}</h1>
        <p className="orb-help-text">
          {isSplitState 
            ? "Drag each cell individually • Bring them together to merge them back" 
            : "Grab and shake the orb vigorously to split it in two"}
        </p>
      </div>

      <canvas ref={canvasRef} className="particle-orb-canvas" />
    </div>
  );
};

export default ParticleOrb;
