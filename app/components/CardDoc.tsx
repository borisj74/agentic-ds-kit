"use client";

import { useState } from "react";
import { BarList } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Card } from "agentic-ds-kit";
import { Divider } from "agentic-ds-kit";
import type { CardSize } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { DatePicker } from "agentic-ds-kit";
import { Textarea } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import {
  SMALL_TABLE_CARD_CODE,
  SmallTableCardExample,
  TABLE_CARD_CODE,
  TableCardExample,
} from "./TableCardExample";

const SIZES: CardSize[] = ["sm", "md"];

const SAMPLE_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">
      <rect width="640" height="160" fill="#dbeafe"/>
      <circle cx="88" cy="80" r="36" fill="#1d4ed8"/>
      <rect x="148" y="56" width="220" height="16" rx="8" fill="#1d4ed8"/>
      <rect x="148" y="88" width="160" height="12" rx="6" fill="#93c5fd"/>
    </svg>`,
  );

function masterCode(size: CardSize): string {
  return [
    "<Card",
    '  title="Login to your account"',
    '  description="Enter your email below to login to your account."',
    `  size="${size}"`,
    '  headerAction={{ label: "Sign Up", appearance: "ghost", mode: "neutral" }}',
    ">",
    '  <Field label="Name" htmlFor="card-login-name">',
    '    <Input id="card-login-name" type="text" placeholder="Boris Jovanovic" />',
    "  </Field>",
    '  <Field label="Email" htmlFor="card-login-email">',
    '    <Input id="card-login-email" type="email" />',
    "  </Field>",
    '  <Field label="Password" htmlFor="card-login-password" hint="Forgot your password?">',
    '    <Input id="card-login-password" type="password" />',
    "  </Field>",
    '  <Field label="Workspace" htmlFor="card-login-workspace">',
    '    <Input id="card-login-workspace" type="text" placeholder="Studio" />',
    "  </Field>",
    '  <Button appearance="solid" mode="primary" block>',
    "    Login",
    "  </Button>",
    '  <Divider label="Or continue with" />',
    '  <div className="layout-split">',
    '    <Button appearance="outline" mode="neutral" block>',
    "      Google",
    "    </Button>",
    '    <Button appearance="outline" mode="neutral" block>',
    "      Apple",
    "    </Button>",
    "  </div>",
    "</Card>",
  ].join("\n");
}

function LoginCard({ idPrefix, size }: { idPrefix: string; size?: CardSize }) {
  return (
    <Card
      title="Login to your account"
      description="Enter your email below to login to your account."
      size={size}
      headerAction={{ label: "Sign Up", appearance: "ghost", mode: "neutral" }}
    >
      <Field label="Name" htmlFor={`${idPrefix}-name`}>
        <Input id={`${idPrefix}-name`} type="text" placeholder="Boris Jovanovic" />
      </Field>
      <Field label="Email" htmlFor={`${idPrefix}-email`}>
        <Input id={`${idPrefix}-email`} type="email" />
      </Field>
      <Field label="Password" htmlFor={`${idPrefix}-password`} hint="Forgot your password?">
        <Input id={`${idPrefix}-password`} type="password" />
      </Field>
      <Field label="Workspace" htmlFor={`${idPrefix}-workspace`}>
        <Input id={`${idPrefix}-workspace`} type="text" placeholder="Studio" />
      </Field>
      <Button appearance="solid" mode="primary" block>
        Login
      </Button>
      <Divider label="Or continue with" />
      <div className="layout-split">
        <Button appearance="outline" mode="neutral" block>
          Google
        </Button>
        <Button appearance="outline" mode="neutral" block>
          Apple
        </Button>
      </div>
    </Card>
  );
}

const PLAN_MIX = [
  { label: "Growth", value: 41 },
  { label: "Starter", value: 32 },
  { label: "Scale", value: 27 },
];

const percent = (value: number) => `${value}%`;

function PlanRows() {
  return <BarList label="Revenue by plan" scale="total" valueFormatter={percent} data={PLAN_MIX} />;
}

export function CardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<CardSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Cards</h2>
        <p className={styles.lede}>Framed tile. Section is unframed. Scorecard is a KPI.</p>
      </header>

      <section className={styles.master} aria-labelledby="card-master">
        <div className={styles.masterHeader}>
          <h2 id="card-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            A login-style Card composing kit Buttons, Divider, Field and Input.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <LoginCard idPrefix="card-login" size={size} />
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
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose kit pieces in children. One primary action. Don&apos;t use Card for a lone
                  metric.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Basic</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card title="Workspace" description="Defaults for the current team.">
                    <p>Notification preferences and shared project settings live here.</p>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Title, description, and body. Section stays unframed page grouping.
                </p>
              </div>
              <CodeBlock
                code={'<Card title="Workspace" description="Defaults for the current team.">\n  <p>Notification preferences and shared project settings live here.</p>\n</Card>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Login</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <LoginCard idPrefix="card-variant-login" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Login is the one primary, a block Button after the fields. Google and Apple sit
                  side by side in a layout-split under a Divider. Sign Up in the header is tertiary.
                </p>
              </div>
              <CodeBlock
                code={`<Card
  title="Login to your account"
  description="Enter your email below to login to your account."
  headerAction={{ label: "Sign Up", appearance: "ghost", mode: "neutral" }}
>
  <Field label="Name" htmlFor="name">
    <Input id="name" type="text" placeholder="Boris Jovanovic" />
  </Field>
  <Field label="Email" htmlFor="email">
    <Input id="email" type="email" />
  </Field>
  <Field label="Password" htmlFor="password" hint="Forgot your password?">
    <Input id="password" type="password" />
  </Field>
  <Field label="Workspace" htmlFor="workspace">
    <Input id="workspace" type="text" placeholder="Studio" />
  </Field>
  <Button appearance="solid" mode="primary" block>
    Login
  </Button>
  <Divider label="Or continue with" />
  <div className="layout-split">
    <Button appearance="outline" mode="neutral" block>
      Google
    </Button>
    <Button appearance="outline" mode="neutral" block>
      Apple
    </Button>
  </div>
</Card>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With a date field</h2>
              <div className={styles.exampleCanvas} style={{ overflow: "visible" }}>
                <div className={styles.previewFill}>
                  <Card title="Request time off" description="Pick the days you will be away.">
                    <Field label="Dates" htmlFor="card-variant-time-off-dates">
                      <DatePicker id="card-variant-time-off-dates" mode="range" />
                    </Field>
                    <Field label="Note" htmlFor="card-variant-time-off-note">
                      <Textarea id="card-variant-time-off-note" rows={2} />
                    </Field>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Card does not clip its content, so a DatePicker, Select, or DropdownMenu overlay
                  opens past the card&apos;s bottom edge.
                </p>
              </div>
              <CodeBlock
                code={`<Card title="Request time off" description="Pick the days you will be away.">
  <Field label="Dates" htmlFor="dates">
    <DatePicker id="dates" mode="range" />
  </Field>
  <Field label="Note" htmlFor="note">
    <Textarea id="note" rows={2} />
  </Field>
</Card>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With image</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card
                    title="Feature"
                    description="A framed summary with a full-bleed image."
                    imageSrc={SAMPLE_SRC}
                    imageAlt="Abstract feature illustration"
                  >
                    <p>Compose kit Field, Input, Button, or Badge in the body.</p>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  imageAlt is required when imageSrc is set. The image is full bleed and its top corners take
                  the card radius.
                </p>
              </div>
              <CodeBlock
                code={'<Card title="Feature" description="A framed summary with a full-bleed image." imageSrc="/feature.svg" imageAlt="Abstract feature illustration">\n  <p>Compose kit Field, Input, Button, or Badge in the body.</p>\n</Card>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Flush (table card)</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "100%" }}>
                  <TableCardExample />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  flush runs the body edge to edge for a DataTable, which drops its own frame. Its
                  first and last columns take the card&apos;s inline padding at any size, whatever the
                  table&apos;s cellSize. headerAction href still works here but is deprecated; prefer View all as a footer action.
                </p>
              </div>
              <CodeBlock code={TABLE_CARD_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Small</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card
                    title="Compact tile"
                    description="sm tightens padding and the title."
                    size="sm"
                  >
                    <p>Use sm when a denser framed tile fits the layout.</p>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  size sm uses tighter spacing and a body-sized title. Default is md. Size never sets width: the card fills its container, so wrap it in the layout for a narrow tile.
                </p>
              </div>
              <CodeBlock
                code={'<Card title="Compact tile" description="sm tightens padding and the title." size="sm">\n  <p>Use sm when a denser framed tile fits the layout.</p>\n</Card>'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Small flush (table card)</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <SmallTableCardExample />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The DataTable&apos;s first and last columns take the card&apos;s inline padding at any
                  size, whatever the table&apos;s cellSize, so the title lines up with the first column
                  and View all with the last.
                </p>
              </div>
              <CodeBlock code={SMALL_TABLE_CARD_CODE} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Header row, source and Ask</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Card
                    title="Revenue by plan"
                    icon="ChartBar"
                    eyebrow="Analytics"
                    meta="12:04"
                    onDismiss={() => {}}
                    source="Stripe · last 30 days"
                    askLabel="Ask"
                    onAsk={() => {}}
                    actions={[
                      { label: "Export" },
                      { label: "Open report", appearance: "solid", mode: "primary" },
                    ]}
                  >
                    <PlanRows />
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  icon, eyebrow, meta and onDismiss add a header row above the title: an icon tile
                  and a grey label on the left, the time and an X on the right. source is a grey line
                  under the body that names where the data comes from. The footer sits under a
                  divider: Ask on the left, then the actions, with one primary at most.
                </p>
              </div>
              <CodeBlock
                code={`<Card
  title="Revenue by plan"
  icon="ChartBar"
  eyebrow="Analytics"
  meta="12:04"
  onDismiss={hide}
  source="Stripe · last 30 days"
  askLabel="Ask"
  onAsk={openChat}
  actions={[
    { label: "Export", onClick: exportCsv },
    { label: "Open report", appearance: "solid", mode: "primary", onClick: openReport },
  ]}
>
  …
</Card>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Header row, small</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "24rem" }}>
                  <Card
                    size="sm"
                    title="Revenue by plan"
                    icon="ChartBar"
                    eyebrow="Analytics"
                    meta="12:04"
                    onDismiss={() => {}}
                    source="Stripe · last 30 days"
                    askLabel="Ask"
                    onAsk={() => {}}
                    actions={[{ label: "Open report", appearance: "solid", mode: "primary" }]}
                  >
                    <PlanRows />
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  sm uses space-4 padding. On a narrow screen keep Ask and the one primary in the footer.
                </p>
              </div>
              <CodeBlock
                code={`<Card size="sm" title="Revenue by plan" icon="ChartBar" eyebrow="Analytics" meta="12:04" onDismiss={hide} source="Stripe · last 30 days" askLabel="Ask" onAsk={openChat} actions={[{ label: "Open report", appearance: "solid", mode: "primary" }]}>
  …
</Card>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Two header actions</h2>
              <div className={styles.exampleCanvas}>
                <Card
                  title="Open invoices"
                  description="Which invoices are past their due date?"
                  headerAction={[
                    { label: "Ask about Open invoices", iconStart: "MessageCircle", iconOnly: true },
                    { label: "View all", href: "#" },
                  ]}
                >
                  <p className={styles.usageBody}>12 invoices, 3 past due.</p>
                </Card>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  headerAction takes up to two actions; more are ignored, with a warning in
                  development. iconOnly with iconStart makes an icon-only Button named by its label.
                  href still renders a real link with the sm Button look, but it is deprecated: for new
                  cards, use the footer for View all and Ask.
                </p>
              </div>
              <CodeBlock
                code={`<Card
  title="Open invoices"
  description="Which invoices are past their due date?"
  headerAction={[
    { label: "Ask about Open invoices", iconStart: "MessageCircle", iconOnly: true },
    { label: "View all", href: "/invoices" },
  ]}
>
  …
</Card>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
