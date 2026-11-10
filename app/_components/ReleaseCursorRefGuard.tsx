"use client";

import { useEffect } from "react";

/** Hydration has finished, so the browser may stamp data-cursor-ref again. */
export function ReleaseCursorRefGuard() {
  useEffect(() => {
    window.dispatchEvent(new Event("nistha-cursor-ref-release"));
  }, []);
  return null;
}
