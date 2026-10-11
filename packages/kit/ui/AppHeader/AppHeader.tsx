import { useId } from "react";
import { Input } from "../Input";
import type { AppHeaderProps } from "./AppHeader.types";
import { cx } from "../shared/cx";
import styles from "./AppHeader.module.css";

export type { AppHeaderProps, AppHeaderRadius } from "./AppHeader.types";

export function AppHeader({
  title,
  mark,
  logo,
  search = true,
  searchPlaceholder = "Search",
  searchValue,
  defaultSearchValue,
  onSearch,
  searchShortcut,
  searchId,
  actions,
  start,
  center,
  end,
  className,
  ariaLabel,
  radius = "none",
  ref,
  ...rest
}: AppHeaderProps) {
  const generatedId = useId();
  const inputId = searchId ?? generatedId;
  const markLetter = (mark && mark.length > 0 ? mark : title?.charAt(0)) || "·";
  const label = ariaLabel ?? title ?? "Application";

  const brand = (
    <>
      <div className={styles.brand}>
        {logo ? (
          <div className={styles.logo}>{logo}</div>
        ) : (
          <span className={styles.mark} aria-hidden>
            {markLetter}
          </span>
        )}
      </div>
      {title ? <p className={styles.title}>{title}</p> : null}
    </>
  );

  const centerContent =
    center !== undefined ? (
      center
    ) : search ? (
      <div className={styles.search}>
        <Input
          id={inputId}
          type="search"
          size="md"
          placeholder={searchPlaceholder}
          value={searchValue}
          defaultValue={defaultSearchValue}
          onChange={onSearch}
          iconStart="Search"
          end={searchShortcut}
          ariaLabel={searchPlaceholder}
        />
      </div>
    ) : null;
  const hasCenter = centerContent !== null && centerContent !== undefined && centerContent !== false;
  const endContent = end !== undefined ? end : actions;

  return (
    <header
      {...rest}
      ref={ref}
      className={cx(styles.header, radius === "md" && styles.radiusMd, className)}
      aria-label={label}
      data-search={hasCenter ? undefined : "false"}
    >
      <div className={styles.bar}>
        <div className={styles.start}>{start !== undefined ? start : brand}</div>

        {hasCenter ? <div className={styles.center}>{centerContent}</div> : null}

        <div className={styles.end} role={endContent ? "group" : undefined} aria-label={endContent ? "Actions" : undefined}>
          {endContent}
        </div>
      </div>
    </header>
  );
}
