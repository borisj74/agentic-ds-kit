"use client";

import Link from "next/link";
import { Badge, Breadcrumb } from "agentic-ds-kit";
import { BlockPreview } from "../_components/BlockPreview";
import { CodeBlock } from "../components/CodeBlock";
import { DocPageExtras } from "../components/DocPageExtras";
import { blockPrompt } from "@/lib/pattern-prompt";
import { blockDoc } from "@/lib/blocks";
import { componentLabel } from "@/lib/playground-nav";
import styles from "../patterns/patterns.module.css";
import playground from "../playground.module.css";

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
export function BlockView({ slug }: { slug: string }) {
  const doc = blockDoc(slug);
  if (!doc) return null;
  const { label: title, name, contract, lead, usage } = doc;
  const importLine = `import { ${name} } from "agentic-ds-kit";`;

  return (
    <div className={playground.page}>
      <article className={styles.article}>
        <Breadcrumb items={[{ label: "Blocks", href: "/blocks" }, { label: title }]} />
        <Badge size="sm" tone="neutral" className={playground.screenTag}>
          {contract.category}
        </Badge>
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
