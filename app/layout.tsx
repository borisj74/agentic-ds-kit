import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { CURSOR_REF_GUARD_SCRIPT } from "./_components/cursor-ref-guard";
import { PlaygroundShell } from "./_components/PlaygroundShell";
import { ReleaseCursorRefGuard } from "./_components/ReleaseCursorRefGuard";
import { PLAYGROUND_THEME_INIT_SCRIPT } from "@/lib/playground-theme";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Geist is the kit default (--font-sans / --font-display / --font-mono read these
// variables). No `weight` list: next/font then loads the variable font with the full
// wght axis (100–900) in one file, so headings at 550 (--font-weight-heading) render
// as true 550 instead of snapping to a static 500 or 600 instance.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  // Font switcher option, not the default: no preload, so its files load only once it is picked.
  preload: false,
});

/** The embedded-browser ref guard only matters while developing (N14). */
const isDev = process.env.NODE_ENV === "development";

const tagline = "Nistha — a code-only design system for coding agents and product UI.";

const description = `${tagline} JSON contracts, tokens, and React components.`;

const siteName = "Nistha";

export const metadata: Metadata = {
  // Absolute base for canonical URLs and the OG/Twitter images (app/opengraph-image.tsx).
  metadataBase: new URL(SITE_URL),
  title: {
    default: tagline,
    template: "%s · Nistha",
  },
  description,
  applicationName: siteName,
  openGraph: {
    type: "website",
    siteName,
    description,
  },
  twitter: {
    card: "summary_large_image",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {isDev ? <script dangerouslySetInnerHTML={{ __html: CURSOR_REF_GUARD_SCRIPT }} /> : null}
        <script dangerouslySetInnerHTML={{ __html: PLAYGROUND_THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {isDev ? <ReleaseCursorRefGuard /> : null}
        <PlaygroundShell>{children}</PlaygroundShell>
      </body>
    </html>
  );
}
