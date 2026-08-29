import { Button } from "@/ui/Button";
import { Scoreboard } from "@/ui/Scoreboard";
import styles from "./page.module.css";

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

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Personal kit sandbox</p>
          <h1 className={styles.title}>Studio dashboard</h1>
          <p className={styles.subtitle}>
            A tiny Florence-style playground — contracts in JSON, components in ui/, agents read the
            kit before inventing UI.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className={styles.sectionLabel}>
            Key metrics
          </h2>
          <Scoreboard items={metrics} aria-label="Studio key metrics" />
        </section>

        <section className={styles.section} aria-labelledby="actions-heading">
          <h2 id="actions-heading" className={styles.sectionLabel}>
            Actions
          </h2>
          <div className={styles.actions}>
            <Button variant="primary" size="md">
              Export report
            </Button>
            <Button variant="secondary" size="md">
              View details
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
