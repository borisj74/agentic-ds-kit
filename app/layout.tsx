import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import { PlaygroundShell } from "./_components/PlaygroundShell";
import { PLAYGROUND_THEME_INIT_SCRIPT } from "@/lib/playground-theme";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Code is the contract. Vida is the Agentic DS Kit: JSON contracts, tokens, and React components for agents.";

export const metadata: Metadata = {
  title: {
    default: "Vida — Agentic DS Kit",
    template: "%s · Vida",
  },
  description,
  applicationName: "Vida — Agentic DS Kit",
  openGraph: {
    type: "website",
    siteName: "Vida — Agentic DS Kit",
    description,
  },
  twitter: {
    card: "summary",
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
      className={`${plexSans.variable} ${plexMono.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PLAYGROUND_THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <PlaygroundShell>{children}</PlaygroundShell>
      </body>
    </html>
  );
}
