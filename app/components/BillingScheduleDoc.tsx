"use client";

import { useState } from "react";
import { BillingSchedule, type BillingCharge } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const CHARGES: BillingCharge[] = [
  { id: "dec", date: "01 Dec 2026", label: "Pro plan · monthly", amount: "$480.00", status: "upcoming" },
  { id: "nov", date: "01 Nov 2026", label: "Pro plan · monthly", amount: "$480.00", status: "paid" },
  { id: "seat", date: "18 Oct 2026", label: "Seat added · prorated 14 days", amount: "$22.40", status: "invoiced", note: "prorated" },
  { id: "oct", date: "01 Oct 2026", label: "Pro plan · monthly", amount: "$480.00", status: "failed", note: "card declined" },
  { id: "sep", date: "01 Sep 2026", label: "Pro plan · monthly", amount: "$0.00", status: "waived", note: "credit applied" },
];
const FAILED = CHARGES.filter((charge) => charge.id === "oct" || charge.id === "seat").reverse();
const LABEL = "Pro plan · example data";
const noop = () => {};

export function BillingScheduleDoc() {
  const [view, setView] = useState<"history" | "next only" | "failed">("history");
  return (
    <AgentDocFrame
      id="billingschedule"
      name="BillingSchedule"
      lede="Upcoming and past charges on a subscription, in order. Status is a word, never colour alone."
      summary="Switch between the full history, the next charge only, and a failed payment."
      preview={
        view === "history" ? (
          <BillingSchedule label={LABEL} items={CHARGES} nextId="dec" onDownloadAll={noop} />
        ) : view === "next only" ? (
          <BillingSchedule label={LABEL} items={CHARGES} nextId="dec" nextOnly paymentMethod="Visa ending 4242 · example" onChangeCard={noop} />
        ) : (
          <BillingSchedule label={LABEL} items={FAILED} retryOn="04 Oct" onUpdateCard={noop} />
        )
      }
      controls={<DocOptions label="View" options={["history", "next only", "failed"] as const} value={view} onChange={setView} />}
      usage="BillingSchedule composes the kit Table with a status Badge per row. The next charge is tagged in the table, or shown alone with nextOnly. A failed charge raises a banner with Update card as the one solid primary. All figures here are examples."
      code={`<BillingSchedule
  label="Pro plan · example data"
  items={charges}
  nextId="dec"
  onDownloadAll={download}
/>`}
      variants={[
        {
          title: "Upcoming + history",
          about: "Every status as a word; the next charge is tagged.",
          code: `<BillingSchedule label="Pro plan · example data" items={charges} nextId="dec" onDownloadAll={download} />`,
          render: <BillingSchedule label={LABEL} items={CHARGES} nextId="dec" onDownloadAll={noop} />,
        },
        {
          title: "Next charge only",
          about: "Amount, date, card and Change card.",
          code: `<BillingSchedule items={charges} nextId="dec" nextOnly paymentMethod="Visa ending 4242 · example" onChangeCard={changeCard} />`,
          render: <BillingSchedule label={LABEL} items={CHARGES} nextId="dec" nextOnly paymentMethod="Visa ending 4242 · example" onChangeCard={noop} />,
        },
        {
          title: "Failed payment",
          about: "A role=alert banner with the retry date and Update card.",
          code: `<BillingSchedule items={charges} retryOn="04 Oct" onUpdateCard={updateCard} />`,
          render: <BillingSchedule label={LABEL} items={FAILED} retryOn="04 Oct" onUpdateCard={noop} />,
        },
        {
          title: "Empty, loading and error",
          about: "A kit Empty during the trial; skeleton rows; a load error with Retry.",
          code: `<BillingSchedule items={[]} emptyDescription="…" />
<BillingSchedule items={[]} loading />
<BillingSchedule items={[]} error="Couldn't load the billing schedule." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <BillingSchedule label={LABEL} items={[]} emptyDescription="Your first charge appears here after the trial ends on 14 Dec · example." />
              <BillingSchedule label={LABEL} items={[]} loading />
              <BillingSchedule label={LABEL} items={[]} error="Couldn’t load the billing schedule." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
