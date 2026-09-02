"use client";

import { useState } from "react";
import { Avatar } from "agentic-ds-kit";
import type { AvatarSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import { FACES } from "./faces";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: AvatarSize[] = ["sm", "md", "lg"];
const APPEARANCES = ["photo", "initials"] as const;

type Appearance = (typeof APPEARANCES)[number];

const PEOPLE = [
  { name: "Boris Jovanovic", initials: "BJ" },
  { name: "Ada Jones", initials: "AJ" },
  { name: "Mira", initials: "MI" },
] as const;

function masterCode(size: AvatarSize, appearance: Appearance): string {
  if (appearance === "photo") {
    return `<Avatar name="Maya Chen" src="${FACES["Maya Chen"]}" size="${size}" />`;
  }
  return `<Avatar name="Boris Jovanovic" size="${size}" />`;
}

export function AvatarDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<AvatarSize>("md");
  const [appearance, setAppearance] = useState<Appearance>("photo");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Avatar</h1>
        <p className={styles.lede}>Face or initials for a person. Badge is for status. Not a button.</p>
      </header>

      <section className={styles.master} aria-labelledby="avatar-master">
        <div className={styles.masterHeader}>
          <h2 id="avatar-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Switch size and source to preview a photo or derived initials.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <Avatar
                    name="Maya Chen"
                    src={appearance === "photo" ? FACES["Maya Chen"] : undefined}
                    size={size}
                  />
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
                  <span className={styles.panelLabel}>Appearance</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Appearance">
                    {APPEARANCES.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="avatar-appearance"
                          value={option}
                          checked={appearance === option}
                          onChange={() => setAppearance(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Always pass name. src is optional — a missing or broken image falls back to initials from
                  name. Use kit Avatar only. Badge is not for people. Several people go in AvatarGroup. A
                  Lucide User icon appears only if both the image and initials fail.
                </p>
              </div>
              <CodeBlock code={masterCode(size, appearance)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Photo</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Avatar key={step} name="Maya Chen" src={FACES["Maya Chen"]} size={step} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Photo avatars in sm, md, and lg. The image is cropped to the circle.</p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<Avatar name="Maya Chen" src="${FACES["Maya Chen"]}" size="${step}" />`).join(
                  "\n",
                )}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Initials</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {PEOPLE.map((person) => (
                    <Avatar key={person.name} name={person.name} size="md" />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Omit src to show initials. Two words become first-and-last letters (Boris Jovanovic → BJ).
                  One word uses the first two letters (Mira → MI).
                </p>
              </div>
              <CodeBlock
                code={PEOPLE.map((person) => `<Avatar name="${person.name}" />`).join("\n")}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Avatar key={step} name="Ada Jones" size={step} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>sm 32px, md 40px, lg 48px. Same sizes apply to photo and initials.</p>
              </div>
              <CodeBlock
                code={SIZES.map((step) => `<Avatar name="Ada Jones" size="${step}" />`).join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
