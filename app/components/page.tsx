"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComponentGallery } from "./ComponentGallery";
import { componentSlugFromHash } from "./ComponentsView";
import { useLocationHash } from "@/lib/use-location-hash";

export default function ComponentsPage() {
  const hash = useLocationHash();
  const router = useRouter();

  useEffect(() => {
    if (!hash) return;
    const slug = componentSlugFromHash(hash);
    if (!slug) return;
    router.replace(`/components/${slug}`);
  }, [hash, router]);

  return (
    <ComponentGallery />
  );
}
