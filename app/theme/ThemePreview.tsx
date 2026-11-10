"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  Alert,
  AppHeader,
  Badge,
  BarChart,
  Button,
  Card,
  DataTable,
  Drawer,
  Field,
  Input,
  Modal,
  Scoreboard,
  SideNav,
  Tabs,
} from "agentic-ds-kit";
import type { SideNavItemData } from "agentic-ds-kit";
import styles from "./theme.module.css";

const BREAKPOINT_TOKEN = "--grid-breakpoint-md";
const BREAKPOINT_FALLBACK = "64rem";

function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(BREAKPOINT_TOKEN).trim();
  return `(width < ${value || BREAKPOINT_FALLBACK})`;
}

function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery()).matches, () => false);
}

const NAV: SideNavItemData[] = [
  { id: "overview", label: "Overview", icon: "House" },
  { id: "orders", label: "Orders", icon: "ShoppingBag", badge: "8" },
  { id: "customers", label: "Customers", icon: "Users" },
];

export function ThemePreview({
  css,
  fontClassName,
  drawerStyle,
  showAccentSeries,
}: {
  css: string;
  fontClassName: string;
  drawerStyle: CSSProperties;
  showAccentSeries: boolean;
}) {
  const narrow = useNarrow();
  const [navOpen, setNavOpen] = useState(false);
  const [page, setPage] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const items = NAV.map((item) => ({ ...item, active: item.id === page, onClick: () => setPage(item.id) }));

  return (
    <div id="theme-preview" className={`${styles.stage} ${fontClassName}`}>
      <style>{css}</style>
      <div className="layout-shell">
        <AppHeader
          title="Northwind"
          mark="N"
          radius="none"
          searchPlaceholder="Search orders"
          logo={
            narrow ? (
              <Button
                appearance="ghost"
                mode="neutral"
                size="sm"
                iconStart="Menu"
                ariaLabel="Open navigation"
                onClick={() => setNavOpen(true)}
              />
            ) : undefined
          }
          actions={
            <Button appearance="solid" mode="primary" size="sm">
              New order
            </Button>
          }
        />
        <div className="layout-app">
          {narrow ? null : <SideNav title="Northwind" showHeader={false} radius="none" items={items} />}
          <main className="layout-canvas layout-canvas--sticky-header">
            <div className="layout-content">
              <Alert variant="info" title="March close">
                Revenue is ahead of the forecast. Refunds are still inside the usual band.
              </Alert>
              <Scoreboard
                items={[
                  { label: "Revenue", value: "$48.2k", delta: "+12.4%", trend: "up", hint: "vs last 30 days" },
                  { label: "Orders", value: "318", delta: "+4.1%", trend: "up", hint: "Open and paid" },
                  { label: "Refunds", value: "12", delta: "-1.8%", trend: "down", hint: "This week" },
                ]}
              />
              <div className="layout-split">
                <Card title="Revenue" description="Product and services, last four quarters" size="sm">
                  <div data-accent-series={showAccentSeries ? "" : undefined}>
                    <BarChart
                      title="Revenue"
                      description="Last four quarters"
                      categories={["Q1", "Q2", "Q3", "Q4"]}
                      series={[
                        { label: "Product", data: [120, 180, 150, 210] },
                        { label: "Services", data: [80, 96, 110, 140] },
                      ]}
                      height={180}
                      showTable={false}
                    />
                  </div>
                </Card>
                <Card title="Order" description="Controls on this surface" size="sm">
                  <div className={styles.stack}>
                    <Field label="Customer" htmlFor="theme-customer" hint="Shown on the invoice.">
                      <Input id="theme-customer" placeholder="Northwind" />
                    </Field>
                    <div className={styles.exports}>
                      <Badge tone="brand">Brand</Badge>
                      <Badge tone="success">Paid</Badge>
                      <Badge tone="warning">Hold</Badge>
                      <Badge tone="highlight">Accent</Badge>
                    </div>
                    <div className={styles.exports}>
                      <Button appearance="outline" mode="primary" size="sm">
                        Outline
                      </Button>
                      <Button appearance="soft" mode="primary" size="sm">
                        Soft
                      </Button>
                      <Button appearance="ghost" mode="neutral" size="sm">
                        Ghost
                      </Button>
                      <Button appearance="outline" mode="danger" size="sm">
                        Danger
                      </Button>
                    </div>
                    <Button appearance="outline" mode="neutral" size="sm" onClick={() => setModalOpen(true)}>
                      Review order
                    </Button>
                  </div>
                </Card>
              </div>
              <Tabs
                ariaLabel="Order views"
                items={[
                  {
                    id: "orders",
                    label: "Orders",
                    content: (
                      <DataTable
                        caption="Open orders"
                        cellSize="sm"
                        columns={[
                          { key: "order", header: "Order" },
                          { key: "account", header: "Account" },
                          { key: "status", header: "Status" },
                          { key: "total", header: "Total", type: "number" },
                        ]}
                        rows={[
                          { order: "1042", account: "Northwind", status: "Paid", total: "$1,280" },
                          { order: "1048", account: "Contoso", status: "Hold", total: "$640" },
                          { order: "1051", account: "Fabrikam", status: "Open", total: "$2,140" },
                        ]}
                      />
                    ),
                  },
                  {
                    id: "notes",
                    label: "Notes",
                    content: (
                      <Alert variant="success" title="Ready to ship">
                        Three orders cleared review this morning.
                      </Alert>
                    ),
                  },
                ]}
              />
            </div>
          </main>
        </div>
      </div>
      <Modal
        contained
        open={modalOpen}
        title="Review order"
        description="1042 · Northwind"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button appearance="ghost" mode="neutral" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button appearance="outline" mode="primary" onClick={() => setModalOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <Field label="Reference" htmlFor="theme-order-ref">
          <Input id="theme-order-ref" defaultValue="PO-1042" />
        </Field>
      </Modal>
      {narrow ? (
        <Drawer open={navOpen} title="Northwind" side="left" size="sm" onClose={() => setNavOpen(false)} style={drawerStyle}>
          <SideNav title="Northwind" open showHeader={false} radius="md" items={items} />
        </Drawer>
      ) : null}
    </div>
  );
}
