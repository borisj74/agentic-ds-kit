"use client";

import { CitedAnswer } from "agentic-ds-kit";
import type { Citation } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const TEXT = "Store invoice totals as integer cents and round half-even[1]. Floats are not allowed for money[2], which is why the test expects 107.10[3].";
const CITES: Citation[] = [
  { id: "1", title: "Billing API · Rounding rules", href: "https://docs.example.com/billing/rounding", origin: "docs.example.com/billing/rounding", snippet: "Totals are stored in integer cents and rounded half-even." },
  { id: "2", title: "RFC 017 · Money types", href: "https://notes.example.com/rfc-017", origin: "notes.example.com/rfc-017", snippet: "Floats are not allowed for currency values." },
  { id: "3", title: "invoice.test.ts", origin: "repo · src/billing", snippet: "expects 107.10 for subtotal 99.17 at 8% tax" },
];
const noop = () => {};

export function CitedAnswerDoc() {
  return (
    <AgentDocFrame
      id="citedanswer"
      name="CitedAnswer"
      lede="An assistant reply with its sources. Not Chat. Not LinkList."
      summary="Click a mark: the source list opens and the source highlights."
      preview={<CitedAnswer time="14:02" content={TEXT} citations={CITES} />}
      usage="CitedAnswer is one reply; Chat stays the thread shell. Marks are real links, and a source that went missing says so instead of disappearing."
      code={`<CitedAnswer
  time="14:02"
  content="Store invoice totals as integer cents[1]. Floats are not allowed for money[2]."
  citations={citations}
/>`}
      variants={[
        {
          title: "With citations — sources collapsed",
          about: "The sources toggle says how many were used.",
          code: `<CitedAnswer time="14:02" content="…[1] …[2] …[3]" citations={citations} />`,
          render: <CitedAnswer time="14:02" content={TEXT} citations={CITES} />,
        },
        {
          title: "Sources expanded",
          about: "openSources shows the list: number, title (linked when it has href), origin and a snippet.",
          code: `<CitedAnswer … openSources />`,
          render: <CitedAnswer time="14:02" content={TEXT} citations={CITES} openSources />,
        },
        {
          title: "One source",
          about: "The toggle reads 1 source.",
          code: `<CitedAnswer content="Use half-even rounding for invoice totals[1]." citations={[billingApi]} openSources />`,
          render: <CitedAnswer time="14:02" content="Use half-even rounding for invoice totals[1]." citations={[CITES[0]]} openSources />,
        },
        {
          title: "Missing source",
          about: "The mark reads [n] missing, the toggle counts it, and the list opens on first render with the reason.",
          code: `<CitedAnswer … citations={[…, { id: "3", title: "Northwind contract, grace period", missing: true, missingReason: "Moved or removed after this answer. Don't charge the late fee until it's checked." }]} />`,
          render: (
            <CitedAnswer
              author="Billing agent"
              time="14:02"
              content="Northwind's overdue balance is $2,400, all on INV-1842[1]. Two reminders went out[2]. Their contract allows a 10-day grace period, so a late fee applies from 14 November[3]."
              citations={[
                { id: "1", title: "INV-1842 · Northwind Traders", href: "https://app.example.com/invoices/INV-1842", origin: "app.example.com/invoices/INV-1842" },
                { id: "2", title: "Dunning log · Northwind", snippet: "Reminders sent 7 Nov and 12 Nov." },
                { id: "3", title: "Northwind contract, grace period", missing: true, missingReason: "Moved or removed after this answer. Don't charge the late fee until it's checked." },
              ]}
            />
          ),
        },
        {
          title: "No sources",
          about: "citations={[]} shows emptyText under the answer. Pass emptyText=\"\" to hide it.",
          code: `<CitedAnswer content="…" citations={[]} emptyText="No sources. This is the agent's estimate; check before you act on it." />`,
          render: (
            <CitedAnswer
              author="Billing agent"
              time="14:05"
              content="Northwind usually pays within 12 days of a second reminder, so INV-1842 should clear by 24 November."
              citations={[]}
              emptyText="No sources. This is the agent's estimate; check before you act on it."
            />
          ),
        },
        {
          title: "Loading and error",
          about: "loading uses ShimmerText; error offers Retry.",
          code: `<CitedAnswer content="" citations={[]} loading loadingText="Reading 3 sources…" />
<CitedAnswer content="" citations={[]} error="The answer stopped before it finished." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <CitedAnswer time="14:02" content="" citations={[]} loading loadingText="Reading 3 sources…" />
              <CitedAnswer time="14:02" content="" citations={[]} error="The answer stopped before it finished." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
