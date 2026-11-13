import type { Metadata } from "next";
import type { ReactNode } from "react";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  ...canonical("/patterns"),
  title: {
    default: "Patterns",
    template: "%s · Nistha",
  },
};

export default function PatternsLayout({ children }: { children: ReactNode }) {
  return children;
}
