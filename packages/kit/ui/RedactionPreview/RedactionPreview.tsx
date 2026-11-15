"use client";

import { useId, useState } from "react";
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
  maskedPayload,
  plural,
  segments,
  typeCounts,
  typeLabel,
} from "./redactionPreview.logic";
import type { RedactionPreviewProps } from "./RedactionPreview.types";
import styles from "./RedactionPreview.module.css";

export type { RedactionPreviewProps, RedactionSpan, RedactionRules, RedactionStatus } from "./RedactionPreview.types";

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
  className,
  ref,
  ...rest
}: RedactionPreviewProps) {
  const base = useId();
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const resolved = status === "sent" || status === "cancelled";
  const focus = useResolvedFocus(resolved);
  const masked = maskedCount(payload, spans, rules, lockedTypes);
  const counts = typeCounts(payload, spans);
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const unmasked = total - masked;
  const label = (type: string) => typeLabel(type, typeLabels);

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

  function toggleReveal(index: number) {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function setRule(type: string, on: boolean) {
    onRulesChange?.({ ...rules, [type]: on });
  }

  const lockedHintId = `${base}-locked`;

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
                  <Tag size="sm" count={count} dot={isMasked(type, rules, lockedTypes) ? "success" : "warning"}>
                    {label(type)}
                  </Tag>
                </li>
              ))}
            </ul>
          ) : (
            <span className={styles.none}>No sensitive values found</span>
          )}
        </div>

        <div className={styles.payloadWrap}>
          <p className={styles.payloadLabel} id={`${base}-payload`}>
            What will be sent
          </p>
          <pre className={styles.payload} aria-labelledby={`${base}-payload`} tabIndex={0}>
            {segments(payload, spans).map((seg, i) => {
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
              const shown = revealed.has(seg.index);
              return (
                <Tooltip key={i} content={shown ? `${name}, shown to you only. It is still masked when sent.` : `${name}, masked. Select to show it to you only.`}>
                  <button
                    type="button"
                    className={cx(styles.chip, shown && styles.chipShown)}
                    aria-pressed={shown}
                    aria-label={shown ? `masked ${name.toLowerCase()}, shown to you: ${seg.text}` : `masked ${name.toLowerCase()}`}
                    onClick={() => toggleReveal(seg.index)}
                  >
                    {shown ? seg.text : `[${seg.span.type}]`}
                  </button>
                </Tooltip>
              );
            })}
          </pre>
        </div>

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
          <span className={styles.footerNote}>{`${plural(masked, "value")} masked`}</span>
          <span className={styles.actions}>
            {onCancel ? (
              <Button appearance="outline" mode="neutral" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button appearance="solid" mode="primary" onClick={() => onSend?.(maskedPayload(payload, spans, rules, lockedTypes))}>
              Send
            </Button>
          </span>
        </footer>
      </div>
    </Card>
  );
}
