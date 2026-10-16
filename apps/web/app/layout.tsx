import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap",
});

export const metadata: Metadata = {
  title: "Angaza AI — Illuminate Every Moment",
  description: "Explainable football match intelligence.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080B10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-sidebar="expanded" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Set the sidebar state before first paint to avoid a flash of the
            wrong width. Read from localStorage, fall back to expanded. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              var s = localStorage.getItem('angaza.sidebar');
              document.documentElement.dataset.sidebar = (s === 'collapsed') ? 'collapsed' : 'expanded';
            } catch (e) {
              document.documentElement.dataset.sidebar = 'expanded';
            }`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-sm focus:text-text focus-ring"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
