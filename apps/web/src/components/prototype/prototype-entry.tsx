import { Suspense } from "react";
import { PrototypeApp } from "@/components/prototype/prototype-app";

function PrototypeFallback() {
  return (
    <main className="page-container">
      <div className="simulated-state loading">
        <div className="skeleton-block" />
        <h2>Menyiapkan prototype…</h2>
      </div>
    </main>
  );
}

export function PrototypeEntry() {
  return (
    <Suspense fallback={<PrototypeFallback />}>
      <PrototypeApp />
    </Suspense>
  );
}
