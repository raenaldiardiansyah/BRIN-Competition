import type { AIGap } from "../types";
export function AIGapList({ gaps }: { gaps: AIGap[] }) { if (!gaps.length) return <p>Tidak ada data gap yang teridentifikasi.</p>; return <section><h2>Data gap</h2><ul>{gaps.map((gap) => <li key={gap.id}><strong>{gap.title}</strong><p>{gap.description}</p><small>Prioritas: {gap.severity}</small></li>)}</ul></section>; }
