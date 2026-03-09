import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BtcSpotProvider } from "@/components/BtcSpotProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitcoin Priced Everything (MX)",
  description: "Dashboard educativo para ver el precio de activos expresado en Bitcoin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <BtcSpotProvider>{children}</BtcSpotProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
