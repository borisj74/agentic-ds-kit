"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button, CodeSnippet, SegmentedControl, Select } from "agentic-ds-kit";
import { PATTERN_VIEWS, type ScreenSlug } from "@/lib/pattern-screens";
import { CopyPromptBar } from "./CopyPromptBar";
import { usePatternTheme } from "./ThemeScope";
import { useCustomizeOpen } from "./useCustomizeOpen";
import styles from "../playground.module.css";

/** The size each screen renders at before it is scaled into the frame. */
const DEVICES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

type Device = keyof typeof DEVICES;

/** Crop thumbnails: the narrowest layout width the screen gets, and the window's height / width. */
const CROP_MIN_WIDTH = 1024;
const CROP_RATIO = 10 / 16;
type Mode = "light" | "dark";

export function frameUrl(slug: ScreenSlug, view: string, mode: Mode) {
  return `/frame/patterns/${slug}?view=${encodeURIComponent(view)}&mode=${mode}`;
}

/** An iframe of the screen at its real size, scaled down to fit the width it is given. */
export function ScaledFrame({
  src,
  title,
  device = "desktop",
  interactive = true,
  deferUntilVisible = false,
  crop,
  className,
}: {
  src: string;
  title: string;
  device?: Device;
  interactive?: boolean;
  /**
   * Mount the iframe only once the card is near the viewport (index grids). Native lazy loading
   * starts far ahead of the viewport, so every card on /blocks loaded at once.
   */
  deferUntilVisible?: boolean;
  /**
   * Thumbnail mode: show the top-left of the screen at this scale (about 0.6–0.75) in a fixed
   * 16:10 window with a soft fade at the bottom, instead of the whole screen shrunk to fit. The
   * screen lays out at the visible width (never under 1024px), so it reads as a desktop view.
   */
  crop?: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [hostWidth, setHostWidth] = useState(0);
  const [visible, setVisible] = useState(!deferUntilVisible);
  const size = DEVICES[device];

  useEffect(() => {
    if (visible) return;
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [visible]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => {
      if (host.clientWidth < 8) return;
      setHostWidth(host.clientWidth);
      setScale(Math.min(1, host.clientWidth / size.width));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host);
    return () => observer.disconnect();
  }, [size.width]);

  if (crop) {
    const width = hostWidth ? Math.max(CROP_MIN_WIDTH, Math.round(hostWidth / crop)) : 0;
    return (
      <div ref={hostRef} className={[styles.frameHost, styles.frameCrop, className].filter(Boolean).join(" ")}>
        {visible && width ? (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            tabIndex={interactive ? undefined : -1}
            className={styles.frame}
            style={{ width, height: Math.ceil(width * CROP_RATIO), transform: `scale(${crop})` }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div ref={hostRef} className={[styles.frameHost, className].filter(Boolean).join(" ")}>
      <div
        className={styles.frameBox}
        style={{ width: size.width * scale, height: size.height * scale, visibility: scale ? "visible" : "hidden" }}
      >
        {visible ? (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            tabIndex={interactive ? undefined : -1}
            className={styles.frame}
            style={{ width: size.width, height: size.height, transform: `scale(${scale})` }}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Preview / Code for one pattern, like a screens catalogue: a toolbar (the state switch, light or
 * dark, desktop or mobile, open full screen, copy the prompt or open it in an AI tool) over the
 * screen in a scaled iframe, or the install, usage and contract code.
 */
export function PatternPreview({
  slug,
  title,
  addCommand,
  prompt,
  cursorPrompt,
  usage,
  contract,
  view,
  onViewChange,
}: {
  slug: ScreenSlug;
  title: string;
  addCommand: string;
  /** Build-from-this-pattern prompt (lib/pattern-prompt): Copy, Claude, ChatGPT, v0. */
  prompt: string;
  /** Cursor's variant of the prompt. */
  cursorPrompt: string;
  usage: string;
  contract: string;
  /** The state shown; the toolbar's state switch picks it. */
  view: string;
  onViewChange: (view: string) => void;
}) {
  const views = PATTERN_VIEWS[slug];
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const theme = usePatternTheme();
  const [mode, setMode] = useState<Mode | null>(null);
  // Width is its own switch and holds across states: any state can be seen at 390.
  const [device, setDevice] = useState<Device>("desktop");
  const pathname = usePathname();
  const customize = useCustomizeOpen(pathname);
  const shownMode: Mode = mode ?? theme?.mode ?? "light";
  const src = frameUrl(slug, view, shownMode);

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
          {tab === "preview" && views.length > 1 ? (
            <Select
              id={`${slug}-state`}
              size="sm"
              ariaLabel="State"
              value={view}
              onChange={(value) => onViewChange(Array.isArray(value) ? value[0] : value)}
              options={views.map((item) => ({ value: item.id, label: item.label }))}
            />
          ) : null}
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
        {/* The bare add command stays on the Code tab's Install snippet. One solid primary per view:
            while the docked Theme panel shows its own, Copy steps back. Below md the bar moves up
            beside Preview / Code. */}
        <CopyPromptBar
          className={styles.previewCopy}
          prompt={prompt}
          cursorPrompt={cursorPrompt}
          solid={!customize.docked}
        />
      </div>

      {tab === "preview" ? (
        <ScaledFrame src={src} title={`${title}: ${views.find((item) => item.id === view)?.label ?? view}`} device={device} />
      ) : (
        <CodeSnippet
          tabs={[
            { label: "Install", code: addCommand, language: "bash" },
            { label: "Usage", code: usage, language: "tsx" },
            { label: "Contract", code: contract, language: "json" },
          ]}
        />
      )}
    </section>
  );
}
