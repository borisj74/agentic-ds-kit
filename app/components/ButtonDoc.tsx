"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import type { ButtonAppearance, ButtonMode, ButtonSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

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
  loading: boolean,
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
    loading ? "  loading" : null,
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
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState<IconMode>("none");
  const label = MODE_LABEL[mode];
  const start = icon === "start" || icon === "both" || icon === "only" ? "Plus" : undefined;
  const end = icon === "end" || icon === "both" ? "ArrowRight" : undefined;

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Buttons</h2>
        <p className={styles.lede}>
          Appearance × mode: solid, outline, soft, ghost across primary, neutral, and danger. Optional flat set
          drops elevation. One solid-primary CTA per view. Lucide icon slots via iconStart and iconEnd. Heights are
          32, 36 and 40, the same as Input, Select and FilterButton. Icon-only is a square of that height and
          needs aria-label; IconButton is the typed export for it.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="button-master">
        <div className={styles.masterHeader}>
          <h2 id="button-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle appearance, mode, size, flat, icon, loading, and disabled to preview every Button combination.
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
                      loading={loading}
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
                      loading={loading}
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
                  <Switch label="Loading" size="sm" checked={loading} onChange={setLoading} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One appearance=&quot;solid&quot; mode=&quot;primary&quot; Button per view. Neutral outline for cancel and
                  alternate paths, ghost for toolbars, danger only for irreversible work. Flat drops the resting
                  shadow so a white control still reads on a white card. Pass Lucide export names on iconStart and
                  iconEnd. Icon-only omits children and must set ariaLabel. Set loading while the action runs:
                  the label stays, a spinner takes the leading icon slot, the width holds, and clicks are ignored.
                </p>
              </div>
              <CodeBlock code={masterCode(appearance, mode, size, flat, disabled, loading, label, icon)} />
            </DocNotes>
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
                        : "Danger is for irreversible actions only. Prefer outline or ghost until the user confirms. Solid, outline and soft danger get a warning icon when iconStart is empty, so danger is never colour alone; pass Trash2 for a delete."}
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
              <h2 className={styles.exampleTitle}>Loading</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button loading>Save invoice</Button>
                  <Button appearance="outline" mode="neutral" iconStart="Download" loading>
                    Export
                  </Button>
                  <Button appearance="outline" mode="neutral" iconStart="Download" ariaLabel="Download" loading />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  loading sets aria-busy and ignores clicks. The label stays and a spinner takes the leading icon
                  slot. Every loading button keeps its width: with no leading icon, the padding makes room for
                  the spinner. The button stays focusable; do not also disable it.
                </p>
              </div>
              <CodeBlock
                code={[
                  "<Button loading>Save invoice</Button>",
                  '<Button appearance="outline" mode="neutral" iconStart="Download" loading>Export</Button>',
                ].join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {APPEARANCES.map((rowAppearance) => (
                    <Button key={rowAppearance} appearance={rowAppearance} mode="neutral" disabled>
                      {rowAppearance}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled has its own text, border and fill tokens in every mode, not a faded copy of the live
                  button. Ghost keeps no fill.
                </p>
              </div>
              <CodeBlock code={"<Button disabled>Save invoice</Button>"} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Danger</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button appearance="outline" mode="danger">
                    Revoke access
                  </Button>
                  <Button appearance="outline" mode="danger" iconStart="Trash2">
                    Delete invoice
                  </Button>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  With iconStart empty, a solid, outline or soft danger Button shows a warning icon. Pass Trash2
                  when the action deletes something.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<Button appearance="outline" mode="danger">Revoke access</Button>',
                  '<Button appearance="outline" mode="danger" iconStart="Trash2">Delete invoice</Button>',
                ].join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Ask</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle">
                    Ask
                  </Button>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Ask opens the assistant about the thing it sits on, like an invoice card. It is a neutral sm
                  Button with a MessageCircle icon, not a component of its own.
                </p>
              </div>
              <CodeBlock
                code={'<Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle">Ask</Button>'}
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
