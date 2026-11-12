"use client";

import { useState } from "react";
import { Button, PlanReview, type AgentPlanStep, type PlanReviewDecision } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { PLAN_REVIEW_CHANGES, PLAN_REVIEW_STEPS, PLAN_REVIEW_TITLE } from "@/lib/blocks/plan-review.sample";

/**
 * PlanReview with the sample rate-limiting plan. Step edits stick, Approve / Request changes /
 * Reject lock the plan and show the outcome, and Start over brings the draft back.
 */
export function PlanReviewDemo() {
  const [steps, setSteps] = useState<AgentPlanStep[]>(PLAN_REVIEW_STEPS);
  const [decision, setDecision] = useState<PlanReviewDecision>("pending");
  const [note, setNote] = useState<string | undefined>();
  const [status, setStatus] = useState("");

  return (
    <>
      <PlanReview
        planTitle={PLAN_REVIEW_TITLE}
        agent="Backend agent"
        target="acme/api"
        steps={steps}
        onStepsChange={setSteps}
        changes={PLAN_REVIEW_CHANGES}
        changesPeriod="Expected after the run"
        decision={decision}
        decisionNote={note}
        onApprove={({ autonomy, steps: approved }) => {
          setDecision("approved");
          setNote(`By you · ${approved.length} steps · autonomy: ${autonomy}. The run starts now.`);
          setStatus("Plan approved");
        }}
        onRequestChanges={(text) => {
          setDecision("changes-requested");
          setNote(`Sent to Backend agent: “${text}”`);
          setStatus("Changes requested");
        }}
        onReject={() => {
          setDecision("rejected");
          setNote("By you. Nothing ran.");
          setStatus("Plan rejected");
        }}
      />
      {decision !== "pending" ? (
        <Button
          size="sm"
          appearance="ghost"
          mode="neutral"
          iconStart="RotateCcw"
          onClick={() => {
            setDecision("pending");
            setNote(undefined);
            setStatus("Plan back to draft");
          }}
        >
          Start over (demo)
        </Button>
      ) : null}
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
