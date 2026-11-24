"use client";

import { useEffect, useState } from "react";
import { Button, EvalSuite, type EvalCase, type EvalStatus } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { EVAL_BASELINE, EVAL_CANDIDATE, EVAL_CASES } from "@/lib/blocks/eval-suite.sample";

/**
 * EvalSuite with 40 cases from a support-reply agent, v12 against v13. Accept as new expected and
 * Flag case review regressions live; Re-run plays the running state; the buttons above show the
 * running and error states.
 */
export function EvalSuiteDemo() {
  const [cases, setCases] = useState<EvalCase[]>(EVAL_CASES);
  const [status, setStatus] = useState<EvalStatus>("done");
  const [progress, setProgress] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(1, p + 0.1);
        if (next >= 1) setStatus("done");
        return next;
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [status]);

  function mark(id: string, change: Partial<EvalCase>, message: string) {
    setCases((list) => list.map((c) => (c.id === id ? { ...c, ...change } : c)));
    setNote(message);
  }

  function rerun() {
    setProgress(0);
    setStatus("running");
    setNote("Re-running 40 cases");
  }

  return (
    <>
      <div className={styles.toolbar}>
        <Button size="sm" appearance="outline" mode="neutral" onClick={rerun}>
          Show running
        </Button>
        <Button size="sm" appearance="outline" mode="neutral" onClick={() => setStatus("error")}>
          Show error
        </Button>
        <Button
          size="sm"
          appearance="ghost"
          mode="neutral"
          iconStart="RotateCcw"
          onClick={() => {
            setCases(EVAL_CASES);
            setStatus("done");
            setProgress(1);
          }}
        >
          Reset
        </Button>
      </div>
      <EvalSuite
        title="Support reply agent: v13 vs v12"
        baseline={EVAL_BASELINE}
        candidate={EVAL_CANDIDATE}
        cases={cases}
        status={status}
        progress={progress}
        errorMessage="The run stopped at case 23: the model provider timed out after 60 seconds."
        onAcceptExpected={(id) => mark(id, { accepted: true }, "Accepted as the new expected output")}
        onFlag={(id) => mark(id, { flagged: true }, "Case flagged for the prompt owner")}
        onRerun={rerun}
        onPromote={() => setNote("v13 promoted")}
      />
      <p role="status" className={styles.srOnly}>
        {note}
      </p>
    </>
  );
}
