"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { patternSlugFromHash } from "@/lib/playground-nav";
import { useLocationHash } from "@/lib/use-location-hash";
import playground from "../playground.module.css";
import { PatternsIndex } from "./PatternsIndex";

/** Old `/patterns#…` links still open the matching pattern. The index itself is the thumbnail grid. */
export default function PatternsIndexPage() {
  const hash = useLocationHash();
  const router = useRouter();

  useEffect(() => {
    if (!hash) return;
    router.replace(`/patterns/${patternSlugFromHash(hash)}`);
  }, [hash, router]);

  if (hash) return null;

  return (
    <div className={playground.docPage}>
      <div className={playground.docShell}>
        <PatternsIndex />
      </div>
    </div>
  );
}
