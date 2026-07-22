export function AIAnalysisLoading({ label = "Menyiapkan analisis…" }: { label?: string }) { return <section role="status" aria-live="polite"><p>{label}</p></section>; }
