"use client";

import { useState, useSyncExternalStore } from "react";
import { MissionHome, type MissionHomeEvent } from "agentic-ds-kit";
import styles from "./MissionHomeDemo.module.css";
import { MISSION_HOME_AGENTS, missionHomeEvents, sampleSince } from "@/lib/mission-home-sample";

const subscribeNothing = () => () => {};

/**
 * MissionHome with the sample fleet. Approve finishes the work, Reject closes it, Retry starts
 * the failed run again, so the summary, lanes and inbox move as you use it. The sample is
 * built on the client (its times are relative to now), so nothing renders on the server.
 */
export function MissionHomeDemo() {
  const [start] = useState(() => Date.now());
  const [events, setEvents] = useState<MissionHomeEvent[]>(() => missionHomeEvents(start));
  const [status, setStatus] = useState("");
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);

  if (!mounted) return null;

  function update(id: string, change: (event: MissionHomeEvent) => MissionHomeEvent, message: string) {
    setEvents((list) => list.map((event) => (event.id === id ? change(event) : event)));
    const title = events.find((event) => event.id === id)?.title ?? id;
    setStatus(`${message}: ${title}`);
  }

  return (
    <>
      <MissionHome
        agents={MISSION_HOME_AGENTS}
        events={events}
        since={sampleSince(start)}
        onApprove={(id) =>
          update(id, (event) => ({ ...event, status: "running", ask: undefined, action: undefined }), "Approved")
        }
        onReject={(id) =>
          update(
            id,
            (event) => ({ ...event, status: "done", end: Date.now(), ask: undefined, action: undefined, summary: ["Rejected by you"] }),
            "Rejected",
          )
        }
        onRetry={(id) =>
          update(id, (event) => ({ ...event, status: "running", start: Date.now(), end: undefined, summary: ["Retrying"] }), "Retrying")
        }
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
