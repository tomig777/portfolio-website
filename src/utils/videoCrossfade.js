import { createAnimationLoop } from './animationLoop.js';

// One owner for the archive's two-video loop. Start each fade once, retain its
// progress while hidden, and leave no playing video or frame callback on exit.
export function createVideoCrossfade(current, next, onComplete, duration = 3) {
  let disposed = false;
  let completed = false;
  let fading = false;

  current.style.transition = `opacity ${duration}s linear`;
  current.style.opacity = 1;
  current.style.zIndex = 1;
  next.style.transition = 'none';
  next.style.opacity = 0;
  next.style.zIndex = 2;
  next.pause();
  next.currentTime = 0;

  const play = (video) => {
    if (!video.paused) return;
    // Muted autoplay can still be denied by a browser or a data-saving setting.
    Promise.resolve(video.play()).catch(() => {});
  };

  const loop = createAnimationLoop(() => {
    const remaining = current.duration - current.currentTime;
    if (!Number.isFinite(remaining) || current.duration <= 0) return;
    if (!fading && remaining <= duration) {
      fading = true;
      play(next);
      next.style.transition = `opacity ${duration}s linear`;
      next.style.opacity = 1;
    }
    if (current.ended || remaining <= 0.1) {
      completed = true;
      loop.setActive(false);
      onComplete();
    }
  }, { maxFps: 30 });

  const syncPlayback = () => {
    if (disposed || completed) return;
    if (document.visibilityState === 'hidden') {
      current.pause();
      next.pause();
    } else {
      play(current);
      if (fading) play(next);
    }
  };
  document.addEventListener('visibilitychange', syncPlayback);
  syncPlayback();

  return () => {
    disposed = true;
    document.removeEventListener('visibilitychange', syncPlayback);
    loop.dispose();
    current.pause();
    next.pause();
  };
}
