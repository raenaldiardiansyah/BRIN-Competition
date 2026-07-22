'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

type FadeContentProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  translateY?: number;
  blur?: boolean;
  threshold?: number;
  rootMargin?: string;
};

const FadeContent = ({
  children,
  className = '',
  delay = 0,
  duration = 500,
  translateY = 16,
  blur = true,
  threshold = 0.1,
  rootMargin = '0px'
}: FadeContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    setMounted(true);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin, threshold]);

  const showContent = !mounted || visible || reducedMotion;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: showContent ? 1 : 0,
        transform:
          showContent
            ? 'translateY(0)'
            : `translateY(${translateY}px)`,
        filter:
          showContent || !blur
            ? 'blur(0px)'
            : 'blur(8px)',
        transition: reducedMotion
          ? 'none'
          : `opacity ${duration}ms ease ${delay}ms,
             transform ${duration}ms ease ${delay}ms,
             filter ${duration}ms ease ${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default FadeContent;
