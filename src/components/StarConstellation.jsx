import React, { useState, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center } from '@react-three/drei';
import starModelUrl from '../assets/star.glb';
import './StarConstellation.css';

const StarModel = ({ isHovered }) => {
    const { scene } = useGLTF(starModelUrl);
    // Clone scene to allow multiple instances on the screen without them stealing each other's references
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            if (isHovered) {
                // Fast spin when hovered
                groupRef.current.rotation.y += delta * 3;
                // Approach center smoothly
                groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.1;
            } else {
                // Slow idle float
                groupRef.current.rotation.y += delta * 0.8;
                groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
            }
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                <primitive object={clonedScene} scale={0.28} />
            </Center>
        </group>
    );
};

const StarConstellation = ({ side = 'left', onEasterEgg }) => {
    const [isClicked, setIsClicked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef(null);

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 600);

        // Easter egg: triple-click detection
        clickCountRef.current += 1;

        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
        }

        if (clickCountRef.current >= 3) {
            clickCountRef.current = 0;
            if (onEasterEgg) onEasterEgg();
            return;
        }

        clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0;
        }, 600);
    };

    return (
        <div className="single-star-container">
            <button
                className={`single-star ${isClicked ? 'clicked' : ''}`}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Decorative star"
            >
                <span className="single-star-glow" />
                <div style={{ width: '120px', height: '120px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[10, 10, 10]} intensity={3} />
                        <directionalLight position={[-10, -10, -10]} intensity={1} />
                        <Environment preset="studio" />
                        <Suspense fallback={null}>
                            <StarModel isHovered={isHovered} />
                        </Suspense>
                    </Canvas>
                </div>
            </button>
            <span className="single-star-label">
                {side === 'left' ? 'DREAM' : 'CREATE'}
            </span>
        </div>
    );
};

useGLTF.preload(starModelUrl);

export default StarConstellation;

