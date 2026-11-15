"use client";

import { useState, type ReactNode } from "react";
import { Button, GuardrailLog, Switch } from "agentic-ds-kit";
import type { GuardrailEvent, GuardrailFilters, GuardrailOverrideStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const REFUNDS = { name: "No refunds over €500", text: "Refunds above €500 need a finance lead to approve them.", owner: "Finance ops" };
const DISCOUNT = { name: "Discounts capped at 20%", text: "Agents may not offer more than 20% off any plan.", owner: "Revenue team" };
const EXTERNAL = { name: "No attachments to outside domains", text: "Files may only be emailed to company and customer domains on the allow list.", owner: "Security" };
const TONE = { name: "Plain, polite replies", text: "Customer emails must not promise dates or blame the customer.", owner: "Support leads" };

const BILLING = { name: "Billing agent" };
const EMAIL = { name: "Email agent" };

const EVENTS: GuardrailEvent[] = [
  {
    id: "e1",
    verdict: "blocked",
    rule: REFUNDS,
    agent: BILLING,
    attempted: 'stripe.refunds.create({ charge: "ch_48213", amount: 74000, currency: "eur" })',
    at: "Today 14:02",
    runHref: "#run-913",
  },
  {
    id: "e2",
    verdict: "rewritten",
    rule: TONE,
    agent: EMAIL,
    attempted: "Hi Marta, as you entered the wrong card, the charge went through twice. It will be fixed by Friday.",
    sentInstead: "Hi Marta, thanks for flagging the double charge. We're on it and will email you as soon as the refund is on its way.",
    at: "Today 13:47",
    runHref: "#run-911",
  },
  {
    id: "e3",
    verdict: "flagged",
    rule: EXTERNAL,
    agent: EMAIL,
    attempted: 'send_email(to: "ops@freight-partner.example", attach: ["q3-margins.xlsx"])',
    at: "Today 11:20",
  },
  {
    id: "e4",
    verdict: "blocked",
    rule: DISCOUNT,
    agent: BILLING,
    attempted: 'apply_coupon(account: "Alder & Finch", percent: 35, plan: "Team")',
    at: "Mon 16:05",
    runHref: "#run-887",
  },
  {
    id: "e5",
    verdict: "rewritten",
    rule: DISCOUNT,
    agent: BILLING,
    attempted: 'apply_coupon(account: "Northwind", percent: 25, plan: "Pro")',
    sentInstead: 'apply_coupon(account: "Northwind", percent: 20, plan: "Pro")',
    at: "Mon 10:31",
  },
];

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Billing and email agents — this week",
    about: "Newest first. Each row names the verdict in words, the rule, what the agent tried, the agent and when. Up and Down move between rows; a row opens the Drawer.",
    code: `<GuardrailLog events={events} filters={{ time: "This week" }} onRequestOverride={request} />`,
    render: <GuardrailLog events={EVENTS} filters={{ time: "This week" }} onRequestOverride={noop} />,
  },
  {
    title: "Compact — for a header",
    about: "compact is one line: the summary and the latest event.",
    code: `<GuardrailLog compact events={events} filters={{ time: "This week" }} />`,
    render: <GuardrailLog compact events={EVENTS} filters={{ time: "This week" }} />,
  },
  {
    title: "Empty — nothing fired",
    about: "No events in the window shows a kit Empty.",
    code: `<GuardrailLog events={[]} filters={{ time: "Today" }} />`,
    render: <GuardrailLog events={[]} filters={{ time: "Today" }} />,
  },
  {
    title: "Override error — reason kept",
    about: "overrideStatus error shows a danger Alert in the Drawer and keeps the reason so the person can try again.",
    code: `<GuardrailLog events={events} selectedId="e1" overrideStatus="error" onSelect={select} onRequestOverride={request} />`,
    render: <OverrideErrorDemo />,
  },
];

function OverrideErrorDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className={agentDoc.stack}>
      <div>
        <Button size="sm" appearance="outline" mode="neutral" iconStart="Eye" onClick={() => setSelected("e1")}>
          Open the failed request
        </Button>
      </div>
      <GuardrailLog events={EVENTS.slice(0, 2)} selectedId={selected} onSelect={setSelected} overrideStatus="error" onRequestOverride={noop} />
    </div>
  );
}

export function GuardrailLogDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [filters, setFilters] = useState<GuardrailFilters>({ time: "This week" });
  const [status, setStatus] = useState<GuardrailOverrideStatus>("idle");
  const [failNext, setFailNext] = useState(false);

  function request() {
    setStatus("sending");
    window.setTimeout(() => setStatus(failNext ? "error" : "sent"), 1200);
  }

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>GuardrailLog</h2>
        <p className={styles.lede}>Rules stepping in on their own. Not ApprovalCard. Not PermissionRequest.</p>
      </header>

      <section className={styles.master} aria-labelledby="guardraillog-master">
        <div className={styles.masterHeader}>
          <h2 id="guardraillog-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Filter, open an event, then request an override. Submit confirms first.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={agentDoc.trail}>
                  <GuardrailLog
                    events={EVENTS}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSelect={() => setStatus("idle")}
                    overrideStatus={status}
                    onRequestOverride={request}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <Switch size="sm" label="Fail the next request" checked={failNext} onChange={setFailNext} />
                  <Button
                    size="sm"
                    appearance="outline"
                    mode="neutral"
                    iconStart="RotateCcw"
                    onClick={() => {
                      setStatus("idle");
                      setFilters({ time: "This week" });
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </aside>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  GuardrailLog shows policy rules acting on agents without being asked: blocked, rewritten or flagged.
                  AutonomyDial sets the limits; this log shows them working. When the agent asks first, use ApprovalCard
                  or PermissionRequest.
                </p>
              </div>
              <CodeBlock
                code={`<GuardrailLog
  events={events}
  filters={filters}
  onFiltersChange={setFilters}
  overrideStatus={status}
  onRequestOverride={(id, reason) => requestOverride(id, reason)}
/>`}
              />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={agentDoc.trail}>{doc.render}</div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock code={doc.code} />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
