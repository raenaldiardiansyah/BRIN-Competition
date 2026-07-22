import type { ReactNode } from "react";
import { AIPageHeader } from "./AIPageHeader";
export function AIAnalysisHeader({ title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <AIPageHeader title={title} description={description} action={children} />;
}
