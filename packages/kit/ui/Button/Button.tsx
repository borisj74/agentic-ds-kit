import type { ButtonAppearance, ButtonProps } from "./Button.types";
import { LucideByName } from "./lucideName";
import { cx } from "../shared/cx";
import styles from "./Button.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  ButtonProps,
  ButtonSize,
  ButtonAppearance,
  ButtonMode,
  ButtonType,
  ButtonShape,
} from "./Button.types";

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

/** Leading icon a labelled solid, outline or soft danger Button gets when `iconStart` is empty, so danger is never colour alone. */
const DANGER_ICON = "TriangleAlert";

export function Button({
  children,
  size = "md",
  appearance = "solid",
  mode = "primary",
  flat = false,
  shape = "default",
  block = false,
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  iconStart,
  iconEnd,
  shortcut,
  ariaLabel,
  draggable,
  onDragStart,
  onDragEnd,
  className,
  ref,
  ...rest
}: ButtonProps) {
  const hasLabel = Boolean(children && children.trim());
  const iconOnly = !hasLabel && Boolean(iconStart || iconEnd);
  const iconPx = ICON_SIZE[size];
  const resolvedAppearance: ButtonAppearance = flat && appearance === "ghost" ? "soft" : appearance;
  const busy = loading && !disabled;
  const dangerIcon = hasLabel && mode === "danger" && resolvedAppearance !== "ghost" ? DANGER_ICON : undefined;
  const start = iconStart || dangerIcon;
  // The spinner takes the leading slot; on an icon-only button it takes the place of the one icon.
  const spinner = busy ? <LucideByName name="LoaderCircle" size={iconPx} className={cx(styles.icon, styles.spinner)} /> : null;

  return (
    <button
      {...rest} {...nisthaAttr("button", rest)}
      {...(busy ? { "aria-busy": true } : null)}
      ref={ref}
      type={type}
      disabled={disabled}
      draggable={draggable}
      aria-disabled={disabled || busy || undefined}
      aria-label={hasLabel ? undefined : ariaLabel}
      onClick={busy ? (event) => event.preventDefault() : onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cx(
        styles.button,
        styles[size],
        styles[resolvedAppearance],
        styles[mode],
        flat && styles.flat,
        shape === "pill" && styles.pill,
        block && styles.block,
        iconOnly && styles.iconOnly,
        busy && styles.loading,
        busy && hasLabel && !start && styles.keepWidth,
        className,
      )}
    >
      {spinner ?? <LucideByName name={start} size={iconPx} className={styles.icon} />}
      {hasLabel ? <span>{children}</span> : null}
      {spinner && !hasLabel ? null : <LucideByName name={iconEnd} size={iconPx} className={styles.icon} />}
      {shortcut && hasLabel ? (
        <kbd className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}
