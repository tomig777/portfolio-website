import { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { detectDevicePerformance, getPerformanceSettings } from '../utils/performance';
import './Plasma.css';
import { createAnimationLoop } from '../utils/animationLoop';
import useGraphicsActivity from '../hooks/useGraphicsActivity';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
uniform float uIterations;
uniform float uHorizontal;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i = 0.0, d = 0.0, z = 0.0, T = iTime * uSpeed * uDirection;
  vec3 O = vec3(0.0), p = vec3(0.0), S = vec3(0.0);

  for (vec2 r = iResolution.xy, Q; ++i < float(uIterations); O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;

    if (uHorizontal > 0.5) {
      d = p.x + T;
      p.y += .4*(1.+p.x)*sin(d + p.y*0.1)*cos(.34*d + p.y*0.05);
      Q = p.zy *= mat2(cos(p.x+vec4(0,11,33,0)+T));
      z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.x))/3.+8e-4;
      o = 1.+sin(S.x+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
    } else {
      d = p.y - T;
      p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
      Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
      z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
      o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
    }
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma = ({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  flowDirection = 'vertical',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  paused = false
}) => {
  const containerRef = useRef(null);
  const [settings] = useState(() => getPerformanceSettings(detectDevicePerformance()));
  const propsRef = useRef({});
  const uniformsRef = useRef(null);
  const animationRef = useRef(null);
  const runningRef = useRef(false);
  const { ready, running } = useGraphicsActivity(containerRef, !paused);

  useEffect(() => {
    runningRef.current = running;
    animationRef.current?.setActive(running);
  }, [running]);

  useEffect(() => {
    propsRef.current = { color, speed, direction, flowDirection, scale, opacity, mouseInteractive };
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    uniforms.uCustomColor.value.set(color ? hexToRgb(color) : [1, 1, 1]);
    uniforms.uUseCustomColor.value = color ? 1 : 0;
    uniforms.uSpeed.value = speed * 0.4;
    uniforms.uDirection.value = direction === 'reverse' ? -1 : 1;
    uniforms.uHorizontal.value = flowDirection === 'horizontal' ? 1 : 0;
    uniforms.uScale.value = scale;
    uniforms.uOpacity.value = opacity;
    uniforms.uMouseInteractive.value = mouseInteractive ? 1 : 0;
  }, [color, speed, direction, flowDirection, scale, opacity, mouseInteractive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !container) return;
    const { color, speed, direction, flowDirection, scale, opacity, mouseInteractive } = propsRef.current;

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    try {
      const renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: 1, // Fixed at 1 to save resources
        powerPreference: 'low-power',
        preserveDrawingBuffer: false,
        depth: false, // Disable depth buffer
        stencil: false // Disable stencil buffer
      });
      const gl = renderer.gl;

      if (!gl) {
        console.error('WebGL not supported');
        return;
      }

      const canvas = gl.canvas;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '1';
      container.appendChild(canvas);

      const geometry = new Triangle(gl);

      const program = new Program(gl, {
        vertex: vertex,
        fragment: fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uCustomColor: { value: new Float32Array(customColorRgb) },
          uUseCustomColor: { value: useCustomColor },
          uSpeed: { value: speed * 0.4 },
          uDirection: { value: directionMultiplier },
          uScale: { value: scale },
          uOpacity: { value: opacity },
          uMouse: { value: new Float32Array([0, 0]) },
          uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
          uIterations: { value: settings.plasmaIterations },
          uHorizontal: { value: flowDirection === 'horizontal' ? 1.0 : 0.0 }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });
      uniformsRef.current = program.uniforms;

      const handleMouseMove = e => {
        if (!propsRef.current.mouseInteractive || !runningRef.current) return;
        const rect = container.getBoundingClientRect();
        const mouseUniform = program.uniforms.uMouse.value;
        mouseUniform[0] = e.clientX - rect.left;
        mouseUniform[1] = e.clientY - rect.top;
      };

      container.addEventListener('mousemove', handleMouseMove, { passive: true });

      const setSize = () => {
        const rect = container.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height);
        const res = program.uniforms.iResolution.value;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
      };

      const ro = new ResizeObserver(setSize);
      ro.observe(container);
      setSize();

      const t0 = window.performance.now();
      const loop = t => {
        const timeValue = (t - t0) * 0.001;
        if (propsRef.current.direction === 'pingpong') {
          const cycle = Math.sin(timeValue * 0.5) * directionMultiplier;
          program.uniforms.uDirection.value = cycle;
        }

        program.uniforms.iTime.value = timeValue;
        renderer.render({ scene: mesh });
      };
      const animation = createAnimationLoop(loop, { maxFps: settings.frameRate, active: runningRef.current });
      animationRef.current = animation;

      return () => {
        animation.dispose();
        animationRef.current = null;
        uniformsRef.current = null;
        ro.disconnect();
        container.removeEventListener('mousemove', handleMouseMove);
        geometry.remove();
        program.remove();
        canvas.remove();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    } catch (error) {
      console.error('Plasma component error:', error);
      console.error('Error details:', error.message, error.stack);
    }
  }, [ready, settings]);

  return (
    <div ref={containerRef} className="plasma-container" style={{
      minHeight: '100vh'
    }} />
  );
};

export default Plasma;
