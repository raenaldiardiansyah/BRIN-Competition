import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/product-shell.css";

export const metadata: Metadata = {
  title: "ProjectLink — Proyek yang Membuktikan Kompetensi",
  description:
    "Jaringan profesional berbasis proyek, kontribusi, evidence, dan matching yang dapat dipercaya.",
  icons: {
    icon: "/brand-icon.png",
    shortcut: "/brand-icon.png",
    apple: "/brand-icon.png",
  },
  other: {
    "og:title": "ProjectLink — Proyek yang Membuktikan Kompetensi",
    "og:description":
      "Tampilkan kontribusi, periksa evidence, dan mulai kolaborasi yang tepat.",
    "og:image": "/og-projectlink.png",
    "twitter:card": "summary_large_image",
    "twitter:image": "/og-projectlink.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
