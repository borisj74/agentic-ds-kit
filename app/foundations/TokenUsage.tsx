import { lookupTokenUsage } from "@/lib/token-usage";
import styles from "./TokenUsage.module.css";

export function TokenUsage({ token, compact = false }: { token: string; compact?: boolean }) {
  const note = lookupTokenUsage(token);
  return (
    <p className={styles.note} title={`${note.useWhen}. ${note.doNot}`}>
      <span className={styles.lead}>{note.note}</span>
      {compact ? null : (
        <>
          <span className={styles.meta}>Use when: {note.useWhen}</span>
          <span className={styles.meta}>Do not: {note.doNot}</span>
        </>
      )}
    </p>
  );
}

export function tokenUsageTitle(token: string): string {
  const note = lookupTokenUsage(token);
  return `${note.note} Use when: ${note.useWhen}. Do not: ${note.doNot}`;
}
