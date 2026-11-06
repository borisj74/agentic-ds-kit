"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import type { ButtonAppearance, ButtonMode, ButtonSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ButtonSize[] = ["sm", "md", "lg"];
const APPEARANCES: ButtonAppearance[] = ["solid", "outline", "soft", "ghost"];
const MODES: ButtonMode[] = ["primary", "neutral", "danger"];
const ICON_MODES = ["none", "start", "end", "both", "only"] as const;

type IconMode = (typeof ICON_MODES)[number];

const MODE_LABEL: Record<ButtonMode, string> = {
  primary: "Continue",
  neutral: "Cancel",
  danger: "Delete",
};

function masterCode(
  appearance: ButtonAppearance,
  mode: ButtonMode,
  size: ButtonSize,
  flat: boolean,
  disabled: boolean,
  label: string,
  icon: IconMode,
) {
  const lines = [
    "<Button",
    `  appearance="${appearance}"`,
    `  mode="${mode}"`,
    `  size="${size}"`,
    flat ? "  flat" : null,
    disabled ? "  disabled" : null,
  ];
  if (icon === "start" || icon === "both" || icon === "only") lines.push('  iconStart="Plus"');
  if (icon === "end" || icon === "both") lines.push('  iconEnd="ArrowRight"');
  if (icon === "only") {
    lines.push(`  ariaLabel="${label}"`, "/>");
    return lines.filter(Boolean).join("\n");
  }
  lines.push(">", `  ${label}`, "</Button>");
  return lines.filter(Boolean).join("\n");
}

export function ButtonDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ButtonSize>("md");
  const [appearance, setAppearance] = useState<ButtonAppearance>("solid");
  const [mode, setMode] = useState<ButtonMode>("primary");
  const [flat, setFlat] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [icon, setIcon] = useState<IconMode>("none");
  const label = MODE_LABEL[mode];
  const start = icon === "start" || icon === "both" || icon === "only" ? "Plus" : undefined;
  const end = icon === "end" || icon === "both" ? "ArrowRight" : undefined;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Buttons</h1>
        <p className={styles.lede}>
          Appearance × mode: solid, outline, soft, ghost across primary, neutral, and danger. Optional flat set
          drops elevation. One solid-primary CTA per view. Lucide icon slots via iconStart and iconEnd. Icon-only
          needs aria-label.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="button-master">
        <div className={styles.masterHeader}>
          <h2 id="button-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle appearance, mode, size, flat, icon, and disabled to preview every Button combination.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  {icon === "only" ? (
                    <Button
                      appearance={appearance}
                      mode={mode}
                      flat={flat}
                      size={size}
                      disabled={disabled}
                      iconStart="Plus"
                      ariaLabel={label}
                    />
                  ) : (
                    <Button
                      appearance={appearance}
                      mode={mode}
                      flat={flat}
                      size={size}
                      disabled={disabled}
                      iconStart={start}
                      iconEnd={end}
                    >
                      {label}
                    </Button>
                  )}
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
                          name="button-appearance"
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
                  <span className={styles.panelLabel}>Mode</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Mode">
                    {MODES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="button-mode"
                          value={option}
                          checked={mode === option}
                          onChange={() => setMode(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Icon</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Icon">
                    {ICON_MODES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="button-icon"
                          value={option}
                          checked={icon === option}
                          onChange={() => setIcon(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Flat" size="sm" checked={flat} onChange={setFlat} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One appearance=&quot;solid&quot; mode=&quot;primary&quot; Button per view. Neutral outline for cancel and
                  alternate paths, ghost for toolbars, danger only for irreversible work. Flat drops the resting
                  shadow so a white control still reads on a white card. Pass Lucide export names on iconStart and
                  iconEnd. Icon-only omits children and must set ariaLabel.
                </p>
              </div>
              <CodeBlock code={masterCode(appearance, mode, size, flat, disabled, label, icon)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {MODES.map((rowMode) => (
              <section key={rowMode} className={styles.example}>
                <h2 className={styles.exampleTitle}>{rowMode}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    {APPEARANCES.map((rowAppearance) => (
                      <Button key={rowAppearance} appearance={rowAppearance} mode={rowMode} size="md">
                        {rowAppearance}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>
                    {rowMode === "primary"
                      ? "Solid primary is the view CTA. Outline, soft, and ghost primary stay on-theme without competing."
                      : rowMode === "neutral"
                        ? "White outline/solid keeps an edge on the grey canvas and on white cards. Ghost is the quiet toolbar look."
                        : "Danger is for irreversible actions only. Prefer outline or ghost until the user confirms."}
                  </p>
                </div>
                <CodeBlock
                  code={APPEARANCES.map(
                    (rowAppearance) =>
                      `<Button appearance="${rowAppearance}" mode="${rowMode}">${rowAppearance}</Button>`,
                  ).join("\n")}
                />
              </section>
            ))}
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Flat</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {MODES.map((rowMode) =>
                    (["solid", "outline", "soft"] as const).map((rowAppearance) => (
                      <Button
                        key={`${rowMode}-${rowAppearance}`}
                        appearance={rowAppearance}
                        mode={rowMode}
                        flat
                        size="md"
                      >
                        {rowAppearance}
                      </Button>
                    )),
                  )}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Flat × solid, outline, or soft — no elevation. Ghost is coerced to soft. Use on already-raised or
                  inverse surfaces.
                </p>
              </div>
              <CodeBlock
                code={'<Button appearance="outline" mode="neutral" flat>Cancel</Button>'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icons</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button appearance="outline" mode="neutral" iconStart="Plus">
                    Add
                  </Button>
                  <Button appearance="outline" mode="neutral" iconEnd="ArrowRight">
                    Continue
                  </Button>
                  <Button appearance="outline" mode="neutral" iconStart="Plus" ariaLabel="Add" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Lucide export names on iconStart/iconEnd. Icon-only needs ariaLabel. Related sibling actions go in
                  ButtonGroup.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<Button appearance="outline" mode="neutral" iconStart="Plus">Add</Button>',
                  '<Button appearance="outline" mode="neutral" iconEnd="ArrowRight">Continue</Button>',
                  '<Button appearance="outline" mode="neutral" iconStart="Plus" ariaLabel="Add" />',
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
