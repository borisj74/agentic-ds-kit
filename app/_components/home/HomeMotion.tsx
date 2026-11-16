"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Landing page motion with GSAP (docs app only; never imported from packages/kit).
 *
 * - GSAP, ScrollTrigger and CustomEase load with a dynamic import, so they are a separate chunk
 *   that only this page requests.
 * - Content is visible without JS. An inline script on the page sets
 *   html[data-home-motion="pending"] before first paint, and only then does CSS hide the
 *   [data-motion] targets (and only when motion is allowed). If GSAP never loads, a CSS fallback
 *   shows them after a few seconds.
 * - Once GSAP is ready it takes the targets over with inline styles and sets the attribute to
 *   "ready". gsap.matchMedia runs the movement only under prefers-reduced-motion: no-preference;
 *   with reduce, everything is shown as is.
 * - Durations and the ease come from the kit motion tokens. Everything is reverted on unmount.
 */

const ATTR = "data-home-motion";

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** "500ms" → 0.5. */
function seconds(name: string, fallback: number): number {
  const value = token(name);
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return fallback;
  return value.endsWith("ms") ? number / 1000 : number;
}

/** "cubic-bezier(0.23, 1, 0.32, 1)" → "0.23, 1, 0.32, 1", for CustomEase. */
function bezier(name: string): string | null {
  return token(name).match(/cubic-bezier\(([^)]+)\)/)?.[1] ?? null;
}

export function HomeMotion() {
  // Client navigation does not run the page's inline script: mark the page before it paints.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute(ATTR)) root.setAttribute(ATTR, "pending");
    return () => root.removeAttribute(ATTR);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    let revert: (() => void) | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/CustomEase")])
      .then(([{ gsap }, { ScrollTrigger }, { CustomEase }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger, CustomEase);

        const curve = bezier("--motion-ease-out");
        const ease = curve ? CustomEase.create("home-ease-out", curve) : "power3.out";
        const duration = seconds("--motion-duration-600", 0.5);
        const stagger = seconds("--motion-duration-100", 0.12);
        const lift = Number.parseFloat(token("--space-4")) || 16;

        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const hero = gsap.utils.toArray<HTMLElement>('[data-motion="hero"]');
          const stage = gsap.utils.toArray<HTMLElement>('[data-motion="stage"]');
          const reveals = gsap.utils.toArray<HTMLElement>('[data-motion="reveal"]');

          // Opacity, not autoAlpha: hidden parts stay focusable, and focus scrolls them into view.
          gsap.set([...hero, ...stage, ...reveals], { opacity: 0, y: lift });
          root.setAttribute(ATTR, "ready");

          gsap
            .timeline({ defaults: { duration, ease } })
            .to(hero, { opacity: 1, y: 0, stagger })
            .to(stage, { opacity: 1, y: 0, stagger: stagger * 1.5 }, `-=${duration / 2}`);

          ScrollTrigger.batch(reveals, {
            start: "top 88%",
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration, ease, stagger }),
          });
        });

        mm.add("(prefers-reduced-motion: reduce)", () => {
          root.setAttribute(ATTR, "ready");
        });

        revert = () => mm.revert();
      })
      .catch(() => root.setAttribute(ATTR, "ready"));

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}

