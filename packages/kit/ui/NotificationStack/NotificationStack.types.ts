import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type NotificationTone = "neutral" | "success" | "info" | "warning" | "danger";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  /** Display time, e.g. "5m", "1d". */
  createdAt: string;
  read: boolean;
  /** Icon colour role; each tone has a default icon. */
  tone?: NotificationTone;
  /** Overrides the tone's icon, e.g. "CreditCard". */
  icon?: KitIcon;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type NotificationStackOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the panel `<div>` (inline) or the trigger wrapper. */
export interface NotificationStackProps extends Omit<ComponentPropsWithoutRef<"div">, NotificationStackOwnedKeys> {
  items: NotificationItem[];
  /** Panel title and the trigger's name. Default "Notifications". */
  label?: string;
  /** Controlled popover state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Render the panel in place, with no bell trigger or popover (a page section, docs). */
  inline?: boolean;
  onItemClick?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  onMarkAll?: () => void;
  onViewAll?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLDivElement>;
}
