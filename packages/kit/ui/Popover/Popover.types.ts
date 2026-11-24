import type { ReactElement, ReactNode } from "react";
import type { ModalCardTone } from "../ModalCard/ModalCard.types";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

/** Tone icon and status word before the eyebrow. neutral shows the eyebrow only. */
export type PopoverTone = ModalCardTone;

export interface PopoverProps {
  /** One focusable control. Click toggles the panel. */
  trigger: ReactElement;
  children: ReactNode;
  /** Names the dialog. */
  label: string;
  /** Heading at the top of the panel, 18px. Eyebrow and tone show only with a title. */
  title?: string;
  /** Short area name above the title, like "Billing · Invoices". */
  eyebrow?: string;
  /** Tone icon and status word before the eyebrow. Default neutral: no icon. */
  tone?: PopoverTone;
  /** kit Buttons, size sm, at the bottom right. At most one primary. */
  footer?: ReactNode;
  /** Left of the footer actions: an Ask Button or a count. */
  footerStart?: ReactNode;
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
