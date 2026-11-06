import { notFound } from "next/navigation";
import playground from "../../playground.module.css";
import { ComponentDoc } from "../ComponentsView";
import { DocPageExtras } from "../DocPageExtras";
import { COMPONENT_ITEMS } from "@/lib/playground-nav";

const SLUGS = new Set<string>([...COMPONENT_ITEMS, "barchart", "linechart", "piechart"]);

export function generateStaticParams() {
  return [...SLUGS].filter((slug) => slug !== "button").map((slug) => ({ slug }));
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS.has(slug)) notFound();

  return (
    <div className={playground.docPage}>
      <div className={playground.docShell}>
        <ComponentDoc slug={slug} />
        <DocPageExtras slug={slug} />
      </div>
    </div>
  );
}
