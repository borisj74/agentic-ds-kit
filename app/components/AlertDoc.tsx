"use client";

import { useState } from "react";
import { Alert } from "agentic-ds-kit";
import type { AlertPlacement, AlertVariant } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const VARIANTS: AlertVariant[] = ["info", "success", "warning", "danger"];
const PLACEMENTS: AlertPlacement[] = ["page", "inline"];

const noop = () => {};

const INLINE_CODE = `<Alert
  variant="warning"
  placement="inline"
  eyebrow="Billing"
  timestamp="Nov 20"
  title="Card expires on Dec 12"
  action={{ label: "Update card", onClick: openBilling }}
  secondaryAction={{ label: "Ask about this", onClick: openAsk }}
  onDismiss={hide}
>
  Update the card before then or the workspace pauses.
</Alert>`;

const PAGE_CODE = `<Alert
  variant="danger"
  eyebrow="Billing"
  title="Payment failed"
  action={{ label: "Update payment", onClick: openBilling }}
>
  The card ending 4242 was declined. The workspace pauses on Dec 2.
</Alert>`;

const COPY: Record<AlertVariant, { title: string; body: string; about: string }> = {
  info: {
    title: "Heads up",
    body: "Invoices export overnight. You will get an email when the file is ready.",
    about: "Use Info for neutral guidance that is not a success or a problem.",
  },
  success: {
    title: "Saved",
    body: "Your changes are live.",
    about: "Use Success after a write that already completed.",
  },
  warning: {
    title: "Card expires soon",
    body: "Update the card before the 12th or the workspace pauses.",
    about: "Use Warning when the user can still fix it.",
  },
  danger: {
    title: "Export failed",
    body: "We could not reach the file store. Try again or check the connection.",
    about: "Use Danger for a failure or harmful state on this page.",
  },
};

export function AlertDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [variant, setVariant] = useState<AlertVariant>("info");
  const [placement, setPlacement] = useState<AlertPlacement>("page");
  const current = COPY[variant];

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Alert</h2>
        <p className={styles.lede}>
          Status message that stays on the page until it is fixed or dismissed. Not a toast.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="alert-master">
        <div className={styles.masterHeader}>
          <h2 id="alert-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Switch variant and placement. page keeps the tinted fill; inline sits on the card surface.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <Alert variant={variant} placement={placement} title={current.title}>
                    {current.body}
                  </Alert>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Variant">
                    {VARIANTS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="alert-variant"
                          value={option}
                          checked={variant === option}
                          onChange={() => setVariant(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Placement</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Placement">
                    {PLACEMENTS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="alert-placement"
                          value={option}
                          checked={placement === option}
                          onChange={() => setPlacement(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Put it above the part of the page it is about. It stays until the problem is fixed or
                  dismissed. Use Toast after an action, Badge for a compact chip and AlertDialog when they
                  must choose.
                </p>
              </div>
              <CodeBlock
                code={`<Alert variant="${variant}"${placement === "inline" ? ' placement="inline"' : ""} title="${current.title}">\n  ${current.body}\n</Alert>`}
              />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANTS.map((option) => (
              <section key={option} className={styles.example}>
                <h2 className={styles.exampleTitle}>{option[0].toUpperCase() + option.slice(1)}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewFill}>
                    <Alert variant={option} title={COPY[option].title}>
                      {COPY[option].body}
                    </Alert>
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{COPY[option].about}</p>
                </div>
                <CodeBlock
                  code={`<Alert variant="${option}" title="${COPY[option].title}">${COPY[option].body}</Alert>`}
                />
              </section>
            ))}

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Inline with header and actions</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Alert
                    variant="warning"
                    placement="inline"
                    eyebrow="Billing"
                    timestamp="Nov 20"
                    title="Card expires on Dec 12"
                    action={{ label: "Update card", onClick: noop }}
                    secondaryAction={{ label: "Ask about this", onClick: noop }}
                    onDismiss={noop}
                  >
                    Update the card before then or the workspace pauses.
                  </Alert>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The header reads Warning · Billing: the tone word, then eyebrow. timestamp says when.
                  action is outline here; secondaryAction follows it. onDismiss adds Dismiss. Leave it
                  out while the problem is still real. A warning is role=status; only danger is
                  role=alert.
                </p>
              </div>
              <CodeBlock code={INLINE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Page with one primary</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Alert
                    variant="danger"
                    eyebrow="Billing"
                    title="Payment failed"
                    action={{ label: "Update payment", onClick: noop }}
                  >
                    The card ending 4242 was declined. The workspace pauses on Dec 2.
                  </Alert>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A problem that affects the whole account. Show one at a time. On page, action is the
                  view&apos;s one solid primary Button.
                </p>
              </div>
              <CodeBlock code={PAGE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Error summary</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <Alert
                    variant="danger"
                    title="Not saved. Fix 1 field first"
                    action={{ label: "Go to VAT number", onClick: noop, appearance: "outline" }}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Above a form whose Save is the page&apos;s primary. The title says it all, so there is no
                  body, and the action is outline. One Button per field moves focus to it.
                </p>
              </div>
              <CodeBlock
                code={`<Alert
  variant="danger"
  title="Not saved. Fix 1 field first"
  action={{ label: "Go to VAT number", onClick: focusVat, appearance: "outline" }}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
