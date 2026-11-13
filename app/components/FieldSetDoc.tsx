"use client";

import { useState } from "react";
import { Checkbox, Field, FieldSet, Input, RadioGroup, Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import { DocNotes } from "./DocNotes";
import { DocTabList } from "./DocTabList";
import styles from "./ComponentDoc.module.css";

const MASTER_CODE = `<FieldSet legend="Billing address" description="Used on invoices and receipts.">
  <Field label="Street" htmlFor="street">
    <Input id="street" placeholder="123 Market St" />
  </Field>
  <Field label="City" htmlFor="city">
    <Input id="city" placeholder="San Francisco" />
  </Field>
</FieldSet>`;

export function FieldSetDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>FieldSet</h2>
        <p className={styles.lede}>
          A legend and optional description around related fields. This is the form group. A single
          labeled control stays Field.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="fieldset-master">
        <div className={styles.masterHeader}>
          <h2 id="fieldset-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Legend, description, and kit fields. Do not add FieldLegend, FieldGroup, or Form.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <FieldSet legend="Billing address" description="Used on invoices and receipts.">
                    <Field label="Street" htmlFor="fieldset-street">
                      <Input id="fieldset-street" placeholder="123 Market St" />
                    </Field>
                    <Field label="City" htmlFor="fieldset-city">
                      <Input id="fieldset-city" placeholder="San Francisco" />
                    </Field>
                  </FieldSet>
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  FieldSet is the form group. One Field stands alone. Page titles stay on PageHeader.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Checkbox under a legend</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <FieldSet
                    legend="Billing address"
                    description="The billing address associated with your payment method"
                  >
                    <Checkbox id="fieldset-same" label="Same as shipping address" defaultChecked />
                  </FieldSet>
                </div>
              </div>
              <CodeBlock
                code={`<FieldSet legend="Billing address" description="The billing address associated with your payment method">
  <Checkbox id="same" label="Same as shipping address" />
</FieldSet>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Choice</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <FieldSet legend="Delivery">
                    <RadioGroup
                      name="fieldset-delivery"
                      legend="Speed"
                      hideLegend
                      defaultValue="standard"
                      options={[
                        { value: "standard", label: "Standard" },
                        { value: "express", label: "Express" },
                      ]}
                    />
                  </FieldSet>
                </div>
              </div>
              <CodeBlock
                code={`<FieldSet legend="Delivery">
  <RadioGroup name="delivery" legend="Speed" defaultValue="standard" options={options} />
</FieldSet>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Switch</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <FieldSet legend="Notifications">
                    <Field label="Email me" htmlFor="fieldset-email" labelPosition="start">
                      <Switch id="fieldset-email" ariaLabel="Email me" defaultChecked />
                    </Field>
                  </FieldSet>
                </div>
              </div>
              <CodeBlock
                code={`<FieldSet legend="Notifications">
  <Field label="Email me" htmlFor="email" labelPosition="start">
    <Switch id="email" ariaLabel="Email me" />
  </Field>
</FieldSet>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
