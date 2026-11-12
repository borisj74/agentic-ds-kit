"use client";

import { useState } from "react";
import { Plans } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { PLANS_COMPARISON, PLANS_FAQS, PLANS_SAMPLE } from "@/lib/blocks/plans.sample";

/** Plans with the sample workspace pricing. Choosing a plan says so in a live status line. */
export function PlansDemo() {
  const [status, setStatus] = useState("");
  return (
    <>
      <Plans
        title="Pricing"
        description="Start free with two agents. Upgrade when your team grows."
        plans={PLANS_SAMPLE}
        comparison={PLANS_COMPARISON}
        faqs={PLANS_FAQS}
        savingsLabel="Save 20% with yearly"
        footnote="Prices exclude tax. Change or cancel any time."
        onChoosePlan={(id, interval) => {
          const plan = PLANS_SAMPLE.find((p) => p.id === id)?.name ?? id;
          setStatus(`Chose ${plan}, billed ${interval === "year" ? "yearly" : "monthly"}`);
        }}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
