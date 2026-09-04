import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Agentic DS Kit — Boris Jovanovic",
  description: "Code is the contract. Installable kit of JSON contracts, tokens, and React patterns for agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
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
