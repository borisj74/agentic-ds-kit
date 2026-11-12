import type { Metadata } from "next";
import { ThemePlayground } from "./ThemePlayground";

export const metadata: Metadata = {
  title: "Theme builder",
};

export default function ThemePage() {
  return <ThemePlayground />;
}
