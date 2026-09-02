"use client";

import { useState } from "react";
import type { BreadcrumbItem } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { PageHeader } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const MASTER_TITLE = "Aurora";
const MASTER_SUBTITLE = "Campaign settings and collaborators.";

const MASTER_BREADCRUMBS: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Aurora" },
];

const COLLAPSED_BREADCRUMBS: BreadcrumbItem[] = [
  { label: "Home", href: "#" },
  { label: "Dashboard", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Campaigns", href: "#" },
  { label: "Aurora" },
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

function masterCode(showBreadcrumb: boolean, showActions: boolean): string {
  const lines = ["<PageHeader", `  title="${MASTER_TITLE}"`, `  subtitle="${MASTER_SUBTITLE}"`];
  if (showBreadcrumb) lines.push(`  breadcrumbs={${itemsCode(MASTER_BREADCRUMBS)}}`);
  if (showActions) {
    lines.push(
      "  actions={",
      "    <>",
      '      <Button variant="secondary">Edit</Button>',
      "      <Button>Save</Button>",
      "    </>",
      "  }",
    );
  }
  lines.push("/>");
  return lines.join("\n");
}

export function PageHeaderDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [showBreadcrumb, setShowBreadcrumb] = useState(true);
  const [showActions, setShowActions] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>PageHeader</h1>
        <p className={styles.lede}>
          Page title block. Optional Breadcrumb trail above. Actions are kit Buttons. One piece. Not
          a Breadcrumb cousin.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="pageheader-master">
        <div className={styles.masterHeader}>
          <h2 id="pageheader-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle the trail and actions. Title stays required. One primary action.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  <PageHeader
                    title={MASTER_TITLE}
                    subtitle={MASTER_SUBTITLE}
                    breadcrumbs={showBreadcrumb ? MASTER_BREADCRUMBS : undefined}
                    actions={
                      showActions ? (
                        <>
                          <Button variant="secondary">Edit</Button>
                          <Button>Save</Button>
                        </>
                      ) : undefined
                    }
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Structure</span>
                  <Switch
                    size="sm"
                    label="Breadcrumb"
                    checked={showBreadcrumb}
                    onChange={setShowBreadcrumb}
                  />
                  <Switch
                    size="sm"
                    label="Actions"
                    checked={showActions}
                    onChange={setShowActions}
                  />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose Breadcrumb for the path; keep one primary action. PageHeader is the title
                  block. Path-only still belongs on Breadcrumb alone.
                </p>
              </div>
              <CodeBlock code={masterCode(showBreadcrumb, showActions)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Title only</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <PageHeader title={MASTER_TITLE} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Title is the only required piece. Add a trail, subtitle, or actions when the page
                  needs them.
                </p>
              </div>
              <CodeBlock code={'<PageHeader title="Aurora" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Collapsed trail</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <PageHeader
                    title={MASTER_TITLE}
                    subtitle={MASTER_SUBTITLE}
                    breadcrumbs={COLLAPSED_BREADCRUMBS}
                    breadcrumbMaxItems={3}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass breadcrumbMaxItems through to Breadcrumb. Long trails collapse to the first
                  crumb, an ellipsis, then the last crumbs.
                </p>
              </div>
              <CodeBlock
                code={`<PageHeader
  title="Aurora"
  subtitle="Campaign settings and collaborators."
  breadcrumbMaxItems={3}
  breadcrumbs={[
    { label: "Home", href: "#" },
    { label: "Dashboard", href: "#" },
    { label: "Projects", href: "#" },
    { label: "Campaigns", href: "#" },
    { label: "Aurora" },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Slash separator</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <PageHeader
                    title={MASTER_TITLE}
                    breadcrumbs={MASTER_BREADCRUMBS}
                    breadcrumbSeparator="slash"
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  breadcrumbSeparator is passed through to Breadcrumb. Chevron is the default.
                </p>
              </div>
              <CodeBlock
                code={`<PageHeader
  title="Aurora"
  breadcrumbSeparator="slash"
  breadcrumbs={[{ label: "Home", href: "#" }, { label: "Projects", href: "#" }, { label: "Aurora" }]}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
