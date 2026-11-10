import type { Metadata } from "next";
import { ThemePlayground } from "./ThemePlayground";

export const metadata: Metadata = {
  title: "Theme",
};

export default function ThemePage() {
  return <ThemePlayground />;
}
