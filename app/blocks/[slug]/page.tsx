import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOCK_ITEMS, isBlockSlug } from "@/lib/playground-nav";
import { BlockView } from "../BlockView";
import { canonical } from "@/lib/site";

export function generateStaticParams() {
  return BLOCK_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: BLOCK_ITEMS.find((item) => item.slug === slug)?.label ?? "Block", ...canonical(`/blocks/${slug}`) };
}

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isBlockSlug(slug)) notFound();
  return <BlockView slug={slug} />;
}
