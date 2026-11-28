"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A tick that counts up every `stepMs` while the element is on screen, for the landing page's
 * self-playing component demos. It starts at 0 on the server and the first client render, so
 * nothing mismatches on hydration. Under prefers-reduced-motion it never ticks: the demo holds its
 * first frame. Off screen it stops, so hidden demos cost nothing.
 *
 *   const [ref, tick] = useDemoLoop<HTMLDivElement>(1500);
 *   <div ref={ref}>…{FRAMES[tick % FRAMES.length]}…</div>
 */
export function useDemoLoop<T extends Element>(stepMs: number) {
  const ref = useRef<T>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(() => setTick((value) => value + 1), stepMs);
    };
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };

    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.2 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [stepMs]);

  return [ref, tick] as const;
}
