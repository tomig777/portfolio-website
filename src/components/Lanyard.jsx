'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// replace with your own imports, see the usage snippet for details
import cardGLB from '../assets/newcard.glb';
import lanyard from '../assets/web-optimized/lanyard.webp';

import * as THREE from 'three';
import './Lanyard.css';
import useGraphicsActivity from '../hooks/useGraphicsActivity';
import { isFinitePoint, lanyardLerpAlpha, updateLanyardGeometry } from '../utils/lanyardGeometry';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true, dpr = 1, active = true }) {
  const containerRef = useRef();
  const { running } = useGraphicsActivity(containerRef, active);
  const paused = !running;

  return (
    <div ref={containerRef} className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        gl={{
          alpha: transparent,
          antialias: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
        dpr={dpr}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
        }}
        frameloop={paused ? 'never' : 'demand'}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60} paused={paused}>
          <Band isVisible={!paused} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
function Band({ maxSpeed = 50, minSpeed = 0, isVisible = true }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const [{ vec, ang, rot, dir, smoothed, curveSamples }] = useState(() => ({
    vec: new THREE.Vector3(),
    ang: new THREE.Vector3(),
    rot: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    smoothed: [new THREE.Vector3(), new THREE.Vector3()],
    curveSamples: Array.from({ length: 33 }, () => new THREE.Vector3())
  }));
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const smoothingInitialized = useRef(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      drag(false);
      hover(false);
    }
  }, [isVisible]);

  useFrame((state, delta) => {
    if (!isVisible || !band.current || !fixed.current || !j1.current || !j2.current || !j3.current || !card.current) return;

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      vec.sub(dragged);
      if (isFinitePoint(vec)) card.current.setNextKinematicTranslation(vec);
    }
    {
      const translations = [j1.current.translation(), j2.current.translation(), j3.current.translation(), fixed.current.translation()];
      if (!translations.every(isFinitePoint)) return;
      for (let index = 0; index < 2; index++) {
        const point = smoothed[index];
        const target = translations[index];
        if (!smoothingInitialized.current || !isFinitePoint(point)) point.copy(target);
        point.lerp(target, lanyardLerpAlpha(delta, point.distanceTo(target), minSpeed, maxSpeed));
      }
      smoothingInitialized.current = true;

      curve.points[0].copy(translations[2]);
      curve.points[1].copy(smoothed[1]);
      curve.points[2].copy(smoothed[0]);
      curve.points[3].copy(translations[3]);
      for (let i = 0; i < curveSamples.length; i += 1) {
        curve.getPoint(i / 32, curveSamples[i]);
      }
      const ropeChanged = updateLanyardGeometry(band.current.geometry, curveSamples);
      const moving = Boolean(dragged) || ropeChanged
        || !j1.current.isSleeping() || !j2.current.isSleeping() || !j3.current.isSleeping() || !card.current.isSleeping();
      const motion = moving ? 'moving' : 'settled';
      if (state.gl.domElement.dataset.lanyardMotion !== motion) state.gl.domElement.dataset.lanyardMotion = motion;
      // Rapier invalidates while bodies are active. Continue just long enough
      // for the smoothed rope to catch up, then leave the canvas completely idle.
      if (ropeChanged || dragged) state.invalidate();

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      if (!card.current.isSleeping() && isFinitePoint(ang) && isFinitePoint(rot)) {
        ang.y -= rot.y * 0.25;
        card.current.setAngvel(ang, false);
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerCancel={() => drag(false)}
            onLostPointerCapture={() => drag(false)}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
          transparent={false}
          opacity={1}
        />
      </mesh>
    </>
  );
}
