"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button, CodeSnippet, SegmentedControl, Select, Tabs } from "agentic-ds-kit";
import {
  PROMPT_TARGETS,
  componentPrompt,
  contractJson,
  contractSnippet,
  importLine,
  type PromptTarget,
} from "@/lib/component-contract";
import { readPatternTheme, subscribeTheme } from "@/lib/theme-store";
import { PRESETS, clampRadius, type ThemeState } from "@/lib/theme-playground";
import { PreviewScope } from "../_components/ThemeScope";
import { useCustomizeOpen } from "../_components/useCustomizeOpen";
import { GalleryPreview } from "./GalleryPreview";
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
  const [target, setTarget] = useState<PromptTarget>("claude-code");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(componentPrompt(id, target));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  // One solid primary per view: while the docked Theme panel shows its own, this one steps back.
  const solid = !customize.docked;

  return (
    <div className={styles.copy}>
      <span className={styles.copyLabel} id={`${id}-copy-label`}>
        Copy prompt for
      </span>
      <div className={styles.copyTargetsWide}>
        <SegmentedControl
          ariaLabel="Copy prompt for"
          size="sm"
          value={target}
          onChange={(value) => setTarget(value as PromptTarget)}
          items={PROMPT_TARGETS}
        />
      </div>
      <div className={styles.copyTargetsNarrow}>
        <Select
          id={`${id}-copy-target`}
          size="md"
          ariaLabel="Copy prompt for"
          value={target}
          onChange={(value) => setTarget(String(value) as PromptTarget)}
          options={PROMPT_TARGETS}
        />
      </div>
      <Button
        size="sm"
        appearance={solid ? "solid" : "outline"}
        mode={solid ? "primary" : "neutral"}
        iconStart={copied ? "Check" : "Copy"}
        onClick={() => void copy()}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
      <span className={styles.srOnly} role="status">
        {copied ? "Prompt copied to the clipboard" : ""}
      </span>
    </div>
  );
}

/**
 * Preview / Variants / Code / Contract for one component, plus the Copy prompt picker.
 * `variants` is the component's own doc (its master preview and variant examples).
 */
export function ComponentStage({ id, variants }: { id: string; variants?: ReactNode }) {
  const [tab, setTab] = useState<StageTab>("preview");
  const snippet = contractSnippet(id);
  const code = snippet ? `${importLine(id)}\n\n${snippet}` : importLine(id);

  return (
    <section className={styles.stageWrap} aria-label="Preview">
      <Tabs
        variant="segmented"
        size="sm"
        ariaLabel="Preview, variants, code or contract"
        value={tab}
        onChange={(value) => setTab(value as StageTab)}
        items={[
          {
            id: "preview",
            label: "Preview",
            content: (
              // The whole stage is the preview scope, so its ground follows the preview theme too.
              <PreviewScope className={styles.stage}>
                <StageThemeLabel />
                <div className={styles.stageInner}>
                  <GalleryPreview id={id} size="stage" />
                </div>
              </PreviewScope>
            ),
          },
          ...(variants
            ? [
                {
                  id: "variants",
                  label: "Variants",
                  content: (
                    <PreviewScope className={`${docStyles.examplesHost} ${styles.variants}`}>{variants}</PreviewScope>
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
        ]}
      />
      <CopyPrompt id={id} />
    </section>
  );
}
