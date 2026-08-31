"use client";

import { useCallback, useEffect, useState } from "react";
import colorStyles from "./ColorFoundations.module.css";
import styles from "./GridFoundations.module.css";

type GridTab = "primitives" | "semantics";

const PATTERNS = [
  { name: "App shell", className: ".layout-app", copy: "Fixed product nav + fluid canvas. First layout every SaaS screen should use." },
  { name: "Canvas", className: ".layout-canvas", copy: "Header bar over a fill-height body. Lives inside the app shell canvas column." },
  { name: "Workspace", className: ".layout-workspace", copy: "Primary content + optional context rail (assistant, inspector, detail)." },
  { name: "Content", className: ".layout-content", copy: "Scrollable dashboard body. Stacks sections with space-gap-lg and page inset." },
  { name: "Metrics", className: ".layout-metrics", copy: "KPI / summary card strip. Use --fixed-3 or --fixed-4 when the count is known." },
  { name: "Header", className: ".layout-header", copy: "Title cluster + actions row for the canvas top bar." },
] as const;

const SHELL = [
  { name: "layout-sidebar", note: "14rem nav" },
  { name: "layout-rail", note: "22rem rail" },
  { name: "layout-metrics-min", note: "KPI min track" },
] as const;

const GUTTERS = ["sm", "md", "lg", "xl"] as const;
const MARGINS = ["sm", "md", "lg"] as const;
const CONTAINERS = [
  { className: "layout-container-sm", label: "sm · 640" },
  { className: "layout-container-md", label: "md · 1024" },
  { className: "layout-container-lg", label: "lg · 1280" },
  { className: "layout-container-xl", label: "xl · 1440" },
] as const;

const PRIMITIVES = [
  { title: "Columns", code: "grid-columns", tokens: [{ name: "grid-columns", note: "12" }] },
  {
    title: "Gutters",
    code: "grid-gutter-*",
    tokens: [
      { name: "grid-gutter-sm", note: "12px" },
      { name: "grid-gutter-md", note: "16px" },
      { name: "grid-gutter-lg", note: "24px" },
      { name: "grid-gutter-xl", note: "40px" },
    ],
  },
  {
    title: "Margins",
    code: "grid-margin-*",
    tokens: [
      { name: "grid-margin-sm", note: "16px" },
      { name: "grid-margin-md", note: "24px" },
      { name: "grid-margin-lg", note: "40px" },
    ],
  },
  {
    title: "Widths",
    code: "grid-width-*",
    tokens: [
      { name: "grid-width-sm", note: "640px" },
      { name: "grid-width-md", note: "1024px" },
      { name: "grid-width-lg", note: "1280px" },
      { name: "grid-width-xl", note: "1440px" },
    ],
  },
  {
    title: "Breakpoints",
    code: "grid-breakpoint-*",
    tokens: [
      { name: "grid-breakpoint-sm", note: "640px" },
      { name: "grid-breakpoint-md", note: "1024px" },
      { name: "grid-breakpoint-lg", note: "1280px" },
    ],
  },
] as const;

const SNIPPET = `<div className="layout-app">
  <aside>{/* AppNav */}</aside>
  <div className="layout-canvas">
    <header className="layout-header">…</header>
    <div className="layout-workspace">
      <main className="layout-content">
        <section className="layout-metrics layout-metrics--fixed-3">…</section>
        <section className="layout-split--primary">…</section>
      </main>
      <aside>{/* detail rail */}</aside>
    </div>
  </div>
</div>`;

function CopyCode({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [value]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button type="button" className={styles.token} onClick={onCopy} title={`Copy ${value}`}>
      {copied ? "Copied ✓" : value}
    </button>
  );
}

export function GridFoundations() {
  const [tab, setTab] = useState<GridTab>("semantics");

  return (
    <div className={colorStyles.colorSection}>
      <div className={colorStyles.tabList} role="tablist" aria-label="Grid systems views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "semantics"}
          className={`${colorStyles.tab} ${tab === "semantics" ? colorStyles.tabActive : ""}`}
          onClick={() => setTab("semantics")}
        >
          Semantics
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "primitives"}
          className={`${colorStyles.tab} ${tab === "primitives" ? colorStyles.tabActive : ""}`}
          onClick={() => setTab("primitives")}
        >
          Primitives
        </button>
      </div>

      <p className={colorStyles.lead}>
        SaaS layout patterns first - app shell, canvas, workspace, metrics, and content splits.
        Primitives stay available as the source scale.
      </p>

      {tab === "semantics" ? (
        <div className={styles.sections}>
          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>SaaS composition</h3>
              <code className={colorStyles.huePattern}>app → canvas → workspace → content</code>
            </div>
            <p className={styles.note}>
              Build product screens from these patterns instead of inventing per-page grids. The
              kit dashboard pattern uses this stack.
            </p>
            <div className={styles.map} aria-hidden="true">
              <div className={styles.mapApp}>
                <div className={styles.mapNav}>Nav</div>
                <div className={styles.mapCanvas}>
                  <div className={styles.mapHeader}>Header</div>
                  <div className={styles.mapWorkspace}>
                    <div className={styles.mapMain}>
                      <div className={styles.mapMetrics}>
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className={styles.mapSplit}>
                        <span>Main</span>
                        <span>Aside</span>
                      </div>
                    </div>
                    <div className={styles.mapRail}>Rail</div>
                  </div>
                </div>
              </div>
            </div>
            <pre className={styles.code}>
              <code>{SNIPPET}</code>
            </pre>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>Patterns</h3>
              <code className={colorStyles.huePattern}>.layout-*</code>
            </div>
            <div className={styles.patternList}>
              {PATTERNS.map((item) => (
                <article key={item.name} className={styles.patternCard}>
                  <header className={styles.patternHead}>
                    <h4 className={styles.patternName}>{item.name}</h4>
                    <CopyCode value={item.className} />
                  </header>
                  <p className={styles.note}>{item.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>Metrics</h3>
              <code className={colorStyles.huePattern}>.layout-metrics</code>
            </div>
            <p className={styles.note}>
              Dashboard KPI rows. Fixed variants keep equal columns; the default auto-fits from{" "}
              <code>--layout-metrics-min</code>.
            </p>
            <div className={`layout-metrics layout-metrics--fixed-3 ${styles.demoSplit}`}>
              {["Users", "Conversion", "Open tasks"].map((label) => (
                <div key={label} className={styles.demoCell}>
                  {label}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>Content splits</h3>
              <code className={colorStyles.huePattern}>.layout-split*</code>
            </div>
            <p className={styles.note}>
              Panels inside <code>.layout-content</code>. Primary is the default table + activity
              layout.
            </p>
            <div className={styles.demoStack}>
              <div className={styles.demoRow}>
                <code className={styles.demoLabel}>.layout-split--primary</code>
                <div className={`layout-split--primary ${styles.demoSplit}`}>
                  <div className={styles.demoCell}>Main · table</div>
                  <div className={styles.demoCell}>Aside · feed</div>
                </div>
              </div>
              <div className={styles.demoRow}>
                <code className={styles.demoLabel}>.layout-split</code>
                <div className={`layout-split ${styles.demoSplit}`}>
                  <div className={styles.demoCell}>Half</div>
                  <div className={styles.demoCell}>Half</div>
                </div>
              </div>
              <div className={styles.demoRow}>
                <code className={styles.demoLabel}>.layout-split--thirds</code>
                <div className={`layout-split--thirds ${styles.demoSplit}`}>
                  <div className={styles.demoCell}>1</div>
                  <div className={styles.demoCell}>2</div>
                  <div className={styles.demoCell}>3</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>App shell</h3>
              <code className={colorStyles.huePattern}>layout-sidebar · layout-rail</code>
            </div>
            <div className={styles.list}>
              {SHELL.map((item) => (
                <div key={item.name} className={styles.rowNote}>
                  <CopyCode value={item.name} />
                  <span className={styles.px}>{item.note}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>Gutter</h3>
              <code className={colorStyles.huePattern}>layout-gutter-*</code>
            </div>
            <div className={styles.list}>
              {GUTTERS.map((step) => {
                const token = `layout-gutter-${step}`;
                return (
                  <div key={token} className={styles.row}>
                    <CopyCode value={token} />
                    <div className={styles.track}>
                      <div className={styles.bar} style={{ width: `var(--${token})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>Margin</h3>
              <code className={colorStyles.huePattern}>layout-margin-*</code>
            </div>
            <div className={styles.list}>
              {MARGINS.map((step) => {
                const token = `layout-margin-${step}`;
                return (
                  <div key={token} className={styles.row}>
                    <CopyCode value={token} />
                    <div className={styles.track}>
                      <div className={styles.bar} style={{ width: `var(--${token})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.scale}>
            <div className={colorStyles.hueHeader}>
              <h3 className={styles.title}>Containers</h3>
              <code className={colorStyles.huePattern}>.layout-container-*</code>
            </div>
            <p className={styles.note}>
              Centered max-width shells for docs and marketing. Prefer the SaaS patterns above for
              product UI.
            </p>
            <div className={styles.demoStack}>
              {CONTAINERS.map((item) => (
                <div key={item.className} className={styles.demoRow}>
                  <CopyCode value={`.${item.className}`} />
                  <div className={styles.containerTrack}>
                    <div className={`${styles.containerBox} ${item.className}`}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.sections}>
          {PRIMITIVES.map((family) => (
            <section key={family.title} className={styles.scale}>
              <div className={colorStyles.hueHeader}>
                <h3 className={styles.title}>{family.title}</h3>
                <code className={colorStyles.huePattern}>{family.code}</code>
              </div>
              <div className={styles.list}>
                {family.tokens.map((token) => (
                  <div key={token.name} className={styles.rowNote}>
                    <CopyCode value={`--${token.name}`} />
                    <span className={styles.px}>{token.note}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
