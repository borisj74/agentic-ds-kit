import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isBlockSlug } from "@/lib/playground-nav";
import { ALL_BLOCK_DOCS, blockDoc } from "@/lib/blocks";
import { BlockView } from "../BlockView";
import { canonical } from "@/lib/site";

export function generateStaticParams() {
  return ALL_BLOCK_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: blockDoc(slug)?.label ?? "Block", ...canonical(`/blocks/${slug}`) };
}

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isBlockSlug(slug)) notFound();
  return <BlockView slug={slug} />;
}
