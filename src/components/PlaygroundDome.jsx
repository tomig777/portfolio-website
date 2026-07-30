import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import logoDark from '../assets/logo-dark.png';
import { GALLERY_IMAGE_URLS, preparePlaygroundGallery } from '../utils/galleryAssets';
import './PlaygroundDome.css';

const MOSAIC_PATTERN = [
  { x: 0, y: 0, width: 17, height: 22, category: 'portrait' },
  { x: 17, y: 0, width: 11, height: 11, category: 'square' },
  { x: 17, y: 11, width: 11, height: 11, category: 'square' },
  { x: 28, y: 0, width: 176 / 9, height: 11, category: 'landscape' },
  { x: 28, y: 11, width: 176 / 9, height: 11, category: 'landscape' }
];
const MOSAIC_BLOCK_WIDTH = 28 + 176 / 9;
const MOSAIC_BLOCK_HEIGHT = 22;


function createMosaicLayout(width, height, galleryImages) {
  const mosaicUnit = width < 600 ? 9 : 14;
  const desiredWidth = width * 1.35;
  const desiredHeight = height * 1.35;
  const categoryCounts = galleryImages.reduce((counts, image) => {
    counts[image.category] += 1;
    return counts;
  }, { square: 0, portrait: 0, landscape: 0 });
  const minimumBlocks = Math.max(
    1,
    Math.ceil(categoryCounts.square / 2),
    categoryCounts.portrait,
    Math.ceil(categoryCounts.landscape / 2)
  );

  const blockWidth = MOSAIC_BLOCK_WIDTH * mosaicUnit;
  const blockHeight = MOSAIC_BLOCK_HEIGHT * mosaicUnit;
  const blockColumns = Math.max(1, Math.ceil(desiredWidth / blockWidth));
  let blockRows = Math.max(1, Math.ceil(desiredHeight / blockHeight));
  blockRows = Math.max(blockRows, Math.ceil(minimumBlocks / blockColumns));

  const cells = [];
  for (let blockRow = 0; blockRow < blockRows; blockRow += 1) {
    for (let blockColumn = 0; blockColumn < blockColumns; blockColumn += 1) {
      MOSAIC_PATTERN.forEach((tile) => {
        const mirrorX = (blockRow + blockColumn) % 2 === 1;
        const mirrorY = blockRow % 2 === 1;
        const tileX = mirrorX ? MOSAIC_BLOCK_WIDTH - tile.x - tile.width : tile.x;
        const tileY = mirrorY ? MOSAIC_BLOCK_HEIGHT - tile.y - tile.height : tile.y;
        cells.push({
          x: blockColumn * blockWidth + tileX * mosaicUnit,
          y: blockRow * blockHeight + tileY * mosaicUnit,
          w: tile.width * mosaicUnit,
          h: tile.height * mosaicUnit,
          category: tile.category
        });
      });
    }
  }

  return {
    cells,
    packW: blockColumns * blockWidth,
    packH: blockRows * blockHeight
  };
}

// Calculate cover offset & scale for image textures
function getTextureCover(aspectRatio, targetAspect) {
  if (aspectRatio > targetAspect) {
    const scale = targetAspect / aspectRatio;
    return { repeatX: scale, repeatY: 1, offsetX: (1 - scale) / 2, offsetY: 0 };
  } else {
    const scale = aspectRatio / targetAspect;
    return { repeatX: 1, repeatY: scale, offsetX: 0, offsetY: (1 - scale) / 2 };
  }
}

// Shaders for grid meshes
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 modelPosition = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      modelPosition = instanceMatrix * modelPosition;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * modelPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTex;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform float uHover;
  uniform float uFade;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    if (uHover > 0.001) {
      float zoom = uHover * 0.08;
      uv = (uv - 0.5) * (1.0 - zoom) + 0.5;
    }

    vec3 col = texture2D(uTex, uv * uRepeat + uOffset).rgb;

    gl_FragColor = vec4(col, uFade);
  }
`;

// Post processing dome fragment shader (implements fish-eye and radial speed blur)
const domeFragmentShader = `
  uniform sampler2D uScene;
  uniform float uStrength;
  uniform float uRadialBlur;
  varying vec2 vUv;

  #define PI 3.14159265359
  #define SAMPLES 6

  void main() {
    if (uStrength < 0.001 && uRadialBlur < 0.001) {
      gl_FragColor = texture2D(uScene, vUv);
      return;
    }

    // Fish-eye lens dome mapping
    vec2 c = vUv * 2.0 - 1.0;
    float r = length(c);
    float rSphere = mix(r, sin(r * PI * 0.5), uStrength * 0.75);
    vec2 uv = (r > 0.001) ? (c / r * rSphere) * 0.5 + 0.5 : vUv;
    uv = clamp(uv, 0.0, 1.0);

    // The gentle automatic drift does not need a multi-sample blur pass.
    // Avoiding six identical texture reads here keeps the idle gallery smooth.
    if (uRadialBlur < 0.001) {
      gl_FragColor = texture2D(uScene, uv);
      return;
    }

    // Radial motion blur
    vec2 center = vec2(0.5);
    vec2 dir = uv - center;
    float dist = length(dir);
    float amt = dist * dist * uRadialBlur;
    
    vec4 acc = vec4(0.0);
    for (int i = 0; i < SAMPLES; i++) {
      float t = float(i) / float(SAMPLES - 1);
      acc += texture2D(uScene, uv - dir * t * amt);
    }
    gl_FragColor = acc / float(SAMPLES);
  }
`;

const postVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export default function PlaygroundDome({ onClose }) {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  
  // Stats states
  const [cellsCount, setCellsCount] = useState(0);
  const [switchesCount, setSwitchesCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    preparePlaygroundGallery().then((images) => {
      if (!isCancelled) setGalleryImages(images);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Lock parent page scrolling on mount, restore on unmount
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origHtmlOverflowY = document.documentElement.style.overflowY;
    const origBodyOverflow = document.body.style.overflow;
    const origBodyOverflowY = document.body.style.overflowY;

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overflowY = 'hidden';

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow || 'auto';
      document.documentElement.style.overflowY = origHtmlOverflowY || 'auto';
      document.body.style.overflow = origBodyOverflow || 'auto';
      document.body.style.overflowY = origBodyOverflowY || 'auto';
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !galleryImages?.length) return;

    setIsLoading(true);

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // 1. Setup Three.js Core
    const scene = new THREE.Scene();
    const fov = 45;
    // Set camera distance to match pixels to WebGL coordinate units
    const cameraZ = height / (2 * Math.tan((fov * Math.PI) / 360));
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, cameraZ * 2.5);
    camera.position.z = cameraZ;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mountRef.current = renderer.domElement;
    container.appendChild(renderer.domElement);

    // 2. Setup Post Processing Render Target
    let fbo = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const postMat = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: domeFragmentShader,
      uniforms: {
        uScene: { value: fbo.texture },
        uStrength: { value: 1.0 }, // default 1.0 to look like inside the dome
        uRadialBlur: { value: 0 }
      },
      depthWrite: false,
      depthTest: false
    });
    
    const postMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
    postScene.add(postMesh);

    // 3. Grid Tiling and Groups
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    // Ratio-aware mosaic: every image is assigned to a matching square,
    // portrait, or landscape tile in a tightly packed repeating pattern.
    const { cells: rawCells, packW, packH } = createMosaicLayout(width, height, galleryImages);
    const imagesByCategory = galleryImages.reduce((groups, image) => {
      groups[image.category].push(image);
      return groups;
    }, { square: [], portrait: [], landscape: [] });
    const categoryIndexes = { square: 0, portrait: 0, landscape: 0 };
    const placedImages = [];
    const cellSpacing = 20;
    const cellsAreNeighbors = (cellA, cellB) => {
      const centerAX = cellA.x + cellA.w / 2;
      const centerAY = cellA.y + cellA.h / 2;
      const centerBX = cellB.x + cellB.w / 2;
      const centerBY = cellB.y + cellB.h / 2;
      const rawDistanceX = Math.abs(centerAX - centerBX);
      const rawDistanceY = Math.abs(centerAY - centerBY);
      const distanceX = Math.min(rawDistanceX, packW - rawDistanceX);
      const distanceY = Math.min(rawDistanceY, packH - rawDistanceY);

      return (
        distanceX <= (cellA.w + cellB.w) / 2 + cellSpacing &&
        distanceY <= (cellA.h + cellB.h) / 2 + cellSpacing
      );
    };
    const getNextImage = (category, cell) => {
      const categoryImages = imagesByCategory[category].length
        ? imagesByCategory[category]
        : galleryImages;
      const startIndex = categoryIndexes[category] % categoryImages.length;
      let selectedImage = categoryImages[startIndex];
      let selectedIndex = startIndex;

      for (let offset = 0; offset < categoryImages.length; offset += 1) {
        const candidateIndex = (startIndex + offset) % categoryImages.length;
        const candidate = categoryImages[candidateIndex];
        const duplicatesNeighbor = placedImages.some((placement) => (
          placement.image.imageUrl === candidate.imageUrl &&
          cellsAreNeighbors(cell, placement.cell)
        ));

        if (!duplicatesNeighbor) {
          selectedImage = candidate;
          selectedIndex = candidateIndex;
          break;
        }
      }

      categoryIndexes[category] = selectedIndex + 1;
      placedImages.push({ image: selectedImage, cell });
      return selectedImage;
    };

    setCellsCount(rawCells.length);

    // Each artwork is decoded once and shared by every repeated tile that uses it.
    // Previously every tile created a separate GPU texture for the same source.
    const textureCache = new Map();
    galleryImages.forEach(({ imageUrl, image }) => {
      if (!image) return;
      const texture = new THREE.Texture(image);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      textureCache.set(imageUrl, texture);
    });

    const cells = [];
    const meshToCell = new Map();

    rawCells.forEach((c) => {
      const { imageUrl: url, aspectRatio: imageAspect } = getNextImage(c.category, c);
      const cover = getTextureCover(imageAspect, c.w / c.h);

      const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTex: { value: textureCache.get(url) || null },
          uRepeat: { value: new THREE.Vector2(cover.repeatX, cover.repeatY) },
          uOffset: { value: new THREE.Vector2(cover.offsetX, cover.offsetY) },
          uHover: { value: 0 },
          uFade: { value: 1.0 }
        },
        transparent: true
      });

      const spacingScale = Math.max(0.2, 1 - cellSpacing / Math.min(c.w, c.h));
      const cellW = c.w * spacingScale;
      const cellH = c.h * spacingScale;
      const geom = new THREE.PlaneGeometry(cellW, cellH);
      const posX = c.x + c.w / 2 - packW / 2;
      const posY = -(c.y + c.h / 2 - packH / 2);

      // One instanced draw replaces nine individual mesh draw calls while
      // preserving the center tile and its eight infinite-wrap replicas.
      const offsetsX = [-1, 0, 1];
      const offsetsY = [-1, 0, 1];
      const mesh = new THREE.InstancedMesh(geom, mat, offsetsX.length * offsetsY.length);
      const instanceTransform = new THREE.Object3D();
      let instanceIndex = 0;

      offsetsY.forEach(oy => {
        offsetsX.forEach(ox => {
          instanceTransform.position.set(posX + ox * packW, posY + oy * packH, 1);
          instanceTransform.updateMatrix();
          mesh.setMatrixAt(instanceIndex, instanceTransform.matrix);
          instanceIndex += 1;
        });
      });
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      gridGroup.add(mesh);

      const cellData = {
        mesh,
        mat,
        url,
        x: posX,
        y: posY,
        w: cellW,
        h: cellH,
        aspect: cellW / cellH,
        imageAspect
      };
      cells.push(cellData);
      meshToCell.set(mesh, cellData);
    });

    const raycastMeshes = cells.map((cell) => cell.mesh);

    // 4. Dragging, Scrolling & Raycasting Physics
    let scrollX = 0;
    let scrollY = 0;
    let targetX = 0;
    let targetY = 0;
    let velocity = 0;
    let isDragging = false;
    let autoScroll = true;

    // Expand view variables
    let isExpanded = false;
    let expandedCell = null;
    let expandedMesh = null;
    let expandedInstanceId = null;
    let expandedBackdrop = null;
    let expandedImageElement = null;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    let hoveredCell = null;
    const instanceMatrix = new THREE.Matrix4();
    const instanceWorldMatrix = new THREE.Matrix4();
    const worldPosition = new THREE.Vector3();
    const projectedPosition = new THREE.Vector3();

    const getMeshScreenRect = (mesh, cell, instanceId = 4) => {
      gridGroup.updateMatrixWorld(true);
      mesh.getMatrixAt(instanceId, instanceMatrix);
      instanceWorldMatrix.multiplyMatrices(mesh.matrixWorld, instanceMatrix);
      worldPosition.setFromMatrixPosition(instanceWorldMatrix);
      projectedPosition.copy(worldPosition).project(camera);
      const canvasRect = renderer.domElement.getBoundingClientRect();
      const perspectiveScale = camera.position.z / (camera.position.z - worldPosition.z);

      return {
        centerX: (projectedPosition.x * 0.5 + 0.5) * canvasRect.width,
        centerY: (-projectedPosition.y * 0.5 + 0.5) * canvasRect.height,
        width: cell.w * perspectiveScale,
        height: cell.h * perspectiveScale
      };
    };

    const removeExpandedElements = () => {
      expandedBackdrop?.remove();
      expandedImageElement?.remove();
      expandedBackdrop = null;
      expandedImageElement = null;
    };

    const setRaycastPointer = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const pointerX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const pointerY = -((clientY - rect.top) / rect.height) * 2 + 1;
      const radius = Math.hypot(pointerX, pointerY);
      const domeStrength = postMat.uniforms.uStrength.value * 0.75;

      if (radius < 0.001) {
        mouse.set(pointerX, pointerY);
        return;
      }

      // Match the exact screen-to-texture warp used by the dome fragment
      // shader so hover/click raycasts land on the artwork under the cursor.
      const sphereRadius = Math.sin(radius * Math.PI * 0.5);
      const warpedRadius = radius + (sphereRadius - radius) * domeStrength;
      const scale = warpedRadius / radius;
      mouse.set(
        THREE.MathUtils.clamp(pointerX * scale, -1, 1),
        THREE.MathUtils.clamp(pointerY * scale, -1, 1)
      );
    };

    const tweenCellHover = (cell, value) => {
      if (!cell) return;
      const hoverUniform = cell.mat.uniforms.uHover;
      gsap.killTweensOf(hoverUniform);
      gsap.to(hoverUniform, {
        value,
        duration: value ? 0.14 : 0.18,
        ease: 'power2.out',
        overwrite: true
      });
    };

    const clearHoveredCell = () => {
      if (hoveredCell) tweenCellHover(hoveredCell, 0);
      hoveredCell = null;
    };

    // Pointer events for dragging
    let startX = 0;
    let startY = 0;
    let startTargetX = 0;
    let startTargetY = 0;
    let hasDragged = false;
    let resumeAutoScrollTimer = null;

    const scheduleAutoScroll = (delay) => {
      window.clearTimeout(resumeAutoScrollTimer);
      resumeAutoScrollTimer = window.setTimeout(() => {
        if (!isDragging && !isExpanded) autoScroll = true;
      }, delay);
    };

    const handlePointerDown = (e) => {
      if (isExpanded) return;
      isDragging = true;
      hasDragged = false;
      autoScroll = false;
      window.clearTimeout(resumeAutoScrollTimer);
      clearHoveredCell();
      startX = e.clientX;
      startY = e.clientY;

      // Begin from the position that is actually visible, rather than from an
      // eased wheel/idle target that may still be travelling off-screen.
      targetX = scrollX;
      targetY = scrollY;
      startTargetX = scrollX;
      startTargetY = scrollY;
    };

    const handlePointerMove = (e) => {
      setRaycastPointer(e.clientX, e.clientY);

      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) > 5) hasDragged = true;
      
      // Direct manipulation: the artwork follows the pointer on both axes.
      targetX = startTargetX + dx;
      targetY = startTargetY - dy;
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      scheduleAutoScroll(220);
    };

    const handlePointerLeave = () => {
      mouse.set(-9999, -9999);
      clearHoveredCell();
    };

    const handleWheel = (e) => {
      if (isExpanded) return;
      autoScroll = false;
      targetY += e.deltaY * 0.45;
      targetX += e.deltaX * 0.45;
      
      scheduleAutoScroll(1500);
    };

    // Close the floating artwork back into its moving tile position.
    const closeExpand = () => {
      if (!isExpanded || !expandedCell || !expandedMesh || !expandedImageElement) return;

      const returnRect = getMeshScreenRect(expandedMesh, expandedCell, expandedInstanceId);
      const imageElement = expandedImageElement;
      const backdropElement = expandedBackdrop;
      isExpanded = false;
      setSwitchesCount(prev => prev + 1);
      autoScroll = true;

      gsap.to(backdropElement, { opacity: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(imageElement, {
        left: returnRect.centerX,
        top: returnRect.centerY,
        width: returnRect.width,
        height: returnRect.height,
        opacity: 0,
        scale: 0.94,
        duration: 0.72,
        ease: 'power3.inOut',
        onComplete: () => {
          removeExpandedElements();
          expandedCell = null;
          expandedMesh = null;
          expandedInstanceId = null;
        }
      });
    };

    // Pop the selected artwork out of its tile while the dome keeps drifting.
    const handleClick = (event) => {
      if (isExpanded) return;
      if (hasDragged) {
        hasDragged = false;
        return;
      }

      setRaycastPointer(event.clientX, event.clientY);

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(raycastMeshes, false);

      if (hits.length > 0) {
        const clickedMesh = hits[0].object;
        const clickedInstanceId = hits[0].instanceId;
        const matchingCell = meshToCell.get(clickedMesh);

        if (matchingCell && clickedInstanceId !== undefined) {
          const startRect = getMeshScreenRect(clickedMesh, matchingCell, clickedInstanceId);
          const maxWidth = width * 0.78;
          const maxHeight = height * 0.78;
          let targetWidth = maxWidth;
          let targetHeight = targetWidth / matchingCell.imageAspect;
          if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = targetHeight * matchingCell.imageAspect;
          }

          expandedBackdrop = document.createElement('button');
          expandedBackdrop.type = 'button';
          expandedBackdrop.className = 'pg-expanded-backdrop';
          expandedBackdrop.setAttribute('aria-label', 'Close expanded artwork');
          expandedBackdrop.addEventListener('click', closeExpand);

          expandedImageElement = document.createElement('img');
          expandedImageElement.className = 'pg-expanded-image';
          expandedImageElement.src = matchingCell.url;
          expandedImageElement.alt = 'Expanded gallery artwork';

          container.appendChild(expandedBackdrop);
          container.appendChild(expandedImageElement);

          gsap.set(expandedBackdrop, { opacity: 0 });
          gsap.set(expandedImageElement, {
            left: startRect.centerX,
            top: startRect.centerY,
            width: startRect.width,
            height: startRect.height,
            xPercent: -50,
            yPercent: -50,
            opacity: 0.82,
            scale: 0.96
          });

          isExpanded = true;
          expandedCell = matchingCell;
          expandedMesh = clickedMesh;
          expandedInstanceId = clickedInstanceId;
          autoScroll = true;

          if (hoveredCell) {
            clearHoveredCell();
          }

          gsap.to(expandedBackdrop, { opacity: 1, duration: 0.5, ease: 'power2.out' });
          gsap.to(expandedImageElement, {
            left: width / 2,
            top: height / 2,
            width: targetWidth,
            height: targetHeight,
            opacity: 1,
            scale: 1,
            duration: 0.92,
            ease: 'power3.out'
          });
        }
      }
    };

    const canvasElement = renderer.domElement;
    canvasElement.addEventListener('mousedown', handlePointerDown);
    canvasElement.addEventListener('mousemove', handlePointerMove);
    canvasElement.addEventListener('mouseup', handlePointerUp);
    canvasElement.addEventListener('mouseleave', handlePointerLeave);
    canvasElement.addEventListener('wheel', handleWheel, { passive: true });
    canvasElement.addEventListener('click', handleClick);
    window.addEventListener('mouseup', handlePointerUp);

    // Touch support
    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0]);
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0]);
      }
    };
    canvasElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvasElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvasElement.addEventListener('touchend', handlePointerUp);

    // Time elapsed counter
    const startTime = performance.now();
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((performance.now() - startTime) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');
      setElapsedTime(`${mm}:${ss}`);
    }, 1000);

    // 5. Rendering & Animation loop
    let prevScrollX = 0;
    let prevScrollY = 0;
    let animationFrameId;
    let hoverRaycastElapsed = 0;
    let hasRenderedFirstFrame = false;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      hoverRaycastElapsed += delta;

      // Constant drift
      if (autoScroll && !isDragging) {
        targetY -= 12 * delta; // continuous scroll vertical
      }

      // Smooth scroll interpolation
      scrollX += (targetX - scrollX) * 0.08;
      scrollY += (targetY - scrollY) * 0.08;

      // Calculate velocity for motion blur
      const frameDist = Math.hypot(scrollX - prevScrollX, scrollY - prevScrollY);
      velocity += (frameDist - velocity) * 0.35;
      
      prevScrollX = scrollX;
      prevScrollY = scrollY;

      // Wrap coordinate system for infinite scrolling
      const wrappedX = scrollX - Math.round(scrollX / packW) * packW;
      const wrappedY = scrollY - Math.round(scrollY / packH) * packH;
      gridGroup.position.x = wrappedX;
      gridGroup.position.y = -wrappedY;

      // Raycast Hover updates
      if (!isDragging && !isExpanded && hoverRaycastElapsed >= 1 / 30) {
        hoverRaycastElapsed = 0;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastMeshes, false);

        let currentHovered = null;
        if (intersects.length > 0) {
          currentHovered = meshToCell.get(intersects[0].object) || null;
        }

        if (currentHovered !== hoveredCell) {
          if (hoveredCell) tweenCellHover(hoveredCell, 0);
          if (currentHovered) tweenCellHover(currentHovered, 1);
          hoveredCell = currentHovered;
        }
      }

      // Update post-processing uniforms
      if (postMat) {
        // Dome zoom dynamic breathing based on scrolling speed
        const targetStrength = 1.0;
        postMat.uniforms.uStrength.value += (targetStrength - postMat.uniforms.uStrength.value) * 0.1;
        
        // Radial blur dynamic on movement speed
        const speedBlur = velocity > 1.5
          ? Math.min((velocity - 1.5) / 18, 0.065)
          : 0;
        postMat.uniforms.uRadialBlur.value += (speedBlur - postMat.uniforms.uRadialBlur.value) * 0.07;
      }

      // Render double pass
      renderer.setRenderTarget(fbo);
      renderer.clear();
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);

      if (!hasRenderedFirstFrame) {
        hasRenderedFirstFrame = true;
        setIsLoading(false);
      }
    };

    // Wait until GSAP finishes reveal
    const animationStartTimer = window.setTimeout(() => {
      animate();
    }, 100);

    // 6. Resize listener
    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      
      camera.aspect = w / h;
      camera.position.z = h / (2 * Math.tan((fov * Math.PI) / 360));
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
      fbo.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Handle initial transition on mount
    const overlayElement = document.querySelector('.playground-overlay');
    const overlayRevealTimer = overlayElement
      ? window.setTimeout(() => overlayElement.classList.add('is-active'), 50)
      : null;

    // Close Expand exporter for escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isExpanded) closeExpand();
        else if (onCloseRef.current) onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.clearTimeout(animationStartTimer);
      window.clearTimeout(overlayRevealTimer);
      window.clearTimeout(resumeAutoScrollTimer);
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      
      canvasElement.removeEventListener('mousedown', handlePointerDown);
      canvasElement.removeEventListener('mousemove', handlePointerMove);
      canvasElement.removeEventListener('mouseup', handlePointerUp);
      canvasElement.removeEventListener('mouseleave', handlePointerLeave);
      canvasElement.removeEventListener('wheel', handleWheel);
      canvasElement.removeEventListener('click', handleClick);
      window.removeEventListener('mouseup', handlePointerUp);
      canvasElement.removeEventListener('touchstart', handleTouchStart);
      canvasElement.removeEventListener('touchmove', handleTouchMove);
      canvasElement.removeEventListener('touchend', handlePointerUp);

      expandedBackdrop?.removeEventListener('click', closeExpand);
      gsap.killTweensOf(expandedBackdrop);
      gsap.killTweensOf(expandedImageElement);
      removeExpandedElements();

      // Clean up geometries and materials
      cells.forEach(c => {
        gsap.killTweensOf(c.mat.uniforms.uHover);
        c.mesh.geometry.dispose();
        c.mat.dispose();
      });
      textureCache.forEach((texture) => texture.dispose());
      fbo.dispose();
      postMesh.geometry.dispose();
      postMat.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [galleryImages]);

  return (
    <div
      className="playground-overlay"
      role="region"
      aria-label={`Interactive gallery with ${GALLERY_IMAGE_URLS.length} images`}
      data-gallery-cells={cellsCount}
      data-gallery-switches={switchesCount}
      data-gallery-elapsed={elapsedTime}
    >
      {isLoading && (
        <div className="pg-loader">
          <div className="pg-loader-text">INITIALIZING SKETCHES...</div>
        </div>
      )}

      {/* WebGL Dome Canvas Container */}
      <div ref={containerRef} className="playground-canvas-container" />

      {/* Centered logo button to return to main page */}
      <button className="pg-logo-btn" onClick={onClose} aria-label="Exit Playground">
        <img src={logoDark} alt="Logo" className="pg-logo-img" />
      </button>
    </div>
  );
}
