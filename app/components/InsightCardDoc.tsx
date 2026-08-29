"use client";

import { useState } from "react";
import { InsightCard } from "@/ui/InsightCard";
import type { InsightCardSize, InsightCardTone } from "@/ui/InsightCard";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const SIZES: InsightCardSize[] = ["sm", "md", "lg"];
const TONES: InsightCardTone[] = ["opportunity", "warning", "danger", "info", "neutral"];

const MASTER_TITLE = "Rebook no-shows automatically";
const MASTER_DESCRIPTION = "Fill empty slots from the waitlist when clients cancel.";
const MASTER_CONFIDENCE = "High confidence";
const MASTER_SOURCE = "From last 14 days";

function masterCode(
  size: InsightCardSize,
  tone: InsightCardTone,
  showDescription: boolean,
  showConfidence: boolean,
  showSource: boolean,
  showDismiss: boolean,
) {
  const lines = ["<InsightCard", `  title="${MASTER_TITLE}"`];
  if (showDescription) lines.push(`  description="${MASTER_DESCRIPTION}"`);
  lines.push('  eyebrow="Insight"', `  tone="${tone}"`, `  size="${size}"`);
  if (showConfidence) lines.push(`  confidence="${MASTER_CONFIDENCE}"`);
  if (showSource) lines.push(`  source="${MASTER_SOURCE}"`);
  lines.push('  primaryAction={{ label: "Review", onClick: () => {} }}');
  lines.push('  secondaryAction={{ label: "Not now", onClick: () => {} }}');
  if (showDismiss) lines.push("  onDismiss={() => {}}");
  lines.push("/>");
  return lines.join("\n");
}

const VARIANT_DOCS: {
  title: string;
  about: string;
  code: string;
  card: {
    title: string;
    description: string;
    tone?: InsightCardTone;
    size?: InsightCardSize;
    confidence?: string;
    source?: string;
    dismiss?: boolean;
    primary?: string;
    secondary?: string;
  };
}[] = [
  {
    title: "Opportunity",
    about: "Default tone. Use for a recommended action the user can take next.",
    code: `<InsightCard
  title="Rebook no-shows automatically"
  description="Fill empty slots from the waitlist when clients cancel."
  tone="opportunity"
  primaryAction={{ label: "Review", onClick: () => {} }}
  secondaryAction={{ label: "Not now", onClick: () => {} }}
/>`,
    card: {
      title: "Rebook no-shows automatically",
      description: "Fill empty slots from the waitlist when clients cancel.",
      tone: "opportunity",
      primary: "Review",
      secondary: "Not now",
    },
  },
  {
    title: "Warning",
    about: "Use Warning when a finding needs attention the user can still fix.",
    code: `<InsightCard
  title="Slots going unused this week"
  description="12 openings have no waitlist match yet."
  tone="warning"
  primaryAction={{ label: "Review", onClick: () => {} }}
/>`,
    card: {
      title: "Slots going unused this week",
      description: "12 openings have no waitlist match yet.",
      tone: "warning",
      primary: "Review",
    },
  },
  {
    title: "Danger",
    about: "Use Danger for a harmful finding that needs a recovery action.",
    code: `<InsightCard
  title="Payment failed for 8 clients"
  description="Failed charges will cancel upcoming visits unless retried."
  tone="danger"
  primaryAction={{ label: "Retry", onClick: () => {} }}
/>`,
    card: {
      title: "Payment failed for 8 clients",
      description: "Failed charges will cancel upcoming visits unless retried.",
      tone: "danger",
      primary: "Retry",
    },
  },
  {
    title: "Info",
    about: "Use Info for a finding that is not a problem and not an opportunity.",
    code: `<InsightCard
  title="New waitlist pattern"
  description="Evening slots fill twice as fast as mornings."
  tone="info"
  source="From last 30 days"
/>`,
    card: {
      title: "New waitlist pattern",
      description: "Evening slots fill twice as fast as mornings.",
      tone: "info",
      source: "From last 30 days",
    },
  },
  {
    title: "Neutral",
    about: "Use Neutral when the tile should not carry a status color.",
    code: `<InsightCard
  title="Review leftover inventory"
  description="4 products are below the reorder point."
  tone="neutral"
  primaryAction={{ label: "Open list", onClick: () => {} }}
/>`,
    card: {
      title: "Review leftover inventory",
      description: "4 products are below the reorder point.",
      tone: "neutral",
      primary: "Open list",
    },
  },
  {
    title: "Large",
    about: "lg uses wider padding and md Buttons. Stay on heading size for the title.",
    code: `<InsightCard
  title="Rebook no-shows automatically"
  description="Fill empty slots from the waitlist when clients cancel."
  size="lg"
  confidence="High confidence"
  source="From last 14 days"
  primaryAction={{ label: "Review", onClick: () => {} }}
  secondaryAction={{ label: "Not now", onClick: () => {} }}
/>`,
    card: {
      title: "Rebook no-shows automatically",
      description: "Fill empty slots from the waitlist when clients cancel.",
      size: "lg",
      confidence: "High confidence",
      source: "From last 14 days",
      primary: "Review",
      secondary: "Not now",
    },
  },
  {
    title: "Compact",
    about: "sm is a denser tile for dashboard rails next to Scorecards.",
    code: `<InsightCard
  title="Rebook no-shows automatically"
  description="Fill empty slots from the waitlist when clients cancel."
  size="sm"
  primaryAction={{ label: "Review", onClick: () => {} }}
/>`,
    card: {
      title: "Rebook no-shows automatically",
      description: "Fill empty slots from the waitlist when clients cancel.",
      size: "sm",
      primary: "Review",
    },
  },
];

export function InsightCardDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<InsightCardSize>("md");
  const [tone, setTone] = useState<InsightCardTone>("opportunity");
  const [showDescription, setShowDescription] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showDismiss, setShowDismiss] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>InsightCard</h1>
        <p className={styles.lede}>Recommended insight. Not Card. Not Scorecard. Not Alert.</p>
      </header>

      <section className={styles.master} aria-labelledby="insightcard-master">
        <div className={styles.masterHeader}>
          <h2 id="insightcard-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Toggle size, tone, description, confidence, source, and dismiss. Actions are kit
            Buttons. Dismiss is not.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <InsightCard
                  title={MASTER_TITLE}
                  description={showDescription ? MASTER_DESCRIPTION : undefined}
                  eyebrow="Insight"
                  tone={tone}
                  size={size}
                  confidence={showConfidence ? MASTER_CONFIDENCE : undefined}
                  source={showSource ? MASTER_SOURCE : undefined}
                  primaryAction={{ label: "Review", onClick: () => {} }}
                  secondaryAction={{ label: "Not now", onClick: () => {} }}
                  onDismiss={showDismiss ? () => {} : undefined}
                />
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${size === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === step}
                        onClick={() => setSize(step)}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Tone</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Tone">
                    {TONES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.sizeTab} ${tone === option ? styles.sizeTabActive : ""}`}
                        aria-pressed={tone === option}
                        onClick={() => setTone(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Content</span>
                  <Switch size="sm" label="Description" checked={showDescription} onChange={setShowDescription} />
                  <Switch size="sm" label="Confidence" checked={showConfidence} onChange={setShowConfidence} />
                  <Switch size="sm" label="Source" checked={showSource} onChange={setShowSource} />
                  <Switch size="sm" label="Dismiss" checked={showDismiss} onChange={setShowDismiss} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  InsightCard for a recommended action. Card for forms. Scorecard for one KPI.
                  Alert for inline page status. One primary Button per view.
                </p>
              </div>
              <CodeBlock
                code={masterCode(size, tone, showDescription, showConfidence, showSource, showDismiss)}
              />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.title} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <InsightCard
                    title={doc.card.title}
                    description={doc.card.description}
                    tone={doc.card.tone}
                    size={doc.card.size}
                    confidence={doc.card.confidence}
                    source={doc.card.source}
                    primaryAction={
                      doc.card.primary ? { label: doc.card.primary, onClick: () => {} } : undefined
                    }
                    secondaryAction={
                      doc.card.secondary ? { label: doc.card.secondary, onClick: () => {} } : undefined
                    }
                    onDismiss={doc.card.dismiss ? () => {} : undefined}
                  />
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock code={doc.code} />
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
