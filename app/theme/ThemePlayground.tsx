"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, CodeSnippet, Section, SegmentedControl } from "agentic-ds-kit";
import { ensureThemeSnapshot, subscribeTheme } from "@/lib/theme-store";
import {
  DEFAULT_THEME,
  contrastReport,
  exportCss,
  exportDesign,
  exportTokens,
} from "@/lib/theme-playground";
import { ThemeScope } from "../_components/ThemeScope";
import { ContrastList } from "./ContrastList";
import { ThemeControls } from "./ThemeControls";
import { ThemePatternPreview, type ThemePatternId } from "./ThemePatternPreview";
import styles from "./theme.module.css";

const PATTERNS: { value: ThemePatternId; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "list", label: "List" },
  { value: "settings", label: "Settings" },
];

function download(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copy(contents: string) {
  await navigator.clipboard.writeText(contents);
}

export function ThemePlayground() {
  const state = useSyncExternalStore(subscribeTheme, ensureThemeSnapshot, () => DEFAULT_THEME);
  const [pattern, setPattern] = useState<ThemePatternId>("dashboard");
  const cssExport = useMemo(() => exportCss(state), [state]);
  const jsonExport = useMemo(() => exportTokens(state), [state]);
  const designExport = useMemo(() => exportDesign(state), [state]);
  const pairs = useMemo(() => contrastReport(state), [state]);

  return (
    <div className={`layout-content ${styles.page}`}>
      <header className={styles.stack}>
        <h1 className={styles.title}>Theme</h1>
        <p className={styles.lead}>
          The same controls live in the header Theme panel. Changes stay inside the preview. The docs chrome keeps its own tokens.
        </p>
      </header>
      <div className={styles.workspace}>
        <div className={styles.controlsColumn}>
          <ThemeControls />
        </div>
        <div className={styles.previewColumn}>
          <SegmentedControl
            ariaLabel="Preview pattern"
            size="sm"
            value={pattern}
            onChange={(value) => setPattern(value as ThemePatternId)}
            items={PATTERNS}
          />
          <ThemeScope theme={state} className={styles.stage}>
            <ThemePatternPreview pattern={pattern} />
          </ThemeScope>
          <ContrastList pairs={pairs} />
        </div>
      </div>
      <Section title="Export" description="Overrides only. Load them after tokens.css." size="sm">
        <div className={styles.stack}>
          <CodeSnippet
            title="Theme export"
            maxHeight="20rem"
            tabs={[
              { label: "tokens-override.css", language: "css", code: cssExport },
              { label: "tokens.json", language: "json", code: jsonExport },
              { label: "DESIGN.md", language: "markdown", code: designExport },
            ]}
          />
          <div className={styles.exports}>
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={() => void copy(cssExport)}>
              Copy CSS
            </Button>
            <Button
              appearance="outline"
              mode="neutral"
              size="sm"
              iconStart="Download"
              onClick={() => download("tokens-override.css", cssExport, "text/css")}
            >
              Download CSS
            </Button>
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={() => void copy(jsonExport)}>
              Copy JSON
            </Button>
            <Button
              appearance="outline"
              mode="neutral"
              size="sm"
              iconStart="Download"
              onClick={() => download("tokens.json", jsonExport, "application/json")}
            >
              Download JSON
            </Button>
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={() => void copy(designExport)}>
              Copy DESIGN.md
            </Button>
            <Button
              appearance="outline"
              mode="neutral"
              size="sm"
              iconStart="Download"
              onClick={() => download("DESIGN.md", designExport, "text/markdown")}
            >
              Download DESIGN.md
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
