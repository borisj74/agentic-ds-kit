"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/Button";
import { Chat } from "../../ui/Chat";
import type { ChatMessage } from "../../ui/Chat";
import { InsightCard } from "../../ui/InsightCard";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Section } from "../../ui/Section";
import { INSIGHTS, STARTER } from "./assistant-workspace-data";
import styles from "./AssistantWorkspacePattern.module.css";

const SUGGESTIONS = INSIGHTS.map((insight) => insight.prompt);

function replyFor(message: string): string {
  const hit = INSIGHTS.find(
    (insight) => insight.prompt.toLowerCase() === message.trim().toLowerCase() || insight.id === message,
  );
  if (hit) return hit.reply;
  return `Got it — “${message}”. I can go deeper on owners or next steps.`;
}

/*
 * Stacked = below --grid-breakpoint-md, where layout-workspace puts the rail under
 * the content (lib/layout.css). matchMedia reads the token at runtime; 64rem is the
 * fallback (media queries in CSS cannot read var()).
 */
function railIsStacked(): boolean {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--grid-breakpoint-md").trim();
  return window.matchMedia(`(width < ${value || "64rem"})`).matches;
}

export interface AssistantWorkspacePatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

export function AssistantWorkspacePattern({ breadcrumbs }: AssistantWorkspacePatternProps) {
  const [railOpen, setRailOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER);
  const [thinking, setThinking] = useState(false);
  const timerRef = useRef<number | null>(null);
  const railRef = useRef<HTMLElement>(null);
  const revealRail = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  // After Ask on a card, a stacked rail sits below the cards: bring it into view and
  // move focus to it so the reply (announced by Chat's live log) is where the user is.
  // Runs after the commit that adds the message, so a rail that Ask just reopened is mounted.
  useEffect(() => {
    if (!revealRail.current) return;
    revealRail.current = false;
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
    rail.focus({ preventScroll: true });
  }, [messages]);

  function askFromCard(prompt: string) {
    if (thinking) return;
    revealRail.current = railIsStacked();
    ask(prompt);
  }

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
          <Section title="Recommended" description="Ask the assistant about a card, or send a prompt in the rail." size="sm">
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
                    onClick: () => askFromCard(insight.prompt),
                  }}
                />
              ))}
            </div>
          </Section>
        </div>
      </div>
      {railOpen ? (
        <aside ref={railRef} className={styles.rail} tabIndex={-1}>
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
