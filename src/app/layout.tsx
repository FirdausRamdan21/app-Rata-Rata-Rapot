import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNav } from "./app-nav";
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
  title: "Nilai Rapor",
  description: "Catat, pahami, dan ikuti perkembangan nilai rapormu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="app-shell">
          <header className="topbar">
            <Link className="brand" href="/" aria-label="Nilai Rapor, Dashboard">
              <span className="brand-mark" aria-hidden="true">NR</span>
              <span className="brand-name">
                Nilai Rapor
                <span>CATATAN AKADEMIK</span>
              </span>
            </Link>
            <AppNav />
            <div className="storage-state">
              <span className="storage-dot" aria-hidden="true" />
              Tersimpan lokal
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
