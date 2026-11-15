"use client";

import { useEffect, useState } from "react";
import { AgentOverview, type AgentOverviewEvent } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { AGENT_OVERVIEW_AGENTS, SAMPLE_NOW, agentOverviewEvents, sampleSince } from "@/lib/blocks/agent-overview.sample";

const EVENTS = agentOverviewEvents(SAMPLE_NOW);
const SINCE = sampleSince(SAMPLE_NOW);

/**
 * AgentOverview with the sample fleet. Approve finishes the work, Reject closes it, Retry starts
 * the failed run again, so the summary, lanes and inbox move as you use it.
 *
 * The sample sits on a fixed clock (SAMPLE_NOW) and the block gets it as `now`, so the server
 * and the first client render match and the frame's HTML already holds the block. It used to
 * render nothing until it mounted, which left the /blocks thumbnail empty until the iframe had
 * loaded and run its scripts. Once mounted, the clock moves on in real time from SAMPLE_NOW.
 */
export function AgentOverviewDemo() {
  const [now, setNow] = useState(SAMPLE_NOW);
  const [events, setEvents] = useState<AgentOverviewEvent[]>(EVENTS);
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

  return (
    <>
      <AgentOverview
        agents={AGENT_OVERVIEW_AGENTS}
        events={events}
        since={SINCE}
        now={now}
        onApprove={(id) =>
          update(id, (event) => ({ ...event, status: "running", ask: undefined, action: undefined }), "Approved")
        }
        onReject={(id) =>
          update(
            id,
            (event) => ({ ...event, status: "done", end: now, ask: undefined, action: undefined, summary: ["Rejected by you"] }),
            "Rejected",
          )
        }
        onRetry={(id) =>
          update(id, (event) => ({ ...event, status: "running", start: now, end: undefined, summary: ["Retrying"] }), "Retrying")
        }
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
