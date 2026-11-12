"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button, CodeSnippet, SegmentedControl } from "agentic-ds-kit";
import { CopyPromptBar } from "./CopyPromptBar";
import { ScaledFrame } from "./PatternPreview";
import { usePatternTheme } from "./ThemeScope";
import { useCustomizeOpen } from "./useCustomizeOpen";
import styles from "../playground.module.css";

type Mode = "light" | "dark";
type Device = "desktop" | "mobile";

export function blockFrameUrl(slug: string, mode: Mode) {
  return `/frame/blocks/${slug}?mode=${mode}`;
}

/**
 * Preview / Code for one block, like the pattern pages: light or dark, desktop (1440) or mobile
 * (390), open full screen and the Copy prompt bar, over the block in a scaled iframe. Code shows
 * the import, the usage and the contract.
 */
export function BlockPreview({
  slug,
  title,
  importLine,
  usage,
  contract,
  prompt,
  cursorPrompt,
}: {
  slug: string;
  title: string;
  importLine: string;
  usage: string;
  contract: string;
  prompt: string;
  cursorPrompt: string;
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const theme = usePatternTheme();
  const [mode, setMode] = useState<Mode | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const pathname = usePathname();
  const customize = useCustomizeOpen(pathname);
  const shownMode: Mode = mode ?? theme?.mode ?? "light";
  const src = blockFrameUrl(slug, shownMode);

  return (
    <section className={styles.previewBlock} aria-label={`${title} preview`}>
      <div className={styles.previewToolbar}>
        <div className={styles.previewTools}>
          <SegmentedControl
            size="sm"
            ariaLabel="Show"
            value={tab}
            onChange={(value) => setTab(value === "code" ? "code" : "preview")}
            items={[
              { value: "preview", label: "Preview", icon: "Eye" },
              { value: "code", label: "Code", icon: "Code" },
            ]}
          />
        </div>
        <div className={styles.previewTools}>
          {tab === "preview" ? (
            <>
              <SegmentedControl
                className={styles.iconSegments}
                size="sm"
                ariaLabel="Theme mode"
                value={shownMode}
                onChange={(value) => setMode(value === "dark" ? "dark" : "light")}
                items={[
                  { value: "light", label: "Light", icon: "Sun" },
                  { value: "dark", label: "Dark", icon: "Moon" },
                ]}
              />
              <SegmentedControl
                className={styles.iconSegments}
                size="sm"
                ariaLabel="Width"
                value={device}
                onChange={(value) => setDevice(value === "mobile" ? "mobile" : "desktop")}
                items={[
                  { value: "desktop", label: "Desktop", icon: "Monitor" },
                  { value: "mobile", label: "Mobile", icon: "Smartphone" },
                ]}
              />
              <Button
                appearance="ghost"
                mode="neutral"
                size="sm"
                iconStart="Maximize2"
                ariaLabel="Open full screen"
                onClick={() => window.open(src, "_blank", "noopener")}
              />
            </>
          ) : null}
        </div>
        <CopyPromptBar className={styles.previewCopy} prompt={prompt} cursorPrompt={cursorPrompt} solid={!customize.docked} />
      </div>

      {tab === "preview" ? (
        <ScaledFrame src={src} title={`${title} block`} device={device} />
      ) : (
        <CodeSnippet
          tabs={[
            { label: "Import", code: importLine, language: "tsx" },
            { label: "Usage", code: usage, language: "tsx" },
            { label: "Contract", code: contract, language: "json" },
          ]}
        />
      )}
    </section>
  );
}
