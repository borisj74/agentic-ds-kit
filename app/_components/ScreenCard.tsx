"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Button } from "agentic-ds-kit";
import styles from "../playground.module.css";

/**
 * One screen in a screens list: a live thumbnail (inert), an optional category tag, its name and one line, and a copy
 * button for the add command. The whole card opens the screen (href) or picks it (onSelect).
 */
export function ScreenCard({
  title,
  description,
  tag,
  thumb,
  href,
  onSelect,
  selected = false,
  copyText,
  headingLevel = 2,
}: {
  title: string;
  description?: string;
  /** A short category label shown as a kit Badge over the thumbnail's caption, e.g. "Agents". */
  tag?: string;
  thumb: ReactNode;
  href?: string;
  onSelect?: () => void;
  selected?: boolean;
  copyText?: string;
  headingLevel?: 2 | 3;
}) {
  const [copied, setCopied] = useState(false);
  const Heading = headingLevel === 3 ? "h3" : "h2";

  async function copy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={styles.screenCard} data-selected={selected || undefined}>
      <div className={styles.screenThumb} inert aria-hidden="true">
        {thumb}
      </div>
      <div className={styles.screenMeta}>
        <div className={styles.screenText}>
          {tag ? (
            <Badge size="sm" tone="neutral" className={styles.screenTag}>
              {tag}
            </Badge>
          ) : null}
          <Heading className={styles.screenTitle}>{title}</Heading>
          {description ? <p className={styles.screenDescription}>{description}</p> : null}
        </div>
        {copyText ? (
          <span className={styles.screenCopy}>
            <Button
              appearance="ghost"
              mode="neutral"
              size="sm"
              iconStart={copied ? "Check" : "Copy"}
              ariaLabel={copied ? "Copied" : `Copy the add command for ${title}`}
              onClick={copy}
            />
          </span>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className={styles.screenHit} aria-label={`Open ${title}`} />
      ) : onSelect ? (
        <button
          type="button"
          className={styles.screenHit}
          aria-label={`Show ${title}`}
          aria-pressed={selected}
          onClick={onSelect}
        />
      ) : null}
    </article>
  );
}
