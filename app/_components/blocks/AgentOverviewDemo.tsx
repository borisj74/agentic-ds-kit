"use client";

import { useEffect, useState } from "react";
import { AgentOverview, type AgentOverviewAgent, type AgentOverviewEvent } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { AGENT_OVERVIEW_AGENTS, SAMPLE_NOW, agentOverviewEvents, sampleSince } from "@/lib/blocks/agent-overview.sample";

const EVENTS = agentOverviewEvents(SAMPLE_NOW);
const SINCE = sampleSince(SAMPLE_NOW);

/**
 * AgentOverview with Northwind's billing agents. Approve applies the payment and Deny closes the
 * request, so Needs you, the rows and the Since rail move as you use it. Review, Ask and New task
 * are announced in the status line (the docs have no run page or task brief to open).
 *
 * The sample sits on a fixed clock (SAMPLE_NOW) and the block gets it as `now`, so the server
 * and the first client render match and the frame's HTML already holds the block. It used to
 * render nothing until it mounted, which left the /blocks thumbnail empty until the iframe had
 * loaded and run its scripts. Once mounted, the clock moves on in real time from SAMPLE_NOW.
 */
export function AgentOverviewDemo() {
  const [now, setNow] = useState(SAMPLE_NOW);
  const [events, setEvents] = useState<AgentOverviewEvent[]>(EVENTS);
  const [agents, setAgents] = useState<AgentOverviewAgent[]>(AGENT_OVERVIEW_AGENTS);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const mountedAt = Date.now();
    const id = window.setInterval(() => setNow(SAMPLE_NOW + Date.now() - mountedAt), 1000);
    return () => window.clearInterval(id);
  }, []);

  function update(id: string, change: (event: AgentOverviewEvent) => AgentOverviewEvent, message: string) {
    setEvents((list) => list.map((event) => (event.id === id ? change(event) : event)));
    const title = events.find((event) => event.id === id)?.title ?? id;
    setStatus(`${message}: ${title}`);
  }

  function nameOf(agentId: string) {
    return agents.find((agent) => agent.id === agentId)?.name ?? agentId;
  }

  // The request's agent moves on once you answer it.
  function settle(eventId: string, status: AgentOverviewAgent["status"], line: string) {
    const agentId = events.find((event) => event.id === eventId)?.agentId;
    setAgents((list) => list.map((agent) => (agent.id === agentId ? { ...agent, status, now: line } : agent)));
  }

  return (
    <>
      <AgentOverview
        agents={agents}
        events={events}
        since={SINCE}
        now={now}
        onApprove={(id) => {
          update(id, (event) => ({ ...event, status: "done", end: now, ask: undefined, action: undefined, summary: ["Approved by you"] }), "Approved");
          settle(id, "done", "INV-1842 paid · dunning stopped");
        }}
        onReject={(id) => {
          update(id, (event) => ({ ...event, status: "done", end: now, ask: undefined, action: undefined, summary: ["Denied by you"] }), "Denied");
          settle(id, "done", "Left INV-1842 open");
        }}
        onReview={(agentId) => setStatus(`Review: ${nameOf(agentId)}`)}
        onAsk={(agentId) => setStatus(`Ask: ${nameOf(agentId)}`)}
        onNewTask={() => setStatus("New task: opens TaskBrief")}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
