import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import styles from "./playground.module.css";

const metrics = [
  {
    label: "Monthly revenue",
    value: "$48.2k",
    trend: "up" as const,
    delta: "+12%",
    hint: "vs last month",
  },
  {
    label: "Active projects",
    value: "14",
    trend: "neutral" as const,
    delta: "No change",
  },
  {
    label: "Churn rate",
    value: "2.1%",
    trend: "down" as const,
    delta: "-0.3%",
    hint: "vs last month",
  },
];

const table = {
  caption: "Recent projects",
  columns: [
    { key: "name", header: "Project" },
    { key: "status", header: "Status" },
    { key: "updated", header: "Updated" },
  ],
  rows: [
    { name: "Atlas redesign", status: "In progress", updated: "2 days ago" },
    { name: "Client portal", status: "Review", updated: "5 days ago" },
    { name: "Brand kit", status: "Shipped", updated: "1 week ago" },
  ],
};

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <DashboardPattern metrics={metrics} table={table} />
      </div>
    </div>
  );
}
