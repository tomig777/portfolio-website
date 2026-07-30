import { useEffect, useRef } from 'react';
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';
import './AuroraBackground.css';

const VERTEX_SHADER = `#version 300 es
  in vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `#version 300 es
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform vec3 uColorStops[3];
  uniform vec2 uResolution;
  uniform float uBlend;

  out vec4 fragColor;

  vec3 permute(vec3 value) {
    return mod(((value * 34.0) + 1.0) * value, 289.0);
  }

  float simplexNoise(vec2 value) {
    const vec4 coefficients = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 cell = floor(value + dot(value, coefficients.yy));
    vec2 local = value - cell + dot(cell, coefficients.xx);
    vec2 offset = local.x > local.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 corners = local.xyxy + coefficients.xxzz;
    corners.xy -= offset;
    cell = mod(cell, 289.0);

    vec3 permutation = permute(
      permute(cell.y + vec3(0.0, offset.y, 1.0)) +
      cell.x +
      vec3(0.0, offset.x, 1.0)
    );
    vec3 attenuation = max(
      0.5 - vec3(
        dot(local, local),
        dot(corners.xy, corners.xy),
        dot(corners.zw, corners.zw)
      ),
      0.0
    );
    attenuation *= attenuation;
    attenuation *= attenuation;

    vec3 gradient = 2.0 * fract(permutation * coefficients.www) - 1.0;
    vec3 height = abs(gradient) - 0.5;
    vec3 rounded = floor(gradient + 0.5);
    vec3 adjusted = gradient - rounded;
    attenuation *= 1.79284291400159 -
      0.85373472095314 * (adjusted * adjusted + height * height);

    vec3 contribution;
    contribution.x = adjusted.x * local.x + height.x * local.y;
    contribution.yz = adjusted.yz * corners.xz + height.yz * corners.yw;

    return 130.0 * dot(attenuation, contribution);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec3 firstBlend = mix(
      uColorStops[0],
      uColorStops[1],
      smoothstep(0.0, 0.5, uv.x)
    );
    vec3 secondBlend = mix(
      uColorStops[1],
      uColorStops[2],
      smoothstep(0.5, 1.0, uv.x)
    );
    vec3 rampColor = mix(firstBlend, secondBlend, step(0.5, uv.x));

    float height = simplexNoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25));
    height = exp(height * 0.5 * uAmplitude);
    height = uv.y * 2.0 - height + 0.2;
    float intensity = 0.6 * height;
    float midpoint = 0.2;
    float alpha = smoothstep(
      midpoint - uBlend * 0.5,
      midpoint + uBlend * 0.5,
      intensity
    );

    fragColor = vec4(intensity * rampColor * alpha, alpha);
  }
`;

const AuroraBackground = ({
  colorStops = ['#3a29ff', '#ff94b4', '#ff3232'],
  amplitude = 1,
  blend = 0.5,
  speed = 1,
}) => {
  const containerRef = useRef(null);
  const propsRef = useRef({ colorStops, amplitude, blend, speed });
  propsRef.current = { colorStops, amplitude, blend, speed };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = 'transparent';

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const toColorArray = (stops) => stops.map((hex) => {
      const color = new Color(hex);
      return [color.r, color.g, color.b];
    });

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: toColorArray(colorStops) },
        uResolution: { value: [container.offsetWidth, container.offsetHeight] },
        uBlend: { value: blend },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };

    let animationFrame = 0;
    const render = (time) => {
      const current = propsRef.current;
      program.uniforms.uTime.value = time * 0.0001 * current.speed;
      program.uniforms.uAmplitude.value = current.amplitude;
      program.uniforms.uBlend.value = current.blend;
      program.uniforms.uColorStops.value = toColorArray(current.colorStops);
      renderer.render({ scene: mesh });
      animationFrame = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [amplitude, blend, colorStops]);

  return <div ref={containerRef} className="aurora-background" />;
};

export default AuroraBackground;
