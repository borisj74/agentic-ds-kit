import { useId } from "react";
import { Input } from "@/ui/Input";
import type { AppHeaderProps } from "./AppHeader.types";
import styles from "./AppHeader.module.css";

export type { AppHeaderProps } from "./AppHeader.types";

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
  className = "",
  ariaLabel,
}: AppHeaderProps) {
  const generatedId = useId();
  const inputId = searchId ?? generatedId;
  const markLetter = (mark && mark.length > 0 ? mark : title?.charAt(0)) || "·";
  const label = ariaLabel ?? title ?? "Application";

  return (
    <header
      className={`${styles.header} ${className}`.trim()}
      aria-label={label}
      data-search={search ? undefined : "false"}
    >
      <div className={styles.start}>
        {logo ? (
          <div className={styles.logo}>{logo}</div>
        ) : (
          <span className={styles.mark} aria-hidden>
            {markLetter}
          </span>
        )}
        {title ? <p className={styles.title}>{title}</p> : null}
      </div>

      {search ? (
        <div className={styles.center}>
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
        </div>
      ) : null}

      <div className={styles.end} role={actions ? "group" : undefined} aria-label={actions ? "Actions" : undefined}>
        {actions}
      </div>
    </header>
  );
}
