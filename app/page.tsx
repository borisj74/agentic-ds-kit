import { DashboardPattern } from "@/ui/patterns/DashboardPattern";
import styles from "./playground.module.css";

const metrics = [
  {
    title: "Monthly revenue",
    metric: "$48.2k",
    trend: "up" as const,
    trendLabel: "+12% vs last month",
  },
  {
    title: "Active projects",
    metric: "14",
    trend: "neutral" as const,
    trendLabel: "No change",
  },
  {
    title: "Churn rate",
    metric: "2.1%",
    trend: "down" as const,
    trendLabel: "-0.3% vs last month",
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
