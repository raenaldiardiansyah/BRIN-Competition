import type { AILimitation } from "../types";
export function AILimitationNotice({ limitation }: { limitation: AILimitation }) { return <aside aria-label="Batasan analisis"><strong>Batasan: {limitation.title}</strong><p>{limitation.description}</p></aside>; }
