import type { Metadata } from "next";
import type { ReactNode } from "react";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  ...canonical("/components"),
  title: {
    default: "Components",
    template: "%s · Nistha",
  },
};

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return children;
}
