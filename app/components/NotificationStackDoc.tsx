"use client";

import { useState } from "react";
import { NotificationStack, type NotificationItem } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const ITEMS: NotificationItem[] = [
  { id: "failed", title: "Payment failed", body: "INV-1842 · Northwind · $2,418.00. Visa ending 4242 was declined.", createdAt: "09:42", read: false, tone: "danger", group: "Today", action: { label: "Retry payment", onClick: () => {} } },
  { id: "dispute", title: "Dispute opened", body: "INV-1810 · $889.68 · Duplicate charge. Respond by Dec 4.", createdAt: "08:15", read: false, tone: "warning", group: "Today" },
  { id: "mention", title: "Priya mentioned you", body: "INV-1842 · “Can you check with Northwind AP before we retry?”", createdAt: "07:58", read: false, icon: "MessageCircle", group: "Today" },
  { id: "paid", title: "Invoice paid", body: "INV-1797 · Northwind · $842.40 by ACH.", createdAt: "16:20", read: true, tone: "success", group: "Yesterday" },
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
      lede="The durable in-app inbox: a bell with the unread count and a 24rem popover list. Below 40rem it opens as a full-height Drawer with the same rows."
      summary="Open the bell, open an item to mark it read, or Mark all read (announced politely). Unread is a filled rail marker plus a New badge, never colour or weight alone. The count chip goes away at zero."
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
          about: "Unread rows have a filled 12px marker and a New badge; read rows have a hollow marker. Each row reads as one button: New. Payment failed. INV-1842 … 09:42.",
          code: `<NotificationStack inline items={notifications} onMarkAll={markAll} onViewAll={viewAll} />`,
          render: <NotificationStack inline items={ITEMS} onItemClick={noop} onMarkAll={noop} onViewAll={noop} />,
        },
        {
          title: "Groups and one row action",
          about: "group gathers items under Today and Yesterday. action adds one outline sm Button under a row, only when the event needs a decision (Retry payment).",
          code: `const items = [
  { id: "failed", title: "Payment failed", body: "INV-1842 · Northwind · $2,418.00…", createdAt: "09:42", read: false, tone: "danger",
    group: "Today", action: { label: "Retry payment", onClick: retry } },
  { id: "paid", title: "Invoice paid", body: "INV-1797 · Northwind · $842.40 by ACH.", createdAt: "16:20", read: true, tone: "success", group: "Yesterday" },
];`,
          render: <NotificationStack inline items={ITEMS} onItemClick={noop} onMarkAll={noop} onViewAll={noop} />,
        },
        {
          title: "All read",
          about: "Hollow markers, no New badges, no count; Mark all read is disabled.",
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
          about: "The bell is an sm (32) kit Button named \"Notifications, 3 unread\", so it sits on one row with Ask and the avatar. No chip at zero.",
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
