import contract from "../../packages/kit/contracts/usagebilling.json";
import type { BlockDoc } from "./types";

export const usageBillingDoc: BlockDoc = {
  slug: "usage-billing",
  label: "Usage & billing",
  name: "UsageBilling",
  contract,
  lead:
    "Plan usage and what it costs. The main allowance sits beside the plan, with Upgrade as the one primary action, then the other limits and the latest invoices to download.",
  usage: `import { UsageBilling } from "agentic-ds-kit";

export function Billing({ plan, credits, limits, invoices }) {
  return (
    <main className="layout-content">
      <UsageBilling
        plan={plan}              // { name, price, priceNote?, nextCharge?, paymentMethod?, upgradeTo? }
        allowance={credits}      // UsageMeter props: { title, used, limit, unit?, daily?, … }
        limits={limits}          // UsageList items: { id, label, used, limit, unit? }[]
        invoices={invoices}      // { id, number, date, amount, status }[], newest first
        onUpgrade={() => openCheckout("team")}
        onManagePayment={() => openBillingPortal()}
        onDownloadInvoice={(id) => download(id)}
      />
    </main>
  );
}`,
};
