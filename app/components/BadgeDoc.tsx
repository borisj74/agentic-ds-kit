"use client";

import { useState } from "react";
import { Badge } from "agentic-ds-kit";
import type { BadgeSize, BadgeTone } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: BadgeSize[] = ["sm", "md", "lg"];
const TONES: BadgeTone[] = ["neutral", "brand", "success", "warning", "danger", "info"];

const MASTER_LABEL: Record<BadgeTone, string> = {
  neutral: "Draft",
  brand: "Beta",
  success: "Active",
  warning: "Pending",
  danger: "Blocked",
  info: "In progress",
};

const TONE_DOCS: {
  tone: BadgeTone;
  title: string;
  about: string;
}[] = [
  {
    tone: "neutral",
    title: "Neutral",
    about: "Use Neutral for draft, default, or uncategorized labels.",
  },
  {
    tone: "brand",
    title: "Brand",
    about: "Use Brand for product or feature markers like beta that should feel on-theme, not a status.",
  },
  {
    tone: "success",
    title: "Success",
    about: "Use Success for active, complete, or healthy states on rows and cards.",
  },
  {
    tone: "warning",
    title: "Warning",
    about: "Use Warning for pending or attention states the user can still fix.",
  },
  {
    tone: "danger",
    title: "Danger",
    about: "Use Danger for blocked, failed, or harmful status. Not a delete button.",
  },
  {
    tone: "info",
    title: "Info",
    about: "Use Info for in-progress or informational status that is not success or a problem.",
  },
];

function masterCode(tone: BadgeTone, size: BadgeSize, removable: boolean, disabled: boolean, label: string) {
  const lines = ["<Badge", `  tone="${tone}"`, `  size="${size}"`];
  if (removable) {
    lines.push("  removable");
    lines.push("  onRemove={() => {}}");
  }
  if (disabled) lines.push("  disabled");
  lines.push(">", `  ${label}`, "</Badge>");
  return lines.join("\n");
}

export function BadgeDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<BadgeSize>("md");
  const [tone, setTone] = useState<BadgeTone>("info");
  const [removable, setRemovable] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const label = MASTER_LABEL[tone];

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Badges</h1>
        <p className={styles.lede}>Status and category pills. Not Avatar. Not a button.</p>
      </header>

      <section className={styles.master} aria-labelledby="badge-master">
        <div className={styles.masterHeader}>
          <h2 id="badge-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Toggle size, tone, removable, and disabled to preview every Badge combination.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Badge tone={tone} size={size} removable={removable} disabled={disabled} onRemove={removable ? () => {} : undefined}>
                    {label}
                  </Badge>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Tone</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Tone">
                    {TONES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="badge-tone"
                          value={option}
                          checked={tone === option}
                          onChange={() => setTone(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Removable" size="sm" checked={removable} onChange={setRemovable} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Badge for status; Avatar for people; Button for actions. Removable only for dismissible filters.
                </p>
              </div>
              <CodeBlock code={masterCode(tone, size, removable, disabled, label)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {TONE_DOCS.map((doc) => (
              <section key={doc.tone} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    {SIZES.map((step) => (
                      <Badge key={step} tone={doc.tone} size={step}>
                        {MASTER_LABEL[doc.tone]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock
                  code={SIZES.map(
                    (step) => `<Badge tone="${doc.tone}" size="${step}">${MASTER_LABEL[doc.tone]}</Badge>`,
                  ).join("\n")}
                />
              </section>
            ))}
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Removable</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Badge tone="info" size="md" removable onRemove={() => {}}>
                    In progress
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Removable only for dismissible filters. The X is the only interactive control.</p>
              </div>
              <CodeBlock
                code={'<Badge tone="info" size="md" removable onRemove={() => {}}>\n  In progress\n</Badge>'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Badge tone="neutral" size="md" disabled>
                    Draft
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled dims the pill and blocks pointer events. If removable and disabled, the X does not fire.
                </p>
              </div>
              <CodeBlock code={'<Badge tone="neutral" size="md" disabled>\n  Draft\n</Badge>'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
