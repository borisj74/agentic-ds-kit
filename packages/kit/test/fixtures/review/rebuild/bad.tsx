import { ActivityFeed, AgentLanes, ApprovalCard, ListView, SegmentedControl } from "agentic-ds-kit";

export function Bad() {
  return (
    <main>
      <ApprovalCard title="" action={{ kind: "command", command: "" }} />
      <SegmentedControl items={[]} />
      <ListView label="" items={[]} />
      <AgentLanes lanes={[]} />
      <ActivityFeed events={[]} />
    </main>
  );
}
