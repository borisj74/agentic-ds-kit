import { AgentOverview, Scoreboard } from "agentic-ds-kit";

export function Good() {
  return (
    <main>
      <AgentOverview />
      <Scoreboard items={[]} />
    </main>
  );
}
