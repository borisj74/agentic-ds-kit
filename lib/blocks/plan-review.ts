import contract from "../../packages/kit/contracts/planreview.json";
import type { BlockDoc } from "./types";

export const planReviewDoc: BlockDoc = {
  slug: "plan-review",
  label: "Plan review",
  name: "PlanReview",
  contract,
  lead:
    "The go / no-go before an agent runs. Its steps, which you can edit, sit beside what the plan expects to change and how far the agent may go without asking. Approve hands back the steps and the autonomy you chose; or send the plan back with a note, or reject it.",
  usage: `import { PlanReview } from "agentic-ds-kit";

export function PlanPage({ plan }) {
  const [steps, setSteps] = useState(plan.steps);
  return (
    <main className="layout-content">
      <PlanReview
        planTitle={plan.title}
        agent="Backend agent"
        target="acme/api"
        steps={steps}               // AgentPlan steps; edits come back through onStepsChange
        onStepsChange={setSteps}
        changes={plan.changes}      // ChangeSummary items: before → after, delta, sentiment
        onApprove={({ autonomy, steps }) => run(plan.id, { autonomy, steps })}
        onRequestChanges={(note) => sendBack(plan.id, note)}
        onReject={() => reject(plan.id)}
      />
    </main>
  );
}`,
};
