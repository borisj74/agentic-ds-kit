"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Divider } from "agentic-ds-kit";
import type { DividerAlign, DividerOrientation, DividerTone } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const ORIENTATIONS: DividerOrientation[] = ["horizontal", "vertical"];
const TONES: DividerTone[] = ["faint", "default"];
const ALIGNS: DividerAlign[] = ["start", "center", "end"];

const actionCode = '<Button variant="tertiary" size="sm" iconStart="Plus">Add item</Button>';

const verticalRow = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-inline-md)",
  color: "var(--text-secondary)",
  fontSize: "var(--type-size-body-sm)",
} as const;

function masterCode(
  orientation: DividerOrientation,
  tone: DividerTone,
  align: DividerAlign,
  withLabel: boolean,
  withAction: boolean,
) {
  const attrs: string[] = [];
  if (orientation === "vertical") attrs.push('orientation="vertical"');
  if (tone !== "faint") attrs.push(`tone="${tone}"`);
  if (orientation === "horizontal") {
    if (withLabel) attrs.push('label="or"');
    if ((withLabel || withAction) && align !== "center") attrs.push(`align="${align}"`);
    if (withAction) attrs.push(`action={${actionCode}}`);
  }
  if (attrs.length === 0) return "<Divider />";
  if (attrs.length === 1 && !withAction) return `<Divider ${attrs[0]} />`;
  return ["<Divider", ...attrs.map((attr) => `  ${attr}`), "/>"].join("\n");
}

export function DividerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [orientation, setOrientation] = useState<DividerOrientation>("horizontal");
  const [tone, setTone] = useState<DividerTone>("faint");
  const [align, setAlign] = useState<DividerAlign>("center");
  const [withLabel, setWithLabel] = useState(true);
  const [withAction, setWithAction] = useState(false);
  const horizontal = orientation === "horizontal";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Divider</h1>
        <p className={styles.lede}>
          Thin rule between groups of content, with an optional label or action on the line. Not a spacer. Not a
          container border.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="divider-master">
        <div className={styles.masterHeader}>
          <h2 id="divider-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle orientation, tone, label, action, and alignment. Label and action are horizontal only.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                {horizontal ? (
                  <div className={styles.previewFill}>
                    <Divider
                      tone={tone}
                      align={align}
                      label={withLabel ? "or" : undefined}
                      action={
                        withAction ? (
                          <Button variant="tertiary" size="sm" iconStart="Plus">
                            Add item
                          </Button>
                        ) : undefined
                      }
                    />
                  </div>
                ) : (
                  <div style={verticalRow}>
                    <span>Draft</span>
                    <Divider orientation="vertical" tone={tone} />
                    <span>Edited 2h ago</span>
                    <Divider orientation="vertical" tone={tone} />
                    <span>3 comments</span>
                  </div>
                )}
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Orientation</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Orientation">
                    {ORIENTATIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${orientation === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={orientation === option}
                        onClick={() => setOrientation(option)}
                      >
                        {option}
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
                          name="divider-tone"
                          value={option}
                          checked={tone === option}
                          onChange={() => setTone(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                {horizontal ? (
                  <>
                    <div className={styles.panelGroup}>
                      <span className={styles.panelLabel}>Content</span>
                      <Switch label="Label" size="sm" checked={withLabel} onChange={setWithLabel} />
                      <Switch label="Action" size="sm" checked={withAction} onChange={setWithAction} />
                    </div>
                    <div className={styles.panelGroup}>
                      <span className={styles.panelLabel}>Align</span>
                      <div className={styles.radioList} role="radiogroup" aria-label="Align">
                        {ALIGNS.map((option) => (
                          <label key={option} className={styles.radio}>
                            <input
                              type="radio"
                              name="divider-align"
                              value={option}
                              checked={align === option}
                              disabled={!withLabel && !withAction}
                              onChange={() => setAlign(option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Plain horizontal renders an hr. Vertical renders role=separator with aria-orientation. With a label
                  or action, the line halves are decorative and the label is plain text. Use space tokens for
                  whitespace, not a Divider.
                </p>
              </div>
              <CodeBlock code={masterCode(orientation, tone, align, withLabel, withAction)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Plain</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <Divider />
                  <Divider tone="default" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Faint is the default between groups on one surface. Default tone is stronger, for when faint gets
                  lost on a muted surface.
                </p>
              </div>
              <CodeBlock code={['<Divider />', '<Divider tone="default" />'].join("\n")} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With label</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <Divider label="or" />
                  <Divider label="Older" align="start" />
                  <Divider label="Today" align="end" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A word or two on the line, like an "or" between sign-in methods. Align moves it to the start or
                  end.
                </p>
              </div>
              <CodeBlock
                code={['<Divider label="or" />', '<Divider label="Older" align="start" />', '<Divider label="Today" align="end" />'].join(
                  "\n",
                )}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With action</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Divider
                    action={
                      <Button variant="tertiary" size="sm" iconStart="Plus">
                        Add item
                      </Button>
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One kit Button (tertiary, sm) on the line, e.g. to insert between list sections or show more.
                </p>
              </div>
              <CodeBlock
                code={`import { Button, Divider } from "agentic-ds-kit";

<Divider
  action={${actionCode}}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Vertical</h2>
              <div className={styles.exampleCanvas}>
                <div style={verticalRow}>
                  <span>Draft</span>
                  <Divider orientation="vertical" />
                  <span>Edited 2h ago</span>
                  <Divider orientation="vertical" />
                  <span>3 comments</span>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Between items in a flex row (metadata, toolbar). It stretches to the row height. No label.
                </p>
              </div>
              <CodeBlock
                code={`<div style={{ display: "flex", alignItems: "center", gap: "var(--space-inline-md)" }}>
  <span>Draft</span>
  <Divider orientation="vertical" />
  <span>Edited 2h ago</span>
</div>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
