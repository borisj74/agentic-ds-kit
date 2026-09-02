"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../../Button";
import { Chat } from "../../Chat";
import type { ChatMessage } from "../../Chat";
import { InsightCard } from "../../InsightCard";
import type { InsightCardTone } from "../../InsightCard";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";
import { Section } from "../../Section";
import styles from "./AssistantWorkspacePattern.module.css";

interface Insight {
  id: string;
  title: string;
  description: string;
  tone: InsightCardTone;
  source: string;
  prompt: string;
  reply: string;
}

const INSIGHTS: Insight[] = [
  {
    id: "qa-checklist",
    title: "QA checklist is still blocked",
    description: "Unassigned for 2 days. Assign an owner before Thursday's review.",
    tone: "warning",
    source: "From Open tasks",
    prompt: "Why is QA blocked?",
    reply: "QA checklist has no owner. Assign someone before Thursday so the last two device passes can close.",
  },
  {
    id: "invite-members",
    title: "Invite members is still open",
    description: "Three seats unused. Send invites so review comments have owners.",
    tone: "warning",
    source: "From Workspace",
    prompt: "Who should own invites?",
    reply: "Seats are provisioned. Maya can send the design and QA invites from Invite members so comments have owners.",
  },
  {
    id: "release-notes",
    title: "Release notes are ready to ship",
    description: "Jordan marked this Ready. Confirm the changelog before tag.",
    tone: "opportunity",
    source: "From Open tasks",
    prompt: "Draft a standup update",
    reply: "Release notes are Ready. Confirm the known-issues list, then tag. QA is still blocked and needs an owner today.",
  },
];

const STARTER: ChatMessage[] = [
  {
    role: "assistant",
    content: "I can explain a blocked task, suggest an owner, or draft a standup update.",
  },
];

const SUGGESTIONS = INSIGHTS.map((insight) => insight.prompt);

function replyFor(message: string): string {
  const hit = INSIGHTS.find(
    (insight) => insight.prompt.toLowerCase() === message.trim().toLowerCase() || insight.id === message,
  );
  if (hit) return hit.reply;
  return `Got it — “${message}”. I can go deeper on owners or next steps.`;
}

export interface AssistantWorkspacePatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

export function AssistantWorkspacePattern({ breadcrumbs }: AssistantWorkspacePatternProps) {
  const [railOpen, setRailOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER);
  const [thinking, setThinking] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function ask(prompt: string) {
    const next = prompt.trim();
    if (!next || thinking) return;
    setRailOpen(true);
    setMessages((current) => [...current, { role: "user", content: next }]);
    setThinking(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", content: replyFor(next) }]);
      setThinking(false);
      timerRef.current = null;
    }, 1200);
  }

  return (
    <div
      className={`${railOpen ? "layout-workspace" : "layout-workspace layout-workspace--flush"} ${styles.shell}`}
    >
      <div className="layout-canvas">
        <div className="layout-header">
          <PageHeader
            title="Insights"
            subtitle="Recommendations for Sprint 24, with an assistant on the side."
            breadcrumbs={breadcrumbs}
            actions={
              railOpen ? undefined : (
                <Button variant="primary" size="md" iconStart="Sparkles" onClick={() => setRailOpen(true)}>
                  Ask assistant
                </Button>
              )
            }
          />
        </div>
        <div className="layout-content">
          <Section title="Recommended" description="Ask the assistant about a card, or send a prompt in the rail.">
            <div className={`layout-split ${styles.insights}`}>
              {INSIGHTS.map((insight) => (
                <InsightCard
                  key={insight.id}
                  title={insight.title}
                  description={insight.description}
                  tone={insight.tone}
                  source={insight.source}
                  secondaryAction={{
                    label: "Ask",
                    onClick: () => ask(insight.prompt),
                  }}
                />
              ))}
            </div>
          </Section>
        </div>
      </div>
      {railOpen ? (
        <aside className={styles.rail}>
          <Chat
            title="Assistant"
            status="Sprint 24"
            messages={messages}
            suggestions={SUGGESTIONS}
            placeholder="Ask about this sprint"
            emptyState="Ask about a blocked task, a draft, or who should own the next review."
            isThinking={thinking}
            disabled={thinking}
            onSend={ask}
            onClose={() => setRailOpen(false)}
            radius="none"
          />
        </aside>
      ) : null}
    </div>
  );
}
