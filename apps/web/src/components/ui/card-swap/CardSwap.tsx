'use client';

import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { customClass?: string }>(
  ({ customClass, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`project-card-swap__card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
  )
);
Card.displayName = 'Card';

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el: HTMLElement | null, slot: { x: number; y: number; z: number; zIndex: number }, skew: number, isReduced: boolean) => {
  if (!el) return;
  if (isReduced) {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: 0,
      xPercent: -50,
      yPercent: -50,
      skewY: 0,
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: false
    });
  } else {
    gsap.set(el, {
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
  }
};

interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onActiveCardChange?: (originalIndex: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: React.ReactNode;
}

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onActiveCardChange,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const [isReduced, setIsReduced] = useState(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const config = useMemo(() => {
    return easing === 'elastic' && !isReduced
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
  }, [easing, isReduced]);

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    [childArr.length]
  );

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  // Initial placement using useLayoutEffect
  useLayoutEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount, isReduced);
    });
  }, [refs, cardDistance, verticalDistance, skewAmount, isReduced]);

  const scheduleNextSwap = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isReduced || isPausedRef.current) return;

    timerRef.current = setTimeout(() => {
      swap();
    }, delay);
  };

  const swap = () => {
    if (order.current.length < 2 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    const [front, ...rest] = order.current;
    const elFront = refs[front].current;

    tlRef.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => {
        order.current = [...rest, front];
        isAnimatingRef.current = false;
        onActiveCardChange?.(rest[0]);
        scheduleNextSwap();
      }
    });
    tlRef.current = tl;

    if (isReduced) {
      // In reduced motion, we do a simple crossfade swap instantly
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.to(el, {
          x: slot.x,
          y: slot.y,
          zIndex: slot.zIndex,
          opacity: 1,
          duration: 0.3
        }, 0);
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.to(elFront, {
        x: backSlot.x,
        y: backSlot.y,
        zIndex: backSlot.zIndex,
        duration: 0.3
      }, 0);
    } else {
      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );
    }
  };

  const promoteToFront = (clickedIdx: number) => {
    if (isAnimatingRef.current) return;
    const idxInOrder = order.current.indexOf(clickedIdx);
    if (idxInOrder === 0) return; // Already front

    isAnimatingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    tlRef.current?.kill();

    const newOrder = [...order.current.slice(idxInOrder), ...order.current.slice(0, idxInOrder)];
    const tl = gsap.timeline({
      onComplete: () => {
        order.current = newOrder;
        isAnimatingRef.current = false;
        onActiveCardChange?.(clickedIdx);
        scheduleNextSwap();
      }
    });
    tlRef.current = tl;

    newOrder.forEach((idx, i) => {
      const el = refs[idx].current;
      const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
      
      if (isReduced) {
        tl.to(el, {
          x: slot.x,
          y: slot.y,
          z: 0,
          zIndex: slot.zIndex,
          duration: 0.3
        }, 0);
      } else {
        tl.to(el, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: config.durMove,
          ease: config.ease,
          onStart: () => {
            if (el) el.style.zIndex = String(slot.zIndex);
          }
        }, 0);
      }
    });
  };

  useEffect(() => {
    // Schedule the first auto-swap (delayed by delay ms on mount, not instant)
    scheduleNextSwap();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      tlRef.current?.kill();
    };
  }, [cardDistance, verticalDistance, delay, config, isReduced]);

  const handlePause = () => {
    isPausedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    tlRef.current?.pause();
  };

  const handleResume = () => {
    isPausedRef.current = false;
    tlRef.current?.play();
    scheduleNextSwap();
  };

  const handleFocusOut = (event: FocusEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !container.current?.contains(nextTarget)) {
      handleResume();
    }
  };

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    if (pauseOnHover) {
      node.addEventListener('mouseenter', handlePause);
      node.addEventListener('mouseleave', handleResume);
      node.addEventListener('focusin', handlePause);
      node.addEventListener('focusout', handleFocusOut as any);
    }

    return () => {
      if (node) {
        node.removeEventListener('mouseenter', handlePause);
        node.removeEventListener('mouseleave', handleResume);
        node.removeEventListener('focusin', handlePause);
        node.removeEventListener('focusout', handleFocusOut as any);
      }
    };
  }, [pauseOnHover]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child as any, {
          key: i,
          ref: refs[i],
          style: { width, height, ...((child.props as any).style ?? {}) },
          onClick: (e: React.MouseEvent) => {
            (child.props as any).onClick?.(e);
            promoteToFront(i);
          }
        })
      : child
  );

  return (
    <div ref={container} className="project-card-swap__container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
