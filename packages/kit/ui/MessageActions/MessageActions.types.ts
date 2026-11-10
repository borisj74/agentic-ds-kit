import type { ComponentPropsWithoutRef, Ref } from "react";
import type { DropdownMenuItem } from "../DropdownMenu/DropdownMenu.types";

export type MessageFeedback = "up" | "down" | null;

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type MessageActionsOwnedKeys = "children" | "role";

/** `ref`, `className` and other native attributes land on the root toolbar `<div>`. */
export interface MessageActionsProps extends Omit<ComponentPropsWithoutRef<"div">, MessageActionsOwnedKeys> {
  /** Toolbar name. Default "Message actions". */
  label?: string;
  onCopy?: () => void;
  /** Shows "Copied" in place of the copy button. */
  copied?: boolean;
  onRetry?: () => void;
  retrying?: boolean;
  /** User messages: edit instead of retry. */
  onEdit?: () => void;
  /** Thumbs up / down. Omit to hide feedback. */
  onFeedback?: (value: MessageFeedback) => void;
  feedback?: MessageFeedback;
  /** After a thumbs up, e.g. "Thanks, noted". */
  thanksText?: string;
  /** After a thumbs down: quick reasons as chips. */
  reasons?: string[];
  onReason?: (reason: string) => void;
  /** More menu items. */
  moreItems?: DropdownMenuItem[];
  onAction?: (id: string) => void;
  /** hover: hidden until the toolbar or an ancestor with data-message-actions-host is hovered or focused. */
  visible?: "always" | "hover";
  /** Message still streaming. */
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}
