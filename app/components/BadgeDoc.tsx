"use client";

import { useState } from "react";
import { Badge } from "agentic-ds-kit";
import type { BadgeAppearance, BadgeSize, BadgeTone } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: BadgeSize[] = ["sm", "md", "lg"];
const APPEARANCES: BadgeAppearance[] = ["soft", "tint", "solid", "outline"];
const TONES: BadgeTone[] = ["neutral", "primary", "success", "warning", "danger", "info", "highlight"];

/** Suggested tone icons. Plain role labels (Admin, Member) leave the icon off. */
const TONE_ICON: Record<BadgeTone, string> = {
  neutral: "Circle",
  primary: "Info",
  brand: "Info",
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleX",
  info: "Info",
  highlight: "Info",
};

const MASTER_LABEL: Record<BadgeTone, string> = {
  neutral: "Draft",
  primary: "Beta",
  brand: "Beta",
  success: "Active",
  warning: "Pending",
  danger: "Failed",
  info: "In progress",
  highlight: "New",
};

function masterCode(
  appearance: BadgeAppearance,
  tone: BadgeTone,
  size: BadgeSize,
  withIcon: boolean,
  removable: boolean,
  disabled: boolean,
  label: string,
) {
  const lines = ["<Badge", `  appearance="${appearance}"`, `  tone="${tone}"`, `  size="${size}"`];
  if (withIcon) lines.push(`  icon="${TONE_ICON[tone]}"`);
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
  const [appearance, setAppearance] = useState<BadgeAppearance>("soft");
  const [tone, setTone] = useState<BadgeTone>("success");
  const [withIcon, setWithIcon] = useState(true);
  const [removable, setRemovable] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const label = MASTER_LABEL[tone];

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Badges</h2>
        <p className={styles.lede}>
          Status the system sets. sm 20 and md 24, no border, 4px corner, optional tone icon. Not a number
          (Count), not a change (Delta), not a person (Avatar), not a button.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="badge-master">
        <div className={styles.masterHeader}>
          <h2 id="badge-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle appearance, tone, size, tone icon, removable, and disabled to preview every Badge combination.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Badge
                    appearance={appearance}
                    tone={tone}
                    size={size}
                    icon={withIcon ? TONE_ICON[tone] : undefined}
                    removable={removable}
                    disabled={disabled}
                    onRemove={removable ? () => {} : undefined}
                  >
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
                  <span className={styles.panelLabel}>Appearance</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Appearance">
                    {APPEARANCES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="badge-appearance"
                          value={option}
                          checked={appearance === option}
                          onChange={() => setAppearance(option)}
                        />
                        {option}
                      </label>
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
                  <Switch label="Tone icon" size="sm" checked={withIcon} onChange={setWithIcon} />
                  <Switch label="Removable" size="sm" checked={removable} onChange={setRemovable} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Badge for status; Avatar for people; Button for actions. Removable only for dismissible filters;
                  user-managed labels use Tag. tone=&quot;brand&quot; is an alias of primary.
                </p>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Which mark to use</h3>
                <p className={styles.usageBody}>
                  Badge is status. Tag is a label the user adds. Count is how many. Delta is how a value moved.
                  Avatar is a person or an organisation. If it is a number, it is never a Badge.
                </p>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Badge or Tag?</h3>
                <p className={styles.usageBody}>
                  Badge is read-only status or category the system sets, like Paid, Overdue, or Beta. Tag is a label
                  the user applies or manages: filter chips, keywords, assigned people. If the user can remove or
                  select it, use Tag.
                </p>
              </div>
              <CodeBlock code={masterCode(appearance, tone, size, withIcon, removable, disabled, label)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {APPEARANCES.map((rowAppearance) => (
              <section key={rowAppearance} className={styles.example}>
                <h2 className={styles.exampleTitle}>{rowAppearance}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    {TONES.map((rowTone) => (
                      <Badge key={rowTone} appearance={rowAppearance} tone={rowTone} size="md">
                        {MASTER_LABEL[rowTone]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>
                    Soft is the default subtle wash. Tint is stronger. Solid fills with the tone&apos;s ink. Outline
                    is a hairline on the control surface.
                  </p>
                </div>
                <CodeBlock
                  code={TONES.map(
                    (rowTone) =>
                      `<Badge appearance="${rowAppearance}" tone="${rowTone}">${MASTER_LABEL[rowTone]}</Badge>`,
                  ).join("\n")}
                />
              </section>
            ))}
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Tone icon</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Badge tone="success" size="sm" icon="CircleCheck">Paid</Badge>
                  <Badge tone="danger" size="sm" icon="CircleX">Overdue</Badge>
                  <Badge tone="warning" size="sm" icon="TriangleAlert">Due soon</Badge>
                  <Badge tone="info" size="sm" icon="Info">Sent</Badge>
                  <Badge tone="neutral" size="sm" icon="Circle">Draft</Badge>
                  <Badge size="sm">Admin</Badge>
                  <Badge size="sm">Member</Badge>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Invoice and run status gets a tone icon so it never relies on colour. Plain role labels like
                  Admin and Member stay without one. The icon is hidden from screen readers; the word says it.
                </p>
              </div>
              <CodeBlock
                code={'<Badge tone="success" size="sm" icon="CircleCheck">Paid</Badge>\n<Badge tone="danger" size="sm" icon="CircleX">Overdue</Badge>\n<Badge size="sm">Admin</Badge>'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Removable</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Badge appearance="soft" tone="info" size="md" removable onRemove={() => {}}>
                    In progress
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Removable only for dismissible filters. The X is the only interactive control.
                </p>
              </div>
              <CodeBlock
                code={'<Badge appearance="soft" tone="info" size="md" removable onRemove={() => {}}>\n  In progress\n</Badge>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
