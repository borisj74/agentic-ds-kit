"use client";

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

/**
 * How it works: the contract on one side and the component it describes on the other,
 * rendered live. It steps through the risk levels the contract allows, and the caption shows the
 * prop it got. Inert, so a click changes nothing on the landing page.
 */
export function HomeLoop() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2400);
  // Starts on "high", the riskiest case, then low and medium.
  const risk = RISKS[(tick + RISKS.length - 1) % RISKS.length];

  return (
    <div className={styles.loop}>
      <div className={styles.loopPane}>
        <CodeSnippet code={EXCERPT} title="contracts/approvalcard.json" language="json" wrap ariaLabel="Excerpt of the ApprovalCard contract" />
      </div>
      <div className={styles.loopPane}>
        <PreviewScope className={styles.loopStage}>
          <div ref={ref} inert>
            <ApprovalCard
              title="Run the database migration?"
              description="Adds a nullable column to invoices on staging."
              risk={risk}
              action={{ kind: "command", command: "npm run db:migrate -- --env staging", target: "acme/api" }}
              onApprove={() => {}}
              onDeny={() => {}}
            />
          </div>
        </PreviewScope>
      </div>
    </div>
  );
}
