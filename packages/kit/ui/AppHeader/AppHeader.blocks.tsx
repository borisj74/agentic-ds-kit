import { useId } from "react";
import { Input } from "../Input";
import { LucideByName } from "../Button/lucideName";
import type {
  AppHeaderActionsProps,
  AppHeaderBrandProps,
  AppHeaderCenterProps,
  AppHeaderMarkProps,
  AppHeaderRootProps,
  AppHeaderSearchProps,
  AppHeaderSpacerProps,
  AppHeaderTitleProps,
} from "./AppHeader.types";
import { cx } from "../shared/cx";
import styles from "./AppHeader.module.css";

/**
 * The `<header>` landmark and its bar grid (start | center | end). Container queries
 * stack the center under start/end below 38rem. Without a center block the bar uses
 * two columns (CSS `:has()`; `data-search="false"` forces it, as the preset does).
 */
export function AppHeaderRoot({
  children,
  ariaLabel = "Application",
  radius = "none",
  className,
  ref,
  ...rest
}: AppHeaderRootProps) {
  return (
    <header
      {...rest}
      ref={ref}
      className={cx(styles.header, radius === "md" && styles.radiusMd, className)}
      aria-label={ariaLabel}
    >
      <div className={styles.bar}>{children}</div>
    </header>
  );
}

/** Letter (or icon) mark on the brand fill. Decorative: the header label names the product. */
export function AppHeaderMark({ children, className, ref, ...rest }: AppHeaderMarkProps) {
  return (
    <span {...rest} ref={ref} className={cx(styles.mark, className)} aria-hidden>
      {children}
    </span>
  );
}

/**
 * Start column. The brand cell (mark or logo) is as wide as the closed SideNav rail so the
 * mark centers on the rail icons; it renders only when `mark` or `logo` is set.
 */
export function AppHeaderBrand({ mark, markIcon, logo, children, className, ref, ...rest }: AppHeaderBrandProps) {
  const hasCell = mark !== undefined || markIcon !== undefined || logo !== undefined;
  return (
    <div {...rest} ref={ref} className={cx(styles.start, className)}>
      {hasCell ? (
        <div className={styles.brand}>
          {logo ? (
            <div className={styles.logo}>{logo}</div>
          ) : (
            <AppHeaderMark>{markIcon ? <LucideByName name={markIcon} size={16} /> : mark}</AppHeaderMark>
          )}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Product name beside the brand cell. Not a heading. */
export function AppHeaderTitle({ children, className, ref, ...rest }: AppHeaderTitleProps) {
  return (
    <p {...rest} ref={ref} className={cx(styles.title, className)}>
      {children}
    </p>
  );
}

/** Center column for custom content. Stacks under the bar in narrow containers. */
export function AppHeaderCenter({ children, className, ref, ...rest }: AppHeaderCenterProps) {
  return (
    <div {...rest} ref={ref} className={cx(styles.center, className)}>
      {children}
    </div>
  );
}

/** Center column with the kit search Input (type search, shortcut hint in the end slot). */
export function AppHeaderSearch({
  placeholder = "Search",
  value,
  defaultValue,
  onSearch,
  shortcut,
  id,
  ariaLabel,
  className,
  ref,
  ...rest
}: AppHeaderSearchProps) {
  const generatedId = useId();
  return (
    <AppHeaderCenter className={className}>
      <div className={styles.search}>
        <Input
          {...rest}
          ref={ref}
          id={id ?? generatedId}
          type="search"
          size="md"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onSearch}
          iconStart="Search"
          end={shortcut}
          ariaLabel={ariaLabel ?? placeholder}
        />
      </div>
    </AppHeaderCenter>
  );
}

/** End column. A group labelled "Actions" when it has children. At most one primary Button. */
export function AppHeaderActions({ children, ariaLabel = "Actions", className, ref, ...rest }: AppHeaderActionsProps) {
  const hasChildren = Boolean(children);
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.end, className)}
      role={hasChildren ? "group" : undefined}
      aria-label={hasChildren ? ariaLabel : undefined}
    >
      {children}
    </div>
  );
}

/** Empty center column: same three-column rhythm as a header with search. */
export function AppHeaderSpacer({ className, ref, ...rest }: AppHeaderSpacerProps) {
  return <div {...rest} ref={ref} className={cx(styles.center, styles.spacer, className)} aria-hidden />;
}
