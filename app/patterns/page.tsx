"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { patternSlugFromHash } from "@/lib/playground-nav";
import { useLocationHash } from "@/lib/use-location-hash";

/** Old `/patterns` and `/patterns#…` links move to `/patterns/[slug]`. */
export default function PatternsIndexPage() {
  const hash = useLocationHash();
  const router = useRouter();

  useEffect(() => {
    if (hash === null) return;
    router.replace(`/patterns/${patternSlugFromHash(hash)}`);
  }, [hash, router]);

  return null;
}
