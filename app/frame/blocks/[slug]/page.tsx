import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOCK_ITEMS, isBlockSlug } from "@/lib/playground-nav";
import { BlockFrame } from "../../../_components/BlockFrame";

/** A block on its own (no docs chrome): the block page's iframe preview and "Open full screen". */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const label = BLOCK_ITEMS.find((item) => item.slug === slug)?.label;
  return { title: label ? `${label} preview` : "Preview", robots: { index: false } };
}

export default async function BlockFramePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { slug } = await params;
  if (!isBlockSlug(slug)) notFound();
  const query = await searchParams;
  const mode = Array.isArray(query.mode) ? query.mode[0] : query.mode;
  const label = BLOCK_ITEMS.find((item) => item.slug === slug)?.label ?? slug;
  return <BlockFrame slug={slug} label={label} mode={mode} />;
}
