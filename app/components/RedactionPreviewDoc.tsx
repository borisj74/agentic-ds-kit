"use client";

import { useState, type ReactNode } from "react";
import { RedactionPreview } from "agentic-ds-kit";
import type { RedactionRules, RedactionSpan, RedactionStatus } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import agentDoc from "./AgentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel } from "./ControlsPanel";

/** Spans for each [value, type] pair, found in the text (first match from the last one on). */
function find(text: string, pairs: [string, string][]): RedactionSpan[] {
  let from = 0;
  return pairs.map(([value, type]) => {
    const start = text.indexOf(value, from);
    from = start + value.length;
    return { start, end: start + value.length, type };
  });
}

const TICKET = `Summarise this ticket and draft a reply.

From: Marta Kovač <marta.kovac@northwind.example>
Order 48213 was charged twice to card 4242 4242 4242 4242.
Please call me on +386 41 555 019 or reply to marta.k@mail.example.
Our integration still uses key demo-key-9f2c81d07a44 — is that why?`;

const TICKET_SPANS = find(TICKET, [
  ["Marta Kovač", "name"],
  ["marta.kovac@northwind.example", "email"],
  ["4242 4242 4242 4242", "card"],
  ["+386 41 555 019", "phone"],
  ["marta.k@mail.example", "email"],
  ["demo-key-9f2c81d07a44", "apiKey"],
]);

const CRM = `{
  "account": "Alder & Finch Ltd",
  "owner": "Jonas Weber",
  "email": "j.weber@alderfinch.example",
  "iban": "DE89 3704 0044 0532 0130 00",
  "notes": "Renewal at risk; asked for a 15% discount on the Team plan."
}`;

const CRM_SPANS = find(CRM, [
  ["Jonas Weber", "name"],
  ["j.weber@alderfinch.example", "email"],
  ["DE89 3704 0044 0532 0130 00", "iban"],
]);

const noop = () => {};

const VARIANT_DOCS: { title: string; about: string; code: string; render: ReactNode }[] = [
  {
    title: "Support ticket — everything masked",
    about:
      "Every sensitive value is a chip. Hover or focus a chip for its type; select it to see the value yourself. The API key is a secret, so its rule is locked on.",
    code: `<RedactionPreview destination="Claude (Anthropic API)" region="EU" payload={ticket} spans={spans} onSend={send} onCancel={cancel} />`,
    render: <RedactionPreview destination="Claude (Anthropic API)" region="EU" payload={TICKET} spans={TICKET_SPANS} onSend={noop} onCancel={noop} />,
  },
  {
    title: "CRM record — JSON payload",
    about: "The payload is shown exactly as it will be sent, here a JSON record for an outside enrichment tool.",
    code: `<RedactionPreview destination="Clearbit enrichment" region="US" payload={record} spans={spans} … />`,
    render: <RedactionPreview destination="Clearbit enrichment" region="US" payload={CRM} spans={CRM_SPANS} onSend={noop} onCancel={noop} />,
  },
  {
    title: "One type unmasked — warning",
    about: "With the Name rule off, names go out as written: they are marked in the text and a warning Alert says how many.",
    code: `<RedactionPreview rules={{ name: false }} … />`,
    render: (
      <RedactionPreview
        destination="Claude (Anthropic API)"
        region="EU"
        payload={TICKET}
        spans={TICKET_SPANS}
        rules={{ name: false }}
        onSend={noop}
        onCancel={noop}
      />
    ),
  },
  {
    title: "Split — Before and After",
    about:
      "layout=\"split\" puts what only you see beside exactly what is sent. keepLast={{ card: 4 }} sends the card as its label and last four digits. On a narrow card After shows first and Before sits behind Show before.",
    code: `<RedactionPreview layout="split" keepLast={{ card: 4 }} … />`,
    render: (
      <RedactionPreview
        destination="Claude (Anthropic API)"
        region="EU"
        payload={TICKET}
        spans={TICKET_SPANS}
        layout="split"
        keepLast={{ card: 4 }}
        onSend={noop}
        onCancel={noop}
      />
    ),
  },
  {
    title: "Send failed — Try again",
    about: "status error keeps the card, says nothing left the product in a danger Alert, and turns Send into Try again with focus on it.",
    code: `<RedactionPreview status="error" errorText="Claude didn't answer in 30 seconds. Your mask rules are kept." onRetry={retry} … />`,
    render: (
      <RedactionPreview
        destination="Claude (Anthropic API)"
        region="EU"
        payload={TICKET}
        spans={TICKET_SPANS}
        layout="split"
        keepLast={{ card: 4 }}
        status="error"
        errorText="Claude didn't answer in 30 seconds. Your mask rules are kept."
        onRetry={noop}
        onCancel={noop}
      />
    ),
  },
  {
    title: "Sent — one line",
    about: "status sent folds to one line with how many values left masked.",
    code: `<RedactionPreview status="sent" … />`,
    render: <RedactionPreview status="sent" destination="Claude (Anthropic API)" payload={TICKET} spans={TICKET_SPANS} />,
  },
];

export function RedactionPreviewDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [rules, setRules] = useState<RedactionRules>({});
  const [status, setStatus] = useState<RedactionStatus>("pending");
  const [sentText, setSentText] = useState<string | null>(null);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>RedactionPreview</h2>
        <p className={styles.lede}>What leaves for a model or tool, masked by type, before it goes. Not ContextWindow. Not ApprovalCard.</p>
      </header>

      <section className={styles.master} aria-labelledby="redactionpreview-master">
        <div className={styles.masterHeader}>
          <h2 id="redactionpreview-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Flip a rule, reveal a chip, then Send. onSend gets the masked text.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={agentDoc.trail}>
                  <div className={agentDoc.stack}>
                    <RedactionPreview
                      destination="Claude (Anthropic API)"
                      region="EU"
                      payload={TICKET}
                      spans={TICKET_SPANS}
                      rules={rules}
                      status={status}
                      onRulesChange={setRules}
                      onSend={(masked) => {
                        setSentText(masked);
                        setStatus("sent");
                      }}
                      onCancel={() => setStatus("cancelled")}
                    />
                    {sentText ? <CodeBlock code={sentText} /> : null}
                  </div>
                </div>
              </div>
              <ControlsPanel
                onReset={() => {
                  setStatus("pending");
                  setRules({});
                  setSentText(null);
                }}
              />
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  RedactionPreview sits between an agent and the model or tool it calls. Pass the exact payload and the
                  sensitive spans your detector found; the person sees what leaves and can loosen rules, but never for
                  secrets.
                </p>
              </div>
              <CodeBlock
                code={`<RedactionPreview
  destination="Claude (Anthropic API)"
  region="EU"
  payload={ticket}
  spans={[{ start: 47, end: 76, type: "email" }, { start: 120, end: 139, type: "card" }]}
  rules={rules}
  onRulesChange={setRules}
  onSend={(maskedPayload) => send(maskedPayload)}
  onCancel={cancel}
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
