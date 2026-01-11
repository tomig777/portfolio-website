import React, { useState } from 'react';
import './InteractiveRing.css';

const InteractiveRing = ({ label = 'SPIN ME' }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotationCount, setRotationCount] = useState(0);

    const handleClick = () => {
        setIsSpinning(true);
        setRotationCount(prev => prev + 1);

        // Reset spinning state after animation
        setTimeout(() => {
            setIsSpinning(false);
        }, 1000);
    };

    return (
        <div
            className={`interactive-ring ${isSpinning ? 'spinning' : ''}`}
            onClick={handleClick}
            style={{ '--rotation-count': rotationCount }}
        >
            <div className="ring-outer" />
            <div className="ring-middle" />
            <div className="ring-inner">
                <div className="ring-center">
                    <span className="ring-icon">✦</span>
                </div>
            </div>
            <div className="ring-dots">
                <span className="ring-dot" />
                <span className="ring-dot" />
                <span className="ring-dot" />
                <span className="ring-dot" />
            </div>
            <span className="ring-label">{label}</span>
        </div>
    );
};

export default InteractiveRing;
