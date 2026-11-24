"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * True while the observed element is narrower than `belowRem` root ems. A component reads its own
 * width, not the viewport, so it switches layout wherever it is placed. Starts false (wide) so the
 * server render and first paint match.
 */
export function useNarrow<T extends HTMLElement>(belowRem: number) {
  const [node, setNode] = useState<T | null>(null);
  const [narrow, setNarrow] = useState(false);
  const ref = useCallback((next: T | null) => setNode(next), []);

  useEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const update = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setNarrow(node.getBoundingClientRect().width < belowRem * rem);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, belowRem]);

  return { ref, narrow };
}
