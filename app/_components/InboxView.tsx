"use client";

import { useEffect, useId, useState } from "react";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import type { BadgeTone } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Empty } from "@/ui/Empty";
import { Field } from "@/ui/Field";
import { FieldSet } from "@/ui/FieldSet";
import { Input } from "@/ui/Input";
import { PageHeader } from "@/ui/PageHeader";
import type { PageHeaderProps } from "@/ui/PageHeader";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import { Table } from "@/ui/Table";
import { Tabs } from "@/ui/Tabs";
import { Textarea } from "@/ui/Textarea";
import { Toast } from "@/ui/Toast";
import styles from "./InboxView.module.css";

type InboxKind = "Comment" | "Mention" | "Request" | "Status" | "Alert";

interface InboxMessage {
  id: string;
  from: string;
  fromSrc?: string;
  subject: string;
  body: string;
  kind: InboxKind;
  kindTone: BadgeTone;
  when: string;
  unread: boolean;
}

const INBOX: InboxMessage[] = [
  {
    id: "maya-comment",
    from: "Maya Chen",
    fromSrc: "/faces/maya-chen.jpg",
    subject: "Comments on Launch brief",
    body: "Two notes on positioning. Close them before the freeze so copy can lock.",
    kind: "Comment",
    kindTone: "info",
    when: "2h ago",
    unread: true,
  },
  {
    id: "qa-alert",
    from: "Unassigned",
    subject: "QA checklist is still blocked",
    body: "No owner for 2 days. Assign someone before Thursday's review.",
    kind: "Alert",
    kindTone: "danger",
    when: "4h ago",
    unread: true,
  },
  {
    id: "alex-reply",
    from: "Alex Rivera",
    fromSrc: "/faces/alex-rivera.jpg",
    subject: "Replied on Support macros",
    body: "Refund and delay macros are drafted. Escalation paths still need a pass.",
    kind: "Comment",
    kindTone: "info",
    when: "5h ago",
    unread: true,
  },
  {
    id: "maya-mention",
    from: "Maya Chen",
    fromSrc: "/faces/maya-chen.jpg",
    subject: "Mentioned you in Launch brief",
    body: "Can you confirm the hero line before legal looks at the brief?",
    kind: "Mention",
    kindTone: "brand",
    when: "Yesterday",
    unread: true,
  },
  {
    id: "jordan-status",
    from: "Jordan Lee",
    fromSrc: "/faces/jordan-lee.jpg",
    subject: "Release notes moved to Ready",
    body: "Changelog is drafted. Confirm the known-issues list before we tag.",
    kind: "Status",
    kindTone: "success",
    when: "Yesterday",
    unread: true,
  },
  {
    id: "iris-request",
    from: "Iris Okafor",
    fromSrc: "/faces/iris-okafor.jpg",
    subject: "Review User research",
    body: "Five interviews are in. Need a read on the onboarding friction before Friday.",
    kind: "Request",
    kindTone: "warning",
    when: "Mon",
    unread: true,
  },
  {
    id: "noah-request",
    from: "Noah Williams",
    fromSrc: "/faces/noah-williams.jpg",
    subject: "Legal sign-off on QA",
    body: "The last two device passes are still open. Legal will not sign until they close.",
    kind: "Request",
    kindTone: "warning",
    when: "Mon",
    unread: true,
  },
];

const COLUMNS = [
  { key: "from", header: "From", emphasis: true },
  { key: "subject", header: "Subject" },
  { key: "kind", header: "Type" },
  { key: "when", header: "When" },
  { key: "open", header: "" },
];

function filterMessages(messages: InboxMessage[], tab: string): InboxMessage[] {
  if (tab === "unread") return messages.filter((item) => item.unread);
  if (tab === "mentions") return messages.filter((item) => item.kind === "Mention");
  if (tab === "requests") return messages.filter((item) => item.kind === "Request");
  return messages;
}

function InboxReplyDrawer({
  message,
  open,
  onClose,
  onSend,
}: {
  message: InboxMessage | null;
  open: boolean;
  onClose: () => void;
  onSend: () => void;
}) {
  const baseId = useId();
  const toId = `${baseId}-to`;
  const subjectId = `${baseId}-subject`;
  const replyId = `${baseId}-reply`;
  const [error, setError] = useState<string | undefined>();

  function close() {
    setError(undefined);
    onClose();
  }

  function send() {
    const reply = (document.getElementById(replyId) as HTMLTextAreaElement | null)?.value.trim() ?? "";
    if (!reply) {
      setError("Write a reply before sending.");
      return;
    }
    onSend();
    setError(undefined);
    onClose();
  }

  return (
    <Drawer
      open={open && Boolean(message)}
      title={message ? `Reply to ${message.from}` : "Reply"}
      description={message?.subject}
      onClose={close}
      footer={
        message ? (
          <>
            <Button variant="primary" block onClick={send}>
              Send reply
            </Button>
            <Button variant="secondary" block onClick={close}>
              Cancel
            </Button>
          </>
        ) : null
      }
    >
      {message ? (
        <FieldSet key={message.id} legend="Reply" description="This goes back to the thread.">
          <Field label="To" htmlFor={toId}>
            <Input id={toId} name="to" defaultValue={message.from} />
          </Field>
          <Field label="Subject" htmlFor={subjectId}>
            <Input id={subjectId} name="subject" defaultValue={`Re: ${message.subject}`} />
          </Field>
          <Field
            label="Message"
            htmlFor={replyId}
            hint="Keep it short. They already have the thread."
            error={error}
          >
            <Textarea
              id={replyId}
              name="reply"
              rows={6}
              placeholder="Write a reply..."
              error={Boolean(error)}
            />
          </Field>
        </FieldSet>
      ) : null}
    </Drawer>
  );
}

export function InboxView({
  breadcrumbs,
}: {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}) {
  const [messages, setMessages] = useState(INBOX);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(INBOX[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const visible = filterMessages(messages, tab);
  const selected = messages.find((item) => item.id === selectedId) ?? null;
  const unread = messages.filter((item) => item.unread).length;

  useEffect(() => {
    const next = filterMessages(messages, tab);
    if (selectedId && next.some((item) => item.id === selectedId)) return;
    setSelectedId(next[0]?.id ?? null);
    setDrawerOpen(false);
  }, [selectedId, tab, messages]);

  function archive(id: string) {
    setMessages((current) => current.filter((item) => item.id !== id));
    setDrawerOpen(false);
  }

  function openMessage(id: string) {
    setSelectedId(id);
    setDrawerOpen(true);
  }

  function sendReply() {
    if (!selected) return;
    setMessages((current) =>
      current.map((item) => (item.id === selected.id ? { ...item, unread: false } : item)),
    );
    setToastOpen(true);
  }

  const rows = visible.map((item) => ({
    from: (
      <div className={styles.from}>
        <Avatar name={item.from} src={item.fromSrc} size="sm" />
        {item.from}
      </div>
    ),
    subject: item.subject,
    kind: <Badge tone={item.kindTone} size="sm">{item.kind}</Badge>,
    when: item.when,
    open: (
      <Button variant="tertiary" size="sm" onClick={() => openMessage(item.id)}>
        Open
      </Button>
    ),
  }));

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Inbox"
          subtitle="Replies, mentions, and requests waiting on you."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Section title="At a glance">
          <Scoreboard
            className="layout-metrics layout-metrics--fixed-4"
            aria-label="Inbox this week"
            items={[
              { label: "Unread", value: String(unread), delta: `+${unread}`, trend: "up" as const, hint: "need a look", size: "lg" as const, badge: "Live", badgeTone: "danger" as const },
              { label: "Mentions", value: String(messages.filter((item) => item.kind === "Mention").length), delta: "+1", trend: "up" as const, hint: "this sprint", size: "lg" as const, badge: "You", badgeTone: "brand" as const },
              { label: "Requests", value: String(messages.filter((item) => item.kind === "Request").length), delta: "+2", trend: "up" as const, hint: "this sprint", size: "lg" as const, badge: "Review", badgeTone: "warning" as const },
              { label: "Open", value: String(messages.length), delta: "0", trend: "flat" as const, hint: "in inbox", size: "lg" as const, badge: "Sprint", badgeTone: "info" as const },
            ]}
          />
        </Section>
        <Section title="Messages" description={`${unread} unread`}>
          <div className={styles.stack}>
            <Tabs
              ariaLabel="Inbox type"
              variant="line"
              size="md"
              value={tab}
              onChange={setTab}
              items={[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "mentions", label: "Mentions" },
                { id: "requests", label: "Requests" },
              ]}
            />
            <Table
              caption="Inbox"
              size="sm"
              columns={COLUMNS}
              rows={rows}
              emptyLabel="No messages in this filter."
            />
          </div>
        </Section>
        <Section
          title={selected?.subject ?? "Message"}
          description={selected ? `${selected.from} · ${selected.when}` : "Select a row"}
          actions={
            selected ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => archive(selected.id)}>
                  Archive
                </Button>
                <Button
                  variant={drawerOpen ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => openMessage(selected.id)}
                >
                  Reply
                </Button>
              </>
            ) : undefined
          }
        >
          {selected ? (
            <div className={styles.detail}>
              <div className={styles.meta}>
                <Avatar name={selected.from} src={selected.fromSrc} size="md" />
                <div className={styles.copy}>
                  <p className={styles.label}>From</p>
                  <p className={styles.value}>{selected.from}</p>
                </div>
                <Badge tone={selected.kindTone}>{selected.kind}</Badge>
              </div>
              <p className={styles.body}>{selected.body}</p>
            </div>
          ) : (
            <Empty
              title="No message selected"
              description="Open a row to read it here."
              icon="Mail"
              outlined
            />
          )}
        </Section>
      </div>
      <InboxReplyDrawer
        message={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSend={sendReply}
      />
      <Toast
        open={toastOpen}
        title="Reply sent"
        description="It will show up in the thread."
        status="success"
        duration={3000}
        onClose={() => setToastOpen(false)}
        onOpenChange={setToastOpen}
      />
    </div>
  );
}
