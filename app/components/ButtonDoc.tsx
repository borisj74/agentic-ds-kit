"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import type { ButtonSize, ButtonVariant } from "@/ui/Button";
import { Switch } from "@/ui/Switch";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: ButtonSize[] = ["lg", "md", "sm"];
const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "danger"];
const ICON_MODES = ["none", "start", "end", "both", "only"] as const;

type IconMode = (typeof ICON_MODES)[number];

const MASTER_LABEL: Record<ButtonVariant, string> = {
  primary: "Continue",
  secondary: "Cancel",
  tertiary: "Learn more",
  danger: "Delete",
};

const VARIANT_DOCS: {
  variant: ButtonVariant;
  title: string;
  about: string;
  labels: Record<ButtonSize, string>;
}[] = [
  {
    variant: "primary",
    title: "Primary",
    about: "Use one Primary button per view. Show lg, md, and sm when hierarchy or density changes.",
    labels: { sm: "Save", md: "Continue", lg: "Get started" },
  },
  {
    variant: "secondary",
    title: "Secondary",
    about: "Use Secondary for cancel, back, or alternate paths that should stay quieter than Primary.",
    labels: { sm: "Back", md: "Cancel", lg: "View details" },
  },
  {
    variant: "tertiary",
    title: "Tertiary",
    about: "Use Tertiary for quiet actions in toolbars, empty states, or denser UI where a filled button would feel heavy.",
    labels: { sm: "Edit", md: "Learn more", lg: "See all options" },
  },
  {
    variant: "danger",
    title: "Danger",
    about: "Use Danger only for irreversible or harmful actions like delete. Confirm before committing when the cost of a mistake is high.",
    labels: { sm: "Remove", md: "Delete", lg: "Delete account" },
  },
];

function masterCode(variant: ButtonVariant, size: ButtonSize, disabled: boolean, label: string, icon: IconMode) {
  const lines = ["<Button", `  variant="${variant}"`, `  size="${size}"`, disabled ? "  disabled" : null];
  if (icon === "start" || icon === "both" || icon === "only") lines.push('  iconStart="Plus"');
  if (icon === "end" || icon === "both") lines.push('  iconEnd="ArrowRight"');
  if (icon === "only") {
    lines.push(`  ariaLabel="${label}"`, "/>");
    return lines.filter(Boolean).join("\n");
  }
  lines.push(">", `  ${label}`, "</Button>");
  return lines.filter(Boolean).join("\n");
}

export function ButtonDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ButtonSize>("md");
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [disabled, setDisabled] = useState(false);
  const [icon, setIcon] = useState<IconMode>("none");
  const label = MASTER_LABEL[variant];
  const start = icon === "start" || icon === "both" || icon === "only" ? "Plus" : undefined;
  const end = icon === "end" || icon === "both" ? "ArrowRight" : undefined;

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Buttons</h1>
        <p className={styles.lede}>
          Action hierarchy across primary, secondary, tertiary, and danger — each in lg, md, and sm. Lucide
          icon slots via iconStart and iconEnd. Icon-only needs aria-label.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="button-master">
        <div className={styles.masterHeader}>
          <h2 id="button-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Toggle size, variant, icon, and disabled to preview every Button combination.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  {icon === "only" ? (
                    <Button variant={variant} size={size} disabled={disabled} iconStart="Plus" ariaLabel={label} />
                  ) : (
                    <Button variant={variant} size={size} disabled={disabled} iconStart={start} iconEnd={end}>
                      {label}
                    </Button>
                  )}
                </div>
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
                  <span className={styles.panelLabel}>Variant</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Variant">
                    {VARIANTS.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="button-variant"
                          value={option}
                          checked={variant === option}
                          onChange={() => setVariant(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Icon</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Icon">
                    {ICON_MODES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="button-icon"
                          value={option}
                          checked={icon === option}
                          onChange={() => setIcon(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use one Primary per view. Secondary for quieter paths, Tertiary for low-emphasis actions, and Danger only for irreversible work.
                  Pass Lucide export names on iconStart and iconEnd. Icon-only omits children and must set ariaLabel. Related sibling actions go in ButtonGroup.
                </p>
              </div>
              <CodeBlock code={masterCode(variant, size, disabled, label, icon)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            {VARIANT_DOCS.map((doc) => (
              <section key={doc.variant} className={styles.example}>
                <h2 className={styles.exampleTitle}>{doc.title}</h2>
                <div className={styles.exampleCanvas}>
                  <div className={styles.previewRow}>
                    {SIZES.map((step) => (
                      <Button key={step} variant={doc.variant} size={step}>
                        {doc.labels[step]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={styles.usageTitle}>Usage</h3>
                  <p className={styles.usageBody}>{doc.about}</p>
                </div>
                <CodeBlock
                  code={SIZES.map((step) => `<Button variant="${doc.variant}" size="${step}">${doc.labels[step]}</Button>`).join("\n")}
                />
              </section>
            ))}
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icons</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Button variant="secondary" iconStart="Plus">
                    Add
                  </Button>
                  <Button variant="secondary" iconEnd="ArrowRight">
                    Continue
                  </Button>
                  <Button variant="secondary" iconStart="Plus" ariaLabel="Add" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Lucide export names on iconStart/iconEnd. Icon-only needs ariaLabel. Related sibling actions go in ButtonGroup.
                </p>
              </div>
              <CodeBlock
                code={[
                  '<Button variant="secondary" iconStart="Plus">Add</Button>',
                  '<Button variant="secondary" iconEnd="ArrowRight">Continue</Button>',
                  '<Button variant="secondary" iconStart="Plus" ariaLabel="Add" />',
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
