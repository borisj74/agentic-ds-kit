"use client";

import { useState } from "react";
import { Field } from "agentic-ds-kit";
import type { FieldLabelPosition } from "agentic-ds-kit";
import { Textarea } from "agentic-ds-kit";
import type { TextareaSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SizeControl, SwitchControl } from "./ControlsPanel";

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
        <h2 className={styles.heroTitle}>Textarea</h2>
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
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <RadioControl
                  label="Label"
                  options={LABEL_POSITIONS}
                  value={labelPosition}
                  onChange={setLabelPosition}
                  optionLabel={(option) => (option === "start" ? "start (left)" : option)}
                />
                <SwitchControl
                  label="State"
                  items={[
                    {
                      label: "Hover",
                      checked: hover,
                      onChange: (next) => {
                        setHover(next);
                        if (next) setFocus(false);
                      },
                    },
                    {
                      label: "Focus",
                      checked: focus,
                      onChange: (next) => {
                        setFocus(next);
                        if (next) setHover(false);
                      },
                    },
                    { label: "Disabled", checked: disabled, onChange: setDisabled },
                    { label: "Error", checked: error, onChange: setError },
                  ]}
                />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. Use Input for a single line. Size sets padding and min-height.
                </p>
              </div>
              <CodeBlock code={masterCode(size, disabled, error, labelPosition)} />
            </DocNotes>
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
