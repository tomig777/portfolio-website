import { useEffect, useRef, useState } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './SideRays.css';

const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255,
      ]
    : [1, 1, 1];
};

const originToFlip = (origin) => {
  switch (origin) {
    case 'top-left':
      return [1, 0];
    case 'bottom-right':
      return [0, 1];
    case 'bottom-left':
      return [1, 1];
    default:
      return [0, 0];
  }
};

const SideRays = ({
  speed = 2.5,
  rayColor1 = '#ffaa6e',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1,
  className = '',
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!isVisible || !container) return undefined;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1 : 2),
      alpha: true,
    });
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.replaceChildren(gl.canvas);

    const vertex = `
      attribute vec2 position;

      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = `
      precision highp float;

      uniform float iTime;
      uniform vec2 iResolution;
      uniform float iSpeed;
      uniform vec3 iRayColor1;
      uniform vec3 iRayColor2;
      uniform float iIntensity;
      uniform float iSpread;
      uniform float iFlipX;
      uniform float iFlipY;
      uniform float iTilt;
      uniform float iSaturation;
      uniform float iBlend;
      uniform float iFalloff;
      uniform float iOpacity;

      float rayStrength(
        vec2 source,
        vec2 referenceDirection,
        vec2 coordinate,
        float seedA,
        float seedB,
        float speed
      ) {
        vec2 sourceToCoordinate = coordinate - source;
        float angle = dot(normalize(sourceToCoordinate), referenceDirection);
        float wave = clamp(
          (0.45 + 0.15 * sin(angle * seedA + iTime * speed)) +
          (0.3 + 0.2 * cos(-angle * seedB + iTime * speed)),
          0.0,
          1.0
        );
        float distanceFade = clamp(
          (iResolution.x - length(sourceToCoordinate)) / iResolution.x,
          0.5,
          1.0
        );
        return wave * distanceFade;
      }

      void main() {
        vec2 fragmentCoordinate = gl_FragCoord.xy;
        if (iFlipX > 0.5) {
          fragmentCoordinate.x = iResolution.x - fragmentCoordinate.x;
        }
        if (iFlipY > 0.5) {
          fragmentCoordinate.y = iResolution.y - fragmentCoordinate.y;
        }

        vec2 coordinate = vec2(
          fragmentCoordinate.x,
          iResolution.y - fragmentCoordinate.y
        );
        vec2 rayPosition = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);
        float tiltRadians = iTilt * 3.14159265 / 180.0;
        float cosine = cos(tiltRadians);
        float sine = sin(tiltRadians);
        vec2 relativeCoordinate = coordinate - rayPosition;
        vec2 tiltedCoordinate = vec2(
          relativeCoordinate.x * cosine - relativeCoordinate.y * sine,
          relativeCoordinate.x * sine + relativeCoordinate.y * cosine
        ) + rayPosition;

        float halfSpread = iSpread * 0.275;
        vec2 firstDirection = normalize(vec2(
          cos(0.785398 + halfSpread),
          sin(0.785398 + halfSpread)
        ));
        vec2 secondDirection = normalize(vec2(
          cos(0.785398 - halfSpread),
          sin(0.785398 - halfSpread)
        ));
        vec4 firstRays = vec4(iRayColor1, 1.0) * rayStrength(
          rayPosition,
          firstDirection,
          tiltedCoordinate,
          36.2214,
          21.11349,
          iSpeed
        );
        vec4 secondRays = vec4(iRayColor2, 1.0) * rayStrength(
          rayPosition,
          secondDirection,
          tiltedCoordinate,
          22.3991,
          18.0234,
          iSpeed * 0.2
        );
        vec4 color =
          firstRays * (1.0 - iBlend) * 0.9 +
          secondRays * iBlend * 0.9;

        float distanceToLight = length(
          fragmentCoordinate - vec2(rayPosition.x, iResolution.y - rayPosition.y)
        ) / iResolution.y;
        float brightness =
          iIntensity * 0.4 /
          pow(max(distanceToLight, 0.001), iFalloff);
        color.rgb *= brightness;

        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(gray), color.rgb, iSaturation);
        color.a = max(color.r, max(color.g, color.b)) * iOpacity;
        gl_FragColor = color;
      }
    `;

    const [flipX, flipY] = originToFlip(origin);
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      iSpeed: { value: speed },
      iRayColor1: { value: hexToRgb(rayColor1) },
      iRayColor2: { value: hexToRgb(rayColor2) },
      iIntensity: { value: intensity },
      iSpread: { value: spread },
      iFlipX: { value: flipX },
      iFlipY: { value: flipY },
      iTilt: { value: tilt },
      iSaturation: { value: saturation },
      iBlend: { value: blend },
      iFalloff: { value: falloff },
      iOpacity: { value: opacity },
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value = [
        width * renderer.dpr,
        height * renderer.dpr,
      ];
    };

    let animationFrame = 0;
    let lastRender = 0;
    const frameInterval = window.innerWidth <= 768 ? 1000 / 30 : 0;
    const render = (time) => {
      animationFrame = requestAnimationFrame(render);
      if (document.visibilityState !== 'visible') return;
      if (frameInterval && time - lastRender < frameInterval) return;
      lastRender = time;
      uniforms.iTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      container.replaceChildren();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    blend,
    falloff,
    intensity,
    isVisible,
    opacity,
    origin,
    rayColor1,
    rayColor2,
    saturation,
    speed,
    spread,
    tilt,
  ]);

  return (
    <div
      ref={containerRef}
      className={`side-rays-container ${className}`.trim()}
    />
  );
};

export default SideRays;
