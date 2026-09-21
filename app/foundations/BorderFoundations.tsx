"use client";

import { useState } from "react";
import { FoundationTabList } from "./FoundationTabList";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./EffectFoundations.module.css";
import { CopyToken } from "./CopyToken";

type Tab = "primitives" | "semantics";

const SCALE = [
  { name: "0", px: "0" },
  { name: "100", px: "1px" },
  { name: "200", px: "2px" },
  { name: "300", px: "4px" },
] as const;

const ROLES = [
  { title: "Control", code: "border-control*", tokens: [
    { name: "border-control", note: "1px" },
    { name: "border-control-strong", note: "2px" },
  ]},
  { title: "Surface", code: "border-surface", tokens: [
    { name: "border-surface", note: "1px" },
  ]},
  { title: "Highlight", code: "border-highlight", tokens: [
    { name: "border-highlight", note: "glass 1px" },
  ]},
  { title: "Divider", code: "border-divider*", tokens: [
    { name: "border-divider", note: "1px" },
    { name: "border-divider-strong", note: "2px" },
  ]},
  { title: "Focus", code: "border-focus-width", tokens: [
    { name: "border-focus-width", note: "2px" },
  ]},
] as const;

export function BorderFoundations() {
  const [tab, setTab] = useState<Tab>("primitives");
  return (
    <div className={colorStyles.colorSection}>
      <FoundationTabList value={tab} onChange={setTab} ariaLabel="Border views" />
      <p className={colorStyles.lead}>Use semantic border widths in components. Pair with color border tokens for stroke color.</p>
      {tab === "semantics" ? (
        <div className={styles.sections}>
          {ROLES.map((family) => (
            <section key={family.title} className={styles.scale}>
              <header className={styles.header}>
                <h3 className={styles.title}>{family.title}</h3>
                <code className={styles.pattern}>{family.code}</code>
              </header>
              <div className={styles.list}>
                {family.tokens.map((token) => (
                  <div key={token.name} className={styles.row}>
                    <CopyToken value={`--${token.name}`} />
                    <span className={styles.note}>{token.note}</span>
                    <div className={styles.swatchBorder} style={{ borderWidth: `var(--${token.name})` }} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className={styles.scale}>
          <header className={styles.header}>
            <h3 className={styles.title}>Scale</h3>
            <code className={styles.pattern}>border-0 → border-300</code>
          </header>
          <div className={styles.list}>
            {SCALE.map((step) => (
              <div key={step.name} className={styles.row}>
                <CopyToken value={`--border-${step.name}`} />
                <span className={styles.note}>{step.px}</span>
                <div className={styles.swatchBorder} style={{ borderWidth: `var(--border-${step.name})` }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
