import { AIAnimatedList } from "../shared/AIAnimatedList";
import type { AIHistoryItem } from "../types";
export function AIHistorySection({ items }: { items: AIHistoryItem[] }) { return <section className="ai-section"><h2>Riwayat analisis</h2><AIAnimatedList items={items} renderItem={(item) => <article className="ai-history-item"><strong>{item.title}</strong><p>{item.summary}</p><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("id-ID")}</time></article>} /></section>; }
