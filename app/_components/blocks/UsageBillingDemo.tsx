"use client";

import { useState } from "react";
import { UsageBilling } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { USAGE_ALLOWANCE, USAGE_INVOICES, USAGE_LIMITS, USAGE_PLAN } from "@/lib/blocks/usage-billing.sample";

/**
 * UsageBilling with a sample Pro workspace late in its period. The actions have nowhere to go in
 * the docs, so each one says what it would do in the live status line.
 */
export function UsageBillingDemo() {
  const [status, setStatus] = useState("");

  return (
    <>
      <UsageBilling
        plan={USAGE_PLAN}
        allowance={USAGE_ALLOWANCE}
        limits={USAGE_LIMITS}
        invoices={USAGE_INVOICES}
        onUpgrade={() => setStatus("Would open checkout for the Team plan")}
        onManagePayment={() => setStatus("Would open the payment method settings")}
        onDownloadInvoice={(id) => {
          const invoice = USAGE_INVOICES.find((item) => item.id === id);
          setStatus(`Would download ${invoice?.number ?? id}`);
        }}
        onViewInvoices={() => setStatus("Would open all invoices")}
        onViewUsage={() => setStatus("Would open the usage report")}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
