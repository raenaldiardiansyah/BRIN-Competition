import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "@/styles/product-shell.css";
import "@/styles/product-experiences.css";
import "@/styles/shadcn.css";

export const metadata: Metadata = {
  title: "TautIn — Proyek yang Membuktikan Kompetensi",
  description:
    "Jaringan profesional berbasis proyek, kontribusi, evidence, dan matching yang dapat dipercaya.",
  icons: {
    icon: "/ICON TAUTIN.png",
    shortcut: "/ICON TAUTIN.png",
    apple: "/ICON TAUTIN.png",
  },
  other: {
    "og:title": "TautIn — Proyek yang Membuktikan Kompetensi",
    "og:description":
      "Tampilkan kontribusi, periksa evidence, dan mulai kolaborasi yang tepat.",
      "og:image": "/Long TAUUTIN.png",
      "twitter:card": "summary_large_image",
      "twitter:image": "/Long TAUUTIN.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <div id="pl-ui-portal-root"></div>
      </body>
    </html>
  );
}
