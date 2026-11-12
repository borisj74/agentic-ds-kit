import contract from "../../packages/kit/contracts/livesession.json";
import type { BlockDoc } from "./types";

export const liveSessionDoc: BlockDoc = {
  slug: "live-session",
  label: "Live session",
  name: "LiveSession",
  contract,
  lead:
    "Work alongside agents while they run. Talk to them in the conversation, see who is working, steer or pause one of them, and approve what an agent asks right where it asks.",
  usage: `import { LiveSession } from "agentic-ds-kit";

export function Session({ messages, agents, requests }) {
  return (
    <main className="layout-content">
      <LiveSession
        messages={messages}      // Chat messages
        agents={agents}          // { id, name, status, activity?, elapsed?, suggestions? }[]
        requests={requests}      // open approvals, oldest first
        onSend={(text) => send(text)}
        onSteer={(agentId, text) => steer(agentId, text)}
        onPause={(agentId) => pause(agentId)}
        onResume={(agentId) => resume(agentId)}
        onApprove={(requestId) => approve(requestId)}
        onDeny={(requestId) => deny(requestId)}
      />
    </main>
  );
}`,
};
