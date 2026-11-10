"use client";

import { useState } from "react";
import { InvoiceDocument, type InvoiceLine, type InvoiceStatus } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const LINES: InvoiceLine[] = [
  { id: "pro", description: "Pro plan · Nov 2026", quantity: 1, unitPrice: "$480.00", amount: "$480.00" },
  { id: "seats", description: "Extra seats", quantity: 3, unitPrice: "$24.00", amount: "$72.00" },
  { id: "credits", description: "AI credits top-up", quantity: 2, unitPrice: "$50.00", amount: "$100.00" },
];
const BASE = {
  number: "INV-2026-0117",
  from: "Northwind Ledger Ltd · example issuer",
  to: "Acme Co · 12 Example St",
  issuedOn: "01 Nov 2026",
  dueOn: "15 Nov 2026",
  lines: LINES,
  subtotal: "$652.00",
  taxLabel: "Tax 20%",
  tax: "$130.40",
  total: "$782.40",
};
const FOOT: Partial<Record<InvoiceStatus, string>> = {
  paid: "Paid 09 Nov 2026 · Visa 4242 · example",
  overdue: "12 days overdue. A reminder was sent on 20 Nov.",
  void: "Voided 03 Nov 2026 · replaced by INV-2026-0121",
};
const noop = () => {};
const actions = { onDownload: noop, onSend: noop, onIssue: noop, onRecordPayment: noop };

export function InvoiceDocumentDoc() {
  const [status, setStatus] = useState<InvoiceStatus>("issued");
  return (
    <AgentDocFrame
      id="invoicedocument"
      name="InvoiceDocument"
      lede="A document view for an invoice or a credit note, not a PDF engine."
      summary="Switch the status: the badge, the solid primary and the footnote follow it."
      preview={<InvoiceDocument {...BASE} {...actions} status={status} footnote={FOOT[status]} />}
      controls={<DocOptions label="Status" options={["draft", "issued", "paid", "overdue", "void"] as const} value={status} onChange={setStatus} />}
      usage="One solid primary at most: Issue invoice on a draft, Record payment when issued or overdue. A credit note names the invoice it reduces. Money arrives pre-formatted, so currency and locale stay with the app. All data here is an example."
      code={`<InvoiceDocument
  number="INV-2026-0117"
  status="issued"
  from="Northwind Ledger Ltd · example issuer"
  to="Acme Co · 12 Example St"
  issuedOn="01 Nov 2026"
  dueOn="15 Nov 2026"
  lines={lines}
  subtotal="$652.00"
  taxLabel="Tax 20%"
  tax="$130.40"
  total="$782.40"
  onDownload={download}
  onSend={send}
  onRecordPayment={record}
/>`}
      variants={[
        {
          title: "Draft",
          about: "Issue invoice is the solid primary.",
          code: `<InvoiceDocument … status="draft" onIssue={issue} />`,
          render: <InvoiceDocument {...BASE} {...actions} status="draft" />,
        },
        {
          title: "Paid",
          about: "No primary; the footnote says when and how it was paid.",
          code: `<InvoiceDocument … status="paid" footnote="Paid 09 Nov 2026 · Visa 4242 · example" />`,
          render: <InvoiceDocument {...BASE} {...actions} status="paid" footnote={FOOT.paid} />,
        },
        {
          title: "Overdue",
          about: "Record payment stays the primary; the footnote is a danger line.",
          code: `<InvoiceDocument … status="overdue" footnote="12 days overdue. A reminder was sent on 20 Nov." onRecordPayment={record} />`,
          render: <InvoiceDocument {...BASE} {...actions} status="overdue" footnote={FOOT.overdue} />,
        },
        {
          title: "Void",
          about: "Lines and totals dim, the total is struck through and Download and Send are disabled.",
          code: `<InvoiceDocument … status="void" footnote="Voided 03 Nov 2026 · replaced by INV-2026-0121" />`,
          render: <InvoiceDocument {...BASE} {...actions} status="void" footnote={FOOT.void} />,
        },
        {
          title: "Credit note — reduces a named invoice",
          about: "kind=\"creditNote\" with relatedInvoiceId; amounts are negative.",
          code: `<InvoiceDocument kind="creditNote" number="CN-0042" relatedInvoiceId="INV-2026-0117" … footnote="This credit note reduces INV-2026-0117 by $86.40 including tax." />`,
          render: (
            <InvoiceDocument
              kind="creditNote"
              number="CN-0042"
              from={BASE.from}
              to={BASE.to}
              issuedOn="10 Nov 2026"
              relatedInvoiceId="INV-2026-0117"
              lines={[{ id: "refund", description: "Refund · 3 unused seats", quantity: 3, unitPrice: "$24.00", amount: "−$72.00" }]}
              subtotal="−$72.00"
              taxLabel="Tax 20%"
              tax="−$14.40"
              total="−$86.40"
              footnote="This credit note reduces INV-2026-0117 by $86.40 including tax."
              onDownload={noop}
              onSend={noop}
            />
          ),
        },
        {
          title: "Empty lines, loading and error",
          about: "A kit Empty with Issue invoice disabled; skeletons; a load error with Retry.",
          code: `<InvoiceDocument … status="draft" lines={[]} onIssue={issue} />
<InvoiceDocument … loading />
<InvoiceDocument … error="Couldn't load this invoice." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <InvoiceDocument {...BASE} {...actions} status="draft" lines={[]} />
              <InvoiceDocument {...BASE} loading />
              <InvoiceDocument {...BASE} error="Couldn’t load this invoice." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
