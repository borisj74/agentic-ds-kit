import { Table } from "agentic-ds-kit";
import type { TableColumn } from "agentic-ds-kit";
import styles from "./ComponentDoc.module.css";

const COLUMNS: TableColumn[] = [
  { key: "name", header: "Variable", emphasis: true },
  { key: "controls", header: "Controls (default)" },
];

/** Variables table built from a contract's `cssVars` block. */
export function CssVarsTable({ cssVars, selector }: { cssVars: Record<string, string>; selector: string }) {
  const rows = Object.entries(cssVars).map(([name, controls]) => ({ name: <code>{name}</code>, controls }));

  return (
    <section className={styles.docs} aria-label="Component variables">
      <div>
        <h3 className={styles.usageTitle}>Component variables</h3>
        <p className={styles.usageBody}>
          Override on <code>:root</code>, a wrapper, or the component&apos;s <code>className</code> /{" "}
          <code>style</code>, e.g. <code>{selector}</code>. Set them to semantic tokens, never hex.
          Listed under <code>cssVars</code> in the contract.
        </p>
      </div>
      <Table columns={COLUMNS} rows={rows} size="sm" />
    </section>
  );
}
