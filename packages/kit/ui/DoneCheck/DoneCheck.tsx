"use client";

import { CircleCheck, CircleDashed, CircleX, ListChecks, LoaderCircle, type LucideIcon } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { BlurCrossfade } from "../BlurCrossfade";
import { Button } from "../Button";
import { Card } from "../Card";
import { CodeSnippet } from "../CodeSnippet";
import { Collapsible } from "../Collapsible";
import { Empty } from "../Empty";
import { Link } from "../Link";
import { Progress } from "../Progress";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { STATUS_LABEL, allMet, metCount, metPercent, sortCriteria, verdict } from "./doneCheck.logic";
import type { DoneCheckProps, DoneCriterion, DoneCriterionStatus } from "./DoneCheck.types";
import styles from "./DoneCheck.module.css";

export type { DoneCheckProps, DoneCriterion, DoneCriterionStatus, DoneEvidence } from "./DoneCheck.types";

const STATUS_ICON: Record<DoneCriterionStatus, LucideIcon> = {
  met: CircleCheck,
  not_met: CircleX,
  unverified: CircleDashed,
  checking: LoaderCircle,
};

function hasEvidence(item: DoneCriterion) {
  const e = item.evidence;
  return Boolean(e && (e.note || e.href || e.output));
}

/**
 * After an agent says it is finished: each agreed "done when" check marked met, not met or
 * unverified, with its proof. Unverified never counts as met. Pairs with TaskBrief.
 */
export function DoneCheck({
  title,
  criteria,
  onOverride,
  onRecheck,
  onAccept,
  onSendBack,
  checkedAt,
  className,
  ref,
  ...rest
}: DoneCheckProps) {
  const rows = sortCriteria(criteria);
  const met = metCount(criteria);
  const done = allMet(criteria);
  const result = verdict(criteria);
  const checking = criteria.some((c) => c.status === "checking");

  return (
    <Card
      {...rest}
      {...nisthaAttr("donecheck", rest)}
      ref={ref}
      title={title}
      description={checkedAt}
      className={cx(styles.root, className)}
      aria-busy={checking || undefined}
    >
      {criteria.length === 0 ? (
        <Empty
          icon={ListChecks}
          title="No checks to mark"
          description="This task had no agreed “done when” checks. Add them to the brief next time."
        />
      ) : (
        <div className={styles.body}>
          <div className={styles.summary}>
            <BlurCrossfade contentKey={result.label} duration="fast">
              <Badge tone={result.tone} appearance="soft" size="md">
                {result.label}
              </Badge>
            </BlurCrossfade>
            <Progress
              className={styles.progress}
              size="sm"
              value={metPercent(criteria)}
              tone={done ? "brand" : "muted"}
              ariaLabel={`${met} of ${criteria.length} checks met`}
            />
          </div>

          <ol className={styles.list}>
            {rows.map((item) => {
              const n = criteria.indexOf(item) + 1;
              const Icon = STATUS_ICON[item.status];
              const busy = item.status === "checking";
              return (
                <li key={item.id} className={cx(styles.row, styles[item.status])}>
                  <span className={styles.status}>
                    <BlurCrossfade contentKey={item.status} duration="fast">
                      <span className={styles.statusInner}>
                        <Icon
                          size={16}
                          strokeWidth={ICON_STROKE}
                          className={cx(styles.icon, busy && styles.spin)}
                          aria-hidden="true"
                        />
                        <span className={styles.statusLabel}>{STATUS_LABEL[item.status]}</span>
                      </span>
                    </BlurCrossfade>
                  </span>
                  <div className={styles.main}>
                    <p className={styles.text}>
                      <span className={styles.index}>{n}.</span> {item.text}
                    </p>
                    {item.status === "not_met" && item.reason ? (
                      <p className={styles.reason}>
                        <span className={styles.reasonLead}>Agent says:</span> {item.reason}
                      </p>
                    ) : null}
                    {item.setBy === "person" ? <span className={styles.setBy}>set by you</span> : null}
                    {hasEvidence(item) ? (
                      <Collapsible trigger={`Evidence for check ${n}`} className={styles.evidence}>
                        <div className={styles.evidenceBody}>
                          {item.evidence?.note ? <p className={styles.note}>{item.evidence.note}</p> : null}
                          {item.evidence?.href ? (
                            <Link href={item.evidence.href} variant="standalone">
                              {item.evidence.hrefLabel ?? item.evidence.href}
                            </Link>
                          ) : null}
                          {item.evidence?.output ? (
                            <CodeSnippet code={item.evidence.output} title={item.evidence.outputLabel ?? "Output"} />
                          ) : null}
                        </div>
                      </Collapsible>
                    ) : item.status !== "checking" ? (
                      <p className={styles.noEvidence}>No evidence attached.</p>
                    ) : null}
                    {onOverride || onRecheck ? (
                      <div className={styles.rowActions}>
                        {onOverride && item.status !== "met" ? (
                          <Button size="sm" appearance="outline" mode="neutral" disabled={busy} onClick={() => onOverride(item.id, "met")}>
                            Mark met
                          </Button>
                        ) : null}
                        {onOverride && item.status !== "not_met" ? (
                          <Button size="sm" appearance="outline" mode="neutral" disabled={busy} onClick={() => onOverride(item.id, "not_met")}>
                            Mark not met
                          </Button>
                        ) : null}
                        {onRecheck ? (
                          <Button size="sm" appearance="ghost" mode="neutral" iconStart="RotateCcw" disabled={busy} onClick={() => onRecheck(item.id)}>
                            Re-check
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          {onAccept || onSendBack ? (
            <footer className={styles.footer}>
              <span className={styles.footerNote}>
                {done ? "Every check is met." : "Unverified checks do not count as met."}
              </span>
              <span className={styles.actions}>
                {done && onAccept ? (
                  <>
                    {onSendBack ? (
                      <Button appearance="outline" mode="neutral" onClick={onSendBack}>
                        Send back to agent
                      </Button>
                    ) : null}
                    <Button appearance="solid" mode="primary" onClick={onAccept}>
                      Accept result
                    </Button>
                  </>
                ) : onSendBack ? (
                  <Button appearance="solid" mode="primary" disabled={checking} onClick={onSendBack}>
                    Send back to agent
                  </Button>
                ) : null}
              </span>
            </footer>
          ) : null}
          <span className={styles.srOnly} aria-live="polite">
            {checking ? "Checking" : `${result.label}. ${met} of ${criteria.length} checks met.`}
          </span>
        </div>
      )}
    </Card>
  );
}
