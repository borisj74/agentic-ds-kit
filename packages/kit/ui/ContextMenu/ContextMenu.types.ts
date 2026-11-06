import type { ReactNode } from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  onSelect?: (id: string) => void;
  /** The surface that opens the menu on right-click or Shift+F10. */
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}
