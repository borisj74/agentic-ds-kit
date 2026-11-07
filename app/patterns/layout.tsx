import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Patterns",
    template: "%s · Nistha",
  },
};

export default function PatternsLayout({ children }: { children: ReactNode }) {
  return children;
}
