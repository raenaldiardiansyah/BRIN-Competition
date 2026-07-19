"use client";

import { useEffect, useState } from "react";

const ANNOUNCE_EVENT = "projectlink:announce";

export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  window.dispatchEvent(
    new CustomEvent(ANNOUNCE_EVENT, { detail: { message, priority } }),
  );
}

export function GlobalStatusAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; priority: "polite" | "assertive" }>).detail;
      if (!detail?.message) return;
      if (detail.priority === "assertive") {
        setAssertiveMessage("");
        window.setTimeout(() => setAssertiveMessage(detail.message), 20);
      } else {
        setPoliteMessage("");
        window.setTimeout(() => setPoliteMessage(detail.message), 20);
      }
    };
    window.addEventListener(ANNOUNCE_EVENT, handle);
    return () => window.removeEventListener(ANNOUNCE_EVENT, handle);
  }, []);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </>
  );
}
