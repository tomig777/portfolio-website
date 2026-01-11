import React, { useState, useRef, useEffect } from 'react';
import './FloatingOrbs.css';

const FloatingOrbs = ({ side = 'left' }) => {
    const containerRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
        };

        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`floating-orbs floating-orbs--${side}`}
        >
            {/* Main orb that follows mouse */}
            <div
                className="orb orb-main"
                style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                }}
            />

            {/* Ambient floating orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Decorative stars */}
            <span className="floating-star" style={{ left: '20%', top: '15%' }}>✦</span>
            <span className="floating-star" style={{ left: '75%', top: '25%' }}>✦</span>
            <span className="floating-star" style={{ left: '35%', top: '70%' }}>✦</span>
            <span className="floating-star" style={{ left: '80%', top: '80%' }}>✦</span>

            <span className="orbs-label">
                {side === 'left' ? 'REACH OUT' : 'CONNECT'}
            </span>
        </div>
    );
};

export default FloatingOrbs;
