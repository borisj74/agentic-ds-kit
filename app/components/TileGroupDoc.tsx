"use client";

import { useState } from "react";
import { TileGroup } from "agentic-ds-kit";
import type { TileGroupSelection } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const PLANS = [
  { value: "starter", title: "Starter", description: "For drafts and one seat.", meta: "$12" },
  { value: "pro", title: "Pro", description: "For a small team that ships weekly.", meta: "$29" },
  { value: "scale", title: "Scale", description: "SSO and a shared workspace.", meta: "$79", disabled: true },
];

const ADDONS = [
  { value: "audit", title: "Audit log", description: "Ninety days of history.", meta: "$8" },
  { value: "sso", title: "SSO", description: "SAML for the workspace.", meta: "$20" },
  { value: "support", title: "Priority support", description: "A named contact.", meta: "$15" },
];

export function TileGroupDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [selection, setSelection] = useState<TileGroupSelection>("single");
  const [single, setSingle] = useState("pro");
  const [multi, setMulti] = useState<string[]>(["audit"]);
  const [disabled, setDisabled] = useState(false);

  const code =
    selection === "single"
      ? `<TileGroup\n  ariaLabel="Plan"\n  selection="single"\n  value="${single}"\n  onChange={() => {}}\n  items={plans}\n/>`
      : `<TileGroup\n  ariaLabel="Add-ons"\n  selection="multiple"\n  value={${JSON.stringify(multi)}}\n  onChange={() => {}}\n  items={addOns}\n/>`;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>TileGroup</h2>
        <p className={styles.lede}>
          Selectable cards for a plan or a set of options. Title, description, and a price slot.
          Single or multi select, with checked and disabled tiles.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="tile-master">
        <div className={styles.masterHeader}>
          <h2 id="tile-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Pick a plan, or switch the panel to multi select. Arrow keys move through the tiles.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                {selection === "single" ? (
                  <TileGroup
                    ariaLabel="Plan"
                    selection="single"
                    items={PLANS}
                    value={single}
                    onChange={setSingle}
                    disabled={disabled}
                  />
                ) : (
                  <TileGroup
                    ariaLabel="Add-ons"
                    selection="multiple"
                    items={ADDONS}
                    value={multi}
                    onChange={setMulti}
                    disabled={disabled}
                  />
                )}
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Selection</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Selection">
                    {(["single", "multiple"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`${styles.sizeTab} ${selection === mode ? styles.sizeTabActive : ""}`}
                        aria-pressed={selection === mode}
                        onClick={() => setSelection(mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>State</span>
                  <button
                    type="button"
                    className={`${styles.sizeTab} ${disabled ? styles.sizeTabActive : ""}`}
                    aria-pressed={disabled}
                    onClick={() => setDisabled((current) => !current)}
                  >
                    Disabled
                  </button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Single select is a radiogroup. Multi select is a checkbox group. meta is the
                  price slot. A disabled item stays visible and cannot be checked.
                </p>
              </div>
              <CodeBlock code={code} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Uncontrolled</h2>
              <div className={styles.exampleCanvas}>
                <TileGroup ariaLabel="Plan" defaultValue="starter" items={PLANS} />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  defaultValue seeds the checked tile. Omit value when the group should own the state.
                </p>
              </div>
              <CodeBlock code={'<TileGroup ariaLabel="Plan" defaultValue="starter" items={plans} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
