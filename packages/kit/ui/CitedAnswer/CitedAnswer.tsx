"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, CircleX, ExternalLink, Layers, Sparkles } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { ShimmerText } from "../ShimmerText";
import { Skeleton } from "../Skeleton";
import { cx } from "../shared/cx";
import type { Citation, CitedAnswerProps } from "./CitedAnswer.types";
import styles from "./CitedAnswer.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { CitedAnswerProps, Citation } from "./CitedAnswer.types";

/** An assistant reply with inline citation marks and a source list. Chat stays the thread shell. */
export function CitedAnswer({
  content,
  citations,
  author = "Assistant",
  time,
  openSources,
  onOpenSourcesChange,
  onCitationClick,
  loading = false,
  loadingText = "Reading sources…",
  error,
  onRetry,
  className,
  ref,
  ...rest
}: CitedAnswerProps) {
  const base = useId().replace(/:/g, "");
  const listId = `${base}-sources`;
  const [innerOpen, setInnerOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const open = openSources ?? innerOpen;
  const byId = new Map(citations.map((citation) => [citation.id, citation]));

  function setOpen(next: boolean) {
    if (openSources === undefined) setInnerOpen(next);
    onOpenSourcesChange?.(next);
  }

  function cite(id: string) {
    setOpen(true);
    setHighlight(null);
    window.requestAnimationFrame(() => setHighlight(id));
    onCitationClick?.(id);
  }

  // Split "text[1] more[2]" into text and citation marks.
  const parts: ReactNode[] = [];
  const pattern = /\[(\w+)\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content))) {
    if (match.index > last) parts.push(content.slice(last, match.index));
    const id = match[1];
    const source = byId.get(id);
    parts.push(
      <a
        key={`${id}-${match.index}`}
        href={`#${base}-cite-${id}`}
        className={cx(styles.mark, source?.missing && styles.markMissing)}
        aria-label={source ? `Source ${id}: ${source.missing ? "not found" : source.title}` : `Source ${id}`}
        onClick={(event) => {
          event.preventDefault();
          cite(id);
          window.requestAnimationFrame(() => document.getElementById(`${base}-cite-${id}`)?.focus());
        }}
      >
        [{id}]
      </a>,
    );
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push(content.slice(last));

  return (
    <article {...rest} {...nisthaAttr("citedanswer", rest)} ref={ref} className={cx(styles.answer, className)} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          <Sparkles size={14} strokeWidth={ICON_STROKE} />
        </span>
        <span className={styles.author}>{author}</span>
        {time ? <span className={styles.time}>· {time}</span> : null}
      </header>

      {loading ? (
        <div className={styles.loading}>
          <ShimmerText>{loadingText}</ShimmerText>
          <Skeleton width="90%" size="sm" />
          <Skeleton width="75%" size="sm" />
          <Skeleton width="55%" size="sm" />
        </div>
      ) : error ? (
        <div className={styles.error} role="alert">
          <CircleX size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className={styles.errorText}>{error}</span>
          {onRetry ? (
            <Button size="sm" appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <p className={styles.content}>{parts}</p>
          {citations.length ? (
            <div className={styles.sources}>
              <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={listId} onClick={() => setOpen(!open)}>
                <Layers size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                Used {citations.length} {citations.length === 1 ? "source" : "sources"}
                <ChevronDown size={14} strokeWidth={ICON_STROKE} className={cx(styles.chevron, open && styles.chevronOpen)} aria-hidden="true" />
              </button>
              {open ? (
                <ol id={listId} className={styles.list}>
                  {citations.map((citation: Citation) => (
                    <li
                      key={citation.id}
                      id={`${base}-cite-${citation.id}`}
                      tabIndex={-1}
                      className={cx(styles.source, citation.missing && styles.missing, highlight === citation.id && styles.highlight)}
                    >
                      <span className={styles.number}>[{citation.id}]</span>
                      <div className={styles.sourceBody}>
                        {citation.missing ? (
                          <>
                            <span className={styles.title}>Source not found</span>
                            <span className={styles.snippet}>{citation.missingReason ?? "The page was moved or removed after the answer was written."}</span>
                          </>
                        ) : (
                          <>
                            {citation.href ? (
                              <a className={cx(styles.title, styles.link)} href={citation.href} target="_blank" rel="noreferrer">
                                {citation.title}
                                <ExternalLink size={12} strokeWidth={ICON_STROKE} aria-hidden="true" />
                                <span className={styles.srOnly}> (opens in a new tab)</span>
                              </a>
                            ) : (
                              <span className={styles.title}>{citation.title}</span>
                            )}
                            {citation.origin ? <span className={styles.origin}>{citation.origin}</span> : null}
                            {citation.snippet ? <span className={styles.snippet}>{citation.snippet}</span> : null}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}
