import type { ReactNode } from "react";
import { Badge, Breadcrumb } from "agentic-ds-kit";
import { componentLabel } from "@/lib/playground-nav";
import {
  agentReads,
  componentGroupOf,
  contractIntent,
  contractStatus,
  contractUseWhen,
  importLine,
} from "@/lib/component-contract";
import { PreviewScope } from "../_components/ThemeScope";
import { ComponentStage } from "./ComponentStage";
import docStyles from "./ComponentDoc.module.css";
import styles from "./ComponentPage.module.css";

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className={styles.ruleList}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function AgentReadsBlock({ id }: { id: string }) {
  const reads = agentReads(id);
  const rows: { key: string; label: string; items: string[]; tone: string }[] = [
    { key: "must", label: "must", items: reads.must, tone: styles.labelMust },
    { key: "defaults", label: "defaults", items: reads.defaults, tone: styles.labelDefaults },
    { key: "stops", label: "stops if", items: reads.stopsIf, tone: styles.labelStops },
  ];
  const headingId = `${id}-agent-reads`;

  return (
    <section className={styles.agent} aria-labelledby={headingId}>
      <div className={styles.agentHead}>
        <h2 id={headingId} className={styles.overline}>
          What an agent reads
        </h2>
        <code className={styles.agentImport}>{importLine(id)}</code>
      </div>
      <dl className={styles.agentRows}>
        {rows.map((row) => (
          <div key={row.key} className={styles.agentRow}>
            <dt className={`${styles.agentLabel} ${row.tone}`}>{row.label}</dt>
            <dd className={styles.agentValue}>
              {row.items.length > 0 ? (
                <RuleList items={row.items} />
              ) : (
                <span className={styles.none}>Nothing extra in the contract.</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.agentNote}>
        From <code>contracts/{id}.json</code>: must is the a11y requirements, defaults the prop defaults, stops if the
        doNot rules where the agent asks instead of inventing a cousin.
      </p>
    </section>
  );
}

/**
 * Direction A component page: header from the contract, a preview stage with Preview / Code /
 * Contract, When to use, What an agent reads, then the component's own examples.
 */
export function ComponentPage({ id, children, footer }: { id: string; children: ReactNode; footer?: ReactNode }) {
  const name = componentLabel(id);
  const group = componentGroupOf(id);
  const status = contractStatus(id);
  const { use, avoid } = contractUseWhen(id);
  const crumbs = [
    { label: "Components", href: "/components" },
    ...(group ? [{ label: group, href: `/components?group=${encodeURIComponent(group)}` }] : []),
    { label: name },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumb items={crumbs} />
      <header className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.lede}>{contractIntent(id)}</p>
        <div className={styles.chips}>
          <Badge tone={status === "stable" ? "success" : "warning"} appearance="soft" size="sm">
            {status}
          </Badge>
          <Badge tone="neutral" appearance="soft" size="sm">
            {`contracts/${id}.json`}
          </Badge>
        </div>
      </header>

      <ComponentStage id={id} />

      {use.length > 0 || avoid.length > 0 ? (
        <div className={`layout-split ${styles.rules}`}>
          <section aria-labelledby={`${id}-use`}>
            <h2 id={`${id}-use`} className={styles.ruleTitle}>
              When to use
            </h2>
            <RuleList items={use} />
          </section>
          <section aria-labelledby={`${id}-avoid`}>
            <h2 id={`${id}-avoid`} className={styles.ruleTitle}>
              When not to use
            </h2>
            <RuleList items={avoid} />
          </section>
        </div>
      ) : null}

      <AgentReadsBlock id={id} />

      <section className={styles.examples} aria-labelledby={`${id}-examples`}>
        <h2 id={`${id}-examples`} className={styles.sectionTitle}>
          Examples
        </h2>
        <PreviewScope className={docStyles.examplesHost}>{children}</PreviewScope>
      </section>

      {footer}
    </div>
  );
}
