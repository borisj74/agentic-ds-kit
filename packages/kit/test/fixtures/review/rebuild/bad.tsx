import { AgentInbox, AgentLanes, BarChart, Scoreboard, SegmentedControl } from "agentic-ds-kit";

export function Bad() {
  return (
    <main>
      <SegmentedControl items={[]} />
      <Scoreboard items={[]} />
      <BarChart data={[]} />
      <AgentLanes lanes={[]} />
      <AgentInbox items={[]} />
    </main>
  );
}
