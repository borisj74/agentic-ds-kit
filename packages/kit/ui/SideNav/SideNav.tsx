"use client";

import { isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import type { SideNavItem, SideNavProps, SideNavRenderItem } from "./SideNav.types";
import { cx } from "../shared/cx";
import styles from "./SideNav.module.css";

export type {
  SideNavGroup,
  SideNavItem,
  SideNavProps,
  SideNavRadius,
  SideNavRenderItem,
  SideNavSide,
} from "./SideNav.types";

const ICON_SIZE = 16;

function ItemBody({
  item,
  expanded,
}: {
  item: SideNavItem;
  expanded?: boolean;
}) {
  const nested = Boolean(item.items && item.items.length > 0);

  return (
    <>
      {item.icon ? (
        <span className={styles.icon} aria-hidden>
          <LucideByName name={item.icon} size={ICON_SIZE} />
        </span>
      ) : null}
      <span className={styles.label}>{item.label}</span>
      {item.badge || nested ? (
        <span className={styles.meta}>
          {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
          {nested ? (
            <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}>
              <LucideByName name="ChevronRight" size={ICON_SIZE} />
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );
}

function NavItem({
  item,
  rail,
  renderItem,
}: {
  item: SideNavItem;
  rail: boolean;
  renderItem?: SideNavRenderItem;
}) {
  const nested = Boolean(item.items && item.items.length > 0);
  const submenuId = useId();
  const [expanded, setExpanded] = useState(nested);
  const submenuOpen = expanded && !rail;

  const className = [
    styles.item,
    item.active ? styles.itemActive : "",
    item.disabled ? styles.itemDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  let control: ReactElement;

  if (nested) {
    control = (
      <button
        type="button"
        className={className}
        disabled={item.disabled}
        aria-expanded={submenuOpen}
        aria-controls={submenuId}
        aria-current={item.active ? "page" : undefined}
        onClick={() => {
          if (!rail) setExpanded((current) => !current);
        }}
      >
        <ItemBody item={item} expanded={submenuOpen} />
      </button>
    );
  } else if (item.onClick && !item.disabled) {
    control = (
      <button
        type="button"
        className={className}
        aria-current={item.active ? "page" : undefined}
        onClick={item.onClick}
      >
        <ItemBody item={item} />
      </button>
    );
  } else if (item.href && !item.disabled) {
    control = (
      <a
        href={item.href}
        className={className}
        aria-current={item.active ? "page" : undefined}
      >
        <ItemBody item={item} />
      </a>
    );
  } else {
    control = (
      <button
        type="button"
        className={className}
        disabled={item.disabled}
        aria-current={item.active ? "page" : undefined}
      >
        <ItemBody item={item} />
      </button>
    );
  }

  return (
    <li className={styles.entry}>
      {renderItem ? renderItem(item, control) : control}
      {nested ? (
        <div
          className={`${styles.submenuSlot} ${submenuOpen ? "" : styles.submenuSlotClosed}`.trim()}
        >
          <ul className={styles.submenu} id={submenuId}>
            {item.items!.map((child) => (
              <NavItem key={child.id} item={child} rail={rail} renderItem={renderItem} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function NavList({
  items,
  rail,
  renderItem,
}: {
  items: SideNavItem[];
  rail: boolean;
  renderItem?: SideNavRenderItem;
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <NavItem key={item.id} item={item} rail={rail} renderItem={renderItem} />
      ))}
    </ul>
  );
}

function isNavItem(value: unknown): value is SideNavItem {
  return (
    typeof value === "object" &&
    value !== null &&
    !isValidElement(value) &&
    typeof (value as SideNavItem).id === "string" &&
    typeof (value as SideNavItem).label === "string"
  );
}

/** footer accepts SideNavItem, SideNavItem[], or any ReactNode. */
function footerItems(footer: SideNavProps["footer"]): SideNavItem[] | null {
  if (Array.isArray(footer)) return footer.length > 0 && footer.every(isNavItem) ? footer : null;
  return isNavItem(footer) ? [footer] : null;
}

export function SideNav({
  title,
  mark,
  showHeader = true,
  radius = "md",
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  side = "left",
  groups,
  items = [],
  footer,
  header,
  beforeGroups,
  afterGroups,
  renderItem,
  "aria-label": ariaLabel = title,
  className,
  ref,
  ...rest
}: SideNavProps) {
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  // When showHeader is false we still allow rail open/close; consumers can provide a custom toggle.
  const expanded = isControlled ? openProp : uncontrolledOpen;
  const useGroups = Boolean(groups && groups.length > 0);
  const markLetter = (mark && mark.length > 0 ? mark : title.charAt(0)) || "·";
  const rail = !expanded;
  const footerRows = footerItems(footer);
  const closedProps = rail ? { inert: true } : {};

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <aside
      {...rest}
      ref={ref}
      className={cx(styles.root, radius === "none" && styles.radiusNone, !expanded && styles.rootClosed, className)}
      aria-label={ariaLabel}
      data-side={side}
    >
      <div className={styles.panel}>
        {showHeader ? (
          <header className={styles.header}>
            {header !== undefined ? (
              <div className={styles.headerSlot} {...closedProps}>
                {header}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={`${styles.mark} ${styles.markButton}`}
                  aria-label={expanded ? undefined : "Open"}
                  aria-hidden={expanded ? true : undefined}
                  tabIndex={expanded ? -1 : 0}
                  disabled={expanded}
                  onClick={() => {
                    if (!expanded) setOpen(true);
                  }}
                >
                  {markLetter}
                </button>
                <p className={styles.title}>{title}</p>
              </>
            )}
            <span className={styles.close} {...(!expanded ? { inert: true } : {})}>
              <Button
                variant="tertiary"
                size="sm"
                iconStart={side === "right" ? "PanelRightClose" : "PanelLeftClose"}
                ariaLabel="Close"
                onClick={() => setOpen(false)}
              />
            </span>
          </header>
        ) : null}

        {beforeGroups ? (
          <div className={`${styles.slot} ${styles.slotBefore}`} {...closedProps}>
            {beforeGroups}
          </div>
        ) : null}

        <nav className={styles.nav} aria-label={title}>
          {useGroups
            ? groups!.map((group) => (
                <div key={group.label} className={styles.section}>
                  <p className={styles.sectionLabel}>{group.label}</p>
                  <NavList items={group.items} rail={rail} renderItem={renderItem} />
                </div>
              ))
            : <NavList items={items} rail={rail} renderItem={renderItem} />}
        </nav>

        {afterGroups ? (
          <div className={`${styles.slot} ${styles.slotAfter}`} {...closedProps}>
            {afterGroups}
          </div>
        ) : null}

        {footer ? (
          <div className={styles.footer}>
            {footerRows ? (
              <NavList items={footerRows} rail={rail} renderItem={renderItem} />
            ) : (
              (footer as ReactNode)
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
