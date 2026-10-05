import React, { useRef, useEffect, useState } from 'react';
import './VideoBackground.css';
import backgroundVideo from '../assets/web-optimized/background-faststart.mp4';
import { createVideoCrossfade } from '../utils/videoCrossfade';

const CROSSFADE_DURATION = 3;

const VideoBackground = ({
    fallbackColor = '#1a1a1a'
}) => {
    const video1Ref = useRef(null);
    const video2Ref = useRef(null);
    const [activeVideo, setActiveVideo] = useState(1);

    useEffect(() => {
        const v1 = video1Ref.current;
        const v2 = video2Ref.current;

        if (!v1 || !v2) return;

        const current = activeVideo === 1 ? v1 : v2;
        const next = activeVideo === 1 ? v2 : v1;
        return createVideoCrossfade(current, next, () => {
            setActiveVideo(prev => prev === 1 ? 2 : 1);
        }, CROSSFADE_DURATION);
    }, [activeVideo]);

    const videoProps = {
        className: "video-background",
        muted: true,
        playsInline: true,
        disablePictureInPicture: true,
        controlsList: "nodownload nofullscreen noremoteplayback"
    };

    return (
        <div className="video-background-container" style={{ backgroundColor: fallbackColor }}>
            <video
                ref={video1Ref}
                {...videoProps}
                style={{
                    transition: `opacity ${CROSSFADE_DURATION}s linear`,
                    // Initial styles will be overridden by logic but good defaults
                    opacity: activeVideo === 1 ? 1 : 0
                }}
            >
                <source src={backgroundVideo} type="video/mp4" />
            </video>
            <video
                ref={video2Ref}
                {...videoProps}
                style={{
                    transition: `opacity ${CROSSFADE_DURATION}s linear`,
                    opacity: activeVideo === 2 ? 1 : 0
                }}
            >
                <source src={backgroundVideo} type="video/mp4" />
            </video>
            <div className="video-overlay" />
        </div>
    );
};

export default VideoBackground;
