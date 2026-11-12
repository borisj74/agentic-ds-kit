"use client";

import { useId, useMemo, useState } from "react";
import { AgentSteering } from "../AgentSteering";
import { ApprovalCard } from "../ApprovalCard";
import { Chat } from "../Chat";
import { RunningNow } from "../RunningNow";
import { cx } from "../shared/cx";
import { currentRequest, runningItems, sessionSummary, steeredAgent, steeringStatus } from "./liveSession.logic";
import type { LiveSessionProps } from "./LiveSession.types";
import styles from "./LiveSession.module.css";

export type { LiveSessionProps, LiveSessionAgent, LiveSessionAgentStatus, LiveSessionRequest } from "./LiveSession.types";

/**
 * Block: work alongside agents while they run. The conversation (Chat) beside who is working
 * (RunningNow), the oldest open approval (ApprovalCard) and steering for one agent (AgentSteering).
 */
export function LiveSession(props: LiveSessionProps) {
  const {
    messages,
    agents,
    requests = [],
    thinking = false,
    suggestions,
    selectedAgentId: selectedProp,
    defaultSelectedAgentId,
    onSelectAgent,
    onSend,
    onSteer,
    onPause,
    onResume,
    onStop,
    onApprove,
    onDeny,
    chatTitle = "Conversation",
    title = "Live session",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const askId = useId();
  const [innerSelected, setInnerSelected] = useState(defaultSelectedAgentId);
  const [draft, setDraft] = useState("");
  const steered = steeredAgent(agents, selectedProp ?? innerSelected);
  const items = useMemo(() => runningItems(agents, requests), [agents, requests]);
  const ask = currentRequest(agents, requests);

  function selectAgent(id: string) {
    if (id !== steered?.id) setDraft("");
    if (selectedProp === undefined) setInnerSelected(id);
    onSelectAgent?.(id);
  }

  return (
    <section {...rest} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.lead}>{sessionSummary(agents, requests)}</p>
      </header>

      <div className={cx("layout-split--primary", styles.split)}>
        <Chat
          className={styles.chat}
          title={chatTitle}
          status={thinking ? "Thinking…" : undefined}
          messages={messages}
          suggestions={suggestions}
          isThinking={thinking}
          placeholder="Message the agents…"
          onSend={onSend}
          // A waiting approval is the view's one solid primary while it shows.
          sendAppearance={ask ? "soft" : "solid"}
        />

        <div className={styles.side}>
          <RunningNow
            layout="stack"
            label="Working now"
            items={items}
            maxVisible={items.length}
            emptyText="No agent is working right now"
            onSelect={selectAgent}
          />

          {ask ? (
            <section className={styles.ask} aria-labelledby={askId}>
              <h3 id={askId} className={styles.subtitle}>
                {ask.agentName} asks
                {ask.more > 0 ? <span className={styles.more}> · {ask.more} more waiting</span> : null}
              </h3>
              <ApprovalCard
                key={ask.request.id}
                className={styles.fill}
                title={ask.request.title}
                description={ask.request.description}
                risk={ask.request.risk}
                action={ask.request.action}
                onApprove={onApprove ? () => onApprove(ask.request.id) : undefined}
                onDeny={onDeny ? () => onDeny(ask.request.id) : undefined}
              />
            </section>
          ) : null}

          {steered ? (
            <AgentSteering
              key={steered.id}
              className={styles.fill}
              name={steered.name}
              meta={steered.meta ?? steered.activity}
              status={steeringStatus(steered)}
              elapsed={steered.elapsed}
              value={draft}
              onValueChange={setDraft}
              sendAppearance="soft"
              onSteer={(text) => {
                onSteer?.(steered.id, text);
                setDraft("");
              }}
              applied={steered.applied}
              suggestions={steered.suggestions}
              onPause={onPause ? () => onPause(steered.id) : undefined}
              onResume={onResume ? () => onResume(steered.id) : undefined}
              onStop={onStop ? () => onStop(steered.id) : undefined}
              stopConfirm={{
                title: `Stop ${steered.name}?`,
                description: "The agent stops after its current step. Work so far is kept.",
              }}
              stoppedNote={steered.status === "failed" ? `${steered.name} failed · ${steered.activity ?? "see its trail"}` : undefined}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
