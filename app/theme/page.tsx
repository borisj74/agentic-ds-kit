import type { Metadata } from "next";
import { DM_Sans, Fraunces, Instrument_Serif, Newsreader, Outfit, Source_Sans_3 } from "next/font/google";
import { ThemePlayground } from "./ThemePlayground";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-theme-dm-sans",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-theme-source-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-theme-outfit",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-theme-newsreader",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-theme-fraunces",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-theme-instrument-serif",
});

const fontClassName = [
  dmSans.variable,
  sourceSans.variable,
  outfit.variable,
  newsreader.variable,
  fraunces.variable,
  instrumentSerif.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Theme",
};

export default function ThemePage() {
  return <ThemePlayground fontClassName={fontClassName} />;
}
