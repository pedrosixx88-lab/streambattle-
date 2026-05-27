import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StreamBattle — Batalha de Presentes ao Vivo",
  description:
    "Transforme suas lives do TikTok em batalhas épicas. Mais engajamento, mais presentes, mais crescimento.",
  keywords: ["tiktok", "live", "streamer", "batalha", "presentes", "overlay"],
  openGraph: {
    title: "StreamBattle",
    description: "Batalha de presentes ao vivo para streamers do TikTok",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
