import { ColorFoundations } from "./ColorFoundations";
import styles from "./foundations.module.css";
import playground from "../playground.module.css";

const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"];
const radii = ["--radius-sm", "--radius-md", "--radius-lg", "--radius-full"];
const shadows = ["--shadow-none", "--shadow-sm", "--shadow-md"];
const borders = [
  { name: "border.faint", var: "--border-faint" },
  { name: "border.strong", var: "--border-strong" },
  { name: "border.focus", var: "--border-focus" },
  { name: "border.disabled", var: "--border-disabled" },
];

export default function FoundationsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <h1 className={playground.pageTitle}>Foundations</h1>
        <p className={playground.pageLead}>
          Palette ramps map to semantic roles in lib/tokens.css. Components bind to semantic vars
          only — never primitives, never hex.
        </p>

        <section id="color" className={`${styles.section} ${styles.anchor}`}>
          <h2 className={styles.heading}>Color</h2>
          <ColorFoundations />
        </section>

        <section id="typography" className={`${styles.section} ${styles.anchor}`}>
          <h2 className={styles.heading}>Typography</h2>
          <div className={styles.typeStack}>
            <p className={styles.typeDisplay}>Display — Studio dashboard</p>
            <p className={styles.typeTitle}>Title — Settings</p>
            <p className={styles.typeHeading}>Heading — Key metrics</p>
            <p className={styles.typeBody}>Body — Default paragraph text for descriptions.</p>
            <p className={styles.typeLabel}>Label — Form field label</p>
          </div>
        </section>

        <section id="spacing" className={`${styles.section} ${styles.anchor}`}>
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

        <section id="radius" className={`${styles.section} ${styles.anchor}`}>
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

        <section id="border" className={`${styles.section} ${styles.anchor}`}>
          <h2 className={styles.heading}>Border</h2>
          <div className={styles.borderRow}>
            {borders.map((border) => (
              <div key={border.var} className={styles.borderSample}>
                <div
                  className={styles.borderBox}
                  style={{ borderColor: `var(${border.var})` }}
                />
                <code className={styles.tokenName}>{border.name}</code>
              </div>
            ))}
          </div>
          <p className={styles.borderNote}>
            Width: <code>--border-width-thin</code>, <code>--border-width-medium</code>
          </p>
        </section>

        <section id="shadow" className={`${styles.section} ${styles.anchor}`}>
          <h2 className={styles.heading}>Shadow</h2>
          <div className={styles.shadowRow}>
            {shadows.map((token) => (
              <div key={token} className={styles.shadowCard} style={{ boxShadow: `var(${token})` }}>
                <code className={styles.tokenName}>{token}</code>
              </div>
            ))}
          </div>
        </section>

        <section id="motion" className={`${styles.section} ${styles.anchor}`}>
          <h2 className={styles.heading}>Motion</h2>
          <p className={styles.motionNote}>
            Duration tokens: <code>--motion-fast</code> (150ms), <code>--motion-normal</code>{" "}
            (250ms). Used for hover, focus, and overlay transitions across the kit.
          </p>
        </section>
      </div>
    </div>
  );
}
