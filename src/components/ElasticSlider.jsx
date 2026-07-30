import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion as Motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { RiVolumeDownFill, RiVolumeUpFill } from 'react-icons/ri';

import './ElasticSlider.css';

const MAX_OVERFLOW = 50;

const decay = (value, max) => {
  if (max === 0) return 0;
  const entry = value / max;
  return 2 * (1 / (1 + Math.exp(-entry)) - 0.5) * max;
};

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

export default function ElasticSlider({
  value,
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon = <RiVolumeDownFill aria-hidden="true" />,
  rightIcon = <RiVolumeUpFill aria-hidden="true" />,
  onChange,
  onInteraction,
  ariaLabel = 'Volume'
}) {
  return (
    <div className={`elastic-slider ${className}`.trim()}>
      <Slider
        value={value}
        defaultValue={defaultValue}
        startingValue={startingValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onChange={onChange}
        onInteraction={onInteraction}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

function Slider({
  value: controlledValue,
  defaultValue,
  startingValue,
  maxValue,
  isStepped,
  stepSize,
  leftIcon,
  rightIcon,
  onChange,
  onInteraction,
  ariaLabel
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const sliderRef = useRef(null);
  const [region, setRegion] = useState('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);
  const currentValue = controlledValue ?? internalValue;

  useEffect(() => {
    if (controlledValue === undefined) setInternalValue(defaultValue);
  }, [controlledValue, defaultValue]);

  const commitValue = useCallback((nextValue) => {
    let normalizedValue = nextValue;
    if (isStepped) normalizedValue = Math.round(normalizedValue / stepSize) * stepSize;
    normalizedValue = clamp(normalizedValue, startingValue, maxValue);

    if (controlledValue === undefined) setInternalValue(normalizedValue);
    onChange?.(normalizedValue);
    onInteraction?.();
  }, [controlledValue, isStepped, maxValue, onChange, onInteraction, startingValue, stepSize]);

  useMotionValueEvent(clientX, 'change', (latest) => {
    if (!sliderRef.current) return;
    const { left, right } = sliderRef.current.getBoundingClientRect();

    if (latest < left) {
      setRegion('left');
      overflow.jump(decay(left - latest, MAX_OVERFLOW));
      return;
    }
    if (latest > right) {
      setRegion('right');
      overflow.jump(decay(latest - right, MAX_OVERFLOW));
      return;
    }

    setRegion('middle');
    overflow.jump(0);
  });

  const updateFromPointer = (clientPosition) => {
    if (!sliderRef.current) return;
    const { left, width } = sliderRef.current.getBoundingClientRect();
    const nextValue = startingValue + ((clientPosition - left) / width) * (maxValue - startingValue);
    commitValue(nextValue);
    clientX.jump(clientPosition);
  };

  const handlePointerMove = (event) => {
    if (event.buttons > 0) updateFromPointer(event.clientX);
  };

  const handlePointerDown = (event) => {
    updateFromPointer(event.clientX);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = () => {
    setRegion('middle');
    animate(overflow, 0, { type: 'spring', bounce: 0.5 });
  };

  const handleKeyDown = (event) => {
    const increment = isStepped ? stepSize : 1;
    let nextValue = currentValue;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextValue += increment;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextValue -= increment;
    else if (event.key === 'Home') nextValue = startingValue;
    else if (event.key === 'End') nextValue = maxValue;
    else return;

    event.preventDefault();
    commitValue(nextValue);
  };

  const range = maxValue - startingValue;
  const percentage = range === 0 ? 0 : ((currentValue - startingValue) / range) * 100;
  const iconOpacity = useTransform(scale, [1, 1.2], [0.7, 1]);
  const trackHeight = useTransform(scale, [1, 1.2], [5, 11]);
  const trackMarginTop = useTransform(scale, [1, 1.2], [0, -3]);
  const trackMarginBottom = useTransform(scale, [1, 1.2], [0, -3]);
  const trackScaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]);
  const leftOffset = useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0));
  const rightOffset = useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0));
  const trackScaleX = useTransform(() => {
    const width = sliderRef.current?.getBoundingClientRect().width || 1;
    return 1 + overflow.get() / width;
  });
  const transformOrigin = useTransform(() => {
    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds) return 'center';
    return clientX.get() < bounds.left + bounds.width / 2 ? 'right' : 'left';
  });

  return (
    <>
      <Motion.div
        className="elastic-slider__wrapper"
        style={{ scale, opacity: iconOpacity }}
      >
        <Motion.div
          className="elastic-slider__icon elastic-slider__icon--left"
          animate={{ scale: region === 'left' ? [1, 1.4, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: leftOffset }}
        >
          {leftIcon}
        </Motion.div>

        <div
          ref={sliderRef}
          className="elastic-slider__root"
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-valuemin={startingValue}
          aria-valuemax={maxValue}
          aria-valuenow={Math.round(currentValue)}
          aria-valuetext={`${Math.round(currentValue)} percent`}
          onKeyDown={handleKeyDown}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          <Motion.div
            className="elastic-slider__track-wrapper"
            style={{
              scaleX: trackScaleX,
              scaleY: trackScaleY,
              transformOrigin,
              height: trackHeight,
              marginTop: trackMarginTop,
              marginBottom: trackMarginBottom
            }}
          >
            <div className="elastic-slider__track">
              <div className="elastic-slider__range" style={{ width: `${percentage}%` }} />
            </div>
          </Motion.div>
        </div>

        <Motion.div
          className="elastic-slider__icon elastic-slider__icon--right"
          animate={{ scale: region === 'right' ? [1, 1.4, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: rightOffset }}
        >
          {rightIcon}
        </Motion.div>
      </Motion.div>

      <output className="elastic-slider__value" aria-live="polite">{Math.round(currentValue)}</output>
    </>
  );
}
