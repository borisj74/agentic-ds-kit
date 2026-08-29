import { ColorFoundations } from "./ColorFoundations";
import styles from "./foundations.module.css";
import playground from "../playground.module.css";

const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"];
const radii = ["--radius-sm", "--radius-md", "--radius-lg", "--radius-full"];
const shadows = ["--shadow-none", "--shadow-sm", "--shadow-md"];

export default function FoundationsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <h1 className={playground.pageTitle}>Foundations</h1>
        <p className={playground.pageLead}>
          Palette ramps map to semantic roles in lib/tokens.css. Components bind to semantic vars
          only — never primitives, never hex.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Color</h2>
          <ColorFoundations />
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Spacing</h2>
          <div className={styles.spacingList}>
            {spacing.map((token) => (
              <div key={token} className={styles.spacingRow}>
                <code className={styles.tokenName}>{token}</code>
                <div className={styles.spacingBar} style={{ width: `var(${token})` }} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Radius</h2>
          <div className={styles.radiusRow}>
            {radii.map((token) => (
              <div key={token} className={styles.radiusItem}>
                <div className={styles.radiusBox} style={{ borderRadius: `var(${token})` }} />
                <code className={styles.tokenName}>{token}</code>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Typography</h2>
          <div className={styles.typeStack}>
            <p className={styles.typeDisplay}>Display — Studio dashboard</p>
            <p className={styles.typeTitle}>Title — Settings</p>
            <p className={styles.typeHeading}>Heading — Key metrics</p>
            <p className={styles.typeBody}>Body — Default paragraph text for descriptions.</p>
            <p className={styles.typeLabel}>Label — Form field label</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Shadow & motion</h2>
          <div className={styles.shadowRow}>
            {shadows.map((token) => (
              <div key={token} className={styles.shadowCard} style={{ boxShadow: `var(${token})` }}>
                <code className={styles.tokenName}>{token}</code>
              </div>
            ))}
          </div>
          <p className={styles.motionNote}>
            Motion: <code>--motion-fast</code> (150ms), <code>--motion-normal</code> (250ms)
          </p>
        </section>
      </div>
    </div>
  );
}
