import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

import './CardSwap.css';

export const Card = forwardRef(({ customClass, className, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${className ?? ''}`.trim()} />
));

Card.displayName = 'Card';

const makeSlot = (index, distanceX, distanceY, total) => ({
  x: index * distanceX,
  y: -index * distanceY,
  z: -index * distanceX * 1.5,
  zIndex: total - index
});

const placeNow = (element, slot, skew) => {
  if (!element) return;
  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });
};

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const config = easing === 'elastic'
    ? {
        ease: 'elastic.out(0.6,0.9)',
        durDrop: 2,
        durMove: 2,
        durReturn: 2,
        promoteOverlap: 0.9,
        returnDelay: 0.05
      }
    : {
        ease: 'power1.inOut',
        durDrop: 0.8,
        durMove: 0.8,
        durReturn: 0.8,
        promoteOverlap: 0.45,
        returnDelay: 0.2
      };

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArray.map(() => React.createRef()),
    // Rebuild the card refs only when the stack size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArray.length]
  );
  const order = useRef(Array.from({ length: childArray.length }, (_, index) => index));
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const total = refs.length;
    order.current = Array.from({ length: total }, (_, index) => index);
    refs.forEach((ref, index) => {
      placeNow(ref.current, makeSlot(index, cardDistance, verticalDistance, total), skewAmount);
    });

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const frontElement = refs[front].current;
      if (!frontElement) return;

      timelineRef.current?.kill();
      const timeline = gsap.timeline();
      timelineRef.current = timeline;

      timeline.to(frontElement, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
      });

      timeline.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((index, position) => {
        const element = refs[index].current;
        const slot = makeSlot(position, cardDistance, verticalDistance, refs.length);
        timeline.set(element, { zIndex: slot.zIndex }, 'promote');
        timeline.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${position * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      timeline.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      timeline.call(() => gsap.set(frontElement, { zIndex: backSlot.zIndex }), undefined, 'return');
      timeline.to(
        frontElement,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );
      timeline.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    const node = containerRef.current;
    const pause = () => {
      timelineRef.current?.pause();
      window.clearInterval(intervalRef.current);
    };
    const resume = () => {
      timelineRef.current?.play();
      window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };

    if (pauseOnHover && node) {
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
    }

    return () => {
      if (pauseOnHover && node) {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
      }
      window.clearInterval(intervalRef.current);
      timelineRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

  const renderedCards = childArray.map((child, index) => (
    isValidElement(child)
      ? cloneElement(child, {
          key: index,
          ref: refs[index],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (event) => {
            child.props.onClick?.(event);
            onCardClick?.(index);
          }
        })
      : child
  ));

  return (
    <div ref={containerRef} className="card-swap-container" style={{ width, height }}>
      {renderedCards}
    </div>
  );
};

export default CardSwap;
