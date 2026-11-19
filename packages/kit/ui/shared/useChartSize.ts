"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Measures the plot area's width. The ref is a callback so a remounted plot node (e.g. after
 * ChartFrame swaps its table view back to the chart) is observed again instead of the detached one.
 */
export function useChartSize(fallbackHeight: number) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const ref = useCallback((next: HTMLDivElement | null) => setNode(next), []);

  useEffect(() => {
    if (!node) return undefined;

    const update = () => setWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { ref, width, height: fallbackHeight };
}
