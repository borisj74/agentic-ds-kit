"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { InputOTP } from "agentic-ds-kit";
import type { InputOTPSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: InputOTPSize[] = ["sm", "md", "lg"];

function masterCode(size: InputOTPSize, disabled: boolean, error: boolean) {
  const lines = [
    '<Field label="Verification code" htmlFor="otp">',
    "  <InputOTP",
    '    id="otp"',
    `    size="${size}"`,
  ];
  if (disabled) lines.push("    disabled");
  if (error) lines.push("    error");
  lines.push("  />", "</Field>");
  return lines.join("\n");
}

export function InputOTPDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<InputOTPSize>("md");
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(false);
  const [value, setValue] = useState("");
  const [formValue, setFormValue] = useState("");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>InputOTP</h1>
        <p className={styles.lede}>
          One-time code or PIN as separate slots. One native input so paste and autocomplete
          work. Not a row of Inputs.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="inputotp-master">
        <div className={styles.masterHeader}>
          <h2 id="inputotp-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Field-wrapped 6-digit with a 3-3 separator. Toggle size, disabled, and error.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewStack} style={{ maxWidth: "24rem" }}>
                  <Field
                    label="Verification code"
                    htmlFor="otp-master"
                    hint={value ? `Value: ${value}` : "Type or paste a 6-digit code"}
                    error={error ? "Enter a valid code" : undefined}
                  >
                    <InputOTP
                      id="otp-master"
                      size={size}
                      disabled={disabled}
                      error={error}
                      value={value}
                      onChange={setValue}
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
                  <span className={styles.panelLabel}>State</span>
                  <Switch size="sm" label="Disabled" checked={disabled} onChange={setDisabled} />
                  <Switch size="sm" label="Error" checked={error} onChange={setError} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. Default length is 6 with groups [3, 3]. Paste fills the
                  concatenated value. Unlabeled needs ariaLabel.
                </p>
              </div>
              <CodeBlock code={masterCode(size, disabled, error)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>4-digit PIN</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="PIN" htmlFor="otp-pin">
                    <InputOTP id="otp-pin" length={4} />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  length=4 is one group. No separator.
                </p>
              </div>
              <CodeBlock code={'<Field label="PIN" htmlFor="pin"><InputOTP id="pin" length={4} /></Field>'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>No separator</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="Verification code" htmlFor="otp-flat">
                    <InputOTP id="otp-flat" groups={[6]} />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  groups=[6] keeps six slots in one group.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Verification code" htmlFor="otp"><InputOTP id="otp" groups={[6]} /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Alphanumeric</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="Backup code" htmlFor="otp-alpha">
                    <InputOTP id="otp-alpha" pattern="alphanumeric" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Letters and digits. Stored uppercase.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Backup code" htmlFor="otp"><InputOTP id="otp" pattern="alphanumeric" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="Verification code" htmlFor="otp-disabled">
                    <InputOTP id="otp-disabled" disabled defaultValue="123" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled dims the slots and blocks typing.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Verification code" htmlFor="otp"><InputOTP id="otp" disabled /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Field label="Verification code" htmlFor="otp-error" error="Code is incorrect">
                    <InputOTP id="otp-error" error defaultValue="000000" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  error paints slot borders with status-danger. Pair with Field error text.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Verification code" htmlFor="otp" error="Code is incorrect"><InputOTP id="otp" error /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Verify</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack} style={{ maxWidth: "24rem" }}>
                  <Field
                    label="Verification code"
                    htmlFor="otp-form"
                    hint="We sent a 6-digit code"
                  >
                    <InputOTP id="otp-form" value={formValue} onChange={setFormValue} />
                  </Field>
                  <Button variant="primary" disabled={formValue.length !== 6}>
                    Verify
                  </Button>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose Field, InputOTP, and Button. Enable Verify when the code is complete.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Verification code" htmlFor="otp"><InputOTP id="otp" /></Field>\n<Button variant="primary">Verify</Button>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
