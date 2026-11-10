/** Demo data for BillingSchedulePattern. Every figure is an example; replace it with the subscription's charges. */
export type ChargeStatus = "upcoming" | "invoiced" | "paid" | "failed" | "waived";

export interface Charge {
  id: string;
  /** Display date, e.g. "01 Dec 2026". */
  date: string;
  label: string;
  /** Pre-formatted amount; currency formatting stays with your app. */
  amount: string;
  status: ChargeStatus;
  /** Second line, e.g. "prorated" or "card declined". */
  note?: string;
}

export const CHARGES: Charge[] = [
  { id: "dec", date: "01 Dec 2026", label: "Pro plan · monthly", amount: "$480.00", status: "upcoming" },
  { id: "nov", date: "01 Nov 2026", label: "Pro plan · monthly", amount: "$480.00", status: "paid" },
  { id: "seat", date: "18 Oct 2026", label: "Seat added · prorated 14 days", amount: "$22.40", status: "invoiced", note: "prorated" },
  { id: "oct", date: "01 Oct 2026", label: "Pro plan · monthly", amount: "$480.00", status: "failed", note: "card declined" },
  { id: "sep", date: "01 Sep 2026", label: "Pro plan · monthly", amount: "$0.00", status: "waived", note: "credit applied" },
];

export const NEXT_ID = "dec";
export const PLAN_LABEL = "Pro plan · example data";
export const PAYMENT_METHOD = "Visa ending 4242 · example";
export const RETRY_ON = "04 Oct";
