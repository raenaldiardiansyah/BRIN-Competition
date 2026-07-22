import { Button } from "@/components/ui/button";

export function HomeView() {
  return (
    <section className="container hero">
      <p className="eyebrow">Next.js App Router</p>
      <h1>Frontend dan backend dalam struktur yang rapi</h1>
      <p>
        Tambahkan halaman di folder app, tampilan per fitur di folder features,
        dan logika server di folder server.
      </p>
      <Button type="button">Mulai</Button>
    </section>
  );
}
