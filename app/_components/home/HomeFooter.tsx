import { LinkList } from "agentic-ds-kit";
import { FOOTER_COLUMNS } from "@/lib/home.sample";
import { NisthaLogo } from "../NisthaLogo";
import styles from "./Home.module.css";

/** The home page's closing row: brand and version, then three link columns. */
export function HomeFooter({ version }: { version: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <NisthaLogo />
        <p className={styles.footerText}>Contracts, tokens and React components your coding agent reads before it writes UI.</p>
        <p className={styles.footerMeta}>{`agentic-ds-kit ${version} · MIT`}</p>
      </div>
      <div className={`layout-split--thirds ${styles.footerColumns}`}>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.label} className={styles.footerColumn}>
            <p className={styles.footerHeading}>{column.label}</p>
            <LinkList label={column.label} items={column.items} />
          </div>
        ))}
      </div>
    </footer>
  );
}
