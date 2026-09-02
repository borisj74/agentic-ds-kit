"use client";

import { useState } from "react";
import { Avatar } from "agentic-ds-kit";
import { AppHeader } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import demo from "./AppHeaderDoc.module.css";
import { DocTabList } from "./DocTabList";

function masterCode(showSearch: boolean, showActions: boolean, shortcut: boolean): string {
  const lines = ['<AppHeader', '  title="Acme"', '  mark="A"'];
  if (!showSearch) lines.push("  search={false}");
  if (showSearch) {
    lines.push('  searchPlaceholder="Search"');
    if (shortcut) lines.push('  searchShortcut="⌘K"');
  }
  if (showActions) {
    lines.push(
      "  actions={",
      "    <>",
      '      <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />',
      '      <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />',
      "    </>",
      "  }",
    );
  }
  lines.push("/>");
  return lines.join("\n");
}

function DemoActions() {
  return (
    <>
      <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />
      <Button variant="tertiary" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
    </>
  );
}

export function AppHeaderDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [showSearch, setShowSearch] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const [shortcut, setShortcut] = useState(true);
  const [query, setQuery] = useState("");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>AppHeader</h1>
        <p className={styles.lede}>
          Product top chrome. Letter mark or a logo slot on the start, kit Input search in the
          center, kit Buttons on the end. Not PageHeader. Not AppNav.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="appheader-master">
        <div className={styles.masterHeader}>
          <h2 id="appheader-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Full-bleed bar. Default mark is a letter, same idea as SideNav. Search is kit Input.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={demo.canvas}>
                <div className={demo.bar}>
                  <AppHeader
                    title="Acme"
                    mark="A"
                    search={showSearch}
                    searchPlaceholder="Search"
                    searchShortcut={shortcut ? "⌘K" : undefined}
                    searchValue={query}
                    onSearch={setQuery}
                    actions={showActions ? <DemoActions /> : undefined}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Structure</span>
                  <Switch size="sm" label="Search" checked={showSearch} onChange={setShowSearch} />
                  <Switch size="sm" label="Shortcut" checked={shortcut} onChange={setShortcut} />
                  <Switch size="sm" label="Actions" checked={showActions} onChange={setShowActions} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for the product shell top bar. Pass logo for a custom mark — do not bake a
                  brand SVG into the kit. Page titles stay on PageHeader. Sidebars stay on SideNav
                  or AppNav.
                </p>
              </div>
              <CodeBlock code={masterCode(showSearch, showActions, shortcut)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Logo slot</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.bar}>
                  <AppHeader
                    title="Northwind"
                    logo={<span className={demo.wordmark} aria-hidden>N</span>}
                    searchPlaceholder="Search"
                    searchShortcut="⌘K"
                    actions={<DemoActions />}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  logo replaces the default letter mark. Consumers pass their own mark. Title still
                  sits beside it.
                </p>
              </div>
              <CodeBlock
                code={`<AppHeader
  title="Northwind"
  logo={<YourMark />}
  searchPlaceholder="Search"
  actions={<>…</>}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With Avatar</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.bar}>
                  <AppHeader
                    title="Acme"
                    mark="A"
                    searchPlaceholder="Search"
                    actions={
                      <>
                        <DemoActions />
                        <Avatar name="Maya Chen" size="sm" />
                      </>
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Identity is kit Avatar in the actions slot. Do not invent a UserMenu cousin.
                </p>
              </div>
              <CodeBlock
                code={`<AppHeader
  title="Acme"
  mark="A"
  actions={
    <>
      <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />
      <Avatar name="Maya Chen" size="sm" />
    </>
  }
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Search off</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.bar}>
                  <AppHeader title="Acme" mark="A" search={false} actions={<DemoActions />} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Hide search when the shell has no global query. Do not replace it with a local
                  SearchBar.
                </p>
              </div>
              <CodeBlock code={'<AppHeader title="Acme" mark="A" search={false} actions={<>…</>} />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Rounded</h2>
              <div className={demo.exampleCanvas}>
                <AppHeader
                  title="Acme"
                  mark="A"
                  radius="md"
                  searchPlaceholder="Search"
                  searchShortcut="⌘K"
                  actions={<DemoActions />}
                />
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  radius="md" is radius-surface-md for an inset floating bar. Default none is a
                  flush full-bleed bar.
                </p>
              </div>
              <CodeBlock
                code={'<AppHeader title="Acme" mark="A" radius="md" searchPlaceholder="Search" />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
