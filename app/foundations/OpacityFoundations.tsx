"use client";

import { useState } from "react";
import { FoundationTabList } from "./FoundationTabList";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./EffectFoundations.module.css";
import { CopyToken } from "./CopyToken";

type Tab = "primitives" | "semantics";

const SCALE = [
  { name: "0", note: "0" },
  { name: "100", note: "0.08" },
  { name: "200", note: "0.16" },
  { name: "300", note: "0.32" },
  { name: "400", note: "0.48" },
  { name: "500", note: "0.64" },
  { name: "600", note: "0.8" },
  { name: "700", note: "1" },
] as const;

const ROLES = [
  { title: "Disabled", tokens: [{ name: "opacity-disabled", note: "0.48" }] },
  { title: "Muted", tokens: [{ name: "opacity-muted", note: "0.64" }] },
  { title: "Hover", tokens: [{ name: "opacity-hover", note: "0.08" }] },
  { title: "Scrim", tokens: [{ name: "opacity-scrim-soft", note: "0.32" }, { name: "opacity-scrim", note: "0.64" }] },
  { title: "Full", tokens: [{ name: "opacity-full", note: "1" }] },
] as const;

export function OpacityFoundations() {
  const [tab, setTab] = useState<Tab>("primitives");
  return (
    <div className={colorStyles.colorSection}>
      <FoundationTabList value={tab} onChange={setTab} ariaLabel="Opacity views" />
      <p className={colorStyles.lead}>Use semantic opacity roles in components. Primitives are the source transparency scale.</p>
      {tab === "semantics" ? (
        <div className={styles.sections}>
          {ROLES.map((family) => (
            <section key={family.title} className={styles.scale}>
              <header className={styles.header}>
                <h3 className={styles.title}>{family.title}</h3>
              </header>
              <div className={styles.listOpacity}>
                {family.tokens.map((token) => (
                  <div key={token.name} className={styles.rowOpacity}>
                    <CopyToken value={`--${token.name}`} />
                    <span className={styles.note}>{token.note}</span>
                    <div className={styles.opacityTrack}>
                      <div className={styles.opacityFill} style={{ opacity: `var(--${token.name})` }} />
                    </div>
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
            <code className={styles.pattern}>opacity-0 → opacity-700</code>
          </header>
          <div className={styles.listOpacity}>
            {SCALE.map((step) => (
              <div key={step.name} className={styles.rowOpacity}>
                <CopyToken value={`--opacity-${step.name}`} />
                <span className={styles.note}>{step.note}</span>
                <div className={styles.opacityTrack}>
                  <div className={styles.opacityFill} style={{ opacity: `var(--opacity-${step.name})` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
