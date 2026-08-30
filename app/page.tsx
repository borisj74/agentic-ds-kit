import { Chat } from "@/ui/Chat";
import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import styles from "./playground.module.css";

const metrics = [
  {
    label: "Active users",
    value: "12,480",
    trend: "down" as const,
    delta: "-18.1%",
    hint: "vs last week",
  },
  {
    label: "Conversion",
    value: "3.6%",
    trend: "up" as const,
    delta: "+0.4%",
    hint: "vs prior period",
  },
  {
    label: "Open tasks",
    value: "18",
    trend: "down" as const,
    delta: "-2",
    hint: "cleared this week",
  },
  {
    label: "Revenue",
    value: "$48.2k",
    trend: "up" as const,
    delta: "+12.4%",
    hint: "vs last month",
  },
];

const pie = [
  { label: "Under contract", value: 770 },
  { label: "Closed", value: 514 },
  { label: "Under offer", value: 385 },
  { label: "Off market", value: 385 },
  { label: "Draft", value: 258 },
  { label: "Listed", value: 256 },
];

const bar = [
  { label: "North", value: 2500 },
  { label: "South", value: 2600 },
  { label: "East", value: 1800 },
  { label: "West", value: 2100 },
];

const line = [
  { label: "Mon", value: 1240 },
  { label: "Tue", value: 1380 },
  { label: "Wed", value: 1290 },
  { label: "Thu", value: 1520 },
  { label: "Fri", value: 1680 },
  { label: "Sat", value: 1410 },
  { label: "Sun", value: 1320 },
];

const table = {
  caption: "Sprint backlog",
  columns: [
    { key: "task", header: "Task" },
    { key: "owner", header: "Owner" },
    { key: "status", header: "Status" },
  ],
  rows: [
    { task: "Launch brief", owner: "Maya Chen", status: "In review" },
    { task: "QA checklist", owner: "Unassigned", status: "Blocked" },
    { task: "Release notes", owner: "Jordan Lee", status: "Ready" },
    { task: "Support macros", owner: "Alex Rivera", status: "In progress" },
  ],
};

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.opsShell}>
        <div className={styles.ops}>
          <DashboardPattern metrics={metrics} table={table} pie={pie} bar={bar} line={line} />
          <aside className={styles.rail}>
            <Chat
              title="Workspace assistant"
              status="Ready"
              placeholder="Message the assistant..."
              suggestions={["Assign Final QA", "Draft sprint update"]}
              messages={[
                {
                  role: "assistant",
                  content: "I can summarize open work, draft updates, or assign owners from this sprint.",
                  timestamp: "Just now",
                },
                {
                  role: "user",
                  content: "Who still needs an owner?",
                  timestamp: "Just now",
                },
                {
                  role: "assistant",
                  content: "QA checklist is still unassigned. Want me to draft an ask for Maya?",
                  timestamp: "Just now",
                },
              ]}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
