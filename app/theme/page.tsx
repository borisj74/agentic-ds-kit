import type { Metadata } from "next";
import { ThemePlayground } from "./ThemePlayground";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  ...canonical("/theme"),
  title: "Theme builder",
};

export default function ThemePage() {
  return <ThemePlayground />;
}
