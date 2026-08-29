"use client";

import { useState } from "react";
import { Field } from "@/ui/Field";
import type { FieldLabelPosition } from "@/ui/Field";
import { Input } from "@/ui/Input";
import type { InputSize } from "@/ui/Input";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: InputSize[] = ["lg", "md", "sm"];
const LABEL_POSITIONS: FieldLabelPosition[] = ["top", "start"];

function masterCode(
  size: InputSize,
  disabled: boolean,
  error: boolean,
  labelPosition: FieldLabelPosition,
) {
  const fieldOpen =
    labelPosition === "start"
      ? '<Field label="Email" htmlFor="email" labelPosition="start">'
      : '<Field label="Email" htmlFor="email">';
  const lines = [
    fieldOpen,
    "  <Input",
    '    id="email"',
    '    type="email"',
    `    size="${size}"`,
  ];
  if (disabled) lines.push("    disabled");
  if (error) lines.push("    error");
  lines.push('    placeholder="you@example.com"', "  />", "</Field>");
  return lines.join("\n");
}

export function InputDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<InputSize>("md");
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const [labelPosition, setLabelPosition] = useState<FieldLabelPosition>("top");

  const demo = disabled ? undefined : focus ? "focus" : hover ? "hover" : undefined;
  const fieldError = error ? "Enter a valid email" : undefined;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Input</h1>
        <p className={styles.lede}>
          Single-line text in lg, md, and sm. Field label sits on top or start (left). start and
          iconStart are prefix slots inside the control. No InputGroup cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="input-master">
        <div className={styles.masterHeader}>
          <h2 id="input-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, label position, and state. Prefix text and icons live in Variants.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow} style={{ width: labelPosition === "start" ? "28rem" : "20rem" }}>
                  <Field
                    label="Email"
                    htmlFor="input-master"
                    error={fieldError}
                    labelPosition={labelPosition}
                  >
                    <Input
                      id="input-master"
                      type="email"
                      size={size}
                      disabled={disabled}
                      error={error}
                      demo={demo}
                      placeholder="you@example.com"
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
                          name="input-label-position"
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
                  Wrap with Field. labelPosition top or start (left). start and iconStart are prefix
                  slots inside the control, not the Field label.
                </p>
              </div>
              <CodeBlock code={masterCode(size, disabled, error, labelPosition)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Plain</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "20rem" }}>
                  <Field label="Email" htmlFor="input-plain">
                    <Input id="input-plain" type="email" placeholder="you@example.com" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Field label on top. No start slot.</p>
              </div>
              <CodeBlock
                code={'<Field label="Email" htmlFor="email"><Input id="email" type="email" placeholder="you@example.com" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Label start</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "28rem" }}>
                  <Field label="Email" htmlFor="input-label-start" labelPosition="start">
                    <Input id="input-label-start" type="email" placeholder="you@example.com" />
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
                code={'<Field label="Email" htmlFor="email" labelPosition="start"><Input id="email" type="email" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Start</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "20rem" }}>
                  <Field label="Website" htmlFor="input-start">
                    <Input id="input-start" start="https://" placeholder="example.com" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  start sits inside the field on the left. It is prefix text, not a label.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Website" htmlFor="website"><Input id="website" start="https://" placeholder="example.com" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>iconStart</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "20rem" }}>
                  <Field label="Search" htmlFor="input-icon">
                    <Input id="input-icon" iconStart="Search" placeholder="Search" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Lucide name on iconStart, same catalog as Button.</p>
              </div>
              <CodeBlock
                code={'<Field label="Search" htmlFor="search"><Input id="search" iconStart="Search" placeholder="Search" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>End</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "20rem" }}>
                  <Field label="Amount" htmlFor="input-end">
                    <Input id="input-end" start="$" end="USD" placeholder="0.00" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>end is the matching right slot. Same rule as start.</p>
              </div>
              <CodeBlock
                code={'<Field label="Amount" htmlFor="amount"><Input id="amount" start="$" end="USD" placeholder="0.00" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Large</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "20rem" }}>
                  <Field label="Name" htmlFor="input-lg">
                    <Input id="input-lg" size="lg" placeholder="Boris Jovanovic" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>lg, md, and sm. Default is md.</p>
              </div>
              <CodeBlock
                code={'<Field label="Name" htmlFor="name"><Input id="name" size="lg" /></Field>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
