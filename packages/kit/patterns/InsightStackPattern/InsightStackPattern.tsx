"use client";

import { useId, useState, type ComponentPropsWithoutRef } from "react";
import { ChevronDown, ChevronRight, CircleCheck, Lightbulb } from "lucide-react";
import { Button } from "../../ui/Button";
import { Count } from "../../ui/Count";
import { Delta, type DeltaGoodWhen, type DeltaTone } from "../../ui/Delta";
import { Divider } from "../../ui/Divider";
import { IconButton } from "../../ui/IconButton";
import { Link } from "../../ui/Link";
import { Meter } from "../../ui/Meter";
import { Skeleton } from "../../ui/Skeleton";
import { useKitLabels } from "../../ui/shared/labels";
import "./InsightStackPattern.css";

export type InsightStackSize = "sm" | "md" | "lg";

/** Colours a finding's change: the Delta tone, or the text colour of an unsigned amount. */
export type InsightStackTone = DeltaTone;

export interface InsightStackWhy {
  /** The visible confidence, e.g. "High · 82%". */
  confidence: string;
  /** 0–100 for the confidence Meter. */
  value: number;
  /** Where the finding comes from, e.g. ["412 Stripe invoices", "CRM seat counts"]. Shown joined with " · ". */
  evidence: string[];
}

export interface InsightStackItem {
  id: string;
  title: string;
  /** One line under the title. */
  detail: string;
  /**
   * The change. Signed ("+$18.4k", "−3%", "+2.4 pt") renders a kit Delta; unsigned ("$1,360") renders
   * tone-coloured text with no arrow.
   */
  delta?: string;
  tone: InsightStackTone;
  /** Delta only: which way is good. "down" when a rise is bad, like churn, so it reads "Worse · +2.4 pt". */
  goodWhen?: DeltaGoodWhen;
  why: InsightStackWhy;
}

type RootOwnedKeys = "children" | "title" | "aria-labelledby" | "aria-describedby";

export interface InsightStackPatternProps extends Omit<ComponentPropsWithoutRef<"article">, RootOwnedKeys> {
  /** The card heading (h3), e.g. "Three things changed this month". */
  title: string;
  /** Where the findings come from, e.g. "Billing, product and CRM · last 30 days". Describes the card. */
  source?: string;
  /** Short line beside the icon, e.g. "Summary · 3 of 7 insights". Your copy, not a heading. */
  eyebrow?: string;
  /** Timestamp beside the X, e.g. "09:00". */
  meta?: string;
  /** Ranked findings, most important first. Empty (and not loading) is the all-clear state. */
  items?: InsightStackItem[];
  /** All-clear line under the title, e.g. "Changes over 5% show up here first". */
  caption?: string;
  size?: InsightStackSize;
  /** Header, title and Skeleton rows. No findings, no footer, no X. */
  loading?: boolean;
  /** Spoken while loading (role="status"). */
  loadingLabel?: string;
  /** Findings whose Why? panel starts open. */
  defaultOpenIds?: string[];
  /** Shows the X IconButton. Hidden while loading. */
  onDismiss?: () => void;
  /** Outline Button with MessageCircle, e.g. "Ask in Chat". */
  askLabel?: string;
  onAsk?: () => void;
  /** Outline Button with no icon, e.g. "See all 7". Give onSeeAll, or seeAllHref to navigate. */
  seeAllLabel?: string;
  onSeeAll?: () => void;
  seeAllHref?: string;
  /** Screen-reader name of a rank Count. */
  rankLabel?: (rank: number) => string;
}

const SIGNED = /^[+\-−]/;

function directionOf(delta: string): "up" | "down" {
  return delta.startsWith("+") ? "up" : "down";
}

function Finding({
  item,
  rank,
  open,
  onToggle,
  rankLabel,
}: {
  item: InsightStackItem;
  rank: number;
  open: boolean;
  onToggle: () => void;
  rankLabel: (rank: number) => string;
}) {
  const labels = useKitLabels();
  const uid = useId();
  const titleId = `${uid}-title`;
  const toggleId = `${uid}-why`;
  const panelId = `${uid}-panel`;
  const signed = item.delta ? SIGNED.test(item.delta) : false;
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <li className="insight-stack-pattern__item">
      {rank > 1 ? <Divider tone="faint" /> : null}
      <div className="insight-stack-pattern__row">
        <span className="insight-stack-pattern__rank">
          <Count count={rank} intent={rank === 1 ? "info" : "neutral"} subtle={rank !== 1} size="lg" aria-hidden="true" />
          <span className="insight-stack-pattern__sr">{rankLabel(rank)}</span>
        </span>
        <div className="insight-stack-pattern__finding">
          <div className="insight-stack-pattern__finding-head">
            <p id={titleId} className="insight-stack-pattern__finding-title">
              {item.title}
            </p>
            {item.delta ? (
              <span className="insight-stack-pattern__change">
                {signed ? (
                  <Delta value={item.delta} direction={directionOf(item.delta)} tone={item.tone} goodWhen={item.goodWhen} size="sm" />
                ) : (
                  <span className={`insight-stack-pattern__amount insight-stack-pattern__amount--${item.tone}`}>{item.delta}</span>
                )}
              </span>
            ) : null}
          </div>
          <p className="insight-stack-pattern__detail">{item.detail}</p>
          <button
            type="button"
            id={toggleId}
            className="insight-stack-pattern__why"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
          >
            <Chevron size={14} aria-hidden="true" className="insight-stack-pattern__glyph" />
            <span>{labels.why}</span>
          </button>
        </div>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={`${toggleId} ${titleId}`}
        className="insight-stack-pattern__panel"
        hidden={!open}
      >
        <div className="insight-stack-pattern__evidence">
          <div className="insight-stack-pattern__confidence">
            <span>{labels.confidence}</span>
            <span className="insight-stack-pattern__confidence-value">{item.why.confidence}</span>
          </div>
          <Meter value={item.why.value} label={labels.confidence} size="sm" />
          {item.why.evidence.length > 0 ? (
            <p className="insight-stack-pattern__sources">{item.why.evidence.join(" · ")}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function LoadingRows() {
  return (
    <ol className="insight-stack-pattern__list" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <li key={row} className="insight-stack-pattern__item">
          {row > 0 ? <Divider tone="faint" /> : null}
          <div className="insight-stack-pattern__row">
            <Skeleton shape="circle" width={24} label="" aria-hidden="true" />
            <div className="insight-stack-pattern__skeleton-lines">
              <Skeleton width="70%" size="md" label="" aria-hidden="true" />
              <Skeleton width="90%" size="sm" label="" aria-hidden="true" />
              <Skeleton width="40%" size="sm" label="" aria-hidden="true" />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A ranked AI summary in one card: header (icon, eyebrow, time, X), title and source, then the
 * findings as an ordered list. Each finding has a Why? toggle that opens its confidence Meter and
 * evidence. Loading shows Skeleton rows; no findings is the compact all-clear card.
 */
export function InsightStackPattern({
  title,
  source,
  eyebrow,
  meta,
  items = [],
  caption,
  size = "md",
  loading = false,
  loadingLabel = "Updating",
  defaultOpenIds = [],
  onDismiss,
  askLabel,
  onAsk,
  seeAllLabel,
  onSeeAll,
  seeAllHref,
  rankLabel = (rank) => `Rank ${rank}`,
  className,
  ...rest
}: InsightStackPatternProps) {
  const labels = useKitLabels();
  const titleId = useId();
  const sourceId = useId();
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);
  const empty = !loading && items.length === 0;
  const Icon = empty ? CircleCheck : Lightbulb;
  const showSeeAll = !loading && !empty && Boolean(seeAllLabel && (onSeeAll || seeAllHref));
  const showAsk = !loading && Boolean(askLabel && onAsk);
  const showFooter = showSeeAll || showAsk;

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((open) => open !== id) : [...current, id]));
  }

  return (
    <article
      {...rest}
      className={[
        "insight-stack-pattern",
        `insight-stack-pattern--${size}`,
        empty ? "insight-stack-pattern--empty" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={titleId}
      aria-describedby={source ? sourceId : undefined}
      aria-busy={loading || undefined}
    >
      <header className="insight-stack-pattern__header">
        <div className="insight-stack-pattern__lead">
          <Icon
            size={16}
            aria-hidden="true"
            className={`insight-stack-pattern__glyph insight-stack-pattern__icon${empty ? " insight-stack-pattern__icon--success" : ""}`}
          />
          {eyebrow ? <span className="insight-stack-pattern__eyebrow">{eyebrow}</span> : null}
        </div>
        {meta || (onDismiss && !loading) ? (
          <div className="insight-stack-pattern__trail">
            {meta ? <span className="insight-stack-pattern__meta">{meta}</span> : null}
            {onDismiss && !loading ? (
              <IconButton icon="X" ariaLabel={labels.dismiss} appearance="ghost" mode="neutral" size="sm" onClick={onDismiss} />
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="insight-stack-pattern__heading">
        <h3 id={titleId} className="insight-stack-pattern__title">
          {title}
        </h3>
        {empty && caption ? <p className="insight-stack-pattern__caption">{caption}</p> : null}
        {source ? (
          <p id={sourceId} className="insight-stack-pattern__source">
            {source}
          </p>
        ) : null}
      </div>

      {loading ? (
        <>
          <span role="status" className="insight-stack-pattern__sr">
            {loadingLabel}
          </span>
          <Divider tone="faint" />
          <LoadingRows />
        </>
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <Divider tone="faint" />
          <ol className="insight-stack-pattern__list">
            {items.map((item, index) => (
              <Finding
                key={item.id}
                item={item}
                rank={index + 1}
                open={openIds.includes(item.id)}
                onToggle={() => toggle(item.id)}
                rankLabel={rankLabel}
              />
            ))}
          </ol>
        </>
      ) : null}

      {showFooter ? (
        <>
          <Divider tone="faint" />
          <footer className="insight-stack-pattern__footer">
            {showSeeAll ? (
              seeAllHref ? (
                <Link href={seeAllHref} variant="standalone" className="insight-stack-pattern__see-all-link">
                  {seeAllLabel}
                </Link>
              ) : (
                <Button appearance="outline" mode="neutral" size="sm" onClick={onSeeAll}>
                  {seeAllLabel as string}
                </Button>
              )
            ) : null}
            {showAsk ? (
              <Button appearance="outline" mode="neutral" size="sm" iconStart="MessageCircle" onClick={onAsk}>
                {askLabel as string}
              </Button>
            ) : null}
          </footer>
        </>
      ) : null}
    </article>
  );
}
