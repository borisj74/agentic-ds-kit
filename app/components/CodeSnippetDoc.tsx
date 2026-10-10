"use client";

import { useState } from "react";
import { CodeSnippet } from "agentic-ds-kit";
import type { CodeSnippetTab } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SAMPLE = `import { Button, Card } from "agentic-ds-kit";

export function Welcome({ name }: { name: string }) {
  return (
    <Card title={\`Welcome back, \${name}\`} description="Pick up where you left off, or start a new project from one of the templates below.">
      <Button variant="primary">New project</Button>
    </Card>
  );
}`;

const INSTALL_TABS: CodeSnippetTab[] = [
  { label: "npm", code: "npm install agentic-ds-kit", language: "bash" },
  { label: "pnpm", code: "pnpm add agentic-ds-kit", language: "bash" },
  { label: "yarn", code: "yarn add agentic-ds-kit", language: "bash" },
];

const PREVIEW_TABS: CodeSnippetTab[] = [
  { label: "Welcome.tsx", code: SAMPLE, language: "tsx" },
  { label: "tokens.css", code: '@import "agentic-ds-kit/tokens.css";', language: "css" },
];

const LONG_LINE =
  'curl -X POST https://api.example.com/v1/projects -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d \'{"name":"Launch brief","owner":"ada"}\'';

const MANY_LINES = Array.from({ length: 30 }, (_, index) => `  "item-${index + 1}": "value ${index + 1}",`).join("\n");

function masterCode(withTabs: boolean, withTitle: boolean, lineNumbers: boolean, wrap: boolean) {
  const attrs: string[] = [];
  if (withTabs) {
    attrs.push(
      'tabs={[\n    { label: "Welcome.tsx", code: welcome, language: "tsx" },\n    { label: "tokens.css", code: tokens, language: "css" },\n  ]}',
    );
  } else {
    attrs.push("code={welcome}", 'language="tsx"');
  }
  if (withTitle) attrs.push('title="Welcome.tsx"');
  if (lineNumbers) attrs.push("showLineNumbers");
  if (wrap) attrs.push("wrap");
  return ["<CodeSnippet", ...attrs.map((attr) => `  ${attr}`), "/>"].join("\n");
}

export function CodeSnippetDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [withTabs, setWithTabs] = useState(true);
  const [withTitle, setWithTitle] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wrap, setWrap] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>CodeSnippet</h1>
        <p className={styles.lede}>
          Read-only code with a copy button. Optional title, language label, tabs, and line numbers. No syntax
          highlighting, so it adds no dependency.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="codesnippet-master">
        <div className={styles.masterHeader}>
          <h2 id="codesnippet-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Toggle tabs, title, line numbers, and wrapping.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill}>
                  {withTabs ? (
                    <CodeSnippet
                      tabs={PREVIEW_TABS}
                      title={withTitle ? "Welcome.tsx" : undefined}
                      showLineNumbers={lineNumbers}
                      wrap={wrap}
                    />
                  ) : (
                    <CodeSnippet
                      code={SAMPLE}
                      language="tsx"
                      title={withTitle ? "Welcome.tsx" : undefined}
                      showLineNumbers={lineNumbers}
                      wrap={wrap}
                    />
                  )}
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Options</span>
                  <Switch label="Tabs" size="sm" checked={withTabs} onChange={setWithTabs} />
                  <Switch label="Title" size="sm" checked={withTitle} onChange={setWithTitle} />
                  <Switch label="Line numbers" size="sm" checked={lineNumbers} onChange={setLineNumbers} />
                  <Switch label="Wrap" size="sm" checked={wrap} onChange={setWrap} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Copy writes the raw code string, never the line numbers. With tabs, the title only names the code
                  region; the tab labels are the visible header. Language is a label, not highlighting. The code
                  region takes keyboard focus only when it scrolls.
                </p>
              </div>
              <CodeBlock code={masterCode(withTabs, withTitle, lineNumbers, wrap)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Bare</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <CodeSnippet code="npm install agentic-ds-kit" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  No title, tabs, or language: no header, and Copy floats in the corner. These docs render every
                  code sample this way.
                </p>
              </div>
              <CodeBlock code={'<CodeSnippet code="npm install agentic-ds-kit" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Title and language</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <CodeSnippet title="app/layout.tsx" language="tsx" code={'import "agentic-ds-kit/tokens.css";'} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>A filename in the header names the code region for screen readers.</p>
              </div>
              <CodeBlock
                code={`<CodeSnippet
  title="app/layout.tsx"
  language="tsx"
  code={'import "agentic-ds-kit/tokens.css";'}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Tabs</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <CodeSnippet tabs={INSTALL_TABS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Variants of one snippet. Kit Tabs (line, sm) sit on the header line; arrow keys move between them.
                </p>
              </div>
              <CodeBlock
                code={`<CodeSnippet
  tabs={[
    { label: "npm", code: "npm install agentic-ds-kit", language: "bash" },
    { label: "pnpm", code: "pnpm add agentic-ds-kit", language: "bash" },
    { label: "yarn", code: "yarn add agentic-ds-kit", language: "bash" },
  ]}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Long lines</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewStack}>
                  <CodeSnippet language="bash" code={LONG_LINE} />
                  <CodeSnippet language="bash" code={LONG_LINE} wrap />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Default scrolls sideways and keeps lines intact (best for commands). wrap breaks long lines (best
                  for prose-like config).
                </p>
              </div>
              <CodeBlock code={['<CodeSnippet language="bash" code={command} />', '<CodeSnippet language="bash" code={command} wrap />'].join("\n")} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Max height and line numbers</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <CodeSnippet title="config.json" language="json" code={`{\n${MANY_LINES}\n}`} showLineNumbers maxHeight="16rem" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  maxHeight scrolls inside. Line numbers are decorative: hidden from screen readers, not selectable,
                  not copied.
                </p>
              </div>
              <CodeBlock code={'<CodeSnippet title="config.json" language="json" code={json} showLineNumbers maxHeight="16rem" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
