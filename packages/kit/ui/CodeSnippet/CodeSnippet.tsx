"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { Tabs } from "../Tabs";
import type { CodeSnippetProps } from "./CodeSnippet.types";
import styles from "./CodeSnippet.module.css";

export type { CodeSnippetProps, CodeSnippetTab } from "./CodeSnippet.types";

const COPIED_MS = 1200;

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    /* no Clipboard API or permission denied: fall back to execCommand */
  }
  const previous = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  previous?.focus();
  if (!ok) throw new Error("copy failed");
}

export function CodeSnippet({
  code = "",
  tabs,
  language,
  title,
  showLineNumbers = false,
  copyable = true,
  wrap = false,
  maxHeight,
}: CodeSnippetProps) {
  const hasTabs = Boolean(tabs && tabs.length > 0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = hasTabs ? tabs![Math.min(activeIndex, tabs!.length - 1)] : undefined;
  const text = activeTab ? activeTab.code : code;
  const lang = activeTab?.language ?? language;

  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await writeClipboard(text);
      setCopied(true);
    } catch {
      /* clipboard blocked: leave the button as is */
    }
  }, [text]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => setCopied(false), [text]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const update = () =>
      setScrollable(body.scrollWidth > body.clientWidth || body.scrollHeight > body.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    if (body.firstElementChild) observer.observe(body.firstElementChild);
    return () => observer.disconnect();
  }, [text, wrap, maxHeight, showLineNumbers]);

  const hasHeader = hasTabs || Boolean(title) || Boolean(lang);
  const regionLabel = title ?? activeTab?.label ?? (lang ? `${lang} code` : "Code");
  const lines = showLineNumbers ? text.split("\n") : null;

  const copyButton = copyable ? (
    <Button
      variant={hasHeader ? "tertiary" : "secondary"}
      size="sm"
      iconStart={copied ? "Check" : "Copy"}
      onClick={onCopy}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  ) : null;

  return (
    <div className={`${styles.root}${hasHeader ? "" : ` ${styles.bare}`}`}>
      {hasHeader ? (
        <div className={`${styles.header}${hasTabs ? ` ${styles.withTabs}` : ""}`}>
          {hasTabs ? (
            <div className={styles.tabs}>
              <Tabs
                variant="line"
                size="sm"
                ariaLabel={title ?? "Code"}
                value={String(Math.min(activeIndex, tabs!.length - 1))}
                onChange={(id) => setActiveIndex(Number(id))}
                items={tabs!.map((tab, index) => ({ id: String(index), label: tab.label }))}
              />
            </div>
          ) : title ? (
            <span className={styles.title}>{title}</span>
          ) : null}
          <div className={styles.meta}>
            {lang ? <span className={styles.language}>{lang}</span> : null}
            {copyButton}
          </div>
        </div>
      ) : null}
      <div
        className={`${styles.body}${wrap ? ` ${styles.wrap}` : ""}`}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
        ref={bodyRef}
        role="region"
        aria-label={regionLabel}
        tabIndex={scrollable ? 0 : undefined}
      >
        <pre className={styles.pre}>
          {lines ? (
            <code className={styles.numbered}>
              {lines.map((line, index) => (
                <span key={index} className={styles.line}>
                  <span className={styles.number} aria-hidden>
                    {index + 1}
                  </span>
                  <span className={styles.lineText}>{`${line}\n`}</span>
                </span>
              ))}
            </code>
          ) : (
            <code>{text}</code>
          )}
        </pre>
      </div>
      {!hasHeader && copyButton ? <div className={styles.floatingCopy}>{copyButton}</div> : null}
      {copyable ? (
        <span className={styles.srOnly} aria-live="polite">
          {copied ? "Copied" : ""}
        </span>
      ) : null}
    </div>
  );
}
