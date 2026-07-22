'use client';

import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

type SpotlightStyle = CSSProperties & {
  '--spotlight-x'?: string;
  '--spotlight-y'?: string;
};

const SpotlightCard = ({ children, className = '' }: SpotlightCardProps) => {
  const reducedMotion = useReducedMotion();

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  };

  const initialStyle: SpotlightStyle = {
    '--spotlight-x': '50%',
    '--spotlight-y': '30%'
  };

  return (
    <div
      className={`subscription-spotlight-card ${className}`.trim()}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      onPointerMove={handlePointerMove}
      style={initialStyle}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
