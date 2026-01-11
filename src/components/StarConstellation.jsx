import React, { useState } from 'react';
import './StarConstellation.css';

const StarConstellation = ({ side = 'left' }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 600);
    };

    return (
        <div className="single-star-container">
            <button
                className={`single-star ${isClicked ? 'clicked' : ''}`}
                onClick={handleClick}
                aria-label="Decorative star"
            >
                <span className="single-star-glow" />
                <span className="single-star-icon">✦</span>
            </button>
            <span className="single-star-label">
                {side === 'left' ? 'DREAM' : 'CREATE'}
            </span>
        </div>
    );
};

export default StarConstellation;
