import type { ComponentPropsWithoutRef, Ref } from "react";

/** Which part of the schedule to show. Closed: one of three views, each with its own empty, loading and error. */
export type BillingScheduleView = "full" | "nextOnly" | "failed";

/**
 * scheduled: will be charged. retrying: a retry of a failed invoice.
 * invoiced: billed, not paid yet. paid, failed, waived: billed and settled.
 */
export type ChargeStatus = "scheduled" | "retrying" | "invoiced" | "paid" | "failed" | "waived";

export interface Charge {
  id: string;
  /** Charge date as YYYY-MM-DD. Shown as 01 Dec 2026. */
  date: string;
  label: string;
  /** Pre-formatted amount; currency formatting stays with your app. */
  amount: string;
  /** The amount as a number, for an edit form of your own. */
  value?: number;
  status: ChargeStatus;
  /** Invoice number the charge goes on, e.g. INV-1871. Names the Download row action. */
  invoice?: string;
  /** Muted second line under the description, e.g. "Prorated for 14 days". A failed charge shows it in danger text. */
  note?: string;
  /** A split fee with later parts, e.g. "This and part 3 on 15 Jan 2027". Not shown here; for an edit form of your own. */
  splitLabel?: string;
}

/** The next charge in the nextOnly view. Every string arrives pre-formatted. */
export interface NextCharge {
  /** e.g. "01 Dec 2026"; the panel reads "Next charge on 01 Dec 2026". */
  date: string;
  amount: string;
  /** The payment method under "Pays with", e.g. "Visa ending 4242". */
  paysWith: string;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type BillingScheduleOwnedKeys = "children" | "title" | "aria-labelledby" | "aria-busy";

/** `ref`, `className` and other native attributes land on the Card's root `<article>`. */
export interface BillingScheduleProps extends Omit<ComponentPropsWithoutRef<"article">, BillingScheduleOwnedKeys> {
  /** full (default): every charge in one Table. nextOnly: the next-charge panel. failed: the open failed payment. */
  view?: BillingScheduleView;
  /** Upcoming and billed charges, in any order. full and failed read them. */
  charges?: Charge[];
  /** The nextOnly panel. Without it nextOnly shows its empty state. */
  next?: NextCharge;
  /** The Card description beside the title, such as the plan name. */
  description?: string;
  /** The failure Alert's body: what was declined, when the retry runs and what to do before then. */
  failureDetail?: string;
  /** The empty state's one line. Each view has a default. */
  emptyDescription?: string;
  loading?: boolean;
  /** What failed to load; shows a danger Alert with Retry when `onRetry` is set. */
  error?: string;
  onRetry?: () => void;
  /** Ask (outline, MessageCircle) in the Card header. */
  onAsk?: () => void;
  /** full only: Download all (ghost) in the Card header; hidden while the failure Alert shows. */
  onDownloadAll?: () => void;
  /** full only: an edit pencil on scheduled rows, named with the charge and date. */
  onEditCharge?: (charge: Charge) => void;
  /** A Download icon on billed rows, named by the invoice. */
  onDownloadInvoice?: (charge: Charge) => void;
  /** nextOnly: Change card (outline) at the end of the panel. */
  onChangeCard?: () => void;
  /** full and failed: Update card in the failure Alert, the one solid primary. */
  onUpdateCard?: () => void;
  ref?: Ref<HTMLElement>;
}
