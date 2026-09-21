"use client";

import { useRef, useState } from "react";
import { FoundationTabList } from "./FoundationTabList";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./MotionFoundations.module.css";

type Tab = "primitives" | "semantics";
type Pattern = "lift" | "scale" | "rise" | "drop" | "drift";

const PATTERNS: Record<Pattern, { rest: string; play: string }> = {
  lift: { rest: "translate(-50%, -50%)", play: "translate(-50%, -120%)" },
  scale: { rest: "translate(-50%, -50%) scale(0.95)", play: "translate(-50%, -50%) scale(1.12)" },
  rise: { rest: "translate(-50%, -50%)", play: "translate(-50%, -120%)" },
  drop: { rest: "translate(-50%, -50%)", play: "translate(-50%, 20%)" },
  drift: { rest: "translate(-50%, -50%)", play: "translate(-50%, -130%)" },
};

const SEMANTICS: {
  title: string;
  pattern: Pattern;
  demos: { label: string; note: string; duration: string; easing: string; pattern?: Pattern }[];
}[] = [
  {
    title: "Interaction",
    pattern: "lift",
    demos: [
      { label: "Standard", note: "120ms · out", duration: "var(--motion-interaction-duration)", easing: "var(--motion-interaction-easing)" },
      { label: "Snappy", note: "120ms · out", duration: "var(--motion-duration-100)", easing: "var(--motion-ease-out)" },
      { label: "Soft", note: "180ms · in-out", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-in-out)" },
      { label: "Emphasized", note: "120ms · emphasized", duration: "var(--motion-duration-100)", easing: "var(--motion-ease-emphasized)" },
      { label: "Spring", note: "180ms · spring", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-spring)" },
      { label: "Linear", note: "120ms · linear", duration: "var(--motion-duration-100)", easing: "var(--motion-ease-linear)" },
      { label: "Crisp", note: "160ms · out", duration: "var(--motion-duration-150)", easing: "var(--motion-ease-out)" },
    ],
  },
  {
    title: "Expand",
    pattern: "scale",
    demos: [
      { label: "Emphasized", note: "240ms · in-out", duration: "var(--motion-expand-duration)", easing: "var(--motion-expand-easing)" },
      { label: "Standard", note: "240ms · standard", duration: "var(--motion-duration-300)", easing: "var(--motion-ease-standard)" },
      { label: "Ease out", note: "240ms · out", duration: "var(--motion-duration-300)", easing: "var(--motion-ease-out)" },
      { label: "Spring", note: "240ms · spring", duration: "var(--motion-duration-300)", easing: "var(--motion-ease-spring)" },
      { label: "In-out", note: "320ms · in-out", duration: "var(--motion-duration-400)", easing: "var(--motion-ease-in-out)" },
      { label: "Linear", note: "240ms · linear", duration: "var(--motion-duration-300)", easing: "var(--motion-ease-linear)" },
      { label: "Ease in", note: "240ms · in", duration: "var(--motion-duration-300)", easing: "var(--motion-ease-in)" },
    ],
  },
  {
    title: "Overlay",
    pattern: "rise",
    demos: [
      { label: "Enter · out", note: "180ms · out", pattern: "rise", duration: "var(--motion-overlay-duration)", easing: "var(--motion-overlay-easing)" },
      { label: "Enter · spring", note: "180ms · spring", pattern: "rise", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-spring)" },
      { label: "Enter · emphasized", note: "180ms · emphasized", pattern: "rise", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-emphasized)" },
      { label: "Enter · in-out", note: "180ms · in-out", pattern: "rise", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-in-out)" },
      { label: "Exit · out", note: "120ms · out", pattern: "drop", duration: "var(--motion-overlay-exit-duration)", easing: "var(--motion-overlay-exit-easing)" },
      { label: "Exit · linear", note: "120ms · linear", pattern: "drop", duration: "var(--motion-duration-100)", easing: "var(--motion-ease-linear)" },
      { label: "Exit · quick", note: "120ms · standard", pattern: "drop", duration: "var(--motion-duration-100)", easing: "var(--motion-ease-standard)" },
    ],
  },
  {
    title: "Modal",
    pattern: "rise",
    demos: [
      { label: "Enter · emphasized", note: "320ms · emphasized", pattern: "rise", duration: "var(--motion-modal-duration)", easing: "var(--motion-modal-easing)" },
      { label: "Enter · spring", note: "320ms · spring", pattern: "rise", duration: "var(--motion-duration-400)", easing: "var(--motion-ease-spring)" },
      { label: "Enter · out", note: "320ms · out", pattern: "rise", duration: "var(--motion-duration-400)", easing: "var(--motion-ease-out)" },
      { label: "Enter · in-out", note: "320ms · in-out", pattern: "rise", duration: "var(--motion-duration-400)", easing: "var(--motion-ease-in-out)" },
      { label: "Exit · out", note: "180ms · out", pattern: "drop", duration: "var(--motion-modal-exit-duration)", easing: "var(--motion-modal-exit-easing)" },
      { label: "Exit · standard", note: "180ms · standard", pattern: "drop", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-standard)" },
      { label: "Exit · spring", note: "180ms · spring", pattern: "drop", duration: "var(--motion-duration-200)", easing: "var(--motion-ease-spring)" },
    ],
  },
  {
    title: "Page",
    pattern: "drift",
    demos: [
      { label: "Emphasized", note: "400ms · emphasized", duration: "var(--motion-page-duration)", easing: "var(--motion-page-easing)" },
      { label: "Standard", note: "400ms · standard", duration: "var(--motion-duration-500)", easing: "var(--motion-ease-standard)" },
      { label: "In-out", note: "400ms · in-out", duration: "var(--motion-duration-500)", easing: "var(--motion-ease-in-out)" },
      { label: "Spring", note: "400ms · spring", duration: "var(--motion-duration-500)", easing: "var(--motion-ease-spring)" },
      { label: "Soft out", note: "500ms · out", duration: "var(--motion-duration-600)", easing: "var(--motion-ease-out)" },
      { label: "Linear", note: "400ms · linear", duration: "var(--motion-duration-500)", easing: "var(--motion-ease-linear)" },
      { label: "Crisp", note: "320ms · out", duration: "var(--motion-duration-400)", easing: "var(--motion-ease-out)" },
    ],
  },
];

const DURATIONS = [
  { name: "0", note: "0ms" },
  { name: "100", note: "120ms" },
  { name: "150", note: "160ms" },
  { name: "200", note: "180ms" },
  { name: "300", note: "240ms" },
  { name: "400", note: "320ms" },
  { name: "500", note: "400ms" },
  { name: "600", note: "500ms" },
] as const;

const EASES = [
  { name: "linear", note: "constant speed" },
  { name: "in", note: "accelerate · avoid for enter" },
  { name: "out", note: "responsive enter" },
  { name: "in-out", note: "on-screen morph" },
  { name: "standard", note: "default UI · ease-out" },
  { name: "emphasized", note: "drawer / modal" },
  { name: "spring", note: "subtle overshoot" },
] as const;

function parseTime(value: string): number {
  const v = value.trim();
  if (v.endsWith("ms")) return Number.parseFloat(v);
  if (v.endsWith("s")) return Number.parseFloat(v) * 1000;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 200;
}

function MotionCard({
  title,
  note,
  duration,
  easing,
  pattern,
  titleAsCode = false,
}: {
  title: string;
  note: string;
  duration: string;
  easing: string;
  pattern: Pattern;
  titleAsCode?: boolean;
}) {
  const squareRef = useRef<HTMLDivElement>(null);
  const move = PATTERNS[pattern];

  const play = () => {
    const el = squareRef.current;
    if (!el) return;
    el.getAnimations().forEach((a) => a.cancel());
    const computed = getComputedStyle(el);
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0.01
      : parseTime(computed.animationDuration);
    const ease = computed.animationTimingFunction || "linear";
    el.animate(
      [{ transform: move.rest }, { transform: move.play }, { transform: move.rest }],
      { duration: Math.max(ms, 0.01) * 2, easing: ease },
    );
  };

  return (
    <button
      type="button"
      className={styles.card}
      onClick={play}
      aria-label={`Play ${title} motion demo`}
      style={{ ["--demo-duration" as string]: duration, ["--demo-easing" as string]: easing }}
    >
      <div className={styles.stage} aria-hidden="true">
        <div ref={squareRef} className={styles.square} style={{ transform: move.rest }} />
      </div>
      <div className={styles.footer}>
        {titleAsCode ? <code className={styles.code}>{title}</code> : <span className={styles.label}>{title}</span>}
        <span className={styles.note}>{note}</span>
      </div>
    </button>
  );
}

export function MotionFoundations() {
  const [tab, setTab] = useState<Tab>("primitives");

  return (
    <div className={colorStyles.colorSection}>
      <p className={styles.credit}>
        Motion principles adapted from{" "}
        <a href="https://emilkowal.ski/skill" target="_blank" rel="noreferrer">
          Emil Kowalski
        </a>
        .
      </p>
      <FoundationTabList value={tab} onChange={setTab} ariaLabel="Motion views" />
      <p className={colorStyles.lead}>
        Use semantic motion roles in components. Primitives are the source timing and easing scale.
      </p>

      {tab === "semantics" ? (
        <div className={styles.sections}>
          {SEMANTICS.map((family) => (
            <section key={family.title} className={styles.scale}>
              <h3 className={styles.title}>{family.title}</h3>
              <div className={styles.gallery}>
                {family.demos.map((demo) => (
                  <MotionCard
                    key={demo.label}
                    title={demo.label}
                    note={demo.note}
                    duration={demo.duration}
                    easing={demo.easing}
                    pattern={demo.pattern ?? family.pattern}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.sections}>
          <section className={styles.scale}>
            <h3 className={styles.title}>Duration</h3>
            <div className={styles.gallery}>
              {DURATIONS.map((step) => (
                <MotionCard
                  key={step.name}
                  title={`duration-${step.name}`}
                  note={step.note}
                  duration={`var(--motion-duration-${step.name})`}
                  easing="var(--motion-ease-linear)"
                  pattern="lift"
                  titleAsCode
                />
              ))}
            </div>
          </section>
          <section className={styles.scale}>
            <h3 className={styles.title}>Easing</h3>
            <div className={styles.gallery}>
              {EASES.map((step) => (
                <MotionCard
                  key={step.name}
                  title={`ease-${step.name}`}
                  note={step.note}
                  duration="var(--motion-duration-600)"
                  easing={`var(--motion-ease-${step.name})`}
                  pattern="lift"
                  titleAsCode
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
