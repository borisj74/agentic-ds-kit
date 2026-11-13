import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Everything is public except the bare preview frames, which only exist to fill iframes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/frame/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
