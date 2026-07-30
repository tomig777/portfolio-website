import React, { useCallback, useEffect, useRef, useState } from 'react';
import './SketchRelay.css';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 560;
const SURFACE_COLOR = '#d8d9d5';

const paintBlankSurface = (context) => {
  context.save();
  context.fillStyle = SURFACE_COLOR;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // A deterministic grain keeps the drawing surface tactile without an image asset.
  context.globalAlpha = 0.11;
  for (let index = 0; index < 760; index += 1) {
    const x = (index * 73) % CANVAS_WIDTH;
    const y = (index * 151) % CANVAS_HEIGHT;
    context.fillStyle = index % 3 === 0 ? '#ffffff' : '#90918e';
    context.fillRect(x, y, 1, 1);
  }
  context.restore();
};

const SketchRelay = () => {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const virtualCursorRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const knobDragRef = useRef(null);
  const clearFrameRef = useRef(null);
  const [cursorPoint, setCursorPoint] = useState({ x: 50, y: 50 });
  const [knobTurns, setKnobTurns] = useState({ x: 0, y: 0 });
  const [isClearing, setIsClearing] = useState(false);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d', { alpha: false });
  }, []);

  const resetSurface = useCallback(() => {
    const context = getContext();
    if (!context) return;
    paintBlankSurface(context);
    virtualCursorRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    setCursorPoint({ x: 50, y: 50 });
  }, [getContext]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    resetSurface();

    return () => {
      if (clearFrameRef.current) cancelAnimationFrame(clearFrameRef.current);
    };
  }, [resetSurface]);

  const pointFromPointer = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(CANVAS_WIDTH, ((event.clientX - bounds.left) / bounds.width) * CANVAS_WIDTH)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT, ((event.clientY - bounds.top) / bounds.height) * CANVAS_HEIGHT)),
    };
  }, []);

  const drawLine = useCallback((from, to) => {
    const context = getContext();
    if (!context || isClearing) return;

    context.save();
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.strokeStyle = '#2d2e30';
    context.lineWidth = 4.2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.shadowColor = 'rgba(18, 18, 18, 0.16)';
    context.shadowBlur = 1.5;
    context.stroke();
    context.restore();

    virtualCursorRef.current = to;
    setCursorPoint({
      x: (to.x / CANVAS_WIDTH) * 100,
      y: (to.y / CANVAS_HEIGHT) * 100,
    });
  }, [getContext, isClearing]);

  const handleCanvasPointerDown = (event) => {
    if (isClearing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromPointer(event);
    if (!point) return;
    drawingRef.current = true;
    lastPointRef.current = point;
    virtualCursorRef.current = point;
    setCursorPoint({
      x: (point.x / CANVAS_WIDTH) * 100,
      y: (point.y / CANVAS_HEIGHT) * 100,
    });
  };

  const handleCanvasPointerMove = (event) => {
    if (!drawingRef.current) return;
    const point = pointFromPointer(event);
    const previous = lastPointRef.current;
    if (!point || !previous) return;

    drawLine(previous, point);
    setKnobTurns((current) => ({
      x: current.x + (point.x - previous.x) * 0.42,
      y: current.y + (point.y - previous.y) * 0.42,
    }));
    lastPointRef.current = point;
  };

  const stopCanvasDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const beginKnobDrag = (axis, event) => {
    if (isClearing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    knobDragRef.current = {
      axis,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  };

  const moveKnob = (axis, event) => {
    const drag = knobDragRef.current;
    if (!drag || drag.axis !== axis || drag.pointerId !== event.pointerId) return;

    const rawDelta = axis === 'x' ? event.clientX - drag.lastX : event.clientY - drag.lastY;
    const movement = rawDelta * 4.2;
    const previous = virtualCursorRef.current;
    const next = {
      x: axis === 'x' ? Math.max(0, Math.min(CANVAS_WIDTH, previous.x + movement)) : previous.x,
      y: axis === 'y' ? Math.max(0, Math.min(CANVAS_HEIGHT, previous.y + movement)) : previous.y,
    };

    drawLine(previous, next);
    setKnobTurns((current) => ({
      ...current,
      [axis]: current[axis] + rawDelta * 2.4,
    }));

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
  };

  const stopKnobDrag = () => {
    knobDragRef.current = null;
  };

  const clearDrawing = useCallback(() => {
    if (isClearing) return;
    const context = getContext();
    if (!context) return;

    setIsClearing(true);
    const startedAt = Date.now();
    const duration = 760;
    let previousWidth = 0;

    const wipe = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      const width = Math.ceil(CANVAS_WIDTH * eased);

      context.save();
      context.fillStyle = SURFACE_COLOR;
      context.fillRect(previousWidth, 0, Math.max(1, width - previousWidth), CANVAS_HEIGHT);
      context.restore();
      previousWidth = width;

      setKnobTurns((current) => ({
        x: current.x + 22,
        y: current.y - 22,
      }));

      if (progress < 1) {
        clearFrameRef.current = requestAnimationFrame(wipe);
      } else {
        paintBlankSurface(context);
        virtualCursorRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
        setCursorPoint({ x: 50, y: 50 });
        setIsClearing(false);
        clearFrameRef.current = null;
      }
    };

    clearFrameRef.current = requestAnimationFrame(wipe);
  }, [getContext, isClearing]);

  return (
    <main className="sketch-relay">
      <header className="sketch-relay__intro">
        <p className="sketch-relay__eyebrow">Project 03 / Collaborative toy</p>
        <h1>Sketch <em>Relay</em></h1>
        <p>Leave a line, a note, or a tiny idea behind.</p>
      </header>

      <section className="sketch-board-section" aria-label="Interactive drawing board">
        <div className="sketch-board">
          <div className="sketch-board__shine" aria-hidden="true" />
          <div className="sketch-board__screen-frame">
            <div className={`sketch-board__screen${isClearing ? ' is-clearing' : ''}`}>
              <canvas
                ref={canvasRef}
                className="sketch-board__canvas"
                aria-label="Drawing surface. Drag to draw."
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={stopCanvasDrawing}
                onPointerCancel={stopCanvasDrawing}
                onPointerLeave={stopCanvasDrawing}
              />
              <span
                className="sketch-board__cursor"
                style={{ left: `${cursorPoint.x}%`, top: `${cursorPoint.y}%` }}
                aria-hidden="true"
              />
              <span className="sketch-board__wipe" aria-hidden="true" />
            </div>
          </div>

          <div className="sketch-board__controls">
            <div className="sketch-board__dial-group">
              <span className="sketch-board__axis">Horizontal</span>
              <button
                type="button"
                className="sketch-board__knob"
                style={{ '--knob-turn': `${knobTurns.x}deg` }}
                aria-label="Horizontal drawing knob"
                onPointerDown={(event) => beginKnobDrag('x', event)}
                onPointerMove={(event) => moveKnob('x', event)}
                onPointerUp={stopKnobDrag}
                onPointerCancel={stopKnobDrag}
              >
                <span />
              </button>
            </div>

            <div className="sketch-board__center-controls">
              <div className="sketch-board__brand">
                <span>Sketch</span>
                <strong>Relay</strong>
              </div>
              <button
                type="button"
                className={`sketch-board__clear${isClearing ? ' is-turning' : ''}`}
                onClick={clearDrawing}
                disabled={isClearing}
                aria-label="Turn the wipe knob to clear the drawing"
              >
                <span aria-hidden="true" />
                <small>Wipe</small>
              </button>
            </div>

            <div className="sketch-board__dial-group">
              <span className="sketch-board__axis">Vertical</span>
              <button
                type="button"
                className="sketch-board__knob"
                style={{ '--knob-turn': `${knobTurns.y}deg` }}
                aria-label="Vertical drawing knob"
                onPointerDown={(event) => beginKnobDrag('y', event)}
                onPointerMove={(event) => moveKnob('y', event)}
                onPointerUp={stopKnobDrag}
                onPointerCancel={stopKnobDrag}
              >
                <span />
              </button>
            </div>
          </div>
        </div>

        <p className="sketch-board__hint">
          Draw directly on the screen or drag the two dials. Turn the small wipe knob to start again.
        </p>
      </section>
    </main>
  );
};

export default SketchRelay;
