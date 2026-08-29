import Link from "next/link";
import styles from "./PlaygroundNav.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/foundations", label: "Foundations" },
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
];

export function PlaygroundNav() {
  return (
    <nav className={styles.nav} aria-label="Playground">
      <Link href="/" className={styles.brand}>
        Kit sandbox
      </Link>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
