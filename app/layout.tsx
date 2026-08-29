import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { PlaygroundNav } from "./_components/PlaygroundNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kit Sandbox — Boris Jovanovic",
  description: "Personal design-system playground with JSON contracts and kit components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <PlaygroundNav />
        {children}
      </body>
    </html>
  );
}
