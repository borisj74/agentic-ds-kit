import type { ButtonBase } from "../Button/Button.types";
import type { KitIcon } from "../Button/lucideName";

/**
 * Button's props for an icon-only button: `icon` and `ariaLabel` are required, and the props that
 * need a label (children, iconStart, iconEnd, shortcut, block) are left out.
 */
export interface IconButtonProps extends Omit<ButtonBase, "iconStart" | "iconEnd" | "shortcut" | "block"> {
  /** A Lucide name, a Lucide component, or an element. */
  icon: KitIcon;
  /** Names the action, like "Download". There is no visible label. */
  ariaLabel: string;
}
