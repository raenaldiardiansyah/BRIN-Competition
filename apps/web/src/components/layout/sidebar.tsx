import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <strong>Dashboard</strong>
      <Link href="/">Beranda</Link>
      <Link href="/dashboard">Ringkasan</Link>
    </aside>
  );
}
