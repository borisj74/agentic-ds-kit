/** Demo data for BillingSchedulePattern. Every figure is an example; replace it with the customer's charges. */

/**
 * scheduled: will be charged, and can be edited or skipped. retrying: a retry of a failed invoice.
 * invoiced: billed, not paid yet. paid, failed, waived: billed and settled.
 */
export type ChargeStatus = "scheduled" | "retrying" | "invoiced" | "paid" | "failed" | "waived";

export interface Charge {
  id: string;
  /** Charge date as YYYY-MM-DD. The pattern shows it as 15 Dec 2026. */
  date: string;
  label: string;
  /** Pre-formatted amount; currency formatting stays with your app. */
  amount: string;
  /** The amount as a number, for the edit Drawer's CurrencyInput. */
  value?: number;
  status: ChargeStatus;
  /** Invoice number the charge goes on, e.g. INV-1871. */
  invoice?: string;
  /** Muted second line under the description, e.g. "Prorated for 14 days". A failed charge shows it in danger text. */
  note?: string;
  /**
   * A split fee with later parts: the second Apply to option in the edit Drawer, e.g.
   * "This and part 3 on 15 Jan 2027". Without it the Drawer has no Apply to choice.
   */
  splitLabel?: string;
}

/** The next charge in the nextOnly panel. Every string arrives pre-formatted. */
export interface NextCharge {
  /** e.g. "01 Dec 2026"; the panel reads "Next charge on 01 Dec 2026". */
  date: string;
  amount: string;
  /** The payment method under "Pays with", e.g. "Visa ending 4242". */
  paysWith: string;
}

export const CHARGES: Charge[] = [
  {
    id: "dec",
    date: "2026-12-01",
    label: "Pro plan · monthly",
    amount: "$480.00",
    value: 480,
    status: "scheduled",
    invoice: "INV-0118",
  },
  {
    id: "nov",
    date: "2026-11-01",
    label: "Pro plan · monthly",
    amount: "$480.00",
    value: 480,
    status: "paid",
    invoice: "INV-0117",
  },
  {
    id: "seat",
    date: "2026-10-18",
    label: "Seat added",
    amount: "$22.40",
    value: 22.4,
    status: "invoiced",
    invoice: "INV-0112",
    note: "Prorated for 14 days",
  },
  {
    id: "oct",
    date: "2026-10-01",
    label: "Pro plan · monthly",
    amount: "$480.00",
    value: 480,
    status: "failed",
    invoice: "INV-0109",
    note: "Card declined",
  },
  {
    id: "sep",
    date: "2026-09-01",
    label: "Pro plan · monthly",
    amount: "$0.00",
    value: 0,
    status: "waived",
    invoice: "INV-0101",
    note: "Credit applied",
  },
];

/** A failed payment that nothing has paid since: the failure Alert shows above the table. */
export const FAILED_CHARGES: Charge[] = CHARGES.filter((charge) => charge.id === "seat" || charge.id === "oct");

export const NEXT_CHARGE: NextCharge = {
  date: "01 Dec 2026",
  amount: "$480.00",
  paysWith: "Visa ending 4242",
};

/** The plan name, muted beside the title. Example data. */
export const PLAN_LABEL = "Pro plan";
/** What happens after the failure: when the retry runs and what to do before then. */
export const FAILURE_DETAIL = "The card was declined. We retry on 04 Oct 2026, so update it before then to keep the plan active.";
/** The empty state's one line. */
export const EMPTY_NOTE = "Your first charge shows here when the trial ends on 14 Dec 2026";
