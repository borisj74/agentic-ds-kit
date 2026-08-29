import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import { ListDetailPattern } from "@/ui/patterns/ListDetailPattern";
import { SettingsFormPattern } from "@/ui/patterns/SettingsFormPattern";
import { Section } from "@/ui/Section";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

const dashboardMetrics = [
  { title: "MRR", metric: "$8.4k", trend: "up" as const, trendLabel: "+6%" },
  { title: "Clients", metric: "6", trend: "neutral" as const, trendLabel: "No change" },
];

const dashboardTable = {
  caption: "Open tasks",
  columns: [
    { key: "task", header: "Task" },
    { key: "owner", header: "Owner" },
  ],
  rows: [
    { task: "Invoice Q3", owner: "Boris" },
    { task: "Update portfolio", owner: "Boris" },
  ],
};

export default function PatternsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <h1 className={playground.pageTitle}>Patterns</h1>
        <p className={playground.pageLead}>
          Blueprint compositions that only import kit components. Use these before inventing layouts.
        </p>

        <Section title="dashboard" description="PageHeader + Scoreboard + Section + Table + Buttons">
          <div className={styles.preview}>
            <DashboardPattern metrics={dashboardMetrics} table={dashboardTable} />
          </div>
        </Section>

        <Section title="settings-form" description="PageHeader + Section + Field inputs + Buttons">
          <div className={styles.preview}>
            <SettingsFormPattern />
          </div>
        </Section>

        <Section title="list-detail" description="AppNav + Table + detail Section">
          <div className={styles.preview}>
            <ListDetailPattern
              nav={{
                title: "Studio",
                items: [
                  { href: "#", label: "Projects", active: true },
                  { href: "#", label: "Archive" },
                  { href: "#", label: "Settings" },
                ],
              }}
              table={{
                caption: "All projects",
                columns: [
                  { key: "name", header: "Name" },
                  { key: "status", header: "Status" },
                ],
                rows: [
                  { name: "Atlas", status: "Active" },
                  { name: "Nova", status: "Draft" },
                ],
              }}
              detail={{
                title: "Atlas",
                description: "Selected project",
                status: "Active",
                statusVariant: "success",
                body: "Redesign engagement for Atlas Labs. Kickoff completed; wireframes in review.",
              }}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
