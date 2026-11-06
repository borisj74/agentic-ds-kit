import { notFound } from "next/navigation";
import { isPatternSlug, PATTERN_ITEMS } from "@/lib/playground-nav";
import { PatternsView } from "../PatternsView";

export function generateStaticParams() {
  return PATTERN_ITEMS.map((item) => ({ slug: item.slug }));
}

export default async function PatternPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { slug } = await params;
  if (!isPatternSlug(slug)) notFound();
  const query = await searchParams;
  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  return <PatternsView slug={slug} view={view} />;
}
