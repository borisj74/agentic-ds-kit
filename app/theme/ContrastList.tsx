import { Alert, Badge, Card } from "agentic-ds-kit";
import type { ContrastPair } from "@/lib/theme-playground";
import styles from "./theme.module.css";

export function ContrastList({ pairs }: { pairs: ContrastPair[] }) {
  const failures = pairs.filter((pair) => !pair.pass);
  return (
    <Card
      title="Contrast"
      description="Body text needs 4.5:1. The button fill against the page needs 3:1."
      size="sm"
    >
      <div className={styles.stack}>
        {failures.length === 0 ? (
          <Alert variant="success" title="Passes AA">
            Every checked pair meets WCAG AA.
          </Alert>
        ) : (
          <Alert variant="warning" title={`${failures.length} below AA`}>
            {failures.map((pair) => pair.name).join(", ")}
          </Alert>
        )}
        {pairs.map((pair) => (
          <div key={pair.name} className={styles.pair}>
            <p className={styles.pairName}>
              {pair.name} · {pair.ratio.toFixed(2)}:1
            </p>
            <Badge appearance={pair.pass ? "soft" : "solid"} tone={pair.pass ? "success" : "danger"} size="sm">
              {pair.pass ? "AA" : "Fail"}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
