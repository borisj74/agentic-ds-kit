"use client";

import { useRef, useState } from "react";
import { Alert } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Card } from "agentic-ds-kit";
import { Checkbox } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { FieldSet } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { Select } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { Textarea } from "agentic-ds-kit";
import { RealisticFields, realisticFieldsCode } from "./RealisticFields";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import local from "./FieldDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

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
  title="Payment method"
  description="Card details for this workspace"
  actions={[{ label: "Pay $49.00", appearance: "solid", mode: "primary" }, { label: "Cancel", appearance: "outline", mode: "neutral" }]}
>
  <Field label="Name on card" htmlFor="name">
    <Input id="name" placeholder="Priya Shah" />
  </Field>
  <Field label="Card number" htmlFor="card" hint="16 digits on the front of the card">
    <Input id="card" placeholder="4242 4242 4242 4242" iconStart="CreditCard" />
  </Field>
  <FieldSet legend="Billing address" description="Where the card is billed">
    <Checkbox id="same" label="Same as shipping address" />
  </FieldSet>
</Card>`;

const STATES_CODE = `<Field label="Company name" htmlFor="company" required>
  <Input id="company" defaultValue="Northwind GmbH" />
</Field>
<Field label="VAT number" htmlFor="vat" optional hint="Starts with a country code." error="It needs 9 digits after DE.">
  <Input id="vat" defaultValue="DE12345678" />
</Field>
<Field label="Billing email" htmlFor="billing-email" required success="Email verified.">
  <Input id="billing-email" type="email" defaultValue="billing@northwind.dev" />
</Field>
<Field label="Invoice currency" htmlFor="currency">
  <Select id="currency" size="lg" options={currencies} />
</Field>
<Field label="Legal name" htmlFor="legal-name" changed hint="Was “Northwind Traders Ltd”.">
  <Input id="legal-name" defaultValue="Northwind Traders Limited" />
</Field>`;

const SUMMARY_CODE = `const alertRef = useRef<HTMLDivElement>(null);

function onSubmit() {
  const next = postcode.length === 5 ? "" : "Enter a postcode with 5 digits, like 10119.";
  setPostcodeError(next);
  if (next) requestAnimationFrame(() => alertRef.current?.focus());
}

{postcodeError ? (
  <Alert
    ref={alertRef}
    tabIndex={-1}
    variant="danger"
    placement="inline"
    title="Fix 1 field to save"
    action={{ label: "Go to Postcode", onClick: () => document.getElementById("postcode")?.focus() }}
  >
    Postcode needs 5 digits.
  </Alert>
) : null}
<Field label="Postcode" htmlFor="postcode" required error={postcodeError}>
  <Input id="postcode" value={postcode} onChange={setPostcode} />
</Field>
<Button appearance="outline" mode="neutral" onClick={onSubmit}>Save billing details</Button>`;

const CURRENCIES = [
  { value: "eur", label: "Euro · EUR" },
  { value: "usd", label: "US dollar · USD" },
  { value: "gbp", label: "Pound · GBP" },
];

function ErrorSummaryExample() {
  const alertRef = useRef<HTMLDivElement>(null);
  const [postcode, setPostcode] = useState("101");
  const [postcodeError, setPostcodeError] = useState("");

  function onSubmit() {
    const next = /^\d{5}$/.test(postcode) ? "" : "Enter a postcode with 5 digits, like 10119.";
    setPostcodeError(next);
    if (next) requestAnimationFrame(() => alertRef.current?.focus());
  }

  return (
    <div className={local.stack}>
      {postcodeError ? (
        <Alert
          ref={alertRef}
          tabIndex={-1}
          variant="danger"
          placement="inline"
          title="Fix 1 field to save"
          action={{
            label: "Go to Postcode",
            onClick: () => document.getElementById("field-summary-postcode")?.focus(),
          }}
        >
          Postcode needs 5 digits.
        </Alert>
      ) : null}
      <Field label="Postcode" htmlFor="field-summary-postcode" required error={postcodeError || undefined}>
        <Input id="field-summary-postcode" value={postcode} onChange={setPostcode} />
      </Field>
      <div>
        <Button appearance="outline" mode="neutral" onClick={onSubmit}>
          Save billing details
        </Button>
      </div>
    </div>
  );
}

export function FieldDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Field</h2>
        <p className={styles.lede}>
          Label, control, hint, and error as one piece. FieldSet is the form group. No FieldLabel,
          Form, or FormDisplay.
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
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={local.masterCard}>
                  <Card
                    title="Payment method"
                    description="Card details for this workspace"
                    actions={[
                      { label: "Pay $49.00", appearance: "solid", mode: "primary" },
                      { label: "Cancel", appearance: "outline", mode: "neutral" },
                    ]}
                  >
                    <Field label="Name on card" htmlFor="field-name">
                      <Input id="field-name" placeholder="Priya Shah" />
                    </Field>
                    <Field
                      label="Card number"
                      htmlFor="field-card"
                      hint="16 digits on the front of the card"
                    >
                      <Input id="field-card" placeholder="4242 4242 4242 4242" iconStart="CreditCard" />
                    </Field>
                    <div className={local.split}>
                      <Field label="Month" htmlFor="field-month">
                        <Select id="field-month" options={MONTHS} />
                      </Field>
                      <Field label="Year" htmlFor="field-year">
                        <Select id="field-year" options={YEARS} />
                      </Field>
                      <Field label="CVC" htmlFor="field-cvv">
                        <Input id="field-cvv" placeholder="123" />
                      </Field>
                    </div>
                    <FieldSet
                      legend="Billing address"
                      description="Where the card is billed"
                    >
                      <Checkbox id="field-same" label="Same as shipping address" defaultChecked />
                    </FieldSet>
                    <Field label="Comments" htmlFor="field-comments">
                      <Textarea id="field-comments" placeholder="Add a note" />
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Field for a labeled control. Use FieldSet when a legend wraps related fields.
                  settings-form is the page pattern.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Email, password, search</h2>
              <div className={styles.exampleCanvas}>
                <RealisticFields idPrefix="field-examples" />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Email carries iconStart and a hint. Password carries the error. Search carries iconStart and a
                  decorative ⌘K chip in the end slot.
                </p>
              </div>
              <CodeBlock code={realisticFieldsCode("md", "top", false)} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Help</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Field
                    label="Invoice date"
                    htmlFor="field-invoice-help"
                    help="We use this date on the PDF. It does not change when payment is recorded."
                    hint="Required for billing."
                  >
                    <Input id="field-invoice-help" placeholder="2026-09-20" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  help opens HelpPopover beside the label. hint stays visible under the control.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="Invoice date" htmlFor="invoice-date" help="We use this date on the PDF. It does not change when payment is recorded." hint="Required for billing."><Input id="invoice-date" /></Field>'}
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
              <h2 className={styles.exampleTitle}>Optional, required, success, changed</h2>
              <div className={styles.exampleCanvas}>
                <div className={`${styles.previewFill} ${local.stack}`} style={{ maxWidth: "20rem" }}>
                  <Field label="Company name" htmlFor="field-state-company" required>
                    <Input id="field-state-company" defaultValue="Northwind GmbH" />
                  </Field>
                  <Field
                    label="VAT number"
                    htmlFor="field-state-vat"
                    optional
                    hint="Starts with a country code."
                    error="It needs 9 digits after DE."
                  >
                    <Input id="field-state-vat" defaultValue="DE12345678" />
                  </Field>
                  <Field label="Billing email" htmlFor="field-state-email" required success="Email verified.">
                    <Input id="field-state-email" type="email" defaultValue="billing@northwind.dev" />
                  </Field>
                  <Field label="Invoice currency" htmlFor="field-state-currency">
                    <Select id="field-state-currency" size="lg" options={CURRENCIES} />
                  </Field>
                  <Field
                    label="Legal name"
                    htmlFor="field-state-legal-name"
                    changed
                    hint="Was “Northwind Traders Ltd”."
                  >
                    <Input id="field-state-legal-name" defaultValue="Northwind Traders Limited" />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Mark the rarer kind. Most billing fields are required, so the optional ones say Optional, and
                  required sets aria-required with no asterisk. The hint stays when an error shows, and the
                  message goes under it with an icon. Say what to do: Enter a postcode with 5 digits, not Invalid
                  input. Check on blur and on submit, never while the person is typing. Read-only keeps full
                  contrast; disabled uses the disabled tokens. One size per row: a field, a Select and a Button
                  in one row share sm, md or lg. changed says Edited beside the label for a value not saved yet;
                  put the old value in hint and list the field in SaveBar.
                </p>
              </div>
              <CodeBlock code={STATES_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error summary</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <ErrorSummaryExample />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A recipe, not a component. On submit, show an Alert (danger) above the form that says how many
                  fields to fix, with one Button per field (action and secondaryAction) that moves focus to it,
                  and move focus to the Alert. Field errors are not announced on their own.
                </p>
              </div>
              <CodeBlock code={SUMMARY_CODE} />
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
                    legend="Billing address"
                    description="Where the card is billed"
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
                code={'<FieldSet legend="Billing address" description="Where the card is billed"><Checkbox id="same" label="Same as shipping address" /></FieldSet>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
