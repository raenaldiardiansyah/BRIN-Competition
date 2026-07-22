import type { ReactNode } from "react";
export function AIEmptyState({ title = "Belum ada hasil", description = "Tambahkan konteks atau evidence untuk memulai analisis.", children }: { title?: string; description?: string; children?: ReactNode }) { return <section><h2>{title}</h2><p>{description}</p>{children}</section>; }
