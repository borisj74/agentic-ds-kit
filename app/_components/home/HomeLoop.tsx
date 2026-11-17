"use client";

import { useEffect, useRef, useState } from "react";
import { ApprovalCard, CodeSnippet } from "agentic-ds-kit";
import contract from "agentic-ds-kit/contracts/approvalcard.json";
import { PreviewScope } from "../ThemeScope";
import { useDemoLoop } from "./useDemoLoop";
import styles from "./Home.module.css";

/** The card steps through the risk levels the contract allows. */
const RISKS = contract.props.risk.values as ("low" | "medium" | "high")[];

/**
 * A short, real excerpt of contracts/approvalcard.json: what an agent reads before it renders.
 * Arrays stay on one line so the excerpt fits beside the card.
 */
const EXCERPT = JSON.stringify(
  {
    id: contract.id,
    level: contract.level,
    props: {
      title: contract.props.title.type,
      risk: contract.props.risk.values,
      action: "command | diff",
      status: contract.props.status.values,
    },
    doNot: [contract.doNot[1]],
  },
  null,
  2,
).replace(/\[\s+([^\]]*?)\s+\]/g, (_, items: string) => `[${items.split(/,\s+/).join(", ")}]`);

/** The diff the card shows: the contract's other action kind, and it brings the card to the code's height. */
const MIGRATION = {
  kind: "diff" as const,
  file: "migrations/0042_invoice_note.sql",
  lines: [
    { type: "context" as const, text: "BEGIN;" },
    { type: "remove" as const, text: "-- TODO: invoice notes" },
    { type: "add" as const, text: "ALTER TABLE invoices" },
    { type: "add" as const, text: "  ADD COLUMN note text NULL;" },
    { type: "add" as const, text: "CREATE INDEX invoices_note_idx" },
    { type: "add" as const, text: "  ON invoices (note);" },
    { type: "context" as const, text: "COMMIT;" },
  ],
};

/** Characters per keystroke tick, and the tick, so the excerpt writes itself in about 4 seconds. */
const CHARS_PER_TICK = 3;
const TICK_MS = 28;
const CARET = "▍";

/**
 * How many characters of the excerpt are written. All of it on the server and the first client
 * render (so nothing mismatches), and always under reduced motion. Otherwise it starts again from
 * nothing each time the section comes into view and types to the end.
 */
function useTyping<T extends Element>(text: string) {
  const ref = useRef<T>(null);
  const [count, setCount] = useState(text.length);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: number | undefined;
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setCount(0);
        id = window.setInterval(() => {
          setCount((value) => {
            const next = Math.min(text.length, value + CHARS_PER_TICK);
            if (next === text.length) stop();
            return next;
          });
        }, TICK_MS);
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [text]);

  return [ref, count] as const;
}

/**
 * The written part, a caret, and the rest as empty lines, so the snippet keeps its full height
 * while the code types in and nothing below it moves.
 */
function typed(text: string, count: number) {
  if (count >= text.length) return text;
  const rest = text.slice(count).split("\n").length - 1;
  return `${text.slice(0, count)}${CARET}${"\n".repeat(rest)}`;
}

/**
 * How it works: the contract writes itself on one side, then the component it describes renders
 * on the other and steps through the risk levels the contract allows. Inert, so a click changes
 * nothing on the landing page.
 */
export function HomeLoop() {
  const [typingRef, count] = useTyping<HTMLDivElement>(EXCERPT);
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2400);
  const written = count >= EXCERPT.length;
  // Starts on "high", the riskiest case, then low and medium.
  const risk = RISKS[(tick + RISKS.length - 1) % RISKS.length];

  return (
    <div ref={typingRef} className={styles.loop}>
      <div className={`${styles.loopPane} ${styles.loopType}`}>
        {/* An invisible full copy holds the final height, wrapped lines included, so nothing
            below moves while the code types in. */}
        <div className={styles.loopGhost} aria-hidden="true" inert>
          <CodeSnippet code={EXCERPT} title="contracts/approvalcard.json" language="json" wrap />
        </div>
        <CodeSnippet
          code={typed(EXCERPT, count)}
          title="contracts/approvalcard.json"
          language="json"
          wrap
          ariaLabel="Excerpt of the ApprovalCard contract"
        />
      </div>
      <div className={styles.loopPane}>
        {/* The card renders once its contract is written. */}
        <PreviewScope className={styles.loopStage}>
          <div ref={ref} className={styles.loopCard} data-shown={written ? "" : undefined} inert>
            <ApprovalCard
              title="Apply this migration?"
              description="Adds a nullable note column to invoices on staging."
              risk={risk}
              action={MIGRATION}
              onApprove={() => {}}
              onDeny={() => {}}
            />
          </div>
        </PreviewScope>
      </div>
    </div>
  );
}
