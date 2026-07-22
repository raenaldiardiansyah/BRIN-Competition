"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type FooterRevealLayoutProps = {
  children: ReactNode;
  footer: ReactNode;
};

export function FooterRevealLayout({ children, footer }: FooterRevealLayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layout = layoutRef.current;
    const footerElement = footerRef.current;

    if (!layout || !footerElement) return;

    const updateFooterHeight = () => {
      layout.style.setProperty("--footer-reveal-height", `${footerElement.getBoundingClientRect().height}px`);
    };

    updateFooterHeight();
    const observer = new ResizeObserver(updateFooterHeight);
    observer.observe(footerElement);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="footer-reveal-layout" ref={layoutRef}>
      <div className="footer-reveal-layout__foreground">{children}</div>
      <div className="footer-reveal-layout__fixed" ref={footerRef}>
        {footer}
      </div>
      <div className="footer-reveal-layout__spacer" aria-hidden="true" />
    </div>
  );
}
