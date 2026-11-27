"use client";

import { useState } from "react";
import { BillingSchedule, type BillingScheduleProps, type BillingScheduleView, type Charge } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import { RadioControl } from "./ControlsPanel";

type State = "ready" | "empty" | "loading" | "error";

/** Example data, the same shape the billing-schedule pattern uses. */
const CHARGES: Charge[] = [
  { id: "dec", date: "2026-12-01", label: "Pro plan · monthly", amount: "$480.00", status: "scheduled", invoice: "INV-0118" },
  { id: "nov", date: "2026-11-01", label: "Pro plan · monthly", amount: "$480.00", status: "paid", invoice: "INV-0117" },
  { id: "seat", date: "2026-10-18", label: "Seat added", amount: "$22.40", status: "invoiced", invoice: "INV-0112", note: "Prorated for 14 days" },
  { id: "oct", date: "2026-10-01", label: "Pro plan · monthly", amount: "$480.00", status: "failed", invoice: "INV-0109", note: "Card declined" },
  { id: "sep", date: "2026-09-01", label: "Pro plan · monthly", amount: "$0.00", status: "waived", invoice: "INV-0101", note: "Credit applied" },
];
/** Nothing paid since the October failure, so it is still open. */
const FAILED: Charge[] = CHARGES.filter((charge) => charge.id === "seat" || charge.id === "oct");
const NEXT = { date: "01 Dec 2026", amount: "$480.00", paysWith: "Visa ending 4242" };
const FAILURE_DETAIL = "The card was declined. We retry on 04 Oct 2026, so update it before then to keep the plan active.";
const noop = () => {};

const VIEWS = ["full", "nextOnly", "failed"] as const;
const STATES = ["ready", "empty", "loading", "error"] as const;

function propsFor(view: BillingScheduleView, state: State): BillingScheduleProps {
  const charges = state === "empty" ? (view === "failed" ? CHARGES : []) : view === "failed" ? FAILED : CHARGES;
  return {
    view,
    description: "Pro plan",
    charges,
    next: state === "empty" ? undefined : NEXT,
    failureDetail: FAILURE_DETAIL,
    loading: state === "loading",
    error: state === "error" ? "Check your connection, then try again" : undefined,
    onRetry: noop,
    onDownloadAll: noop,
    onChangeCard: noop,
    onUpdateCard: noop,
  };
}

const CODE: Record<BillingScheduleView, string> = {
  full: `<BillingSchedule view="full" charges={charges} description="Pro plan" onDownloadAll={downloadAll} onUpdateCard={updateCard} />`,
  nextOnly: `<BillingSchedule view="nextOnly" next={next} description="Pro plan" onChangeCard={changeCard} />`,
  failed: `<BillingSchedule view="failed" charges={charges} description="Pro plan" failureDetail={failureDetail} onUpdateCard={updateCard} />`,
};

const ABOUT: Record<BillingScheduleView, Record<State, string>> = {
  full: {
    ready: "Upcoming first, then billed newest first. The earliest charge still due (scheduled or retrying) says Next charge. Download all in the header.",
    empty: "No charges: a kit Empty with one line (emptyDescription).",
    loading: "The Table loading state: the header stays, Skeleton rows below.",
    error: "A danger Alert with Retry (outline, RotateCcw).",
  },
  nextOnly: {
    ready: "The next charge, a rule, what it pays with and Change card. Stacks below 40rem.",
    empty: "No next charge: No upcoming charge.",
    loading: "The panel's shape with Skeleton lines; announces Loading once.",
    error: "A danger Alert titled for the next charge, with Retry.",
  },
  failed: {
    ready: "The open failed payment as a danger Alert with Update card (the one solid primary), then the failed charge and what is still owed.",
    empty: "No open failure (a later charge was paid or waived): No failed payments.",
    loading: "The Table loading state in the same four columns.",
    error: "A danger Alert titled for failed payments, with Retry.",
  },
};

const LABEL: Record<BillingScheduleView, string> = { full: "Full", nextOnly: "Next charge only", failed: "Failed payment" };

export function BillingScheduleDoc() {
  const [view, setView] = useState<BillingScheduleView>("full");
  const [state, setState] = useState<State>("ready");
  return (
    <AgentDocFrame
      id="billingschedule"
      name="BillingSchedule"
      lede="One customer's billing schedule in a kit Card: the full table, the next charge only, or the open failed payment."
      summary="Switch the view and the state. Each view has its own empty, loading and error."
      preview={<BillingSchedule {...propsFor(view, state)} />}
      controls={
        <>
          <RadioControl label="View" options={VIEWS} value={view} onChange={setView} />
          <RadioControl label="State" options={STATES} value={state} onChange={setState} />
        </>
      }
      usage="view is closed: full for billing settings, nextOnly for a dashboard card, failed for an account page that flags a failed payment. Status is a word in a Badge, money arrives pre-formatted and every date reads 01 Dec 2026. Update card in the failure Alert is the one solid primary."
      code={CODE[view]}
      variants={VIEWS.flatMap((v) =>
        STATES.map((s) => ({
          title: `${LABEL[v]} — ${s}`,
          about: ABOUT[v][s],
          code: CODE[v],
          render: <BillingSchedule {...propsFor(v, s)} />,
        })),
      )}
    />
  );
}
