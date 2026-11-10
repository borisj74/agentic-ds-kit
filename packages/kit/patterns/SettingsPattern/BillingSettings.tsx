"use client";

import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Empty } from "../../ui/Empty";
import { ListView } from "../../ui/ListView";
import { Skeleton } from "../../ui/Skeleton";
import { UsageList } from "../../ui/UsageList";
import { BillingSchedulePattern } from "../BillingSchedulePattern";
import { DOCUMENTS, OVERDUE, PLAN, RECENT_CHARGES, USAGE, USAGE_OVERDUE } from "./settings-data";

export type BillingState = "ready" | "overdue" | "loading" | "error";

export interface BillingSettingsProps {
  state?: BillingState;
  onRetry?: () => void;
  onUpgrade?: () => void;
  onComparePlans?: () => void;
  onPayNow?: () => void;
  onUpdateCard?: () => void;
  onViewAllCharges?: () => void;
  onDownload?: (documentId: string) => void;
}

/**
 * Billing page: current plan, usage this period, the billing-schedule example in its summary
 * mode (three latest charges, View all), and latest documents. Overdue puts a danger Alert on
 * top and makes Pay now the one solid primary; Upgrade steps away.
 */
export function BillingSettings({
  state = "ready",
  onRetry,
  onUpgrade,
  onComparePlans,
  onPayNow,
  onUpdateCard,
  onViewAllCharges,
  onDownload,
}: BillingSettingsProps) {
  if (state === "error") {
    return (
      <div className="layout-content">
        <Empty
            outlined
            icon="CircleX"
            title="Couldn’t load billing"
            description="The billing service didn’t respond. Your plan and payments are not affected."
            actions={
              <Button appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={onRetry}>
                Retry
              </Button>
            }
          />
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="layout-content" aria-busy="true">
        <div className="layout-split">
          <div className="settings-pattern__stack">
            <Card title="Current plan">
              <Skeleton lines={3} label="Loading plan" />
            </Card>
            <Card title="Usage this period">
              <Skeleton lines={5} label="Loading usage" />
            </Card>
          </div>
          <div className="settings-pattern__stack">
            <Card title="Billing schedule">
              <Skeleton lines={4} label="Loading charges" />
            </Card>
            <Card title="Latest documents">
              <Skeleton lines={3} label="Loading documents" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const overdue = state === "overdue";

  return (
    <div className="layout-content">
      {overdue ? (
        <div className="settings-pattern__notice">
          <Alert variant="danger" title={OVERDUE.title}>
            {OVERDUE.body}
          </Alert>
          <div className="settings-pattern__actions">
            <Button appearance="outline" mode="neutral" onClick={onUpdateCard}>
              Update card
            </Button>
            <Button onClick={onPayNow}>Pay now</Button>
          </div>
        </div>
      ) : null}

      <div className="layout-split">
        <div className="settings-pattern__stack">
          <Card
            title="Current plan"
            description={overdue ? `${PLAN.name} · monthly` : `${PLAN.name} · ${PLAN.renews}`}
            headerAction={{ label: "Compare plans", appearance: "ghost", mode: "neutral", onClick: onComparePlans }}
          >
            <div className="settings-pattern__plan">
              <div className="settings-pattern__figure-group">
                <span className="settings-pattern__figure">{PLAN.price}</span>
                <span className="settings-pattern__caption">{PLAN.priceNote}</span>
              </div>
              <div className="settings-pattern__figure-group settings-pattern__figure-group--end">
                <span className="settings-pattern__caption">Next charge</span>
                <span className="settings-pattern__mono">{PLAN.nextCharge}</span>
              </div>
              {overdue ? null : (
                <Button onClick={onUpgrade}>{`Upgrade to ${PLAN.upgradeTo}`}</Button>
              )}
            </div>
          </Card>

          <Card title="Usage this period" description="Resets 01 Dec · example data">
            <UsageList label="Plan usage" items={overdue ? USAGE_OVERDUE : USAGE} />
          </Card>
        </div>

        <div className="settings-pattern__stack">
          <Card>
            <BillingSchedulePattern
              charges={RECENT_CHARGES}
              description="Upcoming and recent charges"
              summary
              onViewAll={onViewAllCharges}
            />
          </Card>
          <Card title="Latest documents">
            <ListView
              label="Latest documents"
              size="sm"
              items={DOCUMENTS.map((doc) => ({
                ...doc,
                icon: "FileText",
                actions: [{ id: "download", label: `Download ${doc.primary}`, icon: "Download" }],
              }))}
              onAction={(id) => onDownload?.(id)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
