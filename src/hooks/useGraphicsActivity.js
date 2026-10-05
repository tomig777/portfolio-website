import { useEffect, useRef, useState } from 'react';
import { observeGraphicsActivity } from '../utils/graphicsActivity';

// Allocate an effect once on first display; keep its last frame while paused.
export default function useGraphicsActivity(containerRef, active = true) {
  const controllerRef = useRef(null);
  const activeRef = useRef(active);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    activeRef.current = active;
    controllerRef.current?.setActive(active);
  }, [active]);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const controller = observeGraphicsActivity(element, next => {
      if (next) setReady(true);
      setRunning(next);
    }, { active: activeRef.current });
    controllerRef.current = controller;
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [containerRef]);
  return { ready, running };
}
