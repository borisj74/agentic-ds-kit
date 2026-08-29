import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import { ListDetailPattern } from "@/ui/patterns/ListDetailPattern";
import { SettingsFormPattern } from "@/ui/patterns/SettingsFormPattern";
import { Section } from "@/ui/Section";
import styles from "./patterns.module.css";
import playground from "../playground.module.css";

const dashboardMetrics = [
  { label: "MRR", value: "$8.4k", trend: "up" as const, delta: "+6%" },
  { label: "Clients", value: "6", trend: "flat" as const, delta: "0%" },
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

        <div id="dashboard" className={styles.anchor}>
          <Section title="dashboard" description="PageHeader + Scoreboard + Section + Table + Buttons">
            <div className={styles.preview}>
              <DashboardPattern metrics={dashboardMetrics} table={dashboardTable} />
            </div>
          </Section>
        </div>

        <div id="settings-form" className={styles.anchor}>
          <Section title="settings-form" description="PageHeader + Section + Field inputs + Buttons">
            <div className={styles.preview}>
              <SettingsFormPattern />
            </div>
          </Section>
        </div>

        <div id="list-detail" className={styles.anchor}>
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
                  statusTone: "success",
                  body: "Redesign engagement for Atlas Labs. Kickoff completed; wireframes in review.",
                }}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
