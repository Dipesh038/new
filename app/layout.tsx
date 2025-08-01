import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { PerformanceMonitor } from "./performance-monitor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Movie Stream - Watch Movies & TV Shows Online | Premium Streaming Platform",
  description: "Stream over 1,000+ movies and TV shows in 4K quality. Watch the latest releases, trending content, and classic films. No ads, instant streaming, premium entertainment platform.",
  keywords: "movies, tv shows, streaming, 4K, watch online, entertainment, cinema, series, films, premium streaming",
  authors: [{ name: "Dipesh" }],
  creator: "Dipesh",
  publisher: "Movie Stream",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moviestream.com",
    siteName: "Movie Stream",
    title: "Movie Stream - Premium Streaming Platform",
    description: "Stream over 1,000+ movies and TV shows in 4K quality. No ads, instant streaming.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Movie Stream - Premium Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@moviestream",
    creator: "@dipesh",
    title: "Movie Stream - Premium Streaming Platform",
    description: "Stream over 1,000+ movies and TV shows in 4K quality. No ads, instant streaming.",
    images: ["/twitter-card.jpg"],
  },
  alternates: {
    canonical: "https://moviestream.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6b6b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://vidsrc.xyz" />
      </head>
      <body className={inter.className}>
        {children}
        <PerformanceMonitor />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Movie Stream",
              "description": "Premium streaming platform with over 1,000+ movies and TV shows",
              "url": "https://moviestream.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://moviestream.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}