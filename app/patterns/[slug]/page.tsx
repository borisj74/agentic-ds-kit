import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPatternSlug, PATTERN_ITEMS } from "@/lib/playground-nav";
import { PatternsView } from "../PatternsView";

export function generateStaticParams() {
  return PATTERN_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = PATTERN_ITEMS.find((item) => item.slug === slug)?.label;
  return { title: label ?? "Pattern" };
}

export default async function PatternPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string | string[]; look?: string | string[] }>;
}) {
  const { slug } = await params;
  if (!isPatternSlug(slug)) notFound();
  const query = await searchParams;
  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const look = Array.isArray(query.look) ? query.look[0] : query.look;
  return <PatternsView slug={slug} view={view} look={look} />;
}
