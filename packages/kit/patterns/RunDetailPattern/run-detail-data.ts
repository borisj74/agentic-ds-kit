import type { RunDetailRun, RunDetailStep } from "../../ui/RunDetail";
import type { TraceSpan } from "../../ui/TraceWaterfall";

/** Demo data: Northwind's invoice reconciler on INV-1842. Replace it with your run. */

export type RunDetailState = "failed" | "running" | "done";

export const RUN_PAGE = {
  product: "Northwind",
  account: { name: "Boris Jov", initials: "BJ" },
  runs: "Runs",
  id: "INV-1842",
  title: "Reconcile INV-1842",
  meta: "Halvorsen Freight · $4,180.00 due 15 Nov · started 09:12 today",
  metaShort: "Halvorsen Freight · $4,180.00 due 15 Nov · started 09:12",
};

const FETCH: RunDetailStep = {
  id: "fetch",
  agentId: "reconciler",
  label: "Fetch Stripe charges",
  tool: "stripe.charges.list",
  target: "3 charges since 1 Nov",
  status: "done",
  duration: "1.2s",
  args: { customer: "cus_Q8h2LmT", created_gte: "2026-11-01" },
  result: ["ch_3QX1   $2,000.00   4 Nov", "ch_3QX7   $1,500.00  11 Nov", "ch_3QY2     $608.00  18 Nov"],
  resultMeta: "3 of 3",
};

const MATCH_ARGS = { invoice: "INV-1842", charges: ["ch_3QX1", "ch_3QX7", "ch_3QY2"], tolerance: 0.01 };

const MATCH_FAILED: RunDetailStep = {
  id: "match",
  agentId: "reconciler",
  label: "Match payments",
  tool: "ledger.match_payments",
  target: "3 charges against INV-1842",
  status: "failed",
  duration: "0.6s",
  args: MATCH_ARGS,
  error: ["Short by $72.00: charges $4,108.00, invoice $4,180.00", "No charge within 1% of the gap"],
  attempt: { n: 1, max: 3 },
};

const POST: RunDetailStep = {
  id: "post",
  agentId: "reconciler",
  label: "Update ledger",
  tool: "ledger.post_entries",
  status: "pending",
};

const MARK: RunDetailStep = {
  id: "mark",
  agentId: "reconciler",
  label: "Mark INV-1842 paid",
  tool: "billing.invoices.update",
  status: "pending",
};

const RUN_NAME = "Invoice reconciler";

export const RUNS: Record<RunDetailState, { run: RunDetailRun; headlineShort: string; steps: RunDetailStep[]; selected: string | null; trace?: TraceSpan[]; callsNote?: string }> = {
  failed: {
    run: { name: RUN_NAME, status: "failed", headline: "Stopped at Match payments, step 2 of 4", elapsed: "0:04", cost: "$0.02" },
    headlineShort: "Step 2 of 4",
    callsNote: "Update ledger and Mark INV-1842 paid run once this step passes.",
    steps: [FETCH, MATCH_FAILED, POST, MARK],
    selected: "match",
    trace: [
      { id: "plan", label: "Plan the match", kind: "model", startMs: 0, endMs: 600, cost: 0.01 },
      { id: "fetch", label: "stripe.charges.list", kind: "tool", startMs: 600, endMs: 1800 },
      { id: "reason", label: "Pair charges to the invoice", kind: "model", startMs: 1800, endMs: 3400, cost: 0.01 },
      { id: "match", label: "ledger.match_payments", kind: "tool", startMs: 3400, endMs: 4000, failed: true },
    ],
  },
  running: {
    run: { name: RUN_NAME, status: "running", headline: "Step 2 of 4", elapsed: "0:03" },
    headlineShort: "Step 2 of 4",
    steps: [FETCH, { ...MATCH_FAILED, status: "running", duration: undefined, timer: "0:01", error: undefined, attempt: undefined }, POST, MARK],
    selected: "match",
    trace: [
      { id: "plan", label: "Plan the match", kind: "model", startMs: 0, endMs: 600, cost: 0.01 },
      { id: "fetch", label: "stripe.charges.list", kind: "tool", startMs: 600, endMs: 1800 },
      { id: "reason", label: "Pair charges to the invoice", kind: "model", startMs: 1800, endMs: 2400 },
      { id: "match", label: "ledger.match_payments", kind: "tool", startMs: 2400 },
    ],
  },
  done: {
    run: { name: RUN_NAME, status: "done", headline: "INV-1842 marked paid", elapsed: "1:42", cost: "$0.04" },
    headlineShort: "INV-1842 marked paid",
    // The trail keeps the failed attempt.
    steps: [
      FETCH,
      MATCH_FAILED,
      {
        ...MATCH_FAILED,
        id: "match-2",
        status: "done",
        duration: "0.5s",
        target: "4 charges against INV-1842",
        args: { ...MATCH_ARGS, charges: [...MATCH_ARGS.charges, "ch_3QZ4"] },
        error: undefined,
        attempt: undefined,
        result: ["4 charges matched · $4,180.00"],
      },
      { ...POST, status: "done", duration: "0.4s", target: "3 payments posted", args: { invoice: "INV-1842", entries: 3 }, result: ["3 entries posted to 1200 Receivables"] },
      { ...MARK, status: "done", duration: "0.3s", target: "status paid", args: { id: "INV-1842", status: "paid" }, result: ["INV-1842 · paid"] },
    ],
    selected: null,
    trace: [
      { id: "plan", label: "Plan the match", kind: "model", startMs: 0, endMs: 600, cost: 0.01 },
      { id: "fetch", label: "stripe.charges.list", kind: "tool", startMs: 600, endMs: 1800 },
      { id: "reason", label: "Pair charges to the invoice", kind: "model", startMs: 1800, endMs: 3400, cost: 0.01 },
      { id: "match", label: "ledger.match_payments", kind: "tool", startMs: 3400, endMs: 4000, failed: true },
      { id: "retry", label: "ledger.match_payments", kind: "tool", startMs: 100000, endMs: 100500 },
      { id: "close", label: "Post and close", kind: "model", startMs: 100500, endMs: 101300, cost: 0.02 },
      { id: "post", label: "ledger.post_entries", kind: "tool", startMs: 101300, endMs: 101700 },
      { id: "mark", label: "billing.invoices.update", kind: "tool", startMs: 101700, endMs: 102000 },
    ],
  },
};
