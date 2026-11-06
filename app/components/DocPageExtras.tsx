import Link from "next/link";
import { propsFor } from "@/lib/component-guidance";
import { componentNeighbors } from "@/lib/playground-nav";
import styles from "./ComponentDoc.module.css";

export interface DocPageExtrasProps {
  slug: string;
}

export function DocPageExtras({ slug }: DocPageExtrasProps) {
  const rows = propsFor(slug);
  const { prev, next } = componentNeighbors(slug);

  return (
    <>
      {rows.length > 0 ? (
        <section className={styles.propsSection} aria-labelledby={`${slug}-props`}>
          <h2 id={`${slug}-props`} className={styles.usageTitle}>
            Props
          </h2>
          <div className={styles.propsTableWrap}>
            <table className={styles.propsTable}>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Required</th>
                  <th scope="col">Default</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <th scope="row" className={styles.propsName}>
                      {row.name}
                    </th>
                    <td className={styles.propsType}>{row.type}</td>
                    <td>{row.required}</td>
                    <td className={styles.propsType}>{row.defaultValue}</td>
                    <td>{row.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {prev || next ? (
        <nav className={styles.pager} aria-label="Component pages">
          {prev ? (
            <Link href={prev.href} className={styles.pagerLink}>
              <span className={styles.pagerMeta}>Previous</span>
              <span className={styles.pagerLabel}>{prev.label}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className={`${styles.pagerLink} ${styles.pagerLinkNext}`}>
              <span className={styles.pagerMeta}>Next</span>
              <span className={styles.pagerLabel}>{next.label}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
