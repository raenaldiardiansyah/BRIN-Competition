"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BackButtonProps {
  fallbackHref: string;
  label?: string;
}

export function BackButton({ fallbackHref, label = "Kembali" }: BackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Only use history back if we have history and the referrer is from our own origin
    if (typeof window !== "undefined") {
      setCanGoBack(
        window.history.length > 2 &&
        document.referrer.startsWith(window.location.origin)
      );
    }
  }, []);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Link 
      href={fallbackHref}
      onClick={handleBack}
      className="button ghost text-button back-button" 
      style={{ display: "inline-flex", alignItems: "center", gap: "6px", paddingLeft: 0, paddingBottom: 0, paddingTop: 0, minHeight: 'auto', marginBottom: '16px' }}
      aria-label={label}
    >
      <span aria-hidden="true" style={{ fontSize: "1.1em" }}>←</span> {label}
    </Link>
  );
}
