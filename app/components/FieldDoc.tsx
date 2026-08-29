"use client";

import { useState } from "react";
import { Card } from "@/ui/Card";
import { Checkbox } from "@/ui/Checkbox";
import { Field } from "@/ui/Field";
import { FieldSet } from "@/ui/FieldSet";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Switch } from "@/ui/Switch";
import { Textarea } from "@/ui/Textarea";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import local from "./FieldDoc.module.css";

const MONTHS = [
  { value: "", label: "MM" },
  ...["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((value) => ({
    value,
    label: value,
  })),
];

const YEARS = [
  { value: "", label: "YYYY" },
  ...["2026", "2027", "2028", "2029", "2030"].map((value) => ({ value, label: value })),
];

const MASTER_CODE = `<Card
  title="Payment Method"
  description="All transactions are secure and encrypted"
  actions={[{ label: "Submit" }, { label: "Cancel", variant: "secondary" }]}
>
  <Field label="Name on Card" htmlFor="name">
    <Input id="name" placeholder="Evil Rabbit" />
  </Field>
  <Field label="Card Number" htmlFor="card" hint="Enter your 16-digit card number">
    <Input id="card" placeholder="ACCT-000003" iconStart="CreditCard" />
  </Field>
  <FieldSet legend="Billing Address" description="The billing address associated with your payment method">
    <Checkbox id="same" label="Same as shipping address" />
  </FieldSet>
</Card>`;

export function FieldDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Field</h1>
        <p className={styles.lede}>
          Label, control, hint, and error as one piece. FieldSet groups related fields. No FieldLabel
          or Form cousins.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="field-master">
        <div className={styles.masterHeader}>
          <h2 id="field-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            A payment form from kit Card, Field, FieldSet, Input, Select, Textarea, and Checkbox.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={local.masterCard}>
                  <Card
                    title="Payment Method"
                    description="All transactions are secure and encrypted"
                    actions={[
                      { label: "Submit" },
                      { label: "Cancel", variant: "secondary" },
                    ]}
                  >
                    <Field label="Name on Card" htmlFor="field-name">
                      <Input id="field-name" placeholder="Evil Rabbit" />
                    </Field>
                    <Field
                      label="Card Number"
                      htmlFor="field-card"
                      hint="Enter your 16-digit card number"
                    >
                      <Input id="field-card" placeholder="ACCT-000003" iconStart="CreditCard" />
                    </Field>
                    <div className={local.split}>
                      <Field label="Month" htmlFor="field-month">
                        <Select id="field-month" options={MONTHS} />
                      </Field>
                      <Field label="Year" htmlFor="field-year">
                        <Select id="field-year" options={YEARS} />
                      </Field>
                      <Field label="CVV" htmlFor="field-cvv">
                        <Input id="field-cvv" placeholder="CVC" />
                      </Field>
                    </div>
                    <FieldSet
                      legend="Billing Address"
                      description="The billing address associated with your payment method"
                    >
                      <Checkbox id="field-same" label="Same as shipping address" defaultChecked />
                    </FieldSet>
                    <Field label="Comments" htmlFor="field-comments">
                      <Textarea id="field-comments" placeholder="Add a comment..." />
                    </Field>
                  </Card>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Usage">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Compose</span>
                  <p className={styles.usageBody}>
                    Field wraps one control. FieldSet is the legend group. Card is the chrome. Do not
                    add Form or FieldLabel.
                  </p>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Field for a labeled control. Use FieldSet when a legend wraps related fields.
                  settings-form is the page pattern.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Input</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Field
                    label="Username"
                    htmlFor="field-username"
                    hint="Choose a unique username for your account."
                  >
                    <Input id="field-username" placeholder="evilrabbit" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>hint is the helper. Not a FieldDescription cousin.</p>
              </div>
              <CodeBlock
                code={'<Field label="Username" htmlFor="username" hint="Choose a unique username."><Input id="username" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Field label="Username" htmlFor="field-username-error" error="Choose another username.">
                    <Input id="field-username-error" error defaultValue="admin" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>error on Field for the message. error on the control for the border.</p>
              </div>
              <CodeBlock
                code={'<Field label="Username" htmlFor="username" error="Choose another username."><Input id="username" error /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Switch</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Field label="Subscribe to the newsletter" htmlFor="field-news" labelPosition="start">
                    <Switch id="field-news" ariaLabel="Subscribe to the newsletter" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>labelPosition=start is horizontal. Switch has no second label.</p>
              </div>
              <CodeBlock
                code={'<Field label="Subscribe to the newsletter" htmlFor="news" labelPosition="start"><Switch id="news" ariaLabel="Subscribe to the newsletter" /></Field>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>FieldSet</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <FieldSet
                    legend="Billing Address"
                    description="The billing address associated with your payment method"
                  >
                    <Checkbox id="field-set-same" label="Same as shipping address" defaultChecked />
                  </FieldSet>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One FieldSet. Do not add FieldLegend or FieldGroup. Checkbox keeps its own label.
                </p>
              </div>
              <CodeBlock
                code={'<FieldSet legend="Billing Address" description="The billing address associated with your payment method"><Checkbox id="same" label="Same as shipping address" /></FieldSet>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
