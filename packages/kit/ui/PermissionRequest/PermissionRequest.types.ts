import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type PermissionAccess = "read" | "write" | "admin";
export type PermissionRequestStatus = "pending" | "granting" | "error" | "granted" | "denied" | "expired";

/** One cell of the summary strip: a short label over what it says, e.g. { label: "For", value: "30 days, until 22 Dec" }. */
export interface PermissionSummaryItem {
  label: string;
  value: string;
}

export interface PermissionScope {
  id: string;
  /** What the access covers, e.g. "~/acme/ledger/docs" or "Send email as ops@acme.dev". Shown in mono. */
  resource: string;
  access: PermissionAccess;
  /** Why the agent needs it. */
  reason?: string;
  /** How far the access goes, e.g. "$500 per refund" or "50 emails a day". */
  limit?: string;
  /** e.g. "Expires in 7 days" or "No expiry". */
  expiry?: string;
  /** Lucide icon for the resource, e.g. "Folder", "Mail". Default by access. */
  icon?: KitIcon;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type PermissionRequestOwnedKeys = "children" | "title" | "aria-labelledby" | "onKeyDown";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface PermissionRequestProps extends Omit<ComponentPropsWithoutRef<"section">, PermissionRequestOwnedKeys> {
  /** Default "Permission request". */
  title?: string;
  /** Who asks and why it is standing access. */
  description?: string;
  scopes: PermissionScope[];
  status?: PermissionRequestStatus;
  /** Warning about standing access, shown when any scope writes or administers. */
  warning?: string;
  /** Error text for status error, e.g. "Couldn't save the grant. Request timed out after 10s." */
  errorMessage?: string;
  /** Header note, e.g. "requested 14:02". */
  requestedAt?: string;
  /**
   * A warning Badge (Hand icon) on a row above the title, e.g. "Needs you", for a request that waits on
   * this person. requestedAt moves onto that row and the scope count is left out.
   */
  badge?: string;
  /**
   * A strip under the description that says the change in two to four short cells, e.g. Changes,
   * For, Still asks. Columns when the card is wide; label and value rows under 40rem.
   */
  summary?: PermissionSummaryItem[];
  /** Resolved row detail, e.g. "until 17 Nov" or "14:03". */
  resolvedNote?: string;
  /** Grant: the one solid primary; ⌘/Ctrl+Enter in the card. */
  onGrant?: () => void;
  /** Deny: Escape in the card. */
  onDeny?: () => void;
  /** Retry after an error. Defaults to onGrant. */
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}
