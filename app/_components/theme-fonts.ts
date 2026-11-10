import { DM_Sans, Fraunces, Instrument_Serif, Newsreader, Outfit, Source_Sans_3 } from "next/font/google";

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

/** Font CSS variables. Put this class on a preview scope, never on html or body. */
export const themeFontClassName = [
  dmSans.variable,
  sourceSans.variable,
  outfit.variable,
  newsreader.variable,
  fraunces.variable,
  instrumentSerif.variable,
].join(" ");
