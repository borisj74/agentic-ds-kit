/** Demo data for BillingSchedulePattern. Every figure is an example; replace it with the customer's charges. */

/**
 * scheduled: will be charged, and can be edited or skipped. retrying: a retry of a failed invoice.
 * invoiced: billed, not paid yet. paid, failed, waived: billed and settled.
 */
export type ChargeStatus = "scheduled" | "retrying" | "invoiced" | "paid" | "failed" | "waived";

export interface Charge {
  id: string;
  /** Charge date as YYYY-MM-DD. The pattern shows it as 15 Dec with the weekday under it. */
  date: string;
  label: string;
  /** Pre-formatted amount; currency formatting stays with your app. */
  amount: string;
  /** The amount as a number, for the edit Drawer's CurrencyInput and the Upcoming total. */
  value?: number;
  status: ChargeStatus;
  /** Invoice number the charge goes on, e.g. INV-1871. */
  invoice?: string;
  /** Second line, e.g. "Monthly · Visa 4242" or "Declined · insufficient funds". */
  note?: string;
  /**
   * A split fee with later parts: the second Apply to option in the edit Drawer, e.g.
   * "This and part 3 on 15 Jan". Without it the Drawer has no Apply to choice.
   */
  splitLabel?: string;
}

/** The next charge, as one figure with its lines. Every string arrives pre-formatted. */
export interface NextCharge {
  /** e.g. "Tue 1 Dec". */
  date: string;
  amount: string;
  /** e.g. "Visa ending 4242 · 10 days from today". */
  detail: string;
  lines: { label: string; amount: string }[];
  /** The draft invoice the lines go on, e.g. "INV-1871 · draft". */
  invoice?: string;
}

export const CHARGES: Charge[] = [
  {
    id: "retry-1842",
    date: "2026-11-24",
    label: "Retry of INV-1842",
    amount: "$2,418.00",
    value: 2418,
    status: "retrying",
    invoice: "INV-1842",
    note: "Try 2 of 3 · Visa 4242",
  },
  {
    id: "dec-plan",
    date: "2026-12-01",
    label: "Scale plan · 24 seats",
    amount: "$2,016.00",
    value: 2016,
    status: "scheduled",
    invoice: "INV-1871",
    note: "Monthly · Visa 4242",
  },
  {
    id: "dec-api",
    date: "2026-12-01",
    label: "API calls over 2M",
    amount: "$222.00",
    value: 222,
    status: "scheduled",
    invoice: "INV-1871",
    note: "Estimate · final on 30 Nov",
  },
  {
    id: "onboarding-2",
    date: "2026-12-15",
    label: "Onboarding · part 2 of 3",
    amount: "$1,500.00",
    value: 1500,
    status: "scheduled",
    invoice: "INV-1879",
    note: "Fixed fee · Visa 4242",
    splitLabel: "This and part 3 on 15 Jan",
  },
  {
    id: "jan-plan",
    date: "2027-01-01",
    label: "Scale plan · 24 seats",
    amount: "$2,016.00",
    value: 2016,
    status: "scheduled",
    invoice: "INV-1890",
    note: "Monthly · Visa 4242",
  },
  {
    id: "seat",
    date: "2026-11-18",
    label: "Seat added · prorated 13 days",
    amount: "$72.80",
    value: 72.8,
    status: "invoiced",
    invoice: "INV-1866",
    note: "Due 18 Dec · sent to Ana Ruiz",
  },
  {
    id: "nov",
    date: "2026-11-04",
    label: "Scale plan and API usage",
    amount: "$2,418.00",
    value: 2418,
    status: "failed",
    invoice: "INV-1842",
    note: "Declined · insufficient funds",
  },
  {
    id: "onboarding-1",
    date: "2026-10-15",
    label: "Onboarding · part 1 of 3",
    amount: "$1,500.00",
    value: 1500,
    status: "paid",
    invoice: "INV-1830",
    note: "Paid 15 Oct · Visa 4242",
  },
];

export const NEXT_CHARGE: NextCharge = {
  date: "Tue 1 Dec",
  amount: "$2,238.00",
  detail: "Visa ending 4242 · 10 days from today",
  lines: [
    { label: "Scale plan · 24 seats", amount: "$2,016.00" },
    { label: "API calls over 2M · estimate", amount: "$222.00" },
  ],
  invoice: "INV-1871 · draft",
};

export const PLAN_LABEL = "Northwind Traders · Scale plan, 24 seats · billed monthly · example data";
/** What happens after the failure: next retry, last retry, then the pause. */
export const FAILURE_DETAIL = "Visa 4242 was declined. Next retry is Tue 24 Nov, the last on 01 Dec. Then the plan pauses.";
export const UPCOMING_WINDOW = "next 60 days";
export const BILLED_WINDOW = "last 60 days";
