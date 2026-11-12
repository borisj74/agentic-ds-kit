"use client";

import { useEffect, useRef, useState } from "react";
import { LiveSession, type ChatMessage, type LiveSessionAgent, type LiveSessionRequest } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { LIVE_SESSION_AGENTS, LIVE_SESSION_MESSAGES, LIVE_SESSION_REQUESTS } from "@/lib/blocks/live-session.sample";

function time() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/**
 * LiveSession with the sample session. Sending gets a short reply, a steer lands on the agent,
 * Pause / Resume / Stop change it, and Approve / Deny clear the request and post to the chat.
 */
export function LiveSessionDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>(LIVE_SESSION_MESSAGES);
  const [agents, setAgents] = useState<LiveSessionAgent[]>(LIVE_SESSION_AGENTS);
  const [requests, setRequests] = useState<LiveSessionRequest[]>(LIVE_SESSION_REQUESTS);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState("");
  const reply = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(reply.current), []);

  function say(content: string) {
    setMessages((list) => [...list, { id: `m${list.length + 1}`, role: "assistant", content, timestamp: time() }]);
  }

  function agent(id: string, change: Partial<LiveSessionAgent>) {
    setAgents((list) => list.map((item) => (item.id === id ? { ...item, ...change } : item)));
  }

  const nameOf = (id: string) => agents.find((item) => item.id === id)?.name ?? id;

  function resolve(id: string, approved: boolean) {
    const request = requests.find((item) => item.id === id);
    if (!request) return;
    setRequests((list) => list.filter((item) => item.id !== id));
    agent(request.agentId, { status: "running", activity: approved ? "applying your OK" : "skipping that change" });
    say(`${nameOf(request.agentId)}: ${approved ? "approved, going ahead" : "denied, skipping it"} (${request.title.replace(/\?$/, "")}).`);
    setStatus(`${approved ? "Approved" : "Denied"}: ${request.title}`);
  }

  return (
    <>
      <LiveSession
        messages={messages}
        agents={agents}
        requests={requests}
        thinking={thinking}
        suggestions={["What's left?", "Summarise the changes"]}
        onSend={(text) => {
          setMessages((list) => [...list, { id: `m${list.length + 1}`, role: "user", content: text, timestamp: time() }]);
          setThinking(true);
          window.clearTimeout(reply.current);
          reply.current = window.setTimeout(() => {
            setThinking(false);
            say("Got it. I've passed that to Billing refactor; it picks it up after the current edit.");
          }, 1200);
        }}
        onSteer={(id, text) => {
          agent(id, { applied: `${text.toLowerCase()} · ${time()}`, activity: text.toLowerCase() });
          setStatus(`Steered ${nameOf(id)}: ${text}`);
        }}
        onPause={(id) => {
          agent(id, { status: "paused" });
          setStatus(`Paused ${nameOf(id)}`);
        }}
        onResume={(id) => {
          agent(id, { status: "running" });
          setStatus(`Resumed ${nameOf(id)}`);
        }}
        onStop={(id) => {
          agent(id, { status: "done", activity: "stopped by you" });
          setStatus(`Stopped ${nameOf(id)}`);
        }}
        onApprove={(id) => resolve(id, true)}
        onDeny={(id) => resolve(id, false)}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}
