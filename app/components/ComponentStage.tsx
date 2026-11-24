"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button, CodeSnippet, Drawer, SegmentedControl, Tabs } from "agentic-ds-kit";
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
 * `aside[aria-label="Controls"]`) hides behind a toggle in the canvas corner and opens in a kit
 * Drawer from the bottom; wide screens ignore the toggle and show the panel in its own column.
 * The doc owns the panel, so while the Drawer is open the panel's node is moved into the Drawer
 * body and put back in place when it closes.
 */
function ControlsHost({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hasControls, setHasControls] = useState(false);
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  // Docs mount their panel on the client, so watch the subtree instead of checking once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const check = () => {
      if (!host.querySelector('aside[aria-label="Controls"]')) return;
      setHasControls(true);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Lend the doc's panel to the Drawer body while it is open.
  useEffect(() => {
    const host = hostRef.current;
    if (!open || !slot || !host) return undefined;
    const panel = host.querySelector<HTMLElement>('aside[aria-label="Controls"]');
    const home = panel?.parentNode;
    if (!panel || !home) return undefined;
    const next = panel.nextSibling;
    slot.appendChild(panel);
    return () => {
      if (home.isConnected) home.insertBefore(panel, next && next.parentNode === home ? next : null);
    };
  }, [open, slot]);

  // Back to wide: the panel has its own column again, so the Drawer closes.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 860.02px)");
    const close = () => {
      if (wide.matches) setOpen(false);
    };
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);

  return (
    <div ref={hostRef} className={docStyles.controlsHost}>
      {hasControls ? (
        <Button
          size="md"
          appearance="outline"
          mode="neutral"
          className={docStyles.controlsToggle}
          iconStart="SlidersHorizontal"
          ariaLabel="Show controls"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        />
      ) : null}
      {children}
      <Drawer open={open} side="bottom" title="Controls" onClose={() => setOpen(false)}>
        <div ref={setSlot} className={docStyles.controlsDrawer} />
      </Drawer>
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
