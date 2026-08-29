import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlaygroundShell } from "./_components/PlaygroundShell";
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
  title: "Agentic DS Kit — Boris Jovanovic",
  description: "Personal design-system playground with JSON contracts and kit components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <PlaygroundShell>{children}</PlaygroundShell>
      </body>
    </html>
  );
}
