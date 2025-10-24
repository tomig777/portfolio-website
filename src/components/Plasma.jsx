import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { detectDevicePerformance, getPerformanceSettings } from '../utils/performance';
import './Plasma.css';

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
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < float(uIterations); O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
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
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  paused = false
}) => {
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const devicePerformance = detectDevicePerformance();
  const settings = getPerformanceSettings(devicePerformance);

  useEffect(() => {
    if (!containerRef.current) return;

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
      console.log('Plasma canvas created and appended');
      containerRef.current.appendChild(canvas);

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
          uIterations: { value: settings.plasmaIterations }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });

      const handleMouseMove = e => {
        if (!mouseInteractive) return;
        const rect = containerRef.current.getBoundingClientRect();
        mousePos.current.x = e.clientX - rect.left;
        mousePos.current.y = e.clientY - rect.top;
        const mouseUniform = program.uniforms.uMouse.value;
        mouseUniform[0] = mousePos.current.x;
        mouseUniform[1] = mousePos.current.y;
      };

      if (mouseInteractive) {
        containerRef.current.addEventListener('mousemove', handleMouseMove);
      }

      const setSize = () => {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height);
        const res = program.uniforms.iResolution.value;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
      };

      const ro = new ResizeObserver(setSize);
      ro.observe(containerRef.current);
      setSize();

      let raf = 0;
      const t0 = window.performance.now();
      const loop = t => {
        // Skip animation if paused
        if (paused) {
          raf = requestAnimationFrame(loop);
          return;
        }

        let timeValue = (t - t0) * 0.001;

        if (direction === 'pingpong') {
          const cycle = Math.sin(timeValue * 0.5) * directionMultiplier;
          program.uniforms.uDirection.value = cycle;
        }

        program.uniforms.iTime.value = timeValue;
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        if (mouseInteractive && containerRef.current) {
          containerRef.current.removeEventListener('mousemove', handleMouseMove);
        }
        try {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          containerRef.current?.removeChild(canvas);
        } catch {
          console.warn('Canvas already removed from container');
        }
      };
    } catch (error) {
      console.error('Plasma component error:', error);
      console.error('Error details:', error.message, error.stack);
    }
  }, [color, speed, direction, scale, opacity, mouseInteractive, paused]);

  return (
    <div ref={containerRef} className="plasma-container" style={{ 
      minHeight: '100vh'
    }} />
  );
};

export default Plasma;