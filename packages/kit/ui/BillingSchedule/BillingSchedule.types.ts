import type { ComponentPropsWithoutRef, Ref } from "react";

export type BillingChargeStatus = "upcoming" | "invoiced" | "paid" | "failed" | "waived";

export interface BillingCharge {
  id: string;
  /** Display date, e.g. "01 Dec 2026". */
  date: string;
  /** e.g. "Pro plan · monthly" */
  label: string;
  /** Pre-formatted amount, e.g. "$480.00". */
  amount: string;
  status: BillingChargeStatus;
  /** Second line, e.g. "prorated", "card declined". */
  note?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type BillingScheduleOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface BillingScheduleProps extends Omit<ComponentPropsWithoutRef<"section">, BillingScheduleOwnedKeys> {
  items: BillingCharge[];
  /** Default "Billing schedule". */
  title?: string;
  /** Muted note after the title, e.g. "Pro plan · example data". */
  label?: string;
  /** The next charge: tagged "Next charge" in the table, and the subject of the next-charge summary. */
  nextId?: string;
  /** Show only the next-charge summary (amount, date, card and Change card), no table. */
  nextOnly?: boolean;
  /** Under the next-charge date, e.g. "Visa ending 4242 · example". */
  paymentMethod?: string;
  onChangeCard?: () => void;
  /** A failed charge raises a banner with Update card, the one solid primary. */
  onUpdateCard?: () => void;
  /** Retry date shown in the failed banner, e.g. "04 Oct". */
  retryOn?: string;
  onDownloadAll?: () => void;
  onItemClick?: (id: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
