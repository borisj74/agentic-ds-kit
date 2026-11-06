"use client";

import { useState } from "react";
import { Field } from "agentic-ds-kit";
import type { FieldLabelPosition } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import type { InputSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { InputMatrix } from "./InputMatrix";
import { RealisticFields, realisticFieldsCode } from "./RealisticFields";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import matrix from "./VariantMatrix.module.css";
import shortcut from "./RealisticFields.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const SIZES: InputSize[] = ["sm", "md", "lg"];
const LABEL_POSITIONS: FieldLabelPosition[] = ["top", "start"];


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

      <section className={matrix.block} aria-labelledby="input-matrix">
        <div>
          <h2 id="input-matrix" className={styles.masterTitle}>
            All variants
          </h2>
          <p className={styles.masterSummary}>
            Every size at rest, in error, and disabled, plus the same fields on a grey surface.
          </p>
        </div>
        <InputMatrix />
      </section>

      <section className={styles.master} aria-labelledby="input-master">
        <div className={styles.masterHeader}>
          <h2 id="input-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Email with an icon and hint, a password error, and search with a shortcut chip. Size, label position, and state apply across them.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <RealisticFields
                  idPrefix="input-master"
                  size={size}
                  labelPosition={labelPosition}
                  disabled={disabled}
                  demo={demo}
                  emailError={fieldError}
                />
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. labelPosition top or start (left). start and iconStart are prefix
                  slots inside the control, not the Field label.
                </p>
              </div>
              <CodeBlock code={realisticFieldsCode(size, labelPosition, disabled, fieldError)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Email</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "22rem" }}>
                  <Field label="Email" htmlFor="input-email" hint="We'll send receipts to this address.">
                    <Input id="input-email" type="email" iconStart="Mail" placeholder="ada@example.com" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>iconStart names the field. hint sits under the control.</p>
              </div>
              <CodeBlock
                code={'<Field label="Email" htmlFor="email" hint="We\'ll send receipts to this address."><Input id="email" type="email" iconStart="Mail" placeholder="ada@example.com" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Password</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "22rem" }}>
                  <Field label="Password" htmlFor="input-password" error="Use at least 8 characters.">
                    <Input id="input-password" type="password" defaultValue="short" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>error on Field is the message and the control border.</p>
              </div>
              <CodeBlock
                code={'<Field label="Password" htmlFor="password" error="Use at least 8 characters."><Input id="password" type="password" defaultValue="short" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Label start</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} style={{ width: "28rem" }}>
                  <Field
                    label="Email"
                    htmlFor="input-label-start"
                    labelPosition="start"
                    hint="We'll send receipts to this address."
                  >
                    <Input id="input-label-start" type="email" iconStart="Mail" placeholder="ada@example.com" />
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
                code={'<Field label="Email" htmlFor="email" labelPosition="start" hint="We\'ll send receipts to this address."><Input id="email" type="email" iconStart="Mail" placeholder="ada@example.com" /></Field>'}
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
                    <Input
                      id="input-icon"
                      type="search"
                      className={shortcut.shortcut}
                      iconStart="Search"
                      end="⌘K"
                      placeholder="Invoices, customers, tasks"
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  iconStart is the magnifying glass. end is the decorative ⌘K chip, not a keybinding.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Search" htmlFor="search"><Input id="search" type="search" iconStart="Search" end="⌘K" placeholder="Invoices, customers, tasks" /></Field>'}
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
