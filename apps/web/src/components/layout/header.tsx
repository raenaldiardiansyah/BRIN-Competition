import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <nav className="container nav">
        <Link href="/">BRIN App</Link>
        <div className="nav-links">
          <Link href="/about">Tentang</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Masuk</Link>
        </div>
      </nav>
    </header>
  );
}
