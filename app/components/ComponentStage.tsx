"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button, CodeSnippet, SegmentedControl, Tabs } from "agentic-ds-kit";
import {
  componentPrompt,
  contractJson,
  contractSnippet,
  importLine,
  variantProps,
} from "@/lib/component-contract";
import { readPatternTheme, subscribeTheme } from "@/lib/theme-store";
import { PRESETS, clampRadius, type ThemeState } from "@/lib/theme-playground";
import { PreviewScope } from "../_components/ThemeScope";
import { CopyPromptBar } from "../_components/CopyPromptBar";
import { useCustomizeOpen } from "../_components/useCustomizeOpen";
import { GalleryPreview } from "./GalleryPreview";
import { DocViewProvider } from "./DocView";
import { VariantGrid } from "./VariantGrid";
import docStyles from "./ComponentDoc.module.css";
import styles from "./ComponentPage.module.css";

type StageTab = "preview" | "variants" | "code" | "contract";

function themeLabel(theme: ThemeState): string {
  const preset = PRESETS.find((item) => item.id === theme.preset)?.label ?? "Custom";
  const shadow = theme.shadowPreset === "none" || theme.shadowPreset === "flat" ? "Flat" : theme.shadowPreset === "subtle" ? "Soft" : "Raised";
  return `${preset} · r${clampRadius(theme.radius)} · ${shadow}${theme.mode === "dark" ? " · Dark" : ""}`;
}

function StageThemeLabel() {
  const theme = useSyncExternalStore(subscribeTheme, readPatternTheme, () => null);
  if (!theme || theme.preset === "nistha") return null;
  return <p className={styles.themeLabel}>{themeLabel(theme)}</p>;
}

function CopyPrompt({ id }: { id: string }) {
  const pathname = usePathname();
  const customize = useCustomizeOpen(pathname);
  // One solid primary per view: while the docked Theme panel shows its own, this one steps back.
  return (
    <CopyPromptBar
      prompt={componentPrompt(id, "claude-code")}
      cursorPrompt={componentPrompt(id, "cursor")}
      solid={!customize.docked}
    />
  );
}

/**
 * Wraps a doc's master render. On small screens its Controls panel (the doc's
 * `aside[aria-label="Controls"]`) folds behind a toggle in the canvas corner; wide screens ignore it.
 */
function ControlsHost({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hasControls, setHasControls] = useState(false);
  const [open, setOpen] = useState(false);

  // Docs mount their panel on the client, so watch the subtree instead of checking once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const check = () => setHasControls(Boolean(host.querySelector('aside[aria-label="Controls"]')));
    check();
    const observer = new MutationObserver(check);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={docStyles.controlsHost} data-controls-open={open ? "" : undefined}>
      {hasControls ? (
        <Button
          size="md"
          appearance={open ? "soft" : "outline"}
          mode="neutral"
          className={docStyles.controlsToggle}
          iconStart={open ? "X" : "SlidersHorizontal"}
          ariaLabel={open ? "Hide controls" : "Show controls"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        />
      ) : null}
      {children}
    </div>
  );
}

const VIEW_ICONS: Record<StageTab, string> = {
  preview: "Eye",
  variants: "LayoutGrid",
  code: "Code",
  contract: "FileJson",
};

/**
 * Preview / Variants / Code / Contract for one component, plus the Copy prompt row (open in Claude, ChatGPT, Cursor, v0; MCP; Copy).
 * `doc` is the component's own doc: Preview shows its master render, Variants its variant
 * sections (VariantGrid), so both tabs show the component the same way.
 */
export function ComponentStage({ id, doc }: { id: string; doc?: ReactNode }) {
  const [tab, setTab] = useState<StageTab>("preview");
  const propsForChips = useMemo(() => variantProps(id), [id]);
  const snippet = contractSnippet(id);
  const code = snippet ? `${importLine(id)}\n\n${snippet}` : importLine(id);

  const items = [
    {
      id: "preview",
      label: "Preview",
      content: doc ? (
        // The doc's own master render, the same view the Variants tab uses.
        <PreviewScope className={`${docStyles.examplesHost} ${docStyles.previewHost}`}>
          <StageThemeLabel />
          <ControlsHost>
            <DocViewProvider mode="preview">{doc}</DocViewProvider>
          </ControlsHost>
        </PreviewScope>
      ) : (
        <PreviewScope className={styles.stage}>
          <StageThemeLabel />
          <div className={styles.stageInner}>
            <GalleryPreview id={id} />
          </div>
        </PreviewScope>
      ),
    },
    ...(doc
      ? [
          {
            id: "variants",
            label: "Variants",
            content: (
              <PreviewScope className={`${docStyles.examplesHost} ${docStyles.variantsHost} ${styles.variants}`}>
                <VariantGrid props={propsForChips}>{doc}</VariantGrid>
              </PreviewScope>
            ),
          },
        ]
      : []),
    {
      id: "code",
      label: "Code",
      content: <CodeSnippet code={code} language="tsx" title={`${id}.tsx`} wrap />,
    },
    {
      id: "contract",
      label: "Contract",
      content: (
        <CodeSnippet code={contractJson(id)} language="json" title={`contracts/${id}.json`} maxHeight="24rem" />
      ),
    },
  ];

  return (
    <section className={styles.stageWrap} aria-label="Preview">
      {/* Wide: Copy sits at the right end of the tab row. Narrow: the views become icon segments
          so they and the Copy split button share one row above the stage. */}
      <div className={styles.stageBar}>
        <div className={styles.viewPicker}>
          <SegmentedControl
            ariaLabel="Preview, variants, code or contract"
            size="md"
            value={tab}
            onChange={(value) => setTab(value as StageTab)}
            items={items.map((item) => ({
              value: item.id,
              label: item.label,
              icon: VIEW_ICONS[item.id as StageTab],
            }))}
          />
        </div>
        <CopyPrompt id={id} />
      </div>
      {/* Same tab bar as the rest of the site: kit Tabs, segmented, sm. */}
      <Tabs
        className={styles.tabs}
        variant="segmented"
        size="sm"
        ariaLabel="Preview, variants, code or contract"
        value={tab}
        onChange={(value) => setTab(value as StageTab)}
        items={items}
      />
    </section>
  );
}
