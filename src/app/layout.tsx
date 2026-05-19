import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reserva Quadra — Tênis",
  description:
    "Reserve quadras de tênis com integração Wix, SimplyBook e pagamento online.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Reserva Quadra",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b5e3b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
