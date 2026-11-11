"use client";

import { useState } from "react";
import { NotificationStack, type NotificationItem } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const ITEMS: NotificationItem[] = [
  { id: "pay", title: "Payment received", body: "$782.40 from Acme Co for INV-2026-0117", createdAt: "5m", read: false, tone: "success", icon: "CreditCard" },
  { id: "signin", title: "New sign-in", body: "Chrome on macOS · London · example", createdAt: "1h", read: false, tone: "info" },
  { id: "card", title: "Card expiring", body: "Visa 4242 expires next month", createdAt: "1d", read: true, tone: "warning" },
  { id: "sent", title: "Invoice sent", body: "INV-2026-0116 to Globex", createdAt: "2d", read: true, tone: "neutral" },
];
const READ = ITEMS.map((item) => ({ ...item, read: true }));
const noop = () => {};

export function NotificationStackDoc() {
  const [items, setItems] = useState(ITEMS);
  const markRead = (id: string) => setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  return (
    <AgentDocFrame
      id="notificationstack"
      name="NotificationStack"
      lede="The durable in-app inbox: a bell with the unread count and a popover list."
      summary="Open the bell, open an item to mark it read, or Mark all read. The count chip goes away at zero."
      preview={
        <div className={agentDoc.stack}>
          <NotificationStack
            items={items}
            onItemClick={markRead}
            onMarkRead={markRead}
            onMarkAll={() => setItems(READ)}
            onViewAll={noop}
          />
          <NotificationStack inline items={items} onItemClick={markRead} onMarkAll={() => setItems(READ)} onViewAll={noop} />
        </div>
      }
      usage="Use NotificationStack for payments, sign-ins and billing updates people read later. It is built on the kit Popover; inline renders the same panel on a page. Toasts stay for instant feedback, and agent approvals live in AgentInbox."
      code={`<NotificationStack
  items={notifications}
  onItemClick={open}
  onMarkRead={markRead}
  onMarkAll={markAll}
  onViewAll={viewAll}
/>`}
      variants={[
        {
          title: "Open — unread items",
          about: "Unread items have a bold title and say Unread to screen readers; the header shows the unread count and Mark all read.",
          code: `<NotificationStack inline items={notifications} onMarkAll={markAll} onViewAll={viewAll} />`,
          render: <NotificationStack inline items={ITEMS} onItemClick={noop} onMarkAll={noop} onViewAll={noop} />,
        },
        {
          title: "All read",
          about: "No bold titles, no count; Mark all read is disabled.",
          code: `<NotificationStack inline items={readNotifications} onMarkAll={markAll} onViewAll={viewAll} />`,
          render: <NotificationStack inline items={READ} onItemClick={noop} onMarkAll={noop} onViewAll={noop} />,
        },
        {
          title: "Empty",
          about: "A kit Empty: you're all caught up.",
          code: `<NotificationStack inline items={[]} onMarkAll={markAll} onViewAll={viewAll} />`,
          render: <NotificationStack inline items={[]} onMarkAll={noop} onViewAll={noop} />,
        },
        {
          title: "Loading and error",
          about: "Skeleton rows while loading; a load error with Retry.",
          code: `<NotificationStack inline items={[]} loading />
<NotificationStack inline items={[]} error="Couldn't load notifications." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <NotificationStack inline items={[]} loading onMarkAll={noop} onViewAll={noop} />
              <NotificationStack inline items={[]} error="Couldn’t load notifications." onRetry={noop} onMarkAll={noop} onViewAll={noop} />
            </div>
          ),
        },
        {
          title: "Closed — trigger with unread count",
          about: "The bell is a kit Button named with the count. No chip at zero.",
          code: `<NotificationStack items={notifications} />`,
          render: (
            <div className={agentDoc.row}>
              <NotificationStack items={ITEMS} />
              <NotificationStack items={READ} />
            </div>
          ),
        },
      ]}
    />
  );
}
