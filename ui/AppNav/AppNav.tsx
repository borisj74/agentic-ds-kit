import Link from "next/link";
import type { AppNavProps } from "./AppNav.types";
import styles from "./AppNav.module.css";

export type { AppNavProps, AppNavItem } from "./AppNav.types";

export function AppNav({ title, items }: AppNavProps) {
  return (
    <nav className={styles.nav} aria-label="Application">
      <p className={styles.title}>{title}</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.link} ${item.active ? styles.active : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
