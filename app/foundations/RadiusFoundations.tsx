"use client";

import { useState } from "react";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./EffectFoundations.module.css";
import { CopyToken } from "./CopyToken";

type Tab = "primitives" | "semantics";

const SCALE = [
  { name: "0", px: "0" },
  { name: "50", px: "2px" },
  { name: "100", px: "4px" },
  { name: "200", px: "8px" },
  { name: "300", px: "12px" },
  { name: "400", px: "16px" },
  { name: "500", px: "20px" },
  { name: "600", px: "24px" },
  { name: "full", px: "9999px" },
] as const;

const ROLES = [
  { title: "Control", code: "radius-control-*", prefix: "control", tokens: ["sm", "md", "lg"] },
  { title: "Surface", code: "radius-surface-*", prefix: "surface", tokens: ["sm", "md", "lg"] },
  { title: "Media", code: "radius-media-*", prefix: "media", tokens: ["sm", "md", "lg"] },
  { title: "Pill", code: "radius-pill", prefix: "pill", tokens: [null] },
] as const;

function tokenName(prefix: string, step: string | null) {
  return step === null ? `radius-${prefix}` : `radius-${prefix}-${step}`;
}

export function RadiusFoundations() {
  const [tab, setTab] = useState<Tab>("semantics");
  return (
    <div className={colorStyles.colorSection}>
      <div className={colorStyles.tabList} role="tablist" aria-label="Radius views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "semantics"}
          className={`${colorStyles.tab} ${tab === "semantics" ? colorStyles.tabActive : ""}`}
          onClick={() => setTab("semantics")}
        >
          Semantics
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "primitives"}
          className={`${colorStyles.tab} ${tab === "primitives" ? colorStyles.tabActive : ""}`}
          onClick={() => setTab("primitives")}
        >
          Primitives
        </button>
      </div>
      <p className={colorStyles.lead}>
        Use semantic radius roles in components. Primitives are the source corner scale.
      </p>
      {tab === "semantics" ? (
        <div className={styles.sections}>
          {ROLES.map((family) => (
            <section key={family.title} className={styles.scale}>
              <header className={styles.header}>
                <h3 className={styles.title}>{family.title}</h3>
                <code className={styles.pattern}>{family.code}</code>
              </header>
              <div className={styles.list}>
                {family.tokens.map((step) => {
                  const token = tokenName(family.prefix, step);
                  return (
                    <div key={token} className={`${styles.row} ${styles.rowRadiusSemantic}`}>
                      <CopyToken value={`--${token}`} />
                      <div className={styles.swatch} style={{ borderRadius: `var(--${token})` }} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className={styles.scale}>
          <header className={styles.header}>
            <h3 className={styles.title}>Scale</h3>
            <code className={styles.pattern}>radius-0 → radius-full</code>
          </header>
          <div className={styles.list}>
            {SCALE.map((step) => (
              <div key={step.name} className={`${styles.row} ${styles.rowRadius}`}>
                <CopyToken value={`--radius-${step.name}`} />
                <span className={styles.note}>{step.px}</span>
                <div className={styles.swatch} style={{ borderRadius: `var(--radius-${step.name})` }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
