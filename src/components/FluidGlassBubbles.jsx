import * as THREE from 'three';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';

const DEFAULT_COLORS = [
  '#360021',
  '#650031',
  '#a6004b',
  '#e40070',
  '#ff188f',
  '#ff67bd',
  '#f2a6db',
  '#f0d4e9',
  '#f7f3f1',
];

const COLOR_FIELD_VERTEX = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const COLOR_FIELD_FRAGMENT = `
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform vec3 uColor7;
  uniform vec3 uColor8;
  varying vec2 vUv;

  vec3 palette(float rawIndex) {
    float index = mod(rawIndex, 9.0);
    if (index < 0.5) return uColor0;
    if (index < 1.5) return uColor1;
    if (index < 2.5) return uColor2;
    if (index < 3.5) return uColor3;
    if (index < 4.5) return uColor4;
    if (index < 5.5) return uColor5;
    if (index < 6.5) return uColor6;
    if (index < 7.5) return uColor7;
    return uColor8;
  }

  void main() {
    vec2 centered = vUv - 0.5;
    centered.x *= uAspect;
    float radius = length(centered);
    float bandWidth = 0.13;
    float travel = mod(uTime * 0.084, bandWidth * 9.0);
    float layer = (radius - travel) / bandWidth;
    float layerIndex = floor(layer);
    float edgeBlend = smoothstep(0.58, 0.98, fract(layer));

    vec3 color = mix(
      palette(layerIndex),
      palette(layerIndex + 1.0),
      edgeBlend
    );

    float upperGlow = 1.0 - smoothstep(0.0, 0.66, length(centered - vec2(-0.12, 0.15)));
    color += vec3(1.0, 0.32, 0.66) * upperGlow * 0.055;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ColorField = ({ colors, speed }) => {
  const materialRef = useRef(null);
  const phaseRef = useRef(0);
  const { viewport } = useThree();
  const initialColors = colors || DEFAULT_COLORS;
  const targetColors = useMemo(
    () => initialColors.map((color) => new THREE.Color(color)),
    [initialColors],
  );
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAspect: { value: viewport.width / viewport.height },
    ...Object.fromEntries(
      DEFAULT_COLORS.map((color, index) => [
        `uColor${index}`,
        { value: new THREE.Color(color) },
      ]),
    ),
  }), [viewport.height, viewport.width]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    phaseRef.current += delta * speed;
    materialRef.current.uniforms.uTime.value = phaseRef.current;

    const blend = 1 - Math.exp(-delta * 5);
    targetColors.forEach((color, index) => {
      materialRef.current.uniforms[`uColor${index}`].value.lerp(color, blend);
    });
  });

  return (
    <mesh position={[0, 0, -2.4]} scale={[viewport.width * 1.16, viewport.height * 1.16, 1]}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={COLOR_FIELD_VERTEX}
        fragmentShader={COLOR_FIELD_FRAGMENT}
        toneMapped={false}
      />
    </mesh>
  );
};

const LensField = () => {
  const meshRef = useRef(null);
  const { invalidate, viewport } = useThree();

  const layout = useMemo(() => {
    const diameter = Math.max(0.34, Math.min(0.52, viewport.width / 24));
    const rowStep = diameter * 0.86;
    const columns = Math.ceil(viewport.width / diameter) + 5;
    const rows = Math.ceil(viewport.height / rowStep) + 5;
    return {
      diameter,
      rowStep,
      columns,
      rows,
      count: columns * rows,
    };
  }, [viewport.height, viewport.width]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const startX = -((layout.columns - 1) * layout.diameter) / 2;
    const startY = ((layout.rows - 1) * layout.rowStep) / 2;
    let instance = 0;

    for (let row = 0; row < layout.rows; row += 1) {
      const stagger = row % 2 === 0 ? 0 : layout.diameter * 0.5;
      for (let column = 0; column < layout.columns; column += 1) {
        dummy.position.set(
          startX + column * layout.diameter + stagger,
          startY - row * layout.rowStep,
          0,
        );
        dummy.scale.set(0.98, 0.98, 0.3);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(instance, dummy.matrix);
        instance += 1;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
    invalidate();
  }, [invalidate, layout]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, layout.count]} position={[0, 0, 0]}>
      <sphereGeometry args={[layout.diameter * 0.5, 28, 18]} />
      <MeshTransmissionMaterial
        transmission={1}
        roughness={0.08}
        thickness={0.72}
        ior={1.22}
        chromaticAberration={0.055}
        anisotropy={0.12}
        distortion={0.18}
        distortionScale={0.22}
        temporalDistortion={0}
        attenuationColor="#ffb5df"
        attenuationDistance={2.8}
        color="#fff7fc"
        samples={3}
        resolution={512}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

const FluidGlassBubbles = ({
  colors = DEFAULT_COLORS,
  speed = 1,
}) => (
  <Canvas
    orthographic
    camera={{ position: [0, 0, 10], zoom: 80 }}
    dpr={[1, 1.5]}
    frameloop="always"
    gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
  >
    <color attach="background" args={['#f7f3f1']} />
    <ambientLight intensity={0.9} />
    <directionalLight position={[-4, 7, 8]} intensity={2.4} color="#ffffff" />
    <directionalLight position={[6, -4, 5]} intensity={0.8} color="#ff8cca" />
    <ColorField colors={colors} speed={speed} />
    <LensField />
  </Canvas>
);

export default FluidGlassBubbles;
