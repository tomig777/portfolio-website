import React, { useRef, useEffect, useState } from 'react';
import './VideoBackground.css';
import backgroundVideo from '../assets/background.mp4';

const VideoBackground = ({
    fallbackColor = '#1a1a1a',
    opacity = 1.0
}) => {
    const video1Ref = useRef(null);
    const video2Ref = useRef(null);
    const [activeVideo, setActiveVideo] = useState(1);

    // Config: Longer fade for smoothness
    const CROSSFADE_DURATION = 3.0;

    useEffect(() => {
        const v1 = video1Ref.current;
        const v2 = video2Ref.current;

        if (!v1 || !v2) return;

        // "Current" is the one currently playing and visible
        // "Next" is the one waiting to fade in
        const current = activeVideo === 1 ? v1 : v2;
        const next = activeVideo === 1 ? v2 : v1;

        // Ensure stable state after a swap
        current.style.transition = `opacity ${CROSSFADE_DURATION}s linear`;
        current.style.opacity = 1;
        current.style.zIndex = 1;

        // Reset the "next" video instantly (no transition)
        next.style.transition = 'none';
        next.style.opacity = 0;
        next.style.zIndex = 2; // It will be on top when it fades in

        if (!next.paused) {
            next.pause();
            next.currentTime = 0;
        }

        // Force reflow to apply 'none' transition if needed, though usually requestAnimationFrame handles it.
        // We restore the transition style right before we need it in the loop.

        // Ensure current is playing if not already
        if (current.paused) current.play().catch(() => { });

        let animationFrameId;

        const loop = () => {
            if (current.duration) {
                const timeLeft = current.duration - current.currentTime;

                // Start transition
                if (timeLeft <= CROSSFADE_DURATION) {
                    if (next.paused) {
                        next.play().catch(() => { });
                    }
                    // Restore transition for the fade-in
                    next.style.transition = `opacity ${CROSSFADE_DURATION}s linear`;
                    // Force reflow/paint separation if needed, but usually this is fine 
                    // because opacity change happens in same frame but transition prop is set

                    requestAnimationFrame(() => {
                        next.style.opacity = 1;
                    });
                }

                // Swap when current finishes
                // We depend on 'ended' or extremely close to end to avoid gaps
                if (current.ended || timeLeft <= 0.1) {
                    setActiveVideo(prev => prev === 1 ? 2 : 1);
                    return; // Stop this loop, effect will re-run
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animationFrameId);
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
