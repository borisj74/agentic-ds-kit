"use client";

import { useState } from "react";
import { AgentInbox } from "agentic-ds-kit";
import type { AgentInboxFilter, AgentInboxItem } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const ITEMS: AgentInboxItem[] = [
  {
    id: "migrate",
    agentName: "Migrate DB",
    type: "approval",
    preview: "Run 0042_drop_legacy.sql on staging?",
    time: "2m",
    approval: {
      title: "Migrate DB needs your OK",
      description: "Drops column invoices.legacy_total on staging. Reversible from the 0041 snapshot.",
      risk: "high",
      action: { kind: "command", command: "psql $STAGING_URL -f migrations/0042_drop_legacy.sql", target: "staging" },
    },
  },
  {
    id: "style",
    agentName: "Docs sweep",
    type: "question",
    preview: "Which style guide should I follow for headings?",
    time: "8m",
    question: { question: "Which style guide should I follow for headings?", allowFreeText: true, meta: "paused · 8m" },
  },
  {
    id: "flaky",
    agentName: "Flaky test hunt",
    type: "failure",
    preview: "3 tests failed in invoice.test.ts",
    time: "21m",
    read: true,
    detail: { heading: "Flaky test hunt · failed", meta: "9m 15s · $0.71", lines: ["FAIL invoice.test.ts › rounds to cents", "exit code 1"] },
  },
  {
    id: "billing",
    agentName: "Billing refactor",
    type: "recap",
    preview: "Done · 4 files changed, tests green",
    time: "1h",
    read: true,
    detail: { heading: "Billing refactor · done", meta: "4m 02s · $0.42", lines: ["Moved totals to integer cents", "Updated 4 files in src/billing", "All 38 tests pass"] },
  },
  {
    id: "notes",
    agentName: "Release notes",
    type: "recap",
    preview: "Draft ready for v2.4",
    time: "3h",
    read: true,
    detail: { heading: "Release notes · done", lines: ["Draft ready for v2.4"] },
  },
];

const noop = () => {};

export function AgentInboxDoc() {
  const [items, setItems] = useState(ITEMS);
  const [selected, setSelected] = useState<string | null>("migrate");
  const [filter, setFilter] = useState<AgentInboxFilter>("all");

  function select(id: string) {
    setSelected(id);
    setItems((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  return (
    <AgentDocFrame
      id="agentinbox"
      name="AgentInbox"
      lede="What agents need from you. Not Toast. Not Chat."
      summary="Filter by type, select a row to open its detail, mark everything read."
      preview={
        <AgentInbox
          className={agentDoc.full}
          items={items}
          selectedId={selected}
          onSelect={select}
          filter={filter}
          onFilterChange={setFilter}
          onMarkAllRead={() => setItems((list) => list.map((item) => ({ ...item, read: true })))}
          onApprove={noop}
          onDeny={noop}
          onAnswer={noop}
          onRetryItem={noop}
          onViewDiff={noop}
          onOpenTrail={noop}
        />
      }
      usage="AgentInbox collects agent requests. Approvals reuse ApprovalCard and questions reuse DecisionCard, so their keyboard rules carry over. Product notifications are not agent requests."
      code={`<AgentInbox
  items={items}
  selectedId={selected}
  onSelect={setSelected}
  filter={filter}
  onFilterChange={setFilter}
  onMarkAllRead={markAll}
  onApprove={approve}
  onDeny={deny}
  onAnswer={answer}
/>`}
      variants={[
        {
          title: "Unread and read, every type — approval selected",
          about: "Unread rows carry a dot and say unread in text. An approval opens a kit ApprovalCard.",
          code: `<AgentInbox items={items} selectedId="migrate" onSelect={select} onFilterChange={setFilter} onMarkAllRead={markAll} onApprove={approve} onDeny={deny} />`,
          render: <AgentInbox className={agentDoc.full} items={ITEMS} selectedId="migrate" onSelect={noop} onFilterChange={noop} onMarkAllRead={noop} onApprove={noop} onDeny={noop} />,
        },
        {
          title: "Recap selected — read",
          about: "A recap lists what got done with View diff and Open trail.",
          code: `<AgentInbox … selectedId="billing" onViewDiff={viewDiff} onOpenTrail={openTrail} />`,
          render: <AgentInbox className={agentDoc.full} items={ITEMS} selectedId="billing" onSelect={noop} onFilterChange={noop} onMarkAllRead={noop} onViewDiff={noop} onOpenTrail={noop} />,
        },
        {
          title: "Filtered to none — Questions, all answered",
          about: "A filter with nothing in it says so and points back to everything.",
          code: `<AgentInbox items={answered} filter="question" onFilterChange={setFilter} />`,
          render: <AgentInbox className={agentDoc.full} items={ITEMS.filter((item) => item.type !== "question")} filter="question" onSelect={noop} onFilterChange={noop} />,
        },
        {
          title: "Empty, loading and error",
          about: "No items: All caught up. loading shows skeleton rows; error shows the reason with Retry.",
          code: `<AgentInbox items={[]} />
<AgentInbox items={[]} loading />
<AgentInbox items={[]} error="Couldn't load the inbox. Network timed out." onRetry={reload} />`,
          render: (
            <div className={agentDoc.stack}>
              <AgentInbox className={agentDoc.full} items={[]} />
              <AgentInbox className={agentDoc.full} items={[]} loading />
              <AgentInbox className={agentDoc.full} items={[]} error="Couldn't load the inbox. Network timed out." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
