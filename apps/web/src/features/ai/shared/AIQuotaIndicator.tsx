import type { AIAccessTier } from "../types";
export function AIQuotaIndicator({ used, limit, tier }: { used: number; limit: number | null; tier: AIAccessTier }) { return <section aria-label="Kuota AI"><strong>Kuota AI · {tier}</strong><p>{limit === null ? "Tidak dibatasi pada prototype" : `${used} dari ${limit} analisis digunakan`}</p></section>; }
