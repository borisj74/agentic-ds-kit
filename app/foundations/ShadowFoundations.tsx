"use client";

import { useState } from "react";
import { FoundationTabList } from "./FoundationTabList";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./EffectFoundations.module.css";
import { CopyToken } from "./CopyToken";
import { TokenUsage } from "./TokenUsage";

type Tab = "primitives" | "semantics";

const SCALE = [
  { name: "xs", note: "resting inputs" },
  { name: "sm", note: "cards" },
  { name: "md", note: "popovers, toasts" },
  { name: "lg", note: "dialogs, sheets" },
] as const;

const ROLES = [
  { title: "Raised", code: "shadow-raised-*", tokens: [
    { name: "shadow-raised-xs", note: "inputs" },
    { name: "shadow-raised-sm", note: "cards" },
    { name: "shadow-raised-md", note: "popovers" },
    { name: "shadow-raised-lg", note: "dialogs" },
  ]},
  { title: "Overlay", code: "shadow-overlay-*", tokens: [
    { name: "shadow-overlay-sm", note: "sm → md" },
    { name: "shadow-overlay-md", note: "md" },
    { name: "shadow-overlay-lg", note: "lg" },
  ]},
  { title: "Modal", code: "shadow-modal", tokens: [
    { name: "shadow-modal", note: "lg" },
  ]},
] as const;

export function ShadowFoundations() {
  const [tab, setTab] = useState<Tab>("primitives");
  return (
    <div className={colorStyles.colorSection}>
      <FoundationTabList value={tab} onChange={setTab} ariaLabel="Shadow views" />
      <p className={colorStyles.lead}>Use semantic elevation roles in components. Primitives are the source shadow scale.</p>
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
                  <div key={token.name} className={`${styles.row} ${styles.rowShadow}`}>
                    <div>
                      <CopyToken value={`--${token.name}`} />
                      <TokenUsage token={`--${token.name}`} compact />
                    </div>
                    <span className={styles.note}>{token.note}</span>
                    <div className={styles.swatchWide} style={{ boxShadow: `var(--${token.name})` }} />
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
            <code className={styles.pattern}>shadow-xs → shadow-lg</code>
          </header>
          <div className={styles.list}>
            {SCALE.map((step) => (
              <div key={step.name} className={`${styles.row} ${styles.rowShadow}`}>
                <div>
                  <CopyToken value={`--shadow-${step.name}`} />
                  <TokenUsage token={`--shadow-${step.name}`} compact />
                </div>
                <span className={styles.note}>{step.note}</span>
                <div className={styles.swatchWide} style={{ boxShadow: `var(--shadow-${step.name})` }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
