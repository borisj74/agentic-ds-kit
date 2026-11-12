import contract from "../../packages/kit/contracts/plans.json";
import type { BlockDoc } from "./types";

export const plansDoc: BlockDoc = {
  slug: "plans",
  label: "Plans",
  name: "Plans",
  contract,
  lead:
    "A whole pricing section. Plan cards with one Monthly / Yearly switch and the questions people ask before they buy. The recommended plan's button is the one primary.",
  usage: `import { Plans } from "agentic-ds-kit";

export function Pricing({ plans, faqs }) {
  return (
    <main className="layout-content">
      <Plans
        title="Pricing"
        description="Start free. Upgrade when your team grows."
        plans={plans}            // PricingPlans plans; mark one recommended
        faqs={faqs}              // { id, question, answer }[]
        savingsLabel="Save 20% with yearly"
        defaultInterval="month"  // or interval + onIntervalChange
        onChoosePlan={(id, interval) => checkout(id, interval)}
      />
    </main>
  );
}`,
};
