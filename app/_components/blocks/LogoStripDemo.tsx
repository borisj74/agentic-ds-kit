"use client";

import type { ReactNode } from "react";
import { LogoStrip, type LogoStripLogo } from "agentic-ds-kit";
import styles from "./LogoStripDemo.module.css";

/** Neutral placeholder marks (made-up names, plain shapes in currentColor), not real brands. */
function Mark({ name, shape }: { name: string; shape: ReactNode }) {
  return (
    <span className={styles.mark}>
      <svg viewBox="0 0 24 24" className={styles.shape} aria-hidden="true">
        {shape}
      </svg>
      <span className={styles.word}>{name}</span>
    </span>
  );
}

const SHAPES: Record<string, ReactNode> = {
  Northpeak: <path d="M2 20 9 6l4 7 3-4 6 11Z" fill="currentColor" />,
  Fieldstone: (
    <g fill="currentColor">
      <rect x="2" y="2" width="9" height="9" rx="2" />
      <rect x="13" y="2" width="9" height="9" rx="2" opacity=".5" />
      <rect x="2" y="13" width="9" height="9" rx="2" opacity=".5" />
      <rect x="13" y="13" width="9" height="9" rx="2" />
    </g>
  ),
  Halden: <path d="M12 2 21 7v10l-9 5-9-5V7Z" fill="currentColor" />,
  Brightwater: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 9c3-3 5-3 8 0s5 3 8 0 3-1 4 0" />
      <path d="M2 15c3-3 5-3 8 0s5 3 8 0 3-1 4 0" />
    </g>
  ),
  Lumenfold: (
    <g fill="currentColor">
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="10" opacity=".35" />
    </g>
  ),
  Tidewell: <path d="M3 3h18L12 21Z" fill="currentColor" />,
  Corvane: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" />
    </g>
  ),
  Quarrylane: (
    <g fill="currentColor">
      <rect x="2" y="14" width="5" height="8" rx="1" />
      <rect x="9.5" y="8" width="5" height="14" rx="1" />
      <rect x="17" y="2" width="5" height="20" rx="1" />
    </g>
  ),
};

const LOGOS: LogoStripLogo[] = Object.entries(SHAPES).map(([name, shape]) => ({
  name,
  logo: <Mark name={name} shape={shape} />,
}));

/** LogoStrip with eight placeholder marks: they fit at 1440, and run past the edge at 390. */
export function LogoStripDemo() {
  return <LogoStrip title="Trusted by teams at" description="Over 2,000 teams run their agents with us." logos={LOGOS} />;
}
