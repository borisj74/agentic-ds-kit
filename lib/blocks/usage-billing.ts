import contract from "../../packages/kit/contracts/usagebilling.json";
import type { BlockDoc } from "./types";

export const usageBillingDoc: BlockDoc = {
  slug: "usage-billing",
  label: "Usage & billing",
  name: "UsageBilling",
  contract,
  lead:
    "Plan usage and what it costs. The main allowance sits beside the plan, then the next invoice as an estimate beside the other limits, then the latest invoices to download. Upgrade turns solid only once usage reaches the warning line.",
  usage: `import { UsageBilling } from "agentic-ds-kit";

export function Billing({ plan, credits, nextInvoice, limits, invoices }) {
  return (
    <main className="layout-content">
      <UsageBilling
        plan={plan}              // { name, price, priceNote?, nextCharge?, paymentMethod?, upgradeTo?, fit? }
        allowance={credits}      // UsageMeter props: { title, used, limit, unit?, daily?, overage?, … }
        upcoming={nextInvoice}   // InvoiceDocument props, shown as an Estimate
        limits={limits}          // UsageList items: { id, label, used, limit, unit? }[]
        invoices={invoices}      // { id, number, date, amount, status }[], newest first
        onUpgrade={() => openCheckout("scale")}
        onManagePayment={() => openBillingPortal()}
        onDownloadInvoice={(id) => download(id)}
      />
    </main>
  );
}`,
};
