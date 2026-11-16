"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Alert, Badge, CodeSnippet, InlineDiff } from "agentic-ds-kit";
// Example data in JSON: the findings quote the mistakes they catch (a raw hex value, a local
// import), so they live as data, not as code the review would read.
import sample from "@/lib/home-review.sample.json";
import { PreviewScope } from "../ThemeScope";
import { useDemoLoop } from "./useDemoLoop";
import styles from "./Home.module.css";

const HOME_REVIEW_COMMAND = sample.command;
const HOME_REVIEW_FINDINGS = sample.findings;

/** Ticks per loop: one to read the findings, one per fix, then a pause on "0 issues". */
const STEPS = HOME_REVIEW_FINDINGS.length + 3;

/**
 * The review step, played out: the command finds three problems on a billing page, each fix lands
 * in turn, and the count runs down to 0 issues. Kit parts with example data; inert, so the
 * Accept and Reject buttons take no clicks on the landing page.
 */
export function HomeReview() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(1800);
  const fixed = Math.max(0, Math.min(HOME_REVIEW_FINDINGS.length, (tick % STEPS) - 1));
  const left = HOME_REVIEW_FINDINGS.length - fixed;

  // The fixes collapse as they land, so the demo would shrink and grow each loop and move the
  // page below it. Hold it at the tallest height it has reached at this width.
  const boxRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number>();
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let width = box.clientWidth;
    let tallest = 0;
    const observer = new ResizeObserver(() => {
      if (box.clientWidth !== width) {
        width = box.clientWidth;
        tallest = 0;
        setMinHeight(undefined);
        return;
      }
      if (box.offsetHeight > tallest) {
        tallest = box.offsetHeight;
        setMinHeight(tallest);
      }
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <PreviewScope className={styles.review}>
      <div ref={ref} inert>
        <div ref={boxRef} className={styles.reviewInner} style={{ minHeight }}>
        <CodeSnippet code={HOME_REVIEW_COMMAND} ariaLabel="Review command, example" />
        <div className={styles.reviewHead}>
          <span className={styles.reviewTitle}>app/billing</span>
          <Badge tone={left === 0 ? "success" : "danger"} appearance="soft">
            {left === 1 ? "1 issue" : `${left} issues`}
          </Badge>
        </div>
        <ol className={styles.reviewList} aria-label="Review findings, example">
          {HOME_REVIEW_FINDINGS.map((finding, index) => {
            const done = index < fixed;
            return (
              <li key={finding.id} className={styles.reviewItem}>
                <p className={styles.reviewMessage}>
                  <code className={styles.reviewRule}>{finding.rule}</code>
                  <span>{finding.message}</span>
                </p>
                <InlineDiff
                  title={done ? "Fixed" : "Fix"}
                  file={finding.file}
                  lines={[
                    { type: "remove", text: finding.fix.remove, oldNo: finding.fix.oldNo },
                    { type: "add", text: finding.fix.add, newNo: finding.fix.oldNo },
                  ]}
                  status={done ? "accepted" : "pending"}
                  resolvedSummary={finding.summary}
                  onAccept={() => {}}
                  onReject={() => {}}
                />
              </li>
            );
          })}
        </ol>
        {left === 0 ? (
          <Alert variant="success" title="0 issues">
            Only kit parts and tokens on this page. Ready for review by a person.
          </Alert>
        ) : null}
        </div>
      </div>
    </PreviewScope>
  );
}
