"use client";

import { useState } from "react";
import { IntegrationPicker, type IntegrationItem } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";

const ITEMS: IntegrationItem[] = [
  { id: "ledger", name: "Northwind Ledger", description: "Sync invoices and payments", category: "Accounting", status: "connected", icon: "FileText", publisher: "Example Inc.", permissions: ["Read invoices and payments", "Post paid invoices to the ledger"], connectedNote: "Connected by Maya Chen · 3 Nov" },
  { id: "bank", name: "Ledgerline Bank", description: "Match bank feeds to invoices", category: "Banking", status: "available", icon: "Landmark", publisher: "Example Inc.", permissions: ["Read bank transactions", "Match payments to invoices"] },
  { id: "mail", name: "Mailroom", description: "Send invoices from your domain", category: "Email", status: "available", icon: "Mail" },
  { id: "chat", name: "Team Chat", description: "Post payment alerts to a channel", category: "Messaging", status: "connected", icon: "Hash" },
  { id: "db", name: "Warehouse DB", description: "Nightly export of billing data", category: "Data", status: "available", icon: "Database" },
  { id: "tax", name: "TaxBridge", description: "Automatic tax rates by region", category: "Tax", status: "comingSoon", icon: "Gauge" },
  { id: "books", name: "Ledgerly", description: "Two-way sync with your books", category: "Accounting", status: "available", icon: "FileText" },
];
const CATEGORIES = ["Accounting", "Banking", "Email", "Data"];
const noop = () => {};

export function IntegrationPickerDoc() {
  const [items, setItems] = useState(ITEMS);
  const [connecting, setConnecting] = useState<string | undefined>();
  const connect = (id: string) => {
    setConnecting(id);
    window.setTimeout(() => {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "connected" } : item)));
      setConnecting(undefined);
    }, 900);
  };
  return (
    <AgentDocFrame
      id="integrationpicker"
      name="IntegrationPicker"
      lede="A filterable catalogue of integrations. Providers here are examples."
      summary="Search, pick a category or Connected, and Connect a tile: it reads Connecting…, then Connected with Manage."
      preview={
        <IntegrationPicker
          note="example providers"
          items={items}
          categories={CATEGORIES}
          showConnected
          onConnect={connect}
          onManage={noop}
          connectingId={connecting}
          onRequest={noop}
        />
      }
      usage="Every tile ends in a status word (Not connected, Connected, Connecting…, Coming soon) and at most one action, Connect or Manage. Connecting and Coming soon have no button. showConnected adds a Connected segment with its count. connectFlow detail opens a Drawer with what the app can access and Connect or Disconnect; it replaces AppDirectory. tileSize compact puts each tile on one row. Use the integration-settings pattern for one connected integration."
      code={`<IntegrationPicker
  note="example providers"
  items={integrations}
  onConnect={connect}
  onManage={manage}
  connectingId={connecting}
  onRequest={request}
/>`}
      variants={[
        {
          title: "Mixed catalogue — connected, available, coming soon",
          about: "All categories; one action per tile.",
          code: `<IntegrationPicker note="example providers" items={integrations} onConnect={connect} onManage={manage} />`,
          render: <IntegrationPicker note="example providers" items={ITEMS.slice(0, 6)} categories={CATEGORIES} onConnect={noop} onManage={noop} />,
        },
        {
          title: "Filtered — Accounting, connect in progress",
          about: "The category filter narrows the grid; the tile being connected reads Connecting… with no button.",
          code: `<IntegrationPicker … category="Accounting" connectingId="books" />`,
          render: <IntegrationPicker note="example providers" items={ITEMS} categories={CATEGORIES} category="Accounting" onConnect={noop} onManage={noop} connectingId="books" />,
        },
        {
          title: "Connected segment",
          about: "showConnected adds Connected with its count after All; here it is selected.",
          code: `<IntegrationPicker … showConnected category="connected" />`,
          render: <IntegrationPicker note="example providers" items={ITEMS} categories={CATEGORIES} showConnected category="connected" onConnect={noop} onManage={noop} />,
        },
        {
          title: "Detail flow (replaces AppDirectory)",
          about: "Connect and Manage open a Drawer with the app's detail, what it can access, and Connect or Disconnect. The drawer's Connect is the one solid primary.",
          code: `<IntegrationPicker title="Apps" items={apps} showConnected connectFlow="detail" onConnect={connect} onDisconnect={disconnect} />`,
          render: <IntegrationPicker title="Apps" note="example providers" items={ITEMS.slice(0, 4)} categories={CATEGORIES} showConnected connectFlow="detail" onConnect={noop} onDisconnect={noop} />,
        },
        {
          title: "Compact tiles",
          about: "Name, description and the word or action on one row. SetupGuide uses the same tile under its current task.",
          code: `<IntegrationPicker … tileSize="compact" />`,
          render: <IntegrationPicker note="example providers" items={ITEMS.slice(0, 4)} categories={CATEGORIES} tileSize="compact" onConnect={noop} onManage={noop} />,
        },
        {
          title: "Search empty",
          about: "No match: a kit Empty with Request an integration.",
          code: `<IntegrationPicker … query="stripe" onRequest={request} />`,
          render: <IntegrationPicker note="example providers" items={ITEMS} categories={CATEGORIES} query="stripe" onConnect={noop} onRequest={noop} />,
        },
        {
          title: "Loading",
          about: "Skeleton tiles.",
          code: `<IntegrationPicker items={[]} categories={categories} loading onConnect={connect} />`,
          render: <IntegrationPicker note="example providers" items={[]} categories={CATEGORIES} loading onConnect={noop} />,
        },
        {
          title: "Error",
          about: "A load error with Retry.",
          code: `<IntegrationPicker items={[]} error="Couldn't load the catalogue." onRetry={retry} onConnect={connect} />`,
          render: <IntegrationPicker note="example providers" items={[]} categories={CATEGORIES} error="Couldn’t load the catalogue." onRetry={noop} onConnect={noop} />,
        },
      ]}
    />
  );
}
