"use client";

import { useState } from "react";
import { Breadcrumb } from "@/ui/Breadcrumb";
import type { BreadcrumbItem, BreadcrumbSeparator } from "@/ui/Breadcrumb";
import { PageHeader } from "@/ui/PageHeader";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SEPARATORS: BreadcrumbSeparator[] = ["chevron", "slash"];

const BASIC_ITEMS: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Components", href: "#" },
  { label: "Breadcrumb" },
];

const COLLAPSED_ITEMS: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Dashboard", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Aurora", href: "#" },
  { label: "Settings" },
];

const SIX_ITEMS: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Dashboard", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Aurora", href: "#" },
  { label: "Team", href: "#" },
  { label: "Settings" },
];

function itemsCode(items: BreadcrumbItem[]): string {
  const inner = items
    .map((item) =>
      item.href
        ? `{ label: "${item.label}", href: "${item.href}" }`
        : `{ label: "${item.label}" }`,
    )
    .join(", ");
  return `[${inner}]`;
}

function masterCode(separator: BreadcrumbSeparator, collapsed: boolean): string {
  const items = collapsed ? COLLAPSED_ITEMS : BASIC_ITEMS;
  const lines = ["<Breadcrumb", `  items={${itemsCode(items)}}`];
  if (separator !== "chevron") lines.push(`  separator="${separator}"`);
  if (collapsed) lines.push("  maxItems={3}");
  lines.push("/>");
  return lines.join("\n");
}

export function BreadcrumbDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [separator, setSeparator] = useState<BreadcrumbSeparator>("chevron");
  const [collapsed, setCollapsed] = useState(false);
  const items = collapsed ? COLLAPSED_ITEMS : BASIC_ITEMS;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Breadcrumb</h1>
        <p className={styles.lede}>Path of links. Not PageHeader. Not AppNav.</p>
      </header>

      <section className={styles.master} aria-labelledby="breadcrumb-master">
        <div className={styles.masterHeader}>
          <h2 id="breadcrumb-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle separator and collapsed trail. Current page is never a link. Ellipsis is visual only.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Breadcrumb
                    items={items}
                    separator={separator}
                    maxItems={collapsed ? 3 : undefined}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Separator</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Separator">
                    {SEPARATORS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${separator === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={separator === option}
                        onClick={() => setSeparator(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Trail</span>
                  <Switch label="Collapsed" size="sm" checked={collapsed} onChange={setCollapsed} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Breadcrumb for the path to this page. PageHeader for the title block. AppNav for the
                  sidebar. Last crumb is the current page and is not a link.
                </p>
              </div>
              <CodeBlock code={masterCode(separator, collapsed)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Basic</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Breadcrumb items={BASIC_ITEMS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Three crumbs with the default chevron. Ancestors link; the current page does not.
                </p>
              </div>
              <CodeBlock
                code={'<Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Components", href: "#" }, { label: "Breadcrumb" }]} />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Slash</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Breadcrumb items={BASIC_ITEMS} separator="slash" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use separator slash when the trail should read as a path, not a chevron sequence.
                </p>
              </div>
              <CodeBlock
                code={'<Breadcrumb separator="slash" items={[{ label: "Home", href: "#" }, { label: "Components", href: "#" }, { label: "Breadcrumb" }]} />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Collapsed</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Breadcrumb items={SIX_ITEMS} maxItems={4} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  When the trail is long, maxItems shows the first crumb, an ellipsis, then the last
                  crumbs. The ellipsis is visual only — not a menu.
                </p>
              </div>
              <CodeBlock
                code={`<Breadcrumb
  maxItems={4}
  items={[
    { label: "Home", href: "#" },
    { label: "Dashboard", href: "#" },
    { label: "Projects", href: "#" },
    { label: "Aurora", href: "#" },
    { label: "Team", href: "#" },
    { label: "Settings" },
  ]}
/>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With PageHeader</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <Breadcrumb items={BASIC_ITEMS} />
                  <PageHeader title="Breadcrumb" subtitle="Path to this page" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Sit Breadcrumb above PageHeader. Do not bake crumbs into the title block.
                </p>
              </div>
              <CodeBlock
                code={`<>
  <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Components", href: "#" }, { label: "Breadcrumb" }]} />
  <PageHeader title="Breadcrumb" subtitle="Path to this page" />
</>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
