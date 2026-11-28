import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentDoc } from "../ComponentsView";
import { ComponentPage } from "../ComponentPage";
import { DocPageExtras } from "../DocPageExtras";
import { COMPONENT_ITEMS, DEPRECATED_COMPONENT_ITEMS, componentLabel } from "@/lib/playground-nav";
import { canonical } from "@/lib/site";

// Deprecated components keep their pages for old links; they are out of the nav, gallery and sitemap.
const SLUGS = new Set<string>([...COMPONENT_ITEMS, ...DEPRECATED_COMPONENT_ITEMS, "barchart", "barlist", "combochart", "heatmap", "linechart", "piechart", "scatterchart"]);

export function generateStaticParams() {
  return [...SLUGS].filter((slug) => slug !== "button").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: SLUGS.has(slug) ? componentLabel(slug) : "Component", ...canonical(`/components/${slug}`) };
}

export default async function ComponentSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUGS.has(slug)) notFound();

  return (
    <ComponentPage id={slug} footer={<DocPageExtras slug={slug} />}>
      <ComponentDoc slug={slug} />
    </ComponentPage>
  );
}
