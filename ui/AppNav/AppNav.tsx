"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AppNavGroup, AppNavItem, AppNavLeaf, AppNavProps } from "./AppNav.types";
import styles from "./AppNav.module.css";

export type { AppNavProps, AppNavItem, AppNavLeaf, AppNavGroup } from "./AppNav.types";

function groupHasActive(group: AppNavGroup): boolean {
  return group.items.some((item) => item.active || item.items?.some((child) => child.active));
}

function NavLink({ href, label, active, nested }: AppNavLeaf & { nested?: boolean }) {
  return (
    <Link
      href={href}
      className={`${styles.link} ${nested ? styles.linkNested : ""} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        const [path, fragment] = href.split("#");
        if (!fragment) return;
        const here = window.location.pathname;
        if (path && path !== here) return;
        event.preventDefault();
        window.location.hash = fragment;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
    >
      {label}
    </Link>
  );
}

function NavItem({ item }: { item: AppNavItem }) {
  if (item.items && item.items.length > 0) {
    return (
      <li className={styles.item}>
        <span className={styles.subgroupLabel}>{item.label}</span>
        <ul className={styles.subList}>
          {item.items.map((child) => (
            <li key={child.href}>
              <NavLink {...child} nested />
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      <NavLink {...item} />
    </li>
  );
}

function NavGroup({
  group,
  open,
  onToggle,
}: {
  group: AppNavGroup;
  open: boolean;
  onToggle: () => void;
}) {
  const groupId = `nav-group-${group.label.replace(/\s+/g, "-").toLowerCase()}`;
  const hasActive = groupHasActive(group);

  return (
    <li className={`${styles.group} ${open ? styles.isOpen : ""}`}>
      <button
        type="button"
        className={`${styles.groupToggle} ${open ? styles.groupToggleOpen : ""} ${hasActive ? styles.groupToggleActive : ""}`}
        aria-expanded={open}
        aria-controls={groupId}
        onClick={onToggle}
      >
        <span className={styles.groupLabel}>{group.label}</span>
        <ChevronRight className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} size={14} strokeWidth={2} aria-hidden />
      </button>
      <div className={styles.accordion} id={groupId} aria-hidden={!open} inert={open ? undefined : true}>
        <div className={styles.accordionInner}>
          <ul className={styles.list}>
            {group.items.map((item) => (
              <NavItem key={item.href + item.label} item={item} />
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export function AppNav({ title, items = [], groups }: AppNavProps) {
  const useGroups = Boolean(groups && groups.length > 0);
  const activeLabel = useGroups ? groups!.find(groupHasActive)?.label ?? null : null;
  const fallbackLabel = useGroups
    ? groups!.find((group) => group.defaultOpen !== false)?.label ?? groups![0].label
    : null;
  const [openLabel, setOpenLabel] = useState<string | null>(activeLabel ?? fallbackLabel);

  useEffect(() => {
    if (activeLabel) setOpenLabel(activeLabel);
  }, [activeLabel]);

  const resolvedOpen = openLabel ?? activeLabel ?? fallbackLabel;

  return (
    <nav className={styles.nav} aria-label="Application">
      <p className={styles.title}>{title}</p>
      {useGroups ? (
        <ul className={styles.groupList}>
          {groups!.map((group) => (
            <NavGroup
              key={group.label}
              group={group}
              open={resolvedOpen === group.label}
              onToggle={() => setOpenLabel((current) => (current === group.label ? null : group.label))}
            />
          ))}
        </ul>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </ul>
      )}
    </nav>
  );
}
