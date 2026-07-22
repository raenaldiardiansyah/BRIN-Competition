"use client";

import React, { useState } from "react";
import "./ProjectLinkFolder.css";

type FolderProps = {
  color?: string;
  colorEnd?: string;
  colorBack?: string;
  shadowColor?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: string;
  currentPaperIndex?: number;
  onPaperClick?: (index: number) => void;
};

export default function ProjectLinkFolder({
  color = "#075ff7",
  colorEnd,
  colorBack,
  shadowColor,
  size = 1,
  items = [],
  className = "",
  open,
  onOpenChange,
  label = "Buka folder",
  currentPaperIndex = 2,
  onPaperClick,
}: FolderProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const handleToggle = () => {
    const nextOpen = !resolvedOpen;
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={resolvedOpen}
      aria-label={label}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`pl-projectlink-folder ${
        resolvedOpen ? "pl-projectlink-folder--open" : ""
      } ${className}`}
      style={
        {
          "--folder-color-start": color,
          "--folder-color-end": colorEnd || color,
          "--folder-back-color": colorBack || color,
          "--folder-shadow-color": shadowColor || "rgba(6, 36, 90, 0.12)",
          "--folder-scale": size,
        } as React.CSSProperties
      }
    >
      {/* Back flap of folder */}
      <div className="pl-projectlink-folder__back">
        <div className="pl-projectlink-folder__tab" />
      </div>

      {/* Internal papers */}
      <div className="pl-projectlink-folder__papers">
        {items.map((item, index) => {
          const isDismissed = index > currentPaperIndex;
          const isCurrent = index === currentPaperIndex;
          return (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (resolvedOpen && isCurrent) {
                  onPaperClick?.(index);
                }
              }}
              className={`pl-projectlink-folder__paper ${
                isDismissed ? "pl-projectlink-folder__paper--dismissed" : ""
              } ${isCurrent ? "pl-projectlink-folder__paper--current" : ""}`}
              style={
                {
                  "--paper-index": index,
                } as React.CSSProperties
              }
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* Front flap of folder */}
      <div className="pl-projectlink-folder__front" />
    </div>
  );
}
