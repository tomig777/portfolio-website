import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import WebsiteTestHeader from './WebsiteTestHeader';
import ErrorBoundary from './ErrorBoundary';

// Background & Playground Components
import DarkVeil from './DarkVeil';
import { preparePlaygroundGallery } from '../utils/galleryAssets';
import Folder from './Folder';
import SideRays from './SideRays';
import LightRays from './LightRays';

// Keep interaction-only pages and modals out of the first mobile bundle. They
// are fetched when the corresponding control is opened.
const WorkModal = lazy(() => import('./WorkModal'));
const ResumeModal = lazy(() => import('./ResumeModal'));
const PlaygroundDome = lazy(() => import('./PlaygroundDome'));
const ColorBends = lazy(() => import('./ColorBends'));
const WorkArchivePage = lazy(() => import('./WebsiteTestPages').then(({ WorkArchivePage: Page }) => ({ default: Page })));
const AboutProfilePage = lazy(() => import('./WebsiteTestPages').then(({ AboutProfilePage: Page }) => ({ default: Page })));
const ContactFormPage = lazy(() => import('./WebsiteTestPages').then(({ ContactFormPage: Page }) => ({ default: Page })));

import { SiFigma, SiBlender, SiDavinciresolve, SiInstagram, SiAutodesk, SiCinema4D, SiUnrealengine } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';

import card1Image from '../assets/szia.png';
import card1Video from '../assets/szia_5.mp4';
import card2Image from '../assets/szia_2.jpg';
import card2Video from '../assets/szia_10.mp4';
import card3Image from '../assets/szia_3.jpg';
import card3Video from '../assets/szia_8.mp4';
import card4Video from '../assets/szia_9.mp4';
import flowCard4 from '../assets/gallery-optimized/GalTamas_MediaLabor1_BeautyRender.webp';
import kep9 from '../assets/kep9.png';
import nukeLogo from '../assets/nuke_logo2.png';
import substanceLogo from '../assets/substance_logo.png';
import illustratorLogo from '../assets/illustrator_logo.svg';
import photoshopLogo from '../assets/photoshop_logo.svg';
import premiereLogo from '../assets/premiere_logo.svg';
import afterEffectsLogo from '../assets/aftereffects_logo.svg';
import auditionLogo from '../assets/audition_logo.svg';
import lightroomLogo from '../assets/lightroom_logo.svg';
import touchDesignerLogo from '../assets/touchdesigner_logo.png';
import handLeftSvg from '../assets/hand-left.svg';
import handRightSvg from '../assets/right-hand.svg';
import { runRouteTransition } from '../utils/pageTransition';

import './WebsiteTest.css';

gsap.registerPlugin(ScrollTrigger);

// Keep the previous gradient contact scene in the file while this reference-driven
// version is evaluated. Switching this to false restores the prior implementation.
const USE_BUBBLE_CONTACT_EXPERIMENT = true;

const CONTACT_BEND_PALETTES = {
  violet: ['#4f62d8', '#8d82ee', '#c7c9fa'],
  red: ['#7f1d2c', '#b52b3a', '#d8a2aa']
};

const ASCII_HAND_CHARACTERS = '@#$%^&*<>{}[]()/\\\\|+=-~:;?';
const ASCII_GRID = {
  x: -24,
  baselineY: 94,
  columnWidth: 5.48,
  rowHeight: 10,
  columns: 300,
  rows: 58
};

const createAsciiHandRows = (mirrorDensity = false) => Array.from({ length: ASCII_GRID.rows }, (_, row) => (
  Array.from({ length: ASCII_GRID.columns }, (_, column) => {
    const x = ASCII_GRID.x + column * ASCII_GRID.columnWidth;
    const y = ASCII_GRID.baselineY + row * ASCII_GRID.rowHeight;
    const densityX = mirrorDensity ? 1600 - x : x;
    const hash = Math.abs(Math.sin((row + 1) * 127.1 + (column + 1) * 311.7) * 43758.5453) % 1;
    const densityField = (
      Math.sin(row * 0.43)
      + Math.cos(column * 0.074)
      + Math.sin((row + column) * 0.052)
    ) / 3;
    const lowerArmFade = Math.max(0, Math.min(1, (y - 350) / 190))
      * Math.max(0, Math.min(1, (360 - densityX) / 300))
      * 0.29;
    const fingerFade = Math.max(0, Math.min(1, (densityX - 300) / 430)) * 0.23;
    const gapThreshold = Math.min(
      0.68,
      0.08 + ((densityField + 1) / 2) * 0.2 + lowerArmFade + fingerFade
    );

    if (hash < gapThreshold) return ' ';
    return ASCII_HAND_CHARACTERS[
      (row * 17 + column * 29 + ((row + column) % 7)) % ASCII_HAND_CHARACTERS.length
    ];
  }).join('')
));

const ASCII_LEFT_HAND_ROWS = createAsciiHandRows();
const ASCII_RIGHT_HAND_ROWS = createAsciiHandRows(true);

const AsciiHandsArtWithTrail = ({ mobilePreview = false }) => {
  const svgRef = useRef(null);
  const leftPointerMotionRef = useRef(null);
  const rightPointerMotionRef = useRef(null);
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const handMotionRef = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    lastTime: 0,
    animationFrame: null
  });

  const animateHands = useCallback((time) => {
    const motion = handMotionRef.current;
    const target = cursorTargetRef.current;
    const finalScene = svgRef.current?.closest('.wt-bubble-final-scene');

    if (!finalScene || finalScene.style.visibility === 'hidden') {
      motion.animationFrame = null;
      motion.lastTime = 0;
      return;
    }

    const elapsed = motion.lastTime ? Math.min(34, time - motion.lastTime) : 16.67;
    const smoothing = 1 - Math.exp(-elapsed * 0.0125);
    const targetRotation = target.x * 0.038;

    motion.x += (target.x - motion.x) * smoothing;
    motion.y += (target.y - motion.y) * smoothing;
    motion.rotation += (targetRotation - motion.rotation) * smoothing;
    motion.lastTime = time;

    const xDistance = Math.abs(target.x - motion.x);
    const yDistance = Math.abs(target.y - motion.y);
    const rotationDistance = Math.abs(targetRotation - motion.rotation);
    const isSettled = xDistance < 0.008 && yDistance < 0.008 && rotationDistance < 0.001;
    const movementStrength = Math.min(
      1,
      Math.max(xDistance / 0.18, yDistance / 0.18, rotationDistance / 0.01)
    );
    const rasterBrightnessCompensation = 0.975 + (movementStrength * 0.025);

    if (isSettled) {
      motion.x = target.x;
      motion.y = target.y;
      motion.rotation = targetRotation;
    }

    leftPointerMotionRef.current?.setAttribute(
      'transform',
      `translate(${(-motion.x).toFixed(3)} ${motion.y.toFixed(3)}) rotate(${motion.rotation.toFixed(3)} 340 350)`
    );
    leftPointerMotionRef.current?.setAttribute(
      'opacity',
      rasterBrightnessCompensation.toFixed(3)
    );
    rightPointerMotionRef.current?.setAttribute(
      'transform',
      `translate(${motion.x.toFixed(3)} ${motion.y.toFixed(3)}) rotate(${(-motion.rotation).toFixed(3)} 1260 350)`
    );
    rightPointerMotionRef.current?.setAttribute(
      'opacity',
      rasterBrightnessCompensation.toFixed(3)
    );

    if (isSettled) {
      motion.animationFrame = null;
      motion.lastTime = 0;
      return;
    }

    motion.animationFrame = window.requestAnimationFrame(animateHands);
  }, []);

  const ensureHandAnimation = useCallback(() => {
    const motion = handMotionRef.current;
    if (motion.animationFrame === null) {
      motion.lastTime = 0;
      motion.animationFrame = window.requestAnimationFrame(animateHands);
    }
  }, [animateHands]);

  useEffect(() => {
    const finalScene = svgRef.current?.closest('.wt-bubble-final-scene');

    const updateTarget = (event) => {
      if (finalScene?.style.visibility === 'hidden') return;
      cursorTargetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 10,
        y: (event.clientY / window.innerHeight - 0.5) * -8
      };
      ensureHandAnimation();
    };

    const resetTarget = () => {
      cursorTargetRef.current = { x: 0, y: 0 };
      ensureHandAnimation();
    };

    window.addEventListener('pointermove', updateTarget, { passive: true });
    window.addEventListener('blur', resetTarget);
    document.documentElement.addEventListener('pointerleave', resetTarget);

    return () => {
      window.removeEventListener('pointermove', updateTarget);
      window.removeEventListener('blur', resetTarget);
      document.documentElement.removeEventListener('pointerleave', resetTarget);
      if (handMotionRef.current.animationFrame !== null) {
        window.cancelAnimationFrame(handMotionRef.current.animationFrame);
      }
    };
  }, [ensureHandAnimation]);

  return (
    <svg
      ref={svgRef}
      className="wt-bubble-ascii-hands"
      viewBox={mobilePreview ? '0 0 700 1400' : '0 0 1600 700'}
      preserveAspectRatio={mobilePreview ? 'xMidYMid meet' : 'xMidYMid slice'}
      aria-hidden="true"
    >
      <defs>
        <mask
          id="wt-bubble-left-hand-mask"
          x="-100"
          y="110"
          width="930"
          height="540"
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <image
            href={handLeftSvg}
            x="-72"
            y="145"
            width="850"
            height="470"
            preserveAspectRatio="xMidYMid meet"
          />
        </mask>
        <mask
          id="wt-bubble-right-hand-mask"
          x="770"
          y="110"
          width="930"
          height="540"
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <image
            href={handRightSvg}
            x="822"
            y="145"
            width="850"
            height="470"
            preserveAspectRatio="xMidYMid meet"
          />
        </mask>
      </defs>

      <g className="wt-bubble-ascii-hand wt-bubble-ascii-hand--left">
        <g
          className="wt-bubble-ascii-hand-layout"
          transform={mobilePreview ? 'rotate(25 350 350)' : undefined}
        >
        <g ref={leftPointerMotionRef} className="wt-bubble-ascii-hand-pointer-motion">
          <g mask="url(#wt-bubble-left-hand-mask)">
            <text className="wt-bubble-ascii-pattern" x="-24" y="94" xmlSpace="preserve">
              {ASCII_LEFT_HAND_ROWS.map((row, index) => (
                <tspan x="-24" dy={index === 0 ? 0 : 10} key={`left-${index}`}>{row}</tspan>
              ))}
            </text>
          </g>
        </g>
        </g>
      </g>

      <g className="wt-bubble-ascii-hand wt-bubble-ascii-hand--right">
        <g
          className="wt-bubble-ascii-hand-layout"
          transform={mobilePreview ? 'translate(-900 700) rotate(25 1250 350)' : undefined}
        >
        <g ref={rightPointerMotionRef} className="wt-bubble-ascii-hand-pointer-motion">
          <g mask="url(#wt-bubble-right-hand-mask)">
            <text className="wt-bubble-ascii-pattern" x="-24" y="94" xmlSpace="preserve">
              {ASCII_RIGHT_HAND_ROWS.map((row, index) => (
                <tspan x="-24" dy={index === 0 ? 0 : 10} key={`right-${index}`}>{row}</tspan>
              ))}
            </text>
          </g>
        </g>
        </g>
      </g>
    </svg>
  );
};

const AsciiHandsArt = () => {
  const leftPointerMotionRef = useRef(null);
  const rightPointerMotionRef = useRef(null);
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const handMotionRef = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    lastTime: 0,
    animationFrame: null
  });

  const animateHands = useCallback((time) => {
    const motion = handMotionRef.current;
    const target = cursorTargetRef.current;
    const elapsed = motion.lastTime ? Math.min(34, time - motion.lastTime) : 16.67;
    const smoothing = 1 - Math.exp(-elapsed * 0.0125);
    const targetRotation = target.x * 0.038;

    motion.x += (target.x - motion.x) * smoothing;
    motion.y += (target.y - motion.y) * smoothing;
    motion.rotation += (targetRotation - motion.rotation) * smoothing;
    motion.lastTime = time;

    const isSettled = (
      Math.abs(target.x - motion.x) < 0.008
      && Math.abs(target.y - motion.y) < 0.008
      && Math.abs(targetRotation - motion.rotation) < 0.001
    );

    if (isSettled) {
      motion.x = target.x;
      motion.y = target.y;
      motion.rotation = targetRotation;
    }

    leftPointerMotionRef.current?.setAttribute(
      'transform',
      `translate(${motion.x.toFixed(3)} ${motion.y.toFixed(3)}) rotate(${motion.rotation.toFixed(3)} 340 350)`
    );
    rightPointerMotionRef.current?.setAttribute(
      'transform',
      `translate(${motion.x.toFixed(3)} ${motion.y.toFixed(3)}) rotate(${(-motion.rotation).toFixed(3)} 1260 350)`
    );

    if (isSettled) {
      motion.animationFrame = null;
      motion.lastTime = 0;
      return;
    }

    motion.animationFrame = window.requestAnimationFrame(animateHands);
  }, []);

  const ensureHandAnimation = useCallback(() => {
    const motion = handMotionRef.current;
    if (motion.animationFrame === null) {
      motion.lastTime = 0;
      motion.animationFrame = window.requestAnimationFrame(animateHands);
    }
  }, [animateHands]);

  useEffect(() => {
    const finalScene = leftPointerMotionRef.current?.closest('.wt-bubble-final-scene');

    const updateTarget = (event) => {
      if (finalScene?.style.visibility === 'hidden') return;
      cursorTargetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * -10,
        y: (event.clientY / window.innerHeight - 0.5) * -8
      };
      ensureHandAnimation();
    };

    const resetTarget = () => {
      cursorTargetRef.current = { x: 0, y: 0 };
      ensureHandAnimation();
    };

    window.addEventListener('pointermove', updateTarget, { passive: true });
    window.addEventListener('blur', resetTarget);
    document.documentElement.addEventListener('pointerleave', resetTarget);

    return () => {
      window.removeEventListener('pointermove', updateTarget);
      window.removeEventListener('blur', resetTarget);
      document.documentElement.removeEventListener('pointerleave', resetTarget);
      if (handMotionRef.current.animationFrame !== null) {
        window.cancelAnimationFrame(handMotionRef.current.animationFrame);
      }
    };
  }, [ensureHandAnimation]);

  return (
    <svg
      className="wt-bubble-ascii-hands wt-bubble-ascii-hands--static"
      viewBox="0 0 1600 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <mask
          id="wt-bubble-left-hand-mask-static"
          x="-100"
          y="110"
          width="930"
          height="540"
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <image
            href={handLeftSvg}
            x="-72"
            y="145"
            width="850"
            height="470"
            preserveAspectRatio="xMidYMid meet"
          />
        </mask>
        <mask
          id="wt-bubble-right-hand-mask-static"
          x="770"
          y="110"
          width="930"
          height="540"
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          style={{ maskType: 'alpha' }}
        >
          <image
            href={handRightSvg}
            x="822"
            y="145"
            width="850"
            height="470"
            preserveAspectRatio="xMidYMid meet"
          />
        </mask>
      </defs>

      <g className="wt-bubble-ascii-hand wt-bubble-ascii-hand--left">
        <g ref={leftPointerMotionRef} className="wt-bubble-ascii-hand-pointer-motion">
          <g mask="url(#wt-bubble-left-hand-mask-static)">
            <text className="wt-bubble-ascii-pattern" x="-24" y="94" xmlSpace="preserve">
              {ASCII_LEFT_HAND_ROWS.map((row, index) => (
                <tspan x="-24" dy={index === 0 ? 0 : 10} key={`left-static-${index}`}>{row}</tspan>
              ))}
            </text>
          </g>
        </g>
      </g>

      <g className="wt-bubble-ascii-hand wt-bubble-ascii-hand--right">
        <g ref={rightPointerMotionRef} className="wt-bubble-ascii-hand-pointer-motion">
          <g mask="url(#wt-bubble-right-hand-mask-static)">
            <text className="wt-bubble-ascii-pattern" x="-24" y="94" xmlSpace="preserve">
              {ASCII_RIGHT_HAND_ROWS.map((row, index) => (
                <tspan x="-24" dy={index === 0 ? 0 : 10} key={`right-static-${index}`}>{row}</tspan>
              ))}
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
};

const SkillLogoImage = ({ src, invert = false }) => (
  <img
    className={`skill-brand-logo${invert ? ' skill-brand-logo--invert' : ''}`}
    src={src}
    alt=""
    aria-hidden="true"
  />
);

const OpenAiIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" role="img" aria-label="OpenAI">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </svg>
);

const Lanyard = lazy(() => import('./Lanyard'));

const DeferredColorBends = (props) => {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    if (typeof IntersectionObserver !== 'function') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '1000px 0px' }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="wt-contact-color-bends-deferred" aria-hidden="true">
      {shouldLoad && (
        <Suspense fallback={null}>
          <ColorBends {...props} />
        </Suspense>
      )}
    </div>
  );
};

const adobeLogos = [
  { node: <SkillLogoImage src={illustratorLogo} invert />, title: "Adobe Illustrator" },
  { node: <SkillLogoImage src={photoshopLogo} invert />, title: "Adobe Photoshop" },
  { node: <SkillLogoImage src={premiereLogo} invert />, title: "Adobe Premiere Pro" },
  { node: <SkillLogoImage src={afterEffectsLogo} invert />, title: "Adobe After Effects" },
  { node: <SkillLogoImage src={auditionLogo} invert />, title: "Adobe Audition" },
  { node: <SkillLogoImage src={lightroomLogo} invert />, title: "Adobe Lightroom" },
];

const otherLogos = [
  { node: <SiAutodesk />, title: "Autodesk Maya" },
  { node: <SiFigma />, title: "Figma" },
  { node: <SiBlender />, title: "Blender" },
  { node: <SiDavinciresolve />, title: "DaVinci Resolve" },
  { node: <div className="skill-icon-mask" style={{ WebkitMaskImage: `url(${nukeLogo})`, maskImage: `url(${nukeLogo})`, width: '44px', height: '44px' }} />, title: "Nuke" },
  { node: <SiCinema4D />, title: "Cinema 4D" },
  { node: <div className="skill-icon-mask" style={{ WebkitMaskImage: `url(${substanceLogo})`, maskImage: `url(${substanceLogo})`, width: '50px', height: '50px' }} />, title: "Substance Painter" },
  { node: <SiUnrealengine />, title: "Unreal Engine" },
  { node: <SkillLogoImage src={touchDesignerLogo} />, title: "TouchDesigner" },
  { node: <OpenAiIcon />, title: "ChatGPT" },
];

const skillLogos = [...adobeLogos, ...otherLogos];

const socialItems = [
  <a key="instagram" href="https://www.instagram.com/arhivetkg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <SiInstagram />
  </a>,
  <a key="linkedin" href="https://www.linkedin.com/in/tamasgal77/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <FaLinkedin />
  </a>,
  <a key="email" href="mailto:tamasgaldesign@gmail.com" aria-label="Email">
    <HiMail />
  </a>
];

const featuredProjects = [
  {
    title: 'Signal Bloom',
    description: 'A focused identity test built around glossy forms, quiet motion, and a restrained digital mood shaped for clean presentation.',
    image: card1Image,
    video: card1Video
  },
  {
    title: 'Glass Index',
    description: 'A clean interface study with layered depth, editorial pacing, soft reflections, and a calm system built around visual clarity.',
    image: card2Image,
    video: card2Video
  },
  {
    title: 'Soft Circuit',
    description: 'A compact digital system shaped for smooth product storytelling, subtle movement, and flexible layouts across content moments.',
    image: card3Image,
    video: card3Video
  },
  {
    title: 'Midnight Atlas',
    description: 'A moody visual direction exploring contrast, texture, scale, and atmospheric details for a cinematic project identity.',
    video: card4Video
  }
];

// ─── Ring carousel: one continuous line of cards circling the sentence ───
// All cards currently share the same 16:9 render (uniform size keeps the queue collision-free).
const CARD_STRIP_COUNT = 9; // vertical facets per card — fanned out they read as a smooth physical curl
const transitionCards = [
  { id: 'A', image: flowCard4, alt: 'Interior design beauty render', width: 330, height: 186 },
  { id: 'B', image: flowCard4, alt: 'Interior design beauty render', width: 330, height: 186, mobileHide: true },
  { id: 'C', image: flowCard4, alt: 'Interior design beauty render', width: 330, height: 186 },
  { id: 'D', image: flowCard4, alt: 'Interior design beauty render', width: 330, height: 186 },
  { id: 'E', image: flowCard4, alt: 'Interior design beauty render', width: 330, height: 186 },
  { id: 'F', image: flowCard4, alt: 'Interior design beauty render', width: 330, height: 186, mobileHide: true }
];
const visibleTransitionCards = transitionCards;
const heroRoles = [
  'Creative Designer',
  'Media Designer',
  'Digital Artist',
  'Motion Designer',
  '3D Visual Designer'
];
const headerThemeHueShifts = {
  violet: 15,
  red: -120,
  bone: 28,
  brown: -18,
  forest: 105
};

const HeroRoleReel = () => {
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveRole((current) => (current + 1) % heroRoles.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="wt-hero-role-window" aria-label={heroRoles[activeRole]}>
      <span className="wt-hero-role" key={heroRoles[activeRole]} aria-hidden="true">
        {heroRoles[activeRole]}
      </span>
    </span>
  );
};

const WebsiteTest = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobilePreview = new URLSearchParams(location.search).get('mobilePreview') === '1';
  const [selectedWork, setSelectedWork] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // The mobile preview is the production phone layout. Keep the query flag for
  // the framed preview project, and activate the same UI automatically on real
  // phone-sized viewports.
  const useMobileLayout = isMobilePreview || isMobile;
  const [shouldLoadLanyard, setShouldLoadLanyard] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const [activeNavPage, setActiveNavPage] = useState(null);
  const [navPageOrigin, setNavPageOrigin] = useState('header');
  const [menuReturnToken, setMenuReturnToken] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [headerTheme, setHeaderTheme] = useState(() => {
    try {
      return window.localStorage.getItem('portfolio-theme') === 'red' ? 'red' : 'violet';
    } catch {
      return 'violet';
    }
  });
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const lenisRef = useRef(null);
  const navPageScrollRef = useRef(0);
  const caseStudyScrollRef = useRef(0);
  const caseTransitionTimers = useRef([]);
  const caseTransitionInProgress = useRef(false);
  const pendingMenuReturnRef = useRef(
    location.state?.reopenMenu
      ? { scrollTop: location.state.scrollTop || 0 }
      : null
  );

  useEffect(() => {
    document.documentElement.dataset.portfolioTheme = headerTheme;
    try {
      window.localStorage.setItem('portfolio-theme', headerTheme);
    } catch {
      // Theme persistence is optional when browser storage is unavailable.
    }
  }, [headerTheme]);

  // Playground Overlay visibility state
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  useLayoutEffect(() => {
    const wrapper = containerRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;

    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      overscroll: false,
      autoResize: true,
      autoRaf: false
    });
    lenisRef.current = lenis;

    const updateLenis = (time) => lenis.raf(time * 1000);
    const updateScrollTrigger = () => ScrollTrigger.update();
    const resizeLenis = () => lenis.resize();

    lenis.on('scroll', updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener('refresh', resizeLenis);

    const refreshFrame = window.requestAnimationFrame(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      ScrollTrigger.removeEventListener('refresh', resizeLenis);
      gsap.ticker.remove(updateLenis);
      lenis.off('scroll', updateScrollTrigger);
      lenis.destroy();
      if (lenisRef.current === lenis) {
        lenisRef.current = null;
      }
    };
  }, []);

  const triggerScreenTransition = useCallback((actionCallback) => {
    if (caseTransitionInProgress.current) return;

    caseTransitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    caseTransitionTimers.current = [];
    document.querySelectorAll('.wt-case-transition').forEach((overlay) => overlay.remove());

    const overlay = document.createElement('div');
    overlay.className = 'wt-case-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    caseTransitionInProgress.current = true;

    const revealTimer = window.setTimeout(() => {
      if (actionCallback) {
        actionCallback();
      }
    }, 760);

    const doneTimer = window.setTimeout(() => {
      overlay.remove();
      caseTransitionInProgress.current = false;
    }, 1680);

    caseTransitionTimers.current.push(revealTimer, doneTimer);
  }, []);

  const handleClosePlayground = useCallback(() => {
    triggerScreenTransition(() => {
      setIsPlaygroundOpen(false);
    });
  }, [triggerScreenTransition]);

  const handleOpenPlayground = useCallback(() => {
    preparePlaygroundGallery();
    triggerScreenTransition(() => setIsPlaygroundOpen(true));
  }, [triggerScreenTransition]);

  const handleProjectPicker = useCallback(() => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    runRouteTransition(() => {
      if (onBack) {
        onBack();
        return;
      }

      navigate('/projects', {
        state: {
          returnToMenu: true,
          scrollTop
        }
      });
    });
  }, [navigate, onBack]);

  const handleMenuScrollLock = useCallback((isLocked) => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isLocked) {
      lenis.stop();
      return;
    }

    if (!activeCaseStudy && !activeNavPage && !isPlaygroundOpen && !selectedWork && !showResumeModal) {
      lenis.start();
    }
  }, [activeCaseStudy, activeNavPage, isPlaygroundOpen, selectedWork, showResumeModal]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const isOverlayOpen = Boolean(
      activeCaseStudy
      || activeNavPage
      || isPlaygroundOpen
      || selectedWork
      || showResumeModal
    );

    if (isOverlayOpen) {
      lenis.stop();
      return;
    }

    lenis.start();
    lenis.resize();
  }, [activeCaseStudy, activeNavPage, isPlaygroundOpen, selectedWork, showResumeModal]);

  useLayoutEffect(() => {
    const pendingReturn = pendingMenuReturnRef.current;
    if (!pendingReturn || !containerRef.current) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(pendingReturn.scrollTop, { immediate: true, force: true });
    } else {
      containerRef.current.scrollTop = pendingReturn.scrollTop;
    }
    containerRef.current.dispatchEvent(new Event('scroll', { bubbles: true }));
    pendingMenuReturnRef.current = null;
    setMenuReturnToken((current) => current + 1);
    navigate('/', { replace: true, state: null });

    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [navigate]);

  const openNavPage = useCallback((page, origin = 'header') => {
    triggerScreenTransition(() => {
      navPageScrollRef.current = containerRef.current?.scrollTop || 0;
      setNavPageOrigin(origin);
      setActiveNavPage(page);
    });
  }, [triggerScreenTransition]);

  const closeNavPage = useCallback(() => {
    triggerScreenTransition(() => {
      setActiveNavPage(null);
      if (navPageOrigin === 'menu') {
        setMenuReturnToken((current) => current + 1);
      }
      window.requestAnimationFrame(() => {
        if (containerRef.current) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(navPageScrollRef.current, { immediate: true, force: true });
          } else {
            containerRef.current.scrollTop = navPageScrollRef.current;
          }
          containerRef.current.dispatchEvent(new Event('scroll', { bubbles: true }));
        }
        ScrollTrigger.refresh();
      });
    });
  }, [navPageOrigin, triggerScreenTransition]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The lanyard is an intentionally retained 3D detail, but loading its
  // Three/Rapier chunk during the first render makes a phone wait for the
  // interactive scene before the portfolio shell can paint. Let the browser
  // paint the page first, then fetch the detail during idle time.
  useEffect(() => {
    let timeoutId = null;
    let idleId = null;
    const loadLanyard = () => setShouldLoadLanyard(true);

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(loadLanyard, {
        timeout: useMobileLayout ? 1200 : 500
      });
    } else {
      timeoutId = window.setTimeout(loadLanyard, useMobileLayout ? 450 : 0);
    }

    return () => {
      if (idleId !== null) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [useMobileLayout]);

  useEffect(() => {
    return () => {
      caseTransitionTimers.current.forEach((timer) => window.clearTimeout(timer));
      caseTransitionTimers.current = [];
      document.querySelectorAll('.wt-case-transition').forEach((overlay) => overlay.remove());
      caseTransitionInProgress.current = false;
    };
  }, []);

  // Preload gallery image + exhibition stage card images
  useEffect(() => {
    const img = new Image();
    img.src = kep9;
    visibleTransitionCards.forEach((card) => {
      const cardImg = new Image();
      cardImg.src = card.image;
    });
  }, []);

  // GSAP Animations
  useLayoutEffect(() => {
    const scrollContainer = containerRef.current;
    if (activeCaseStudy || activeNavPage) return undefined;
    if (!scrollContainer) return undefined;

    const ctx = gsap.context(() => {
    // 1. Featured work image handoff
    const imageFrame = document.querySelector('.wt-featured-image-wrap');
    const imageTrack = document.querySelector('.wt-featured-image-track');
    const imageLayers = gsap.utils.toArray('.wt-featured-image-layer');
    const copyLayers = gsap.utils.toArray('.wt-featured-copy');
    const progressDots = gsap.utils.toArray('.wt-image-progress-dot');
    const projectCount = imageLayers.length;
    const finalImageX = isMobile ? '0vw' : '-21vw';
    if (!imageFrame || !imageTrack || projectCount === 0) return;

    gsap.set(imageFrame, {
      xPercent: -50,
      yPercent: -50,
      x: '0vw',
      y: '0vh',
      scale: 0.62,
      autoAlpha: 1,
      borderRadius: '22px'
    });

    gsap.set(imageTrack, { x: 0, y: 0, yPercent: 0 });
    imageLayers.forEach((layer, index) => {
      gsap.set(layer, { x: 0, y: 0, yPercent: index * 100, scale: 1, autoAlpha: 1 });
    });

    gsap.set(copyLayers, {
      xPercent: isMobile ? -50 : 0,
      yPercent: 0,
      x: 0,
      y: 48,
      autoAlpha: 0,
      filter: 'blur(12px)'
    });

    gsap.set(progressDots, {
      height: 7,
      backgroundColor: 'rgba(255, 255, 255, 0.36)'
    });
    gsap.set(progressDots[0], {
      height: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.95)'
    });

    const projectScrollPercent = Math.max(
      360,
      projectCount * 165 - (isMobile ? 78 : 118)
    );
    const workTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.wt-projects-section',
        scroller: scrollContainer,
        start: 'top top',
        end: `+=${projectScrollPercent}%`,
        // Pin the complete section rather than only the stage. Pinning the
        // child leaves one viewport of its parent exposed after the last card
        // exits, which reads as a blank/grey gap before the text transition.
        pin: true,
        pinType: 'fixed',
        scrub: 1.08,
        anticipatePin: 0
      }
    });

    workTl
      .to(imageFrame,
        { y: '0vh', scale: 1, x: '0vw', borderRadius: '26px', ease: 'power2.out', duration: 1.15 }
      )
      .to(imageFrame,
        { x: finalImageX, ease: 'power2.inOut', duration: 0.86 },
        '+=0.18'
      )
      .to(copyLayers[0],
        { x: 0, y: 0, autoAlpha: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 0.64 },
        '<0.28'
      )
      .to({}, { duration: 0.42 });

    for (let index = 1; index < projectCount; index += 1) {
      workTl
        .to(copyLayers[index - 1], {
          x: 0,
          y: -48,
          autoAlpha: 0,
          filter: 'blur(10px)',
          ease: 'power2.in',
          duration: 0.34
        })
        .to(imageTrack, {
          yPercent: index * -100,
          ease: 'power2.inOut',
          duration: 0.9
        }, '<0.08')
        .to(progressDots[index - 1], {
          height: 7,
          backgroundColor: 'rgba(255, 255, 255, 0.36)',
          ease: 'power2.out',
          duration: 0.3
        }, '<0.12')
        .to(progressDots[index], {
          height: 18,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          ease: 'power2.out',
          duration: 0.3
        }, '<')
        .to(copyLayers[index], {
          x: 0,
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          duration: 0.58
        }, '-=0.34')
        .to({}, { duration: 0.44 });
    }

    // Hold the final case study through the end of the pinned section. The
    // section itself naturally scrolls away into the next transition; taking
    // the last card out here leaves a blank viewport-sized tail after the
    // case-study animation has finished.
    // 1b. Light rays background: invisible at the hero, fades in across the first
    // viewport of scrolling and stays for the rest of the page
    gsap.fromTo('.wt-light-rays-bg',
      { opacity: 0 },
      {
        opacity: 0.8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          scroller: scrollContainer,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      }
    );

    // 2. 3D exhibition stage → text reveal → vertical gradient transition
    const exhibitCardElements = gsap.utils.toArray('.wt-exhibit-card');
    const exhibitCopy = document.querySelector('.wt-exhibit-copy');
    const textGroups = gsap.utils.toArray('.wt-exhibit-group');
    const transitionStage = document.querySelector('.wt-skill-transition-stage');
    const contactWash = document.querySelector('.wt-contact-wash');
    const contactTransitionTitle = document.querySelector('.wt-contact-transition-title');
    const contactTransitionTitleInner = document.querySelector('.wt-contact-transition-title__inner');
    const contactScene = document.querySelector('.wt-contact-scene');
    const contactContainer = document.querySelector('.wt-contact-scene .wt-contact-container');
    const contactFooter = document.querySelector('.wt-contact-scene .wt-new-footer');
    const contactFolder = document.querySelector('.wt-contact-scene .wt-contact-folder');
    const contactSideRays = document.querySelector('.wt-contact-scene .wt-contact-side-rays');
    const contactItems = [
      '.wt-contact-scene .wt-contact-desc',
      '.wt-contact-scene .folder-container',
      '.wt-contact-scene .wt-contact-profile'
    ];
    const bubbleExperience = document.querySelector('.wt-bubble-contact-experience');
    const bubbleBlackout = document.querySelector('.wt-bubble-blackout');
    const bubbleDisc = document.querySelector('.wt-bubble-disc');
    const bubbleWhitePanel = document.querySelector('.wt-bubble-white-panel');
    const bubbleContactWord = document.querySelector('.wt-bubble-contact-word');
    const bubbleFinalScene = document.querySelector('.wt-bubble-final-scene');
    const bubbleFinalMeta = gsap.utils.toArray('.wt-bubble-final-meta > *');
    const bubbleFinalName = document.querySelector('.wt-bubble-final-name');
    const bubbleAsciiLeft = document.querySelector('.wt-bubble-ascii-hand--left');
    const bubbleAsciiRight = document.querySelector('.wt-bubble-ascii-hand--right');
    const bubbleContactFolder = document.querySelector('.wt-bubble-contact-folder');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rotScale = isMobile ? 0.8 : 1; // soften extreme rotations on small screens

    // One shared ring around the sentence. Each card's journey p: 0 → 1:
    // 0.00–0.08: FAST straight dash from gate A (off-screen left, slightly higher)
    //            to point B (the ring's bottom) — cards arrive quickly, one by one,
    //            growing a little as they approach the ring
    // 0.08–0.92: SLOW lap around the ring — cards queue up here and keep the tight
    //            spacing; rotation eases in/out at the joins
    // 0.92–1.00: FAST straight dash out to gate A' (off-screen right), shrinking a little
    // Because the lanes are short in progress-space, gaps between cards are large
    // there and small on the curve — automatically.
    const flowState = { travel: 0 };
    const FLOW_GAP = 0.129; // keeps ring spacing at ~480px (0.84 ring span ≈ 6.5 gaps)
    const flowTravelEnd = 1 + ((visibleTransitionCards.length - 1) * FLOW_GAP);

    const RING_START = 0.08;
    const RING_END = 0.92;
    const RING_SWEEP = 360; // one full lap, joining and leaving at the bottom of the ring
    const LANE_Y = 0.28;    // point B: ring bottom (fraction of stage height below centre)
    const GATE_Y = 0.1;     // point A: gate height — slightly above the lane (gentle diagonal)
    const GATE_X = 0.72;    // point A: gate distance off-screen (fraction of stage width)
    const smooth01 = (t) => {
      const c = Math.min(1, Math.max(0, t));
      return c * c * (3 - (2 * c));
    };

    const ringPoint = (p, stageW, stageH) => {
      // Rotation ramps in only once the card is on the ring, and out before it leaves
      const ramp = smooth01((p - RING_START) / 0.1) * (1 - smooth01((p - (RING_END - 0.1)) / 0.1));
      // A portrait viewport would turn the original stage-relative path into a
      // tall loop. Keep the phone preview on a deliberate horizontal ellipse;
      // its widest points may pass beyond the screen and be naturally clipped.
      const ringRadiusX = useMobileLayout ? stageW * 0.56 : stageW * 0.36;
      const ringRadiusY = useMobileLayout ? stageW * 0.39 : stageH * LANE_Y;
      const ringLaneY = ringRadiusY / stageH;

      let x;
      let y;
      let z;
      let baseScale;
      let phi = 0;

      if (p < RING_START) {
        // Fast entry dash: straight line A → B (slightly diagonal), growing 0.8 → 1
        const t = p / RING_START;
        x = (-GATE_X + (GATE_X * t)) * stageW;
        y = (GATE_Y + ((ringLaneY - GATE_Y) * t)) * stageH;
        z = 220;
        baseScale = 0.8 + (0.2 * t);
      } else if (p > RING_END) {
        // Fast exit dash: straight line B' → A' (slightly diagonal), shrinking 1 → 0.8
        const t = (p - RING_END) / (1 - RING_END);
        x = GATE_X * t * stageW;
        y = (ringLaneY + ((GATE_Y - ringLaneY) * t)) * stageH;
        z = 220;
        baseScale = 1 - (0.2 * t);
        phi = 360;
      } else {
        // On the ring: depth peaks at the bottom (closest), min at the top (distant)
        const t = (p - RING_START) / (RING_END - RING_START);
        phi = RING_SWEEP * t;
        const phiRad = phi * (Math.PI / 180);
        const cosPhi = Math.cos(phiRad);
        x = ringRadiusX * Math.sin(phiRad);
        y = ringRadiusY * cosPhi;
        z = 220 * cosPhi;
        baseScale = 0.68 + (0.32 * ((cosPhi + 1) * 0.5));
      }

      const phiRad = phi * (Math.PI / 180);
      return {
        x,
        y,
        z,
        rotateY: 62 * Math.sin(phiRad) * ramp, // capped well below edge-on
        rotateZ: -8 * Math.sin(phiRad) * ramp,
        scale: baseScale,
        curve: ramp, // 0 = flat (lanes) → 1 = fully curled around the ring
        // the curl relaxes as the card turns side-on, so outer strips never hit 90°
        bendScale: 1 - (0.5 * Math.abs(Math.sin(phiRad)))
      };
    };

    const stageSize = () => ({
      w: transitionStage?.clientWidth || scrollContainer.clientWidth,
      h: transitionStage?.clientHeight || scrollContainer.clientHeight
    });
    const sizeScale = () => {
      const { w, h } = stageSize();
      return Math.min(1, Math.max(0.55, Math.min(w / 1920, h / 1080) * 1.06));
    };

    // Physical curl: each card is a row of vertical strips fanned around a cylinder.
    // curve = 0 → strips sit flat side by side; curve = 1 → strips wrap the ring's arc.
    const BEND_MAX = 0.62; // radians of curl at full wrap
    const exhibitStrips = exhibitCardElements.map((el) => Array.from(el.querySelectorAll('.wt-exhibit-strip')));
    const layoutStrips = (strips, cfg, curve) => {
      const radius = cfg.width / BEND_MAX;
      const stripWidth = cfg.width / CARD_STRIP_COUNT;
      const mid = (CARD_STRIP_COUNT - 1) / 2;
      strips.forEach((stripEl) => {
        const offset = Number(stripEl.dataset.stripIndex) - mid;
        // Back faces share the same fan transform, flipped 180° in their local frame —
        // so the card shows the image from both sides like a physical print.
        const flip = stripEl.dataset.face === 'back' ? ' rotateY(180deg)' : '';
        stripEl.style.transform =
          `translateX(${(offset * stripWidth * (1 - curve)).toFixed(2)}px) ` +
          `rotateY(${(offset * (BEND_MAX * curve) / CARD_STRIP_COUNT).toFixed(4)}rad) ` +
          `translateZ(${(radius * curve).toFixed(2)}px)${flip}`;
      });
    };

    const renderCardFlow = () => {
      const { w, h } = stageSize();
      const s = sizeScale();

      exhibitCardElements.forEach((el, index) => {
        const cfg = visibleTransitionCards[index];
        const p = flowState.travel - (index * FLOW_GAP);

        if (p <= 0 || p >= 1 || (isMobile && cfg.mobileHide)) {
          gsap.set(el, { autoAlpha: 0 });
          return;
        }

        const pos = ringPoint(p, w, h);
        const fade = Math.min(1, p / 0.06, (1 - p) / 0.06); // fade only inside the two gate dashes
        const scale = pos.scale * s;
        const curl = pos.curve * pos.bendScale; // full curl facing camera, relaxed when side-on

        gsap.set(el, {
          x: pos.x,
          y: pos.y,
          // keep the cylinder's centre strip on the authored depth plane
          z: (pos.z * s) - ((cfg.width / BEND_MAX) * curl * scale),
          rotateX: 0,
          rotateY: pos.rotateY * rotScale,
          rotateZ: pos.rotateZ,
          scale,
          autoAlpha: fade
        });
        layoutStrips(exhibitStrips[index], cfg, curl);
      });
    };

    gsap.set(exhibitCopy, { xPercent: -50, yPercent: -50, z: 0 });
    gsap.set(exhibitCardElements, {
      xPercent: -50,
      yPercent: -50,
      autoAlpha: 0,
      transformOrigin: '50% 50%'
    });

    if (prefersReducedMotion) {
      // Static composition: cards parked along the ring, sentence fully visible.
      const { w, h } = stageSize();
      const s = sizeScale();
      exhibitCardElements.forEach((el, index) => {
        const cfg = visibleTransitionCards[index];
        if (index >= 5 || (isMobile && cfg.mobileHide)) {
          gsap.set(el, { autoAlpha: 0 });
          return;
        }
        const pos = ringPoint(0.3 + (index * 0.1), w, h);
        const scale = pos.scale * s * 0.9;
        const curl = pos.curve * pos.bendScale;
        gsap.set(el, {
          x: pos.x,
          y: pos.y,
          z: -((cfg.width / BEND_MAX) * curl * scale),
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale,
          autoAlpha: 0.92
        });
        layoutStrips(exhibitStrips[index], cfg, curl);
      });
      gsap.set(textGroups, { opacity: 1, y: 0, filter: 'blur(0px)' });
    } else {
      gsap.set(textGroups, { opacity: 0, y: 8, filter: 'blur(8px)' });
      renderCardFlow();
    }
    if (USE_BUBBLE_CONTACT_EXPERIMENT) {
      gsap.set(bubbleExperience, { autoAlpha: 0 });
      gsap.set(bubbleBlackout, { autoAlpha: 0 });
      gsap.set(bubbleDisc, {
        autoAlpha: 0,
        xPercent: -50,
        scale: 0.008,
        transformOrigin: '50% 50%'
      });
      gsap.set(bubbleWhitePanel, {
        autoAlpha: 0,
        clipPath: 'circle(0.68vmax at 50% 100%)',
        yPercent: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      });
      gsap.set(bubbleContactWord, {
        autoAlpha: 0,
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        y: 46,
        filter: 'blur(8px)'
      });
      gsap.set(bubbleFinalScene, { autoAlpha: 0 });
      gsap.set(bubbleFinalMeta, { autoAlpha: 0, y: -16, filter: 'blur(6px)' });
      gsap.set(bubbleFinalName, { yPercent: 118, filter: 'blur(10px)' });
      gsap.set(bubbleAsciiLeft, { autoAlpha: 0, x: -430, y: 28 });
      gsap.set(bubbleAsciiRight, { autoAlpha: 0, x: 430, y: 28 });
      gsap.set(bubbleContactFolder, {
        autoAlpha: 0,
        y: 20,
        scale: 0.86,
        transformOrigin: '50% 50%'
      });
    } else {
      gsap.set(contactWash, {
        autoAlpha: 0
      });
      gsap.set('.wt-contact-gradient-curtain', { y: 0 });
      gsap.set(contactTransitionTitle, { autoAlpha: 0, yPercent: 0, filter: 'blur(0px)' });
      gsap.set(contactTransitionTitleInner, { yPercent: 112 });
      gsap.set(contactScene, { autoAlpha: 0 });
      gsap.set(contactContainer, { scale: 0.85, transformOrigin: '50% 50%' });
      gsap.set(contactItems, { autoAlpha: 0, scale: 0.5, filter: 'blur(14px)', transformOrigin: '50% 50%' });
      gsap.set(contactFooter, { autoAlpha: 0 });
      gsap.set(contactFolder, { pointerEvents: 'none' });
      gsap.set(contactSideRays, { autoAlpha: 0 });
    }
    const textTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.wt-blur-section',
        scroller: scrollContainer,
        start: 'top top',
        end: USE_BUBBLE_CONTACT_EXPERIMENT ? '+=1120%' : '+=820%',
        pin: true,
        pinType: 'fixed',
        scrub: 0.4,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onRefresh: renderCardFlow
      }
    });

    if (!prefersReducedMotion) {
      // The whole card train is one scrub-driven value: positions are a pure
      // function of scroll progress, so the line freezes when scrolling stops.
      textTl.to(flowState, {
        travel: flowTravelEnd,
        duration: 7.3,
        ease: 'none',
        onUpdate: renderCardFlow
      }, 0);

      // Sentence resolves into focus group by group, then dissolves in reverse order
      // while the cards keep travelling.
      textTl
        .to(textGroups, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.65,
          stagger: 0.18,
          ease: 'power2.out'
        }, 0.06)
        .to(textGroups, {
          opacity: 0,
          y: -7,
          filter: 'blur(9px)',
          duration: 0.55,
          stagger: { each: 0.11, from: 'end' },
          ease: 'power2.in'
        }, 4.76);
    }

    if (USE_BUBBLE_CONTACT_EXPERIMENT) {
      const bubbleStart = prefersReducedMotion ? 1.5 : 7.75;
      const whiteSettleOffset = prefersReducedMotion ? 0.42 : 1.55;
      const bubbleRevealOffset = prefersReducedMotion ? 0.05 : 0.22;
      const bubbleRevealDuration = whiteSettleOffset - bubbleRevealOffset;
      const contactTravelOffset = prefersReducedMotion ? 0.82 : 3.48;
      const panelLiftOffset = prefersReducedMotion ? 1.2 : 5.08;
      const finalRevealOffset = prefersReducedMotion ? 1.38 : 5.72;
      const handsRevealOffset = prefersReducedMotion ? 1.55 : 6.42;

      textTl
        .addLabel('bubbleStart', bubbleStart)
        .to(bubbleExperience, {
          autoAlpha: 1,
          duration: 0.01
        }, 'bubbleStart')
        .to(bubbleBlackout, {
          autoAlpha: 1,
          duration: prefersReducedMotion ? 0.25 : 0.78,
          ease: 'none'
        }, 'bubbleStart')
        .set(bubbleWhitePanel, {
          autoAlpha: 1
        }, `bubbleStart+=${bubbleRevealOffset}`)
        .to(bubbleWhitePanel, {
          clipPath: useMobileLayout
            ? 'circle(112vmax at 50% 100%)'
            : 'circle(85vmax at 50% 100%)',
          duration: bubbleRevealDuration,
          ease: prefersReducedMotion ? 'none' : 'power2.inOut'
        }, `bubbleStart+=${bubbleRevealOffset}`)
        .to(bubbleContactWord, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: prefersReducedMotion ? 0.25 : 0.72,
          ease: 'power3.out'
        }, `bubbleStart+=${whiteSettleOffset + 0.08}`)
        .to(bubbleContactWord, {
          y: '-72vh',
          autoAlpha: 0,
          filter: 'blur(4px)',
          duration: prefersReducedMotion ? 0.3 : 1.08,
          ease: 'power2.in'
        }, `bubbleStart+=${contactTravelOffset}`)
        .set(bubbleFinalScene, {
          autoAlpha: 1
        }, `bubbleStart+=${panelLiftOffset - 0.12}`)
        .to(bubbleWhitePanel, {
          yPercent: -112,
          borderBottomLeftRadius: 'clamp(1.5rem, 3vw, 3.5rem)',
          borderBottomRightRadius: 'clamp(1.5rem, 3vw, 3.5rem)',
          duration: prefersReducedMotion ? 0.4 : 1.42,
          ease: 'power2.inOut'
        }, `bubbleStart+=${panelLiftOffset}`)
        .to(bubbleFinalMeta, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.08,
          duration: prefersReducedMotion ? 0.25 : 0.62,
          ease: 'power2.out'
        }, `bubbleStart+=${finalRevealOffset}`)
        .to(bubbleFinalName, {
          yPercent: 0,
          filter: 'blur(0px)',
          duration: prefersReducedMotion ? 0.35 : 1.08,
          ease: 'power3.out'
        }, `bubbleStart+=${finalRevealOffset + 0.08}`)
        .to(bubbleAsciiLeft, {
          autoAlpha: 1,
          x: -82,
          y: 0,
          duration: prefersReducedMotion ? 0.45 : 1.92,
          ease: 'power2.out'
        }, `bubbleStart+=${handsRevealOffset}`)
        .to(bubbleAsciiRight, {
          autoAlpha: 1,
          x: 82,
          y: 0,
          duration: prefersReducedMotion ? 0.45 : 1.92,
          ease: 'power2.out'
        }, '<')
        .to(bubbleContactFolder, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: prefersReducedMotion ? 0.35 : 0.9,
          ease: 'power3.out'
        }, `bubbleStart+=${handsRevealOffset + 0.28}`)
        .to({}, { duration: prefersReducedMotion ? 0.25 : 0.95 });
    } else {
    const gradientRevealDuration = prefersReducedMotion ? 0.5 : 3.75;
    const titleRevealOffset = prefersReducedMotion ? 0.12 : 1.48;
    const titleRevealDuration = prefersReducedMotion ? 0.3 : 1.18;
    const contactRevealOffset = prefersReducedMotion ? 0.95 : 4.86;
    const contactItemsOffset = prefersReducedMotion ? 1.02 : 5.04;
    const contactReadyOffset = prefersReducedMotion ? 1.52 : 5.84;
    const contactFooterOffset = prefersReducedMotion ? 1.35 : 5.58;

    // Slow background colour journey for the contact scene: the wash starts from a
    // deep cool blue, and the final indigo layer crossfades in on top via opacity
    // only — no gradient-string interpolation, so it can never flicker or jump.
    const contactWashDrift = document.querySelector('.wt-contact-wash-drift');
    gsap.set(contactWashDrift, { autoAlpha: 0 });

    textTl
      .addLabel('gradientRise', prefersReducedMotion ? 1.5 : 7.75)
      .to(contactWash, {
        autoAlpha: 1,
        duration: prefersReducedMotion ? 0.2 : 2.35,
        ease: 'none'
      }, 'gradientRise')
      .to('.wt-contact-gradient-curtain', {
        y: '-140vh',
        duration: gradientRevealDuration,
        ease: 'none'
      }, 'gradientRise')
      // The background keeps slowly changing long after the reveal — the indigo
      // layer crossfades over the cool blue start, settling just before the
      // pin releases at the bottom of the page
      .to(contactWashDrift, {
        autoAlpha: 1,
        duration: prefersReducedMotion ? 0.8 : 5.1,
        ease: 'sine.inOut'
      }, `gradientRise+=${prefersReducedMotion ? 0.1 : 0.9}`)
      .to(contactTransitionTitle, {
        autoAlpha: 1,
        duration: 0.08
      }, `gradientRise+=${titleRevealOffset}`)
      .to(contactTransitionTitleInner, {
        yPercent: 0,
        duration: titleRevealDuration,
        ease: 'power3.out'
      }, '<')
      .to(contactScene, {
        autoAlpha: 1,
        duration: 0.18
      }, `gradientRise+=${contactRevealOffset}`)
      .to(contactSideRays, {
        autoAlpha: 1,
        duration: 1.2,
        ease: 'power2.out'
      }, `gradientRise+=${contactRevealOffset + 0.02}`)
      .to(contactContainer, {
        scale: 1,
        duration: 1.1,
        ease: 'power2.out'
      }, `gradientRise+=${contactRevealOffset + 0.04}`)
      .to(contactItems, {
        autoAlpha: 1,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.09,
        duration: 0.82,
        ease: 'power3.out'
      }, `gradientRise+=${contactItemsOffset}`)
      .set(contactFolder, {
        pointerEvents: 'auto'
      }, `gradientRise+=${contactReadyOffset}`)
      .to(contactFooter, {
        autoAlpha: 1,
        duration: 0.4,
        ease: 'power1.out'
      }, `gradientRise+=${contactFooterOffset}`)
      // rest so the finished scene holds before the pin releases at page bottom
      .to({}, { duration: 0.45 });
    }

    // Recalculate measurements once webfonts are ready
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    }, scrollContainer);

    return () => {
      try {
        ctx.revert();
      } catch {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      }
    };
  }, [isMobile, useMobileLayout, activeCaseStudy, activeNavPage]);

  // triggerScreenTransition definition moved to top of component to support memoized callbacks

  const openCaseStudy = (project) => {
    caseStudyScrollRef.current = containerRef.current?.scrollTop || 0;
    triggerScreenTransition(() => {
      setActiveCaseStudy(project);
    });
  };

  const closeCaseStudy = () => {
    triggerScreenTransition(() => {
      setActiveCaseStudy(null);
      window.requestAnimationFrame(() => {
        if (containerRef.current) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(caseStudyScrollRef.current, { immediate: true, force: true });
          } else {
            containerRef.current.scrollTop = caseStudyScrollRef.current;
          }
        }
        ScrollTrigger.refresh();
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(caseStudyScrollRef.current, { immediate: true, force: true });
            } else {
              containerRef.current.scrollTop = caseStudyScrollRef.current;
            }
          }
        });
        window.setTimeout(() => {
          if (containerRef.current) {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(caseStudyScrollRef.current, { immediate: true, force: true });
            } else {
              containerRef.current.scrollTop = caseStudyScrollRef.current;
            }
          }
        }, 120);
      });
    });
  };

  return (
    <div
      className={`App wt-scroll-container wt-header-theme-${headerTheme}${useMobileLayout ? ' wt-mobile-preview' : ''}${activeCaseStudy || activeNavPage ? ' wt-case-open' : ''}${activeNavPage ? ' wt-nav-chrome-visible' : ''}`}
      ref={containerRef}
      style={{ overflowY: 'auto', overflowX: 'hidden' }}
    >
      <div className="background-wrapper wt-darkveil-background" aria-hidden="true">
        <DarkVeil
          hueShift={headerThemeHueShifts[headerTheme] ?? headerThemeHueShifts.violet}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={1}
          scanlineFrequency={0}
          warpAmount={3}
          resolutionScale={useMobileLayout ? 0.72 : 1.3}
          dpr={useMobileLayout ? 1 : 2}
        />
        <div className="background-fade-overlay" />
      </div>

      {/* Light rays page background — hidden at the hero, fades in on first scroll */}
      <div className="wt-light-rays-bg" aria-hidden="true">
        <LightRays
          raysOrigin="top-center"
          raysColor={headerTheme === 'red' ? '#b52b3a' : '#6f7ff2'}
          raysSpeed={0.8}
          lightSpread={0.7}
          rayLength={1.4}
          fadeDistance={0.9}
          saturation={0.6}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0.04}
          distortion={0.03}
          dpr={useMobileLayout ? 1 : 2}
        />
      </div>

      {/* Header Navigation Bar */}
      <WebsiteTestHeader
        onNavigate={openNavPage}
        menuReturnToken={menuReturnToken}
        onProjectPicker={handleProjectPicker}
        onGalleryPrepare={preparePlaygroundGallery}
        onGalleryClick={handleOpenPlayground}
        themePreset={headerTheme}
        onThemePresetChange={setHeaderTheme}
        forceCollapsed={Boolean(activeNavPage) || useMobileLayout}
        onMenuScrollLock={handleMenuScrollLock}
        mobilePreview={useMobileLayout}
        showThemeControls={!activeCaseStudy && !activeNavPage}
        onLogoClick={() => triggerScreenTransition(() => {
          if (activeNavPage) {
            setActiveNavPage(null);
          }
          if (containerRef.current) {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(0, { immediate: true, force: true });
            } else {
              containerRef.current.scrollTop = 0;
            }
          }
          window.requestAnimationFrame(() => ScrollTrigger.refresh());
        })}
      />

      <div ref={contentRef} className="wt-scroll-content">
      {/* Hero Content Section */}
      <section className="hero-section">
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            {shouldLoadLanyard && (
              <div className="lanyard-container">
                <Lanyard
                  position={isMobile ? [0, 0, 35] : [0, 0, 20]}
                  gravity={[0, -40, 0]}
                  dpr={useMobileLayout ? [1, 1] : [1, 1.5]}
                />
              </div>
            )}
          </Suspense>
        </ErrorBoundary>

        <div className="hero-text">
          <h1 className="hero-text__name" aria-label="TAMAS GAL">
            <span className="hero-text__line">TAMA<span className="wt-hero-terminal-glyph">S</span></span>
            <span className="hero-text__line">GAL</span>
          </h1>
          <p className="hero-text__subtitle">
            <span className="wt-hero-role-line">
              <span>A Budapest-based Hungarian</span>
              <HeroRoleReel />
            </span>
            <span className="wt-hero-specialties">
              Specializing in 3D visualization, vector illustration, social media content, web and interface design.
            </span>
          </p>
        </div>

      </section>

      {/* ─── 1. Sticky Projects Section ─── */}
      <section id="work" className="wt-projects-section">
        <div className="wt-projects-stage">
          <div className="wt-featured-visual-stack">
            <div className="wt-featured-image-wrap">
              <div className="wt-featured-image-track">
                {featuredProjects.map((project, projectIndex) => (
                  project.video && !useMobileLayout ? (
                    <video
                      key={project.title}
                      className="wt-featured-image wt-featured-image-layer"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      poster={project.image || card1Image}
                      aria-label={`${project.title} project preview`}
                    >
                      <source src={project.video} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      key={project.title}
                      src={project.image || card1Image}
                      alt={`${project.title} project preview`}
                      className="wt-featured-image wt-featured-image-layer"
                      loading={projectIndex === 0 ? 'eager' : 'lazy'}
                      fetchPriority={projectIndex === 0 ? 'high' : 'low'}
                    />
                  )
                ))}
              </div>
              <div className="wt-image-progress" aria-hidden="true">
                {featuredProjects.map((item, dotIndex) => (
                  <span
                    className={`wt-image-progress-dot${dotIndex === 0 ? ' is-active' : ''}`}
                    key={`${item.title}-dot`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="wt-featured-copy-stack" aria-label="Selected work details">
            {featuredProjects.map((project, projectIndex) => (
              <div className="wt-featured-copy" key={`${project.title}-copy`}>
                <p className="wt-featured-count">
                  <span>{String(projectIndex + 1).padStart(2, '0')}</span>
                  <small>/ {String(featuredProjects.length).padStart(2, '0')}</small>
                </p>
                <div className="wt-featured-title-group">
                  <h3>{project.title}</h3>
                  <button
                    type="button"
                    className="wt-featured-button"
                    onClick={() => openCaseStudy(project)}
                  >
                    View case study
                  </button>
                </div>
                <p className="wt-featured-description">{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        {!useMobileLayout && <div className="wt-projects-container wt-projects-container--legacy" aria-hidden="true">
          <div className="wt-projects-left">
            <div>
              <p className="section-label">Work</p>
              <h2 className="section-title">Selected<br/>Projects</h2>
            </div>
            <div style={{color: 'rgba(255,255,255,0.5)', maxWidth: '400px', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <p>A collection of my latest works ranging from 3D visualization to UI design. Scroll to explore the details.</p>
              <p>Each project is approached with a unique perspective, ensuring that the final result not only looks stunning but also serves its functional purpose perfectly.</p>
            </div>
          </div>
          
          <div className="wt-projects-right">
            {[1, 2, 3, 4, 5, 6].map((num, index) => (
              <React.Fragment key={num}>
                <div className="wt-project-card project-card-anim" onClick={() => setSelectedWork(num)} style={{ cursor: 'pointer' }}>
                  <img src={card1Image} alt={`Project ${num}`} className="wt-project-card-image" loading="lazy" />
                  <div className="wt-project-card-overlay">
                    <h3 className="wt-project-card-title">Project {num}</h3>
                  </div>
                </div>
                {/* Spacer between cards to create scroll distance without affecting sticky bounding box calculations */}
                {index < 5 && <div style={{ height: '50vh', width: '100%', flexShrink: 0 }} aria-hidden="true"></div>}
              </React.Fragment>
            ))}
            {/* Invisible spacer to extend the content box, allowing Project 6 to stay sticky for an extra 90vh */}
            <div style={{ height: '90vh', width: '100%', flexShrink: 0 }} aria-hidden="true"></div>
          </div>
        </div>}
      </section>

      {/* ─── 2. Text Reveal → Gradient Title Transition → Contact Scene ─── */}
      <section id="contact" className="wt-blur-section wt-skill-transition-section">
        <div className="wt-skill-transition-stage">
          {USE_BUBBLE_CONTACT_EXPERIMENT && (
            <div className="wt-bubble-contact-experience">
              <div className="wt-bubble-blackout" aria-hidden="true" />

              <div className="wt-bubble-final-scene">
                <div className="wt-bubble-final-meta">
                  <div className="wt-bubble-final-meta__identity">
                    <span>tamasgaldesign@gmail.com</span>
                  </div>
                  <div className="wt-bubble-final-meta__nav" aria-label="Portfolio sections">
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => openNavPage('work', 'footer')}
                    >
                      <span className="roll-text">
                        <span className="roll-text__original">Work</span>
                        <span className="roll-text__copy">Work</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="nav-link-btn"
                      onClick={() => openNavPage('about', 'footer')}
                    >
                      <span className="roll-text">
                        <span className="roll-text__original">About</span>
                        <span className="roll-text__copy">About</span>
                      </span>
                    </button>
                  </div>
                </div>

                <AsciiHandsArtWithTrail mobilePreview={useMobileLayout} />

                <div className="wt-bubble-contact-folder">
                  <Folder
                    size={isMobile ? 0.9 : 1.18}
                    color="#b8b8c0"
                    className="custom-folder"
                    items={socialItems}
                  />
                  <span className="wt-bubble-contact-folder-hint">Click to open</span>
                </div>

                <div className="wt-bubble-final-name-mask">
                  <h2 className="wt-bubble-final-name">
                    <span>Tamas</span> <em>Gal</em><i>.</i>
                  </h2>
                </div>
                <p className="wt-bubble-final-email">tamasgaldesign@gmail.com</p>
              </div>

              <div className="wt-bubble-disc" aria-hidden="true" />
              <div className="wt-bubble-white-panel">
                <DeferredColorBends
                  className="wt-contact-color-bends"
                  colors={CONTACT_BEND_PALETTES[headerTheme] || CONTACT_BEND_PALETTES.violet}
                  rotation={90}
                  autoRotate={2.4}
                  speed={0.18}
                  scale={1}
                  frequency={1}
                  warpStrength={1}
                  mouseInfluence={0}
                  parallax={0}
                  noise={0.08}
                  iterations={1}
                  intensity={1.45}
                  bandWidth={6}
                  transparent
                />
                <h2 className="wt-bubble-contact-word">contact</h2>
              </div>
            </div>
          )}

          {!USE_BUBBLE_CONTACT_EXPERIMENT && (
            <>
              <div className="wt-contact-wash" aria-hidden="true">
                <div className="wt-contact-gradient-curtain" />
              </div>
              <div className="wt-contact-wash-drift" aria-hidden="true" />
              <div className="wt-contact-transition-title" aria-hidden="true">
                <div className="wt-contact-transition-title__mask">
                  <h2 className="wt-contact-transition-title__inner">
                    <span>Let's work</span> <em>together.</em>
                  </h2>
                </div>
              </div>
            </>
          )}

          {/* 3D exhibition stage: nine choreographed cards + the central sentence */}
          <div className="wt-exhibit-stage">
            {visibleTransitionCards.map((card) => (
              <figure
                className="wt-exhibit-card"
                key={card.id}
                role="img"
                aria-label={card.alt}
                style={{ width: `${card.width}px`, height: `${card.height}px` }}
              >
                {['front', 'back'].map((face) => (
                  Array.from({ length: CARD_STRIP_COUNT }, (_, stripIndex) => (
                    <span
                      className="wt-exhibit-strip"
                      key={`${card.id}-${face}-${stripIndex}`}
                      data-face={face}
                      data-strip-index={stripIndex}
                      aria-hidden="true"
                      style={{
                        width: `${100 / CARD_STRIP_COUNT}%`,
                        marginLeft: `${-50 / CARD_STRIP_COUNT}%`,
                        backgroundImage: `url(${card.image})`,
                        backgroundSize: `${CARD_STRIP_COUNT * 100}% 100%`,
                        backgroundPosition: `${(stripIndex / (CARD_STRIP_COUNT - 1)) * 100}% 0`
                      }}
                    />
                  ))
                ))}
              </figure>
            ))}

            <h2 className="wt-exhibit-copy" aria-label="Each project is a chance to learn, experiment and push my limits.">
              <span className="wt-exhibit-line" aria-hidden="true">
                <span className="wt-exhibit-group">Each project</span>{' '}
                <span className="wt-exhibit-group">is a chance</span>
              </span>
              <span className="wt-exhibit-line" aria-hidden="true">
                <span className="wt-exhibit-group">to</span>{' '}
                <span className="wt-exhibit-group wt-exhibit-group--serif">learn, experiment</span>{' '}
                <span className="wt-exhibit-group">and</span>
              </span>
              <span className="wt-exhibit-line" aria-hidden="true">
                <span className="wt-exhibit-group">push my</span>{' '}
                <span className="wt-exhibit-group">limits.</span>
              </span>
            </h2>
          </div>

          {/* Final scene: contact content lives inside the pin and is revealed by the same timeline */}
          {!USE_BUBBLE_CONTACT_EXPERIMENT && (
          <div className="wt-contact-scene">
            <div className="wt-contact-side-rays" aria-hidden="true">
              <SideRays
                speed={1.4}
                rayColor1="#f4f1ff"
                rayColor2="#9fd8ff"
                intensity={2.4}
                spread={2.15}
                origin="top-right"
                tilt={0}
                saturation={1.25}
                blend={0.65}
                falloff={1.45}
                opacity={1}
              />
            </div>
            <div className="wt-contact-container">
              <p className="wt-contact-desc">
                I'm always looking for new projects and collaborations. If you have a project in mind, or just want to say hello, please get in touch.
              </p>

              <div className="folder-container wt-contact-folder">
                <Folder size={isMobile ? 1.3 : 1.65} color="#b8b8c0" className="custom-folder" items={socialItems} />
                <div className="folder-base-line" style={{ marginTop: '55px' }} />
              </div>

              <div className="wt-contact-profile">
                <p className="wt-profile-name">Tamas Gal</p>
                <span className="wt-profile-email">tamasgaldesign@gmail.com</span>
              </div>

            </div>

            <footer className="wt-new-footer">
              <p className="wt-footer-copyright">© 2026 Tamas Gal - All rights reserved</p>
            </footer>
          </div>
          )}
        </div>
      </section>
      </div>

      {/* Modals */}
      {selectedWork && (
        <Suspense fallback={null}>
          <WorkModal workId={selectedWork} onClose={() => setSelectedWork(null)} />
        </Suspense>
      )}
      {showResumeModal && (
        <Suspense fallback={null}>
          <ResumeModal onClose={() => setShowResumeModal(false)} />
        </Suspense>
      )}

      {activeCaseStudy && (
        <main className="wt-case-study-page" data-lenis-prevent>
          <button type="button" className="wt-case-back" onClick={closeCaseStudy}>
            <span aria-hidden="true">←</span> Back
          </button>
          <section className="wt-case-hero">
            <p className="wt-case-kicker">Case study</p>
            <h1>{activeCaseStudy.title}</h1>
            <p className="wt-case-subtitle">{activeCaseStudy.description}</p>
            <div className="wt-case-media">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={activeCaseStudy.image}
                aria-label={`${activeCaseStudy.title} case study video`}
              >
                <source src={activeCaseStudy.video} type="video/mp4" />
              </video>
            </div>
          </section>
        </main>
      )}

      {activeNavPage === 'work' && (
        <Suspense fallback={null}>
          <WorkArchivePage themePreset={headerTheme} />
        </Suspense>
      )}

      {activeNavPage === 'about' && (
        <Suspense fallback={null}>
          <AboutProfilePage skills={skillLogos} themePreset={headerTheme} />
        </Suspense>
      )}

      {activeNavPage === 'contact' && (
        <Suspense fallback={null}>
          <ContactFormPage themePreset={headerTheme} />
        </Suspense>
      )}

      {isPlaygroundOpen && (
        <Suspense fallback={null}>
          <PlaygroundDome onClose={handleClosePlayground} />
        </Suspense>
      )}

    </div>
  );
};

export default WebsiteTest;
