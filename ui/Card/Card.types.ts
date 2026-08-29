import type { ReactNode } from "react";
import type { ButtonVariant } from "@/ui/Button";

export type CardSize = "sm" | "md";
export type CardActionVariant = ButtonVariant;

export interface CardAction {
  label: string;
  variant?: CardActionVariant;
  onClick?: () => void;
}

export interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  size?: CardSize;
  actions?: CardAction[];
  headerAction?: CardAction;
  imageSrc?: string;
  /** Required when imageSrc is set. */
  imageAlt?: string;
}
