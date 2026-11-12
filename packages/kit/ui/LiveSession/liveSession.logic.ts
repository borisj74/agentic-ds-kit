import type { AgentSteeringStatus } from "../AgentSteering/AgentSteering.types";
import type { RunningNowItem } from "../RunningNow/RunningNow.types";
import type { LiveSessionAgent, LiveSessionAgentStatus, LiveSessionRequest } from "./LiveSession.types";

/** Pure helpers behind LiveSession: one agent list mapped onto each part. No React here. */

const STEER_STATUS: Record<LiveSessionAgentStatus, AgentSteeringStatus> = {
  running: "running",
  waiting: "running",
  paused: "paused",
  failed: "stopped",
  done: "done",
};

/** Is the agent still in the session's work (not done)? */
export function isWorking(agent: LiveSessionAgent): boolean {
  return agent.status !== "done";
}

/**
 * Running now: every agent not done. Paused agents show as waiting ("paused by you"); an agent
 * with an open request says it waits on you.
 */
export function runningItems(agents: LiveSessionAgent[], requests: LiveSessionRequest[] = []): RunningNowItem[] {
  const asking = new Set(requests.map((request) => request.agentId));
  return agents.filter(isWorking).map((agent) => ({
    id: agent.id,
    name: agent.name,
    elapsed: agent.elapsed,
    status: agent.status === "failed" ? "failed" : agent.status === "running" && !asking.has(agent.id) ? "running" : "waiting",
    activity: agent.status === "paused" ? "paused by you" : asking.has(agent.id) ? "needs your OK" : agent.activity,
  }));
}

/** AgentSteering status for an agent. */
export function steeringStatus(agent: LiveSessionAgent): AgentSteeringStatus {
  return STEER_STATUS[agent.status];
}

/** The steered agent: the chosen one if it exists, else the first still working, else the first. */
export function steeredAgent(agents: LiveSessionAgent[], chosen: string | undefined): LiveSessionAgent | undefined {
  return agents.find((agent) => agent.id === chosen) ?? agents.find(isWorking) ?? agents[0];
}

/** The inline approval: the oldest open request, with its agent's name and how many more wait. */
export function currentRequest(agents: LiveSessionAgent[], requests: LiveSessionRequest[] = []) {
  const request = requests[0];
  if (!request) return null;
  const agentName = agents.find((agent) => agent.id === request.agentId)?.name ?? request.agentId;
  return { request, agentName, more: requests.length - 1 };
}

/** "3 agents working · 1 needs you" for the block's lead line. */
export function sessionSummary(agents: LiveSessionAgent[], requests: LiveSessionRequest[] = []): string {
  const working = agents.filter(isWorking).length;
  const parts = [working === 1 ? "1 agent working" : `${working} agents working`];
  if (requests.length) parts.push(requests.length === 1 ? "1 needs you" : `${requests.length} need you`);
  return parts.join(" · ");
}
