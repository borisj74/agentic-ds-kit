import type { MetadataRoute } from "next";
import { BLOCK_ITEMS, COMPONENT_ITEMS, PATTERN_ITEMS } from "@/lib/playground-nav";
import { SITE_URL } from "@/lib/site";

const PAGES = ["/", "/start-here", "/get-started", "/installation", "/mcp", "/theming", "/theme", "/contract-fit", "/studio", "/foundations", "/components", "/patterns", "/blocks"];

/** Every docs page: the top-level pages, each component, pattern and block page. Frames are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Same set as app/components/[slug] (the chart pages live outside COMPONENT_ITEMS).
  const components = [...new Set<string>([...COMPONENT_ITEMS, "barchart", "linechart", "piechart"])];
  const paths = [
    ...PAGES,
    ...components.map((slug) => `/components/${slug}`),
    ...PATTERN_ITEMS.map((item) => `/patterns/${item.slug}`),
    ...BLOCK_ITEMS.map((item) => `/blocks/${item.slug}`),
  ];
  return paths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8,
  }));
}
