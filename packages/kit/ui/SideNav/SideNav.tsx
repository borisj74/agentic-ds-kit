"use client";

import { useId, useState } from "react";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import type { SideNavItem, SideNavProps } from "./SideNav.types";
import styles from "./SideNav.module.css";

export type {
  SideNavGroup,
  SideNavItem,
  SideNavProps,
  SideNavRadius,
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

function NavItem({ item, rail }: { item: SideNavItem; rail: boolean }) {
  const nested = Boolean(item.items && item.items.length > 0);
  const submenuId = useId();
  const [expanded, setExpanded] = useState(nested);

  const className = [
    styles.item,
    item.active ? styles.itemActive : "",
    item.disabled ? styles.itemDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (nested) {
    return (
      <li className={styles.entry}>
        <button
          type="button"
          className={className}
          disabled={item.disabled}
          aria-expanded={expanded}
          aria-controls={submenuId}
          aria-current={item.active ? "page" : undefined}
          onClick={() => {
            if (!rail) setExpanded((current) => !current);
          }}
        >
          <ItemBody item={item} expanded={expanded} />
        </button>
        {expanded && !rail ? (
          <ul className={styles.submenu} id={submenuId}>
            {item.items!.map((child) => (
              <NavItem key={child.id} item={child} rail={rail} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  if (item.onClick && !item.disabled) {
    return (
      <li className={styles.entry}>
        <button
          type="button"
          className={className}
          aria-current={item.active ? "page" : undefined}
          onClick={item.onClick}
        >
          <ItemBody item={item} />
        </button>
      </li>
    );
  }

  if (item.href && !item.disabled) {
    return (
      <li className={styles.entry}>
        <a
          href={item.href}
          className={className}
          aria-current={item.active ? "page" : undefined}
        >
          <ItemBody item={item} />
        </a>
      </li>
    );
  }

  return (
    <li className={styles.entry}>
      <button
        type="button"
        className={className}
        disabled={item.disabled}
        aria-current={item.active ? "page" : undefined}
      >
        <ItemBody item={item} />
      </button>
    </li>
  );
}

function NavList({ items, rail }: { items: SideNavItem[]; rail: boolean }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <NavItem key={item.id} item={item} rail={rail} />
      ))}
    </ul>
  );
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
}: SideNavProps) {
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  // When showHeader is false we still allow rail open/close; consumers can provide a custom toggle.
  const expanded = isControlled ? openProp : uncontrolledOpen;
  const useGroups = Boolean(groups && groups.length > 0);
  const markLetter = (mark && mark.length > 0 ? mark : title.charAt(0)) || "·";

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <aside
      className={`${styles.root} ${radius === "none" ? styles.radiusNone : ""} ${expanded ? "" : styles.rootClosed}`.trim()}
      aria-label={title}
      data-side={side}
    >
      <div className={styles.panel}>
        {showHeader ? (
          <header className={styles.header}>
            {expanded ? (
              <span className={styles.mark} aria-hidden>
                {markLetter}
              </span>
            ) : (
              <button
                type="button"
                className={`${styles.mark} ${styles.markButton}`}
                aria-label="Open"
                onClick={() => setOpen(true)}
              >
                {markLetter}
              </button>
            )}
            <p className={styles.title}>{title}</p>
            {expanded ? (
              <span className={styles.close}>
                <Button
                  variant="tertiary"
                  size="sm"
                  iconStart={side === "right" ? "PanelRightClose" : "PanelLeftClose"}
                  ariaLabel="Close"
                  onClick={() => setOpen(false)}
                />
              </span>
            ) : null}
          </header>
        ) : null}

        <nav className={styles.nav} aria-label={title}>
          {useGroups
            ? groups!.map((group) => (
                <div key={group.label} className={styles.section}>
                  <p className={styles.sectionLabel}>{group.label}</p>
                  <NavList items={group.items} rail={!expanded} />
                </div>
              ))
            : <NavList items={items} rail={!expanded} />}
        </nav>

        {footer ? (
          <div className={styles.footer}>
            <NavList items={Array.isArray(footer) ? footer : [footer]} rail={!expanded} />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
