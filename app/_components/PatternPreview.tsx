"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Button, CodeSnippet, SegmentedControl } from "agentic-ds-kit";
import { PATTERN_VIEWS, type ScreenSlug } from "@/lib/pattern-screens";
import { usePatternTheme } from "./ThemeScope";
import styles from "../playground.module.css";

/** The size each screen renders at before it is scaled into the frame. */
const DEVICES = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

type Device = keyof typeof DEVICES;
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
  className,
}: {
  src: string;
  title: string;
  device?: Device;
  interactive?: boolean;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const size = DEVICES[device];

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const fit = () => {
      if (host.clientWidth < 8) return;
      setScale(Math.min(1, host.clientWidth / size.width));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host);
    return () => observer.disconnect();
  }, [size.width]);

  return (
    <div ref={hostRef} className={[styles.frameHost, className].filter(Boolean).join(" ")}>
      <div
        className={styles.frameBox}
        style={{ width: size.width * scale, height: size.height * scale, visibility: scale ? "visible" : "hidden" }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          tabIndex={interactive ? undefined : -1}
          className={styles.frame}
          style={{ width: size.width, height: size.height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}

/**
 * Preview / Code for one pattern, like a screens catalogue: a toolbar (light or dark, desktop
 * or mobile, open full screen, copy the add command) over the screen in a scaled iframe, or
 * the install, usage and contract code. The page's screens list picks the screen shown.
 */
export function PatternPreview({
  slug,
  title,
  addCommand,
  usage,
  contract,
  view,
}: {
  slug: ScreenSlug;
  title: string;
  addCommand: string;
  usage: string;
  contract: string;
  /** The screen (state) shown; pick it from the screens list under the preview. */
  view: string;
}) {
  const views = PATTERN_VIEWS[slug];
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const theme = usePatternTheme();
  const [mode, setMode] = useState<Mode | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [copied, setCopied] = useState(false);
  const shownMode: Mode = mode ?? theme?.mode ?? "light";
  const src = frameUrl(slug, view, shownMode);

  async function copy() {
    try {
      await navigator.clipboard.writeText(addCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

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
            <span className={styles.previewLabel}>{views.find((item) => item.id === view)?.label ?? view}</span>
          ) : null}
        </div>
        <div className={styles.previewTools}>
          {tab === "preview" ? (
            <>
              <SegmentedControl
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
          <Button appearance="solid" mode="primary" size="sm" iconStart={copied ? "Check" : "Copy"} onClick={copy}>
            {copied ? "Copied" : "Copy add"}
          </Button>
        </div>
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
