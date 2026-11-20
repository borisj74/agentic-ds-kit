import type { ButtonAppearance, ButtonMode, ButtonSize } from "./Button.types";
import { cx } from "../shared/cx";
import styles from "./Button.module.css";

/**
 * Internal: Button's own classes, for kit parts that must render a real link (<a href>) with the
 * Button look, like Card's header action with href. Not exported from agentic-ds-kit.
 */
export function buttonClassName({
  size = "md",
  appearance = "solid",
  mode = "primary",
  iconOnly = false,
}: {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  mode?: ButtonMode;
  iconOnly?: boolean;
}): string {
  return cx(styles.button, styles[size], styles[appearance], styles[mode], iconOnly && styles.iconOnly);
}

/** Icon slot class, for the same links. */
export const buttonIconClassName = styles.icon;
