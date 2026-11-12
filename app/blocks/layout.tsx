import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Blocks",
    template: "%s · Nistha",
  },
};

export default function BlocksLayout({ children }: { children: ReactNode }) {
  return children;
}
