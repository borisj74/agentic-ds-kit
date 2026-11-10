import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PATTERN_ITEMS } from "@/lib/playground-nav";
import { FrameScreen } from "../../../_components/FrameScreen";
import { isScreenSlug } from "@/lib/pattern-screens";

/**
 * A pattern screen on its own (no docs chrome): the pattern pages show it in a scaled iframe,
 * and "Open full screen" links here. `?view=` picks the state, `?mode=` light or dark.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const label = PATTERN_ITEMS.find((item) => item.slug === slug)?.label;
  return { title: label ? `${label} preview` : "Preview", robots: { index: false } };
}

export default async function PatternFramePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string | string[]; mode?: string | string[] }>;
}) {
  const { slug } = await params;
  if (!isScreenSlug(slug)) notFound();
  const query = await searchParams;
  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const mode = Array.isArray(query.mode) ? query.mode[0] : query.mode;
  return <FrameScreen slug={slug} view={view} mode={mode} />;
}
