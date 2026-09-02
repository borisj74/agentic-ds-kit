"use client";

import { useState } from "react";
import { Field } from "agentic-ds-kit";
import type { FieldLabelPosition } from "agentic-ds-kit";
import { Textarea } from "agentic-ds-kit";
import type { TextareaSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: TextareaSize[] = ["sm", "md", "lg"];
const LABEL_POSITIONS: FieldLabelPosition[] = ["top", "start"];

function masterCode(
  size: TextareaSize,
  disabled: boolean,
  error: boolean,
  labelPosition: FieldLabelPosition,
) {
  const fieldOpen =
    labelPosition === "start"
      ? '<Field label="Notes" htmlFor="notes" labelPosition="start">'
      : '<Field label="Notes" htmlFor="notes">';
  const lines = [fieldOpen, "  <Textarea", '    id="notes"', `    size="${size}"`];
  if (disabled) lines.push("    disabled");
  if (error) lines.push("    error");
  lines.push('    placeholder="Add a note..."', "  />", "</Field>");
  return lines.join("\n");
}

export function TextareaDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TextareaSize>("md");
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const [labelPosition, setLabelPosition] = useState<FieldLabelPosition>("top");

  const demo = disabled ? undefined : focus ? "focus" : hover ? "hover" : undefined;
  const fieldError = error ? "Notes can't be empty" : undefined;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Textarea</h1>
        <p className={styles.lede}>
          Multi-line text in lg, md, and sm. Field label sits on top or start (left). Not Input.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="textarea-master">
        <div className={styles.masterHeader}>
          <h2 id="textarea-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, label position, and state. Wrap with Field. Do not add start slots.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Field
                    label="Notes"
                    htmlFor="textarea-master"
                    error={fieldError}
                    hint={error ? undefined : "Keep it under 240 characters"}
                    labelPosition={labelPosition}
                  >
                    <Textarea
                      id="textarea-master"
                      size={size}
                      disabled={disabled}
                      error={error}
                      demo={demo}
                      placeholder="Add a note..."
                    />
                  </Field>
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
                  <span className={styles.panelLabel}>Label</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Label position">
                    {LABEL_POSITIONS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="textarea-label-position"
                          value={option}
                          checked={labelPosition === option}
                          onChange={() => setLabelPosition(option)}
                        />
                        {option === "start" ? "start (left)" : option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>State</span>
                  <Switch
                    size="sm"
                    label="Hover"
                    checked={hover}
                    onChange={(next) => {
                      setHover(next);
                      if (next) setFocus(false);
                    }}
                  />
                  <Switch
                    size="sm"
                    label="Focus"
                    checked={focus}
                    onChange={(next) => {
                      setFocus(next);
                      if (next) setHover(false);
                    }}
                  />
                  <Switch size="sm" label="Disabled" checked={disabled} onChange={setDisabled} />
                  <Switch size="sm" label="Error" checked={error} onChange={setError} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. Use Input for a single line. Size sets padding and min-height.
                </p>
              </div>
              <CodeBlock code={masterCode(size, disabled, error, labelPosition)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={{ maxWidth: "25.4rem" }}>
                  <Field label="Notes" htmlFor="textarea-lg">
                    <Textarea id="textarea-lg" size="lg" placeholder="Large" />
                  </Field>
                  <Field label="Notes" htmlFor="textarea-md">
                    <Textarea id="textarea-md" size="md" placeholder="Medium" />
                  </Field>
                  <Field label="Notes" htmlFor="textarea-sm">
                    <Textarea id="textarea-sm" size="sm" placeholder="Small" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>lg, md, and sm. Default is md. Same sizes as Input.</p>
              </div>
              <CodeBlock
                code={'<Field label="Notes" htmlFor="notes"><Textarea id="notes" size="lg" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Label start</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "35.56rem" }}>
                  <Field label="Notes" htmlFor="textarea-label-start" labelPosition="start">
                    <Textarea id="textarea-label-start" placeholder="Add a note..." />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  labelPosition=start puts the Field label on the left. Hint and error stay under the
                  control.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Notes" htmlFor="notes" labelPosition="start"><Textarea id="notes" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "25.4rem" }}>
                  <Field label="Notes" htmlFor="textarea-error" error="Notes can't be empty">
                    <Textarea id="textarea-error" error placeholder="Add a note..." />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>error on Field for the message. error on Textarea for the border.</p>
              </div>
              <CodeBlock
                code={'<Field label="Notes" htmlFor="notes" error="Notes can\'t be empty"><Textarea id="notes" error /></Field>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
