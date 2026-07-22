import type { AIHistoryItem } from "../types";
export function AIHistorySection({ items }: { items: AIHistoryItem[] }) {
  return <section className="ai-section ai-history"><div className="ai-section__heading"><div><p>Riwayat analisis</p><h2>Lanjutkan dari keputusan terakhir</h2></div></div>{items.length ? <div className="ai-history-list">{items.map((item) => <div className="ai-history-row" key={item.id}><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("id-ID")}</time><span><strong>{item.title}</strong><small>{item.summary}</small></span><em>{item.status === "result" ? "Selesai" : "Perlu review"}</em><a href={`/ai/${item.featureId}?source=ai-hub`}>Buka hasil →</a></div>)}</div> : <p>Belum ada riwayat analisis.</p>}</section>;
}
