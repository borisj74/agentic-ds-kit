/**
 * The docs site's public origin, for metadataBase, canonical URLs, the sitemap and robots.txt.
 * Set NEXT_PUBLIC_SITE_URL to deploy elsewhere; the default is the live docs site.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agentic-ds-kit.vercel.app").replace(/\/+$/, "");

/** Metadata `alternates` with a canonical path (resolved against metadataBase). */
export function canonical(path: string) {
  return { alternates: { canonical: path } };
}
