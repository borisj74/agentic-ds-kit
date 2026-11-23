"use client";

import { useId, useMemo } from "react";
import { CircleCheck } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Card, type CardAction } from "../Card";
import { InvoiceDocument } from "../InvoiceDocument";
import { ListView } from "../ListView";
import { UsageList } from "../UsageList";
import { UsageMeter } from "../UsageMeter";
import { USAGE_WARN_AT } from "../UsageMeter/UsageMeter";
import { cx } from "../shared/cx";
import { invoiceItems, limitsSummary, upgradeIsPrimary, upgradeLabel } from "./usageBilling.logic";
import type { UsageBillingProps } from "./UsageBilling.types";
import styles from "./UsageBilling.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  UsageBillingProps,
  UsageBillingPlan,
  UsageBillingAllowance,
  UsageBillingUpcoming,
  UsageBillingInvoice,
  UsageBillingInvoiceStatus,
} from "./UsageBilling.types";

/**
 * Block: plan usage and what it costs. The main allowance (UsageMeter) beside the plan card with
 * Upgrade, then the other limits (UsageList) beside recent invoices (ListView with Download).
 */
export function UsageBilling(props: UsageBillingProps) {
  const {
    plan,
    allowance,
    upcoming,
    limits = [],
    invoices = [],
    invoiceLimit = 4,
    onUpgrade,
    onManagePayment,
    onDownloadInvoice,
    onViewInvoices,
    onViewUsage,
    title = "Usage & billing",
    description = "Your plan, what you have used this period and what it costs.",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const rows = useMemo(() => invoiceItems(invoices, invoiceLimit), [invoices, invoiceLimit]);

  const planActions: CardAction[] = [];
  if (onManagePayment) planActions.push({ label: "Manage payment", appearance: "outline", mode: "neutral", onClick: onManagePayment });
  if (onUpgrade) {
    const primary = upgradeIsPrimary(allowance.used, allowance.limit, allowance.warnAt ?? USAGE_WARN_AT);
    planActions.push({
      label: upgradeLabel(plan.upgradeTo),
      appearance: primary ? "solid" : "outline",
      mode: primary ? "primary" : "neutral",
      onClick: onUpgrade,
    });
  }

  const invoicesLabel = `Recent invoices, ${rows.length} of ${invoices.length}`;

  const limitsCard = limits.length ? (
    <Card title="Other limits" description={limitsSummary(limits)}>
      <UsageList label="Other limits" items={limits} />
    </Card>
  ) : null;

  const invoicesCard = invoices.length ? (
    <Card
      title="Recent invoices"
      description={`Last ${rows.length} of ${invoices.length}`}
      headerAction={onViewInvoices ? { label: "View all", onClick: onViewInvoices } : undefined}
    >
      <ListView label={invoicesLabel} size="sm" items={rows} onAction={(invoiceId) => onDownloadInvoice?.(invoiceId)} />
    </Card>
  ) : null;

  return (
    <section {...rest} {...nisthaAttr("usagebilling", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.heading}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description ? <p className={styles.lead}>{description}</p> : null}
      </header>

      <div className={cx("layout-split--primary", styles.split)}>
        <UsageMeter {...allowance} className={styles.meter} onViewUsage={onViewUsage} />
        <Card title={`${plan.name} plan`} description="Current plan" actions={planActions}>
          <dl className={styles.plan}>
            <div className={styles.price}>
              <dt className={styles.srOnly}>Price</dt>
              <dd className={styles.figure}>{plan.price}</dd>
              {plan.priceNote ? <dd className={styles.caption}>{plan.priceNote}</dd> : null}
            </div>
            {plan.nextCharge ? (
              <div className={styles.fact}>
                <dt className={styles.caption}>Next charge</dt>
                <dd className={styles.value}>{plan.nextCharge}</dd>
              </div>
            ) : null}
            {plan.paymentMethod ? (
              <div className={styles.fact}>
                <dt className={styles.caption}>Payment method</dt>
                <dd className={styles.value}>{plan.paymentMethod}</dd>
              </div>
            ) : null}
            {plan.fit ? (
              <div className={styles.fit}>
                <dt className={styles.srOnly}>{plan.upgradeTo ? `${plan.upgradeTo} plan` : "Upgrade"}</dt>
                <dd className={styles.fitText}>
                  <CircleCheck size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.fitIcon} />
                  {plan.fit}
                </dd>
              </div>
            ) : null}
          </dl>
        </Card>
      </div>

      {upcoming ? (
        <>
          <div className={cx("layout-split", styles.split)}>
            <InvoiceDocument {...upcoming} status="estimate" />
            {limitsCard}
          </div>
          {invoicesCard}
        </>
      ) : limitsCard || invoicesCard ? (
        <div className={cx("layout-split", styles.split)}>
          {limitsCard}
          {invoicesCard}
        </div>
      ) : null}
    </section>
  );
}
