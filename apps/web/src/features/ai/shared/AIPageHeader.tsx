"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

const safeSources: Record<string, string> = {
  project: "/projects/aqua-loop/manage",
  profile: "/me",
  collaboration: "/collaboration",
  workspace: "/organization/nexa-research-lab",
  "ai-hub": "/ai",
};

export function AIPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  const source = useSearchParams().get("source") ?? "ai-hub";
  const backHref = safeSources[source] ?? "/ai";

  return (
    <header className="ai-page-header">
      <a className="ai-page-header__back" href={backHref}><ArrowLeft size={18} /> Kembali ke AI Hub</a>
      <nav className="ai-page-header__breadcrumb" aria-label="Breadcrumb"><a href="/ai">AI</a><span>/</span><span>{title}</span></nav>
      <div className="ai-page-header__row"><div><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{action}</div>
    </header>
  );
}
