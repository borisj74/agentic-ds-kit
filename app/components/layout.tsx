import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Components",
    template: "%s · Nistha",
  },
};

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return children;
}
