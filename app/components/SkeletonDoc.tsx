"use client";

import { useState } from "react";
import { Avatar } from "agentic-ds-kit";
import { Card } from "agentic-ds-kit";
import { Skeleton } from "agentic-ds-kit";
import type { SkeletonAnimation, SkeletonShape, SkeletonSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, RadioControl, SizeControl, SwitchControl } from "./ControlsPanel";

const SIZES: SkeletonSize[] = ["sm", "md", "lg"];
const SHAPES: SkeletonShape[] = ["text", "circle", "rect"];
const ANIMATIONS: SkeletonAnimation[] = ["shimmer", "pulse", "none"];
const STACK = { display: "grid", gap: "var(--space-3)", width: "100%", maxWidth: "20rem" } as const;

function masterCode(shape: SkeletonShape, size: SkeletonSize, animation: SkeletonAnimation, loading: boolean) {
  const lines = ["<Skeleton"];
  if (shape !== "text") lines.push(`  shape="${shape}"`);
  if (shape === "text") lines.push("  lines={3}");
  if (size !== "md") lines.push(`  size="${size}"`);
  if (animation !== "shimmer") lines.push(`  animation="${animation}"`);
  if (!loading) lines.push("  loading={false}");
  lines.push(">", "  <p>Ready summary.</p>", "</Skeleton>");
  return lines.join("\n");
}

export function SkeletonDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SkeletonSize>("md");
  const [shape, setShape] = useState<SkeletonShape>("text");
  const [animation, setAnimation] = useState<SkeletonAnimation>("shimmer");
  const [loading, setLoading] = useState(true);

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Skeleton</h2>
        <p className={styles.lede}>
          Gray placeholder shapes in the layout of content that is still loading. Not ShimmerText. Not
          Spinner. Not Progress.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="skeleton-master">
        <div className={styles.masterHeader}>
          <h2 id="skeleton-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Text lines by default. Shape, size, animation, and loading live in the panel.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Skeleton
                    shape={shape}
                    lines={shape === "text" ? 3 : 1}
                    size={size}
                    animation={animation}
                    loading={loading}
                  >
                    <p>Sprint 24 is on track. Three tasks still need an owner.</p>
                  </Skeleton>
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
                <RadioControl label="Shape" options={SHAPES} value={shape} onChange={setShape} />
                <RadioControl label="Animation" options={ANIMATIONS} value={animation} onChange={setAnimation} />
                <SwitchControl label="States" items={[{ label: "Loading", checked: loading, onChange: setLoading }]} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap the real content and set loading to false when it is ready. Label one Skeleton in
                  a group; give the rest an empty label.
                </p>
              </div>
              <CodeBlock code={masterCode(shape, size, animation, loading)} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Shapes</h2>
              <div className={styles.exampleCanvas}>
                <div style={STACK}>
                  <Skeleton shape="text" lines={3} />
                  <Skeleton shape="circle" size="lg" />
                  <Skeleton shape="rect" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Text lines, a circle, and a block.</p>
              </div>
              <CodeBlock
                code={'<Skeleton shape="text" lines={3} />\n<Skeleton shape="circle" size="lg" />\n<Skeleton shape="rect" />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>A card while it loads</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                  <Card title="People">
                    <div style={STACK}>
                      <Skeleton shape="circle" loading label="Loading people">
                        <Avatar name="Maya Chen" />
                      </Skeleton>
                      <Skeleton size="sm" width="40%" loading label="">
                        <strong>Maya Chen</strong>
                      </Skeleton>
                      <Skeleton size="sm" width="60%" loading label="">
                        <span>maya@acme.com</span>
                      </Skeleton>
                      <Skeleton lines={2} size="sm" loading label="">
                        <p>Owns design systems.</p>
                      </Skeleton>
                    </div>
                  </Card>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose several for a card. Label the first; pass an empty label on the rest.
                </p>
              </div>
              <CodeBlock
                code={`<Skeleton shape="circle" loading={loading} label="Loading people">
  <Avatar name={person.name} />
</Skeleton>
<Skeleton size="sm" width="40%" loading={loading} label="">
  <strong>{person.name}</strong>
</Skeleton>`}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Layouts</h2>
              <div className={styles.exampleCanvas}>
                <div style={{ display: "grid", gap: "var(--space-6)", width: "100%" }}>
                  <Skeleton layout="table" lines={4} label="Loading invoices" />
                  <div className={styles.previewFill} style={{ maxWidth: "20rem" }}>
                    <Card title="Plan">
                      <Skeleton layout="card" label="Loading plan" />
                    </Card>
                  </div>
                  <Skeleton layout="list" label="Loading people" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  table, card and list in one piece, with one label for the group. lines sets the rows.
                  Card draws no frame: put it inside a kit Card.
                </p>
              </div>
              <CodeBlock
                code={'<Skeleton layout="table" lines={4} label="Loading invoices" />\n<Card title="Plan">\n  <Skeleton layout="card" label="Loading plan" />\n</Card>\n<Skeleton layout="list" label="Loading people" />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>When to use which</h2>
              <div>
                <p className={styles.usageBody}>
                  Skeleton for the first load of a known layout. Spinner for a short wait, and Button
                  loading for a button action. Progress when the percent is known, and indeterminate
                  Progress when work is underway and the percent is not. Empty or LoadError when it fails
                  or there is nothing. Keep Meter for zones, a datatip and reference lines.
                </p>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
