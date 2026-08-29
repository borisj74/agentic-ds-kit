"use client";

import { useState } from "react";
import { Card } from "@/ui/Card";
import type { CardSize } from "@/ui/Card";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

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
    '  headerAction={{ label: "Sign Up", variant: "tertiary" }}',
    "  actions={[",
    '    { label: "Login", variant: "primary" },',
    '    { label: "Login with Google", variant: "secondary" },',
    "  ]}",
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
    "</Card>",
  ].join("\n");
}

export function CardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<CardSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Cards</h1>
        <p className={styles.lede}>Framed tile. Section is unframed. Scorecard is a KPI.</p>
      </header>

      <section className={styles.master} aria-labelledby="card-master">
        <div className={styles.masterHeader}>
          <h2 id="card-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            A login-style Card composing kit Field, Input, and footer Buttons.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Card
                    title="Login to your account"
                    description="Enter your email below to login to your account."
                    size={size}
                    headerAction={{ label: "Sign Up", variant: "tertiary" }}
                    actions={[
                      { label: "Login", variant: "primary" },
                      { label: "Login with Google", variant: "secondary" },
                    ]}
                  >
                    <Field label="Name" htmlFor="card-login-name">
                      <Input id="card-login-name" type="text" placeholder="Boris Jovanovic" />
                    </Field>
                    <Field label="Email" htmlFor="card-login-email">
                      <Input id="card-login-email" type="email" />
                    </Field>
                    <Field label="Password" htmlFor="card-login-password" hint="Forgot your password?">
                      <Input id="card-login-password" type="password" />
                    </Field>
                    <Field label="Workspace" htmlFor="card-login-workspace">
                      <Input id="card-login-workspace" type="text" placeholder="Studio" />
                    </Field>
                  </Card>
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
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose kit pieces in children. One primary action. Don&apos;t use Card for a lone
                  metric.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </div>
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
                  <Card
                    title="Login to your account"
                    description="Enter your email below to login to your account."
                    headerAction={{ label: "Sign Up", variant: "tertiary" }}
                    actions={[
                      { label: "Login", variant: "primary" },
                      { label: "Login with Google", variant: "secondary" },
                    ]}
                  >
                    <Field label="Name" htmlFor="card-variant-login-name">
                      <Input id="card-variant-login-name" type="text" placeholder="Boris Jovanovic" />
                    </Field>
                    <Field label="Email" htmlFor="card-variant-login-email">
                      <Input id="card-variant-login-email" type="email" />
                    </Field>
                    <Field label="Password" htmlFor="card-variant-login-password" hint="Forgot your password?">
                      <Input id="card-variant-login-password" type="password" />
                    </Field>
                    <Field label="Workspace" htmlFor="card-variant-login-workspace">
                      <Input id="card-variant-login-workspace" type="text" placeholder="Studio" />
                    </Field>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Footer actions are kit Buttons stacked full-width. Login is the one primary. Sign
                  Up in the header is tertiary.
                </p>
              </div>
              <CodeBlock
                code={`<Card
  title="Login to your account"
  description="Enter your email below to login to your account."
  headerAction={{ label: "Sign Up", variant: "tertiary" }}
  actions={[{ label: "Login", variant: "primary" }, { label: "Login with Google", variant: "secondary" }]}
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
                  imageAlt is required when imageSrc is set. The image is full bleed and clipped to
                  the card radius.
                </p>
              </div>
              <CodeBlock
                code={'<Card title="Feature" description="A framed summary with a full-bleed image." imageSrc="/feature.svg" imageAlt="Abstract feature illustration">\n  <p>Compose kit Field, Input, Button, or Badge in the body.</p>\n</Card>'}
              />
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
                  size sm uses tighter spacing and a body-sized title. Default is md.
                </p>
              </div>
              <CodeBlock
                code={'<Card title="Compact tile" description="sm tightens padding and the title." size="sm">\n  <p>Use sm when a denser framed tile fits the layout.</p>\n</Card>'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
