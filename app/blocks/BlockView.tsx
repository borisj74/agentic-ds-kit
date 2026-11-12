"use client";

import Link from "next/link";
import { Breadcrumb } from "agentic-ds-kit";
import { BlockPreview } from "../_components/BlockPreview";
import { CodeBlock } from "../components/CodeBlock";
import { DocPageExtras } from "../components/DocPageExtras";
import { blockPrompt } from "@/lib/pattern-prompt";
import { BLOCK_ITEMS, componentLabel, type BlockSlug } from "@/lib/playground-nav";
import missionHome from "../../packages/kit/contracts/missionhome.json";
import styles from "../patterns/patterns.module.css";
import playground from "../playground.module.css";

interface BlockContract {
  id: string;
  kind: string;
  intent: string;
  useWhen: string[];
  doNotUseWhen: string[];
  contains: string[];
  layout?: string[];
  doNot: string[];
  snippet: string;
}

interface BlockDoc {
  name: string;
  contract: BlockContract;
  lead: string;
  usage: string;
}

const BLOCKS: Record<BlockSlug, BlockDoc> = {
  "mission-home": {
    name: "MissionHome",
    contract: missionHome,
    lead:
      "The first screen of an agent workspace. It says what changed since your last visit, lays every agent on one time axis, and lists what waits on you. One filter drives all three.",
    usage: `import { MissionHome } from "agentic-ds-kit";

export function Home({ agents, events, lastVisit }) {
  return (
    <main className="layout-content">
      <MissionHome
        agents={agents}          // { id, name, model?, icon? }[]
        events={events}          // AgentLanes tasks, plus action? and risk? for approvals
        since={lastVisit}        // epoch ms
        defaultFilter="all"      // or filter + onFilterChange
        onApprove={(id) => approve(id)}
        onReject={(id) => reject(id)}
        onRetry={(id) => retry(id)}
      />
    </main>
  );
}`,
  },
};

function List({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** A block's page: preview, when to use it, usage, props and what it is built from. */
export function BlockView({ slug }: { slug: BlockSlug }) {
  const title = BLOCK_ITEMS.find((item) => item.slug === slug)?.label ?? "Block";
  const { name, contract, lead, usage } = BLOCKS[slug];
  const importLine = `import { ${name} } from "agentic-ds-kit";`;

  return (
    <div className={playground.page}>
      <article className={styles.article}>
        <Breadcrumb items={[{ label: "Blocks" }, { label: title }]} />
        <h1 className={playground.pageTitle}>{title}</h1>
        <p className={playground.pageLead}>{lead}</p>

        <div className={styles.previewAnchor}>
          <BlockPreview
            slug={slug}
            title={title}
            importLine={importLine}
            usage={usage}
            contract={JSON.stringify(contract, null, 2)}
            prompt={blockPrompt(name, contract, "default")}
            cursorPrompt={blockPrompt(name, contract, "cursor")}
          />
        </div>

        <section className={styles.section} aria-labelledby={`${slug}-what`}>
          <h2 id={`${slug}-what`} className={styles.sectionTitle}>
            What a block is
          </h2>
          <p className={playground.body}>
            A block is a kit component for a whole area of a screen, built only from other kit components and tokens. You
            import it like any component; nothing is copied into your app. Put it inside your page&rsquo;s{" "}
            <code>&lt;main&gt;</code>: it brings no header or nav of its own.
          </p>
        </section>

        <section className={styles.section} aria-labelledby={`${slug}-when`}>
          <h2 id={`${slug}-when`} className={styles.sectionTitle}>
            When to use
          </h2>
          <List items={contract.useWhen} />
        </section>

        <section className={styles.section} aria-labelledby={`${slug}-not`}>
          <h2 id={`${slug}-not`} className={styles.sectionTitle}>
            When not to use
          </h2>
          <List items={contract.doNotUseWhen} />
        </section>

        <section className={styles.section} aria-labelledby={`${slug}-usage`}>
          <h2 id={`${slug}-usage`} className={styles.sectionTitle}>
            Usage
          </h2>
          <CodeBlock code={usage} />
        </section>

        {contract.layout?.length ? (
          <section className={styles.section} aria-labelledby={`${slug}-layout`}>
            <h2 id={`${slug}-layout`} className={styles.sectionTitle}>
              Layout
            </h2>
            <List items={contract.layout} />
          </section>
        ) : null}

        <DocPageExtras slug={contract.id} />

        <section className={styles.section} aria-labelledby={`${slug}-built`}>
          <h2 id={`${slug}-built`} className={styles.sectionTitle}>
            Built from
          </h2>
          <ul className={styles.chips}>
            {contract.contains.map((id) => (
              <li key={id}>
                <Link href={`/components/${id}`} className={styles.chip}>
                  {componentLabel(id)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
