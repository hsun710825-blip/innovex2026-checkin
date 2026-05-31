import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "InnoVex2026 基隆主題館開幕儀式｜貴賓簽到",
  description: "InnoVex2026 基隆主題館開幕儀式貴賓數位簽到系統",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${notoSansTC.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
