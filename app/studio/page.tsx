import type { Metadata } from "next";
import { PageHeader } from "agentic-ds-kit";
import playground from "../playground.module.css";
import { StudioShowcase } from "./StudioShowcase";

export const metadata: Metadata = {
  title: "Studio",
};

export default function StudioPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <PageHeader
          title="Studio"
          subtitle="Live type, color, radius, shadow, and theme. The Theme panel and the Theme page share one preview."
        />
        <StudioShowcase />
      </div>
    </div>
  );
}
