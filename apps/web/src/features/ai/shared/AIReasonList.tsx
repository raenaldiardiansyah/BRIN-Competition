import type { AIReason } from "../types";
export function AIReasonList({ reasons }: { reasons: AIReason[] }) { if (!reasons.length) return <p>Belum ada alasan yang dapat dijelaskan.</p>; return <section><h2>Alasan</h2><ul>{reasons.map((reason) => <li key={reason.id}><strong>{reason.title}</strong><p>{reason.description}</p></li>)}</ul></section>; }
