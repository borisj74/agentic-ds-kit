"use client";

import { useState } from "react";
import { AvatarGroup } from "@/ui/AvatarGroup";
import type { AvatarGroupSize } from "@/ui/AvatarGroup";
import { CodeBlock } from "./CodeBlock";
import { FACES } from "./faces";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: AvatarGroupSize[] = ["sm", "md", "lg"];

const MIXED = [
  { name: "Maya Chen", src: FACES["Maya Chen"] },
  { name: "Ada Jones" },
  { name: "Noah Williams", src: FACES["Noah Williams"] },
  { name: "Leo" },
  { name: "Iris Okafor", src: FACES["Iris Okafor"] },
  { name: "Rio Vale" },
] as const;

const INITIALS = [
  { name: "Boris Jovanovic" },
  { name: "Ada Jones" },
  { name: "Mira" },
  { name: "Leo" },
] as const;

const PHOTOS = [
  { name: "Maya Chen", src: FACES["Maya Chen"] },
  { name: "Noah Williams", src: FACES["Noah Williams"] },
  { name: "Iris Okafor", src: FACES["Iris Okafor"] },
] as const;

function masterCode(size: AvatarGroupSize): string {
  return [
    `<AvatarGroup size="${size}" max={3} ariaLabel="Assignees" items={[`,
    `  { name: "Maya Chen", src: "/faces/maya-chen.jpg" },`,
    `  { name: "Ada Jones" },`,
    `  { name: "Noah Williams", src: "/faces/noah-williams.jpg" },`,
    `  { name: "Leo" },`,
    `  { name: "Iris Okafor", src: "/faces/iris-okafor.jpg" },`,
    `  { name: "Rio Vale" },`,
    `]} />`,
  ].join("\n");
}

export function AvatarGroupDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<AvatarGroupSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>AvatarGroup</h1>
        <p className={styles.lede}>Overlapping kit Avatars. Leftover is +N, not another person.</p>
      </header>

      <section className={styles.master} aria-labelledby="avatargroup-master">
        <div className={styles.masterHeader}>
          <h2 id="avatargroup-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Switch size across a stack of six people, three faces plus leftover.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <AvatarGroup size={size} max={3} ariaLabel="Assignees" items={[...MIXED]} />
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
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Only kit Avatars. One person is Avatar. Badge is not for people. Extra people collapse to +N,
                  not another face.
                </p>
              </div>
              <CodeBlock code={masterCode(size)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Tight stack</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <AvatarGroup size="md" max={4} ariaLabel="Assignees" items={[...INITIALS]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Four initials, max 4. When the row fits, there is no leftover count.
                </p>
              </div>
              <CodeBlock
                code={[
                  `<AvatarGroup size="md" max={4} ariaLabel="Assignees" items={[`,
                  `  { name: "Boris Jovanovic" },`,
                  `  { name: "Ada Jones" },`,
                  `  { name: "Mira" },`,
                  `  { name: "Leo" },`,
                  `]} />`,
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Overflow +N</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <AvatarGroup size="md" max={3} ariaLabel="Assignees" items={[...MIXED]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Six people, max 3. The leftover is a count circle (+3), not an Avatar — Avatar requires a
                  person name.
                </p>
              </div>
              <CodeBlock
                code={[
                  `<AvatarGroup size="md" max={3} ariaLabel="Assignees" items={[`,
                  `  { name: "Maya Chen", src: "/faces/maya-chen.jpg" },`,
                  `  { name: "Ada Jones" },`,
                  `  { name: "Noah Williams", src: "/faces/noah-williams.jpg" },`,
                  `  { name: "Leo" },`,
                  `  { name: "Iris Okafor", src: "/faces/iris-okafor.jpg" },`,
                  `  { name: "Rio Vale" },`,
                  `]} />`,
                ].join("\n")}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>All photos</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <AvatarGroup size="md" max={3} ariaLabel="Assignees" items={[...PHOTOS]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Every face can be a photo. The page-colored ring keeps the stack readable.
                </p>
              </div>
              <CodeBlock
                code={[
                  `<AvatarGroup size="md" max={3} ariaLabel="Assignees" items={[`,
                  `  { name: "Maya Chen", src: "/faces/maya-chen.jpg" },`,
                  `  { name: "Noah Williams", src: "/faces/noah-williams.jpg" },`,
                  `  { name: "Iris Okafor", src: "/faces/iris-okafor.jpg" },`,
                  `]} />`,
                ].join("\n")}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
