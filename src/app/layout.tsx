import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Singers House",
  description: "Singers House — escola de voz e música",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-lilas-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
