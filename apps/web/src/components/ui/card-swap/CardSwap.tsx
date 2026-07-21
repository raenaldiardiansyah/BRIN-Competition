'use client';

import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { customClass?: string; isActive?: boolean }>(
  ({ customClass, isActive, ...rest }, ref) => (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      {...rest}
      className={`project-card-swap__card ${isActive ? 'project-card-swap__card--active' : ''} ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
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
  interactionPauseDuration?: number;
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
  interactionPauseDuration = 10000,
  pauseOnHover = false,
  onActiveCardChange,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const [isReduced, setIsReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const isAnimatingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const isFocusWithinRef = useRef(false);
  const manualPauseUntilRef = useRef<number>(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', listener);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', listener);
      window.removeEventListener('resize', checkMobile);
    };
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

  const placeAllCardsFromCurrentOrder = () => {
    const total = refs.length;
    order.current.forEach((idx, i) => {
      placeNow(refs[idx].current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount, isReduced);
    });
  };

  // Initial placement using useLayoutEffect
  useLayoutEffect(() => {
    if (!isMobile) {
      placeAllCardsFromCurrentOrder();
    }
  }, [refs, cardDistance, verticalDistance, skewAmount, isReduced, isMobile]);

  const clearSwapTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleNextSwap = (wait = delay) => {
    clearSwapTimer();

    if (isReduced || isMobile) return;
    if (isHoveredRef.current) return;
    if (isFocusWithinRef.current) return;
    if (isAnimatingRef.current) return;

    const remainingFreeze = manualPauseUntilRef.current - Date.now();

    if (remainingFreeze > 0) {
      timerRef.current = setTimeout(() => {
        scheduleNextSwap(delay);
      }, remainingFreeze);
      return;
    }

    timerRef.current = setTimeout(() => {
      swap();
    }, wait);
  };

  const swap = () => {
    if (order.current.length < 2 || isAnimatingRef.current || isMobile) return;

    isAnimatingRef.current = true;
    const [front, ...rest] = order.current;
    const elFront = refs[front].current;

    // Reposition active cards to their correct slot before animating to normalize GSAP state
    tlRef.current?.kill();
    placeAllCardsFromCurrentOrder();

    const tl = gsap.timeline({
      onComplete: () => {
        order.current = [...rest, front];
        isAnimatingRef.current = false;
        const newActive = rest[0];
        setActiveCardIndex(newActive);
        onActiveCardChange?.(newActive);
        scheduleNextSwap(delay);
      }
    });
    tlRef.current = tl;

    if (isReduced) {
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
    clearSwapTimer();
    
    // Normalization: kill timeline and reset to normalized slots
    tlRef.current?.kill();
    tlRef.current = null;
    placeAllCardsFromCurrentOrder();

    // Freeze autoplay on manual click
    manualPauseUntilRef.current = Date.now() + interactionPauseDuration;

    const newOrder = [...order.current.slice(idxInOrder), ...order.current.slice(0, idxInOrder)];
    const tl = gsap.timeline({
      onComplete: () => {
        order.current = newOrder;
        isAnimatingRef.current = false;
        setActiveCardIndex(clickedIdx);
        onActiveCardChange?.(clickedIdx);
        scheduleNextSwap(delay);
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
    scheduleNextSwap(delay);

    return () => {
      clearSwapTimer();
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [cardDistance, verticalDistance, delay, config, isReduced, isMobile]);

  const handlePause = () => {
    isHoveredRef.current = true;
    clearSwapTimer();
  };

  const handleResume = () => {
    isHoveredRef.current = false;
    scheduleNextSwap(delay);
  };

  const handleFocusIn = () => {
    isFocusWithinRef.current = true;
    clearSwapTimer();
  };

  const handleFocusOut = (event: FocusEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && container.current?.contains(nextTarget)) {
      return;
    }
    isFocusWithinRef.current = false;
    scheduleNextSwap(delay);
  };

  useEffect(() => {
    const node = container.current;
    if (!node || isMobile) return;

    if (pauseOnHover) {
      node.addEventListener('mouseenter', handlePause);
      node.addEventListener('mouseleave', handleResume);
      node.addEventListener('focusin', handleFocusIn);
      node.addEventListener('focusout', handleFocusOut);
    }

    return () => {
      if (node) {
        node.removeEventListener('mouseenter', handlePause);
        node.removeEventListener('mouseleave', handleResume);
        node.removeEventListener('focusin', handleFocusIn);
        node.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [pauseOnHover, isMobile]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child as any, {
          key: i,
          ref: refs[i],
          style: { 
            width: isMobile ? '100%' : width, 
            height: isMobile ? 'auto' : height, 
            ...((child.props as any).style ?? {}) 
          },
          isActive: order.current[0] === i,
          onClick: (e: React.MouseEvent) => {
            (child.props as any).onClick?.(e);
            promoteToFront(i);
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              promoteToFront(i);
            }
            (child.props as any).onKeyDown?.(e);
          }
        })
      : child
  );

  if (isMobile) {
    const activeIdx = order.current[0];
    const activeChild = rendered[activeIdx];

    return (
      <div ref={container} className="project-card-swap__container project-card-swap__container--mobile">
        <div className="project-card-swap__mobile-card-wrapper">
          {activeChild}
        </div>
        <div className="project-card-swap__mobile-nav">
          <button
            type="button"
            className="pl-button-sm pl-button-secondary"
            onClick={() => {
              const last = order.current[order.current.length - 1];
              const rest = order.current.slice(0, -1);
              const newOrder = [last, ...rest];
              order.current = newOrder;
              setActiveCardIndex(last);
              onActiveCardChange?.(last);
            }}
          >
            ← Prev
          </button>
          <span className="project-card-swap__mobile-counter">
            {activeIdx + 1} / {rendered.length}
          </span>
          <button
            type="button"
            className="pl-button-sm pl-button-secondary"
            onClick={() => {
              const [front, ...rest] = order.current;
              const newOrder = [...rest, front];
              order.current = newOrder;
              setActiveCardIndex(rest[0]);
              onActiveCardChange?.(rest[0]);
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="project-card-swap__container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
