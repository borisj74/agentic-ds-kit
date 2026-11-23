"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleX, ShieldCheck } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { Switch } from "../Switch";
import { Tag } from "../Tag";
import { Tooltip } from "../Tooltip";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { nisthaAttr } from "../shared/inspect";
import {
  DEFAULT_LOCKED,
  isMasked,
  maskedCount,
  maskText,
  maskedPayload,
  plural,
  segments,
  typeCounts,
  typeLabel,
} from "./redactionPreview.logic";
import type { RedactionPreviewProps } from "./RedactionPreview.types";
import styles from "./RedactionPreview.module.css";

export type { RedactionPreviewProps, RedactionSpan, RedactionRules, RedactionStatus, RedactionLayout } from "./RedactionPreview.types";

/**
 * Exactly what is about to leave the product for a model or outside tool, with sensitive values
 * masked by type and a rule per type, before it is sent.
 */
export function RedactionPreview({
  destination,
  region,
  payload,
  spans,
  rules = {},
  lockedTypes = DEFAULT_LOCKED,
  lockedReason = "Secrets always stay masked. They are never sent to a model or outside tool.",
  typeLabels,
  onRulesChange,
  onSend,
  onCancel,
  status = "pending",
  errorText,
  onRetry,
  layout = "inline",
  keepLast = {},
  className,
  ref,
  ...rest
}: RedactionPreviewProps) {
  const base = useId();
  // Keyed by the value (segment key), not its position, so a reveal stays on the same value when the data changes.
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const resolved = status === "sent" || status === "cancelled";
  const focus = useResolvedFocus(resolved);
  const masked = maskedCount(payload, spans, rules, lockedTypes);
  const counts = typeCounts(payload, spans);
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const unmasked = total - masked;
  const label = (type: string) => typeLabel(type, typeLabels);
  const [showBefore, setShowBefore] = useState(false);
  const retryRef = useRef<HTMLButtonElement | null>(null);
  const failed = status === "error";

  // A send that fails moves focus to Try again (not when the card first renders failed).
  const wasFailed = useRef(failed);
  useEffect(() => {
    if (failed && !wasFailed.current) retryRef.current?.focus();
    wasFailed.current = failed;
  }, [failed]);

  if (resolved) {
    const sent = status === "sent";
    const Icon = sent ? ShieldCheck : CircleX;
    const text = sent
      ? `Sent to ${destination} with ${plural(masked, "value")} masked${unmasked > 0 ? `, ${unmasked} unmasked` : ""}`
      : `Not sent to ${destination}`;
    return (
      <section
        {...rest}
        {...nisthaAttr("redactionpreview", rest)}
        ref={mergeRefs(focus.rowRef, ref)}
        tabIndex={-1}
        className={cx(styles.resolved, styles[status], className)}
        aria-label={text}
      >
        <Icon size={16} strokeWidth={ICON_STROKE} className={styles.resolvedIcon} aria-hidden="true" />
        <span className={styles.resolvedLabel}>{sent ? "Sent" : "Cancelled"}</span>
        <span className={styles.resolvedText}>{text}</span>
      </section>
    );
  }

  function toggleReveal(key: string) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function setRule(type: string, on: boolean) {
    onRulesChange?.({ ...rules, [type]: on });
  }

  const lockedHintId = `${base}-locked`;
  const send = () => onSend?.(maskedPayload(payload, spans, rules, lockedTypes, keepLast, typeLabels));
  const mask = (type: string, value: string) => maskText(type, value, keepLast, typeLabels, lockedTypes);

  const inlinePayload = segments(payload, spans).map((seg, i) => {
    if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
    const name = label(seg.span.type);
    if (!isMasked(seg.span.type, rules, lockedTypes)) {
      return (
        <mark key={i} className={styles.unmasked}>
          <span className={styles.srOnly}>{`unmasked ${name.toLowerCase()}: `}</span>
          {seg.text}
        </mark>
      );
    }
    const shown = revealed.has(seg.key);
    return (
      <Tooltip key={seg.key} content={shown ? `${name}, shown to you only. It is still masked when sent.` : `${name}, masked. Select to show it to you only.`}>
        <button
          type="button"
          className={cx(styles.chip, shown && styles.chipShown)}
          aria-pressed={shown}
          aria-label={shown ? `masked ${name.toLowerCase()}, shown to you: ${seg.text}` : `masked ${name.toLowerCase()}`}
          onClick={() => toggleReveal(seg.key)}
        >
          {shown ? seg.text : mask(seg.span.type, seg.text)}
        </button>
      </Tooltip>
    );
  });

  // Before: the data as written, for the viewer only. Secrets stay masked here too.
  const beforePayload = segments(payload, spans).map((seg, i) => {
    if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
    if (lockedTypes.includes(seg.span.type)) {
      return (
        <span key={i} className={styles.masked}>
          {`[${label(seg.span.type)}]`}
        </span>
      );
    }
    return <span key={i}>{seg.text}</span>;
  });

  // After: exactly what leaves.
  const afterPayload = segments(payload, spans).map((seg, i) => {
    if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
    const name = label(seg.span.type);
    if (!isMasked(seg.span.type, rules, lockedTypes)) {
      return (
        <mark key={i} className={styles.unmasked}>
          <span className={styles.srOnly}>{`unmasked ${name.toLowerCase()}: `}</span>
          {seg.text}
        </mark>
      );
    }
    return (
      <span key={i} className={styles.masked}>
        <span className={styles.srOnly}>{`masked ${name.toLowerCase()}: `}</span>
        {mask(seg.span.type, seg.text)}
      </span>
    );
  });

  return (
    <Card
      {...rest}
      {...nisthaAttr("redactionpreview", rest)}
      ref={ref}
      title={`Sending to ${destination}`}
      className={cx(styles.root, className)}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
    >
      <div className={styles.body}>
        <div className={styles.summary}>
          {region ? (
            <Badge tone="neutral" appearance="outline" size="sm">
              {`${region} region`}
            </Badge>
          ) : null}
          {counts.length > 0 ? (
            <ul className={styles.tags} aria-label="Sensitive values found">
              {counts.map(({ type, count }) => (
                <li key={type}>
                  <Tag size="sm" count={count} dot={isMasked(type, rules, lockedTypes) ? undefined : "warning"}>
                    {label(type)}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : (
            <span className={styles.none}>No sensitive values found</span>
          )}
        </div>

        {failed ? (
          <Alert variant="danger" title="Couldn't send. Nothing left the product.">
            {errorText ?? "Your mask rules are kept. Try again when you're ready."}
          </Alert>
        ) : null}

        {layout === "split" ? (
          <div className={cx(styles.split, showBefore && styles.splitBefore)}>
            <section className={cx(styles.payloadWrap, styles.before)} aria-labelledby={`${base}-before`}>
              <p className={styles.payloadLabel} id={`${base}-before`}>
                Before · only you see this
              </p>
              <pre className={styles.payload} tabIndex={0} aria-labelledby={`${base}-before`}>
                {beforePayload}
              </pre>
            </section>
            <section className={cx(styles.payloadWrap, styles.after)} aria-labelledby={`${base}-after`}>
              <p className={styles.payloadLabel} id={`${base}-after`}>
                {`After · what ${destination} receives`}
              </p>
              <pre className={styles.payload} tabIndex={0} aria-labelledby={`${base}-after`}>
                {afterPayload}
              </pre>
            </section>
            <span className={styles.beforeToggle}>
              <Button size="sm" appearance="ghost" mode="neutral" iconStart={showBefore ? "EyeOff" : "Eye"} aria-expanded={showBefore} onClick={() => setShowBefore(!showBefore)}>
                {showBefore ? "Hide before" : "Show before"}
              </Button>
            </span>
          </div>
        ) : (
          <div className={styles.payloadWrap}>
            <p className={styles.payloadLabel} id={`${base}-payload`}>
              What will be sent
            </p>
            <pre className={styles.payload} aria-labelledby={`${base}-payload`} tabIndex={0}>
              {inlinePayload}
            </pre>
          </div>
        )}

        {counts.length > 0 ? (
          <fieldset className={styles.rules}>
            <legend className={styles.rulesLegend}>Mask before sending</legend>
            <ul className={styles.ruleList}>
              {counts.map(({ type, count }) => {
                const locked = lockedTypes.includes(type);
                return (
                  <li key={type} className={styles.rule}>
                    <Switch
                      size="sm"
                      label={`${label(type)} (${count})`}
                      checked={isMasked(type, rules, lockedTypes)}
                      disabled={locked}
                      describedBy={locked ? lockedHintId : undefined}
                      onChange={(on) => setRule(type, on)}
                    />
                    {locked ? <span className={styles.lockedNote}>Locked on</span> : null}
                  </li>
                );
              })}
            </ul>
            {counts.some((c) => lockedTypes.includes(c.type)) ? (
              <p id={lockedHintId} className={styles.hint}>
                {lockedReason}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {unmasked > 0 ? (
          <Alert variant="warning" title="Some values go out unmasked">
            {`${plural(unmasked, "value")} will reach ${destination} as written. Turn their rule back on to mask them.`}
          </Alert>
        ) : null}

        <footer className={styles.footer}>
          <span className={styles.footerNote}>{failed ? "Nothing left the product" : `${plural(masked, "value")} masked`}</span>
          <span className={styles.actions}>
            {onCancel ? (
              <Button appearance="outline" mode="neutral" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            {failed ? (
              <Button ref={retryRef} appearance="solid" mode="primary" iconStart="RotateCcw" onClick={() => (onRetry ? onRetry() : send())}>
                Try again
              </Button>
            ) : (
              <Button appearance="solid" mode="primary" onClick={send}>
                Send
              </Button>
            )}
          </span>
        </footer>
      </div>
    </Card>
  );
}
