import Link from "next/link";
import type { AppNavGroup, AppNavItem, AppNavLeaf, AppNavProps } from "./AppNav.types";
import styles from "./AppNav.module.css";

export type { AppNavProps, AppNavItem, AppNavLeaf, AppNavGroup } from "./AppNav.types";

function NavLink({ href, label, active, nested }: AppNavLeaf & { nested?: boolean }) {
  return (
    <Link
      href={href}
      className={`${styles.link} ${nested ? styles.linkNested : ""} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
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

function NavGroup({ group }: { group: AppNavGroup }) {
  const groupId = `nav-group-${group.label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <li className={styles.group}>
      <h3 id={groupId} className={styles.groupLabel}>
        {group.label}
      </h3>
      <ul className={styles.list} aria-labelledby={groupId}>
        {group.items.map((item) => (
          <NavItem key={item.href + item.label} item={item} />
        ))}
      </ul>
    </li>
  );
}

export function AppNav({ title, items = [], groups }: AppNavProps) {
  const useGroups = groups && groups.length > 0;

  return (
    <nav className={styles.nav} aria-label="Application">
      <p className={styles.title}>{title}</p>
      {useGroups ? (
        <ul className={styles.groupList}>
          {groups.map((group) => (
            <NavGroup key={group.label} group={group} />
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
