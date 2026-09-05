"use client";

import { useEffect, useState } from "react";
import { Badge } from "../../Badge";
import { Button } from "../../Button";
import { Cell } from "../../Cell";
import { Empty } from "../../Empty";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";
import { Scoreboard } from "../../Scoreboard";
import { Section } from "../../Section";
import { Table } from "../../Table";
import { Tabs } from "../../Tabs";
import { Toast } from "../../Toast";
import { filterMessages, INBOX, type InboxMessage } from "./inbox-data";
import { InboxReplyDrawer } from "./InboxReplyDrawer";
import styles from "./InboxPattern.module.css";

const COLUMNS = [
  { key: "from", header: "From", emphasis: true },
  { key: "subject", header: "Subject" },
  { key: "kind", header: "Type" },
  { key: "when", header: "When" },
  { key: "open", header: "" },
];

function InboxTable({
  messages,
  onOpen,
}: {
  messages: InboxMessage[];
  onOpen: (id: string) => void;
}) {
  return (
    <Table
      caption="Inbox"
      size="sm"
      emptyLabel="No messages in this filter."
      columns={COLUMNS}
      rows={messages.map((item) => ({
        from: <Cell type="avatar" size="sm" name={item.from} src={item.fromSrc} label={item.from} />,
        subject: item.subject,
        kind: <Badge tone={item.kindTone} size="sm">{item.kind}</Badge>,
        when: item.when,
        open: (
          <Button variant="tertiary" size="sm" onClick={() => onOpen(item.id)}>
            Open
          </Button>
        ),
      }))}
    />
  );
}

export interface InboxPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

export function InboxPattern({ breadcrumbs }: InboxPatternProps) {
  const [messages, setMessages] = useState(INBOX);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(INBOX[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

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
          <Tabs
            ariaLabel="Inbox type"
            variant="line"
            size="md"
            value={tab}
            onChange={setTab}
            items={[
              { id: "all", label: "All", content: <InboxTable messages={filterMessages(messages, "all")} onOpen={openMessage} /> },
              { id: "unread", label: "Unread", content: <InboxTable messages={filterMessages(messages, "unread")} onOpen={openMessage} /> },
              { id: "mentions", label: "Mentions", content: <InboxTable messages={filterMessages(messages, "mentions")} onOpen={openMessage} /> },
              { id: "requests", label: "Requests", content: <InboxTable messages={filterMessages(messages, "requests")} onOpen={openMessage} /> },
            ]}
          />
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
                <Cell type="avatar" size="md" name={selected.from} src={selected.fromSrc} label={selected.from} />
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
        key={selected?.id ?? "none"}
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
