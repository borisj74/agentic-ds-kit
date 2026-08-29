"use client";

import { useState } from "react";
import { Cell } from "@/ui/Cell";
import type { CellSize } from "@/ui/Cell";
import { CodeBlock } from "./CodeBlock";
import { FACES } from "./faces";
import styles from "./ComponentDoc.module.css";

const SIZES: CellSize[] = ["sm", "md"];

const PEOPLE = [
  { name: "Maya Chen", src: FACES["Maya Chen"] },
  { name: "Noah Williams", src: FACES["Noah Williams"] },
  { name: "Iris Okafor", src: FACES["Iris Okafor"] },
  { name: "Jordan Lee", src: FACES["Jordan Lee"] },
];

function masterCode(size: CellSize, text: boolean, checkbox: boolean): string {
  const lines = ["<Cell", '  type="text"', `  size="${size}"`];
  if (text) lines.push("  text");
  else lines.push("  text={false}");
  if (checkbox) lines.push("  checkbox");
  lines.push('  label="Maya Chen"', "/>");
  return lines.join("\n");
}

export function CellDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<CellSize>("md");
  const [showText, setShowText] = useState(true);
  const [checkbox, setCheckbox] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Cell</h1>
        <p className={styles.lede}>
          Inline dataset cell. Compose kit Avatar, Badge, Checkbox, Select, Button, and ButtonGroup.
          DataTable renders Cell in each td.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="cell-master">
        <div className={styles.masterHeader}>
          <h2 id="cell-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Type is text. Toggle size, text, and checkbox.
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
                <div className={styles.previewRow}>
                    <Cell
                      type="text"
                      size={size}
                      text={showText}
                      checkbox={checkbox}
                      label="Maya Chen"
                      checked={checked}
                      onCheckedChange={setChecked}
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
                  <span className={styles.panelLabel}>States</span>
                  <label className={styles.switch}>
                    Text
                    <span className={styles.switchControl} data-checked={showText}>
                      <input
                        type="checkbox"
                        checked={showText}
                        onChange={(event) => setShowText(event.target.checked)}
                      />
                      <span className={styles.switchThumb} />
                    </span>
                  </label>
                  <label className={styles.switch}>
                    Checkbox
                    <span className={styles.switchControl} data-checked={checkbox}>
                      <input
                        type="checkbox"
                        checked={checkbox}
                        onChange={(event) => setCheckbox(event.target.checked)}
                      />
                      <span className={styles.switchThumb} />
                    </span>
                  </label>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Compose kit Avatar, Badge, and Checkbox. DataTable uses Cell in every td. Do not
                  invent a local cell, Tag, Trend, or FileIcon.
                </p>
              </div>
              <CodeBlock code={masterCode(size, showText, checkbox)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Text</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="text" size="md" label="Maya Chen" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Plain label. Optional leading Checkbox.</p>
              </div>
              <CodeBlock code={'<Cell type="text" size="md" label="Maya Chen" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Avatar</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="avatar" size="md" label="Maya Chen" name="Maya Chen" src={FACES["Maya Chen"]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Kit Avatar plus optional name. Do not invent a local face.</p>
              </div>
              <CodeBlock
                code={'<Cell type="avatar" size="md" label="Maya Chen" name="Maya Chen" src="/faces/maya-chen.jpg" />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>File</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="file" size="md" label="brief.pdf" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Lucide File via LucideByName. Icon is aria-hidden.</p>
              </div>
              <CodeBlock code={'<Cell type="file" size="md" label="brief.pdf" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Payment</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="payment" size="md" label="Visa" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Lucide CreditCard via LucideByName. Do not invent PaymentMethod.</p>
              </div>
              <CodeBlock code={'<Cell type="payment" size="md" label="Visa" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Badge</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="badge" size="md" label="Active" tone="success" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Single kit Badge. Active-like demos use success; otherwise neutral.</p>
              </div>
              <CodeBlock code={'<Cell type="badge" size="md" label="Active" tone="success" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Badges</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell
                      type="badges"
                      size="md"
                      badges={[
                        { label: "Design", tone: "info" },
                        { label: "Core", tone: "neutral" },
                      ]}
                    />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Up to three kit Badges in a row. Do not invent Tag.</p>
              </div>
              <CodeBlock
                code={
                  '<Cell type="badges" size="md" badges={[{ label: "Design", tone: "info" }, { label: "Core" }]} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Trend positive</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="trendPositive" size="md" value="12%" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  ChevronUp with status.success. Do not use Badge for trends.
                </p>
              </div>
              <CodeBlock code={'<Cell type="trendPositive" size="md" value="12%" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Trend negative</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="trendNegative" size="md" value="4%" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>ChevronDown with status.danger.</p>
              </div>
              <CodeBlock code={'<Cell type="trendNegative" size="md" value="4%" />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Avatar group</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                    <Cell type="avatarGroup" size="md" people={[...PEOPLE]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Kit AvatarGroup, max 3. Do not invent a local stack.</p>
              </div>
              <CodeBlock
                code={
                  '<Cell type="avatarGroup" size="md" people={[{ name: "Maya Chen", src: "/faces/maya-chen.jpg" }, { name: "Noah Williams", src: "/faces/noah-williams.jpg" }, { name: "Iris Okafor", src: "/faces/iris-okafor.jpg" }, { name: "Jordan Lee", src: "/faces/jordan-lee.jpg" }]} />'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Select</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Cell
                    type="select"
                    size="md"
                    label="Status"
                    value="active"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "invited", label: "Invited" },
                      { value: "away", label: "Away" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Kit Select, size sm. Do not invent a local dropdown.</p>
              </div>
              <CodeBlock
                code={'<Cell type="select" label="Status" value="active" options={[{ value: "active", label: "Active" }, { value: "away", label: "Away" }]} />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Progress</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Cell type="progress" size="md" value={64} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  0 to 100 bar using fill.brand on surface.muted. Not a Progress cousin.
                </p>
              </div>
              <CodeBlock code={'<Cell type="progress" size="md" value={64} />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Rating</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Cell type="rating" size="md" value={4} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Five Lucide Stars. value is 0 to 5. Do not invent Rating.
                </p>
              </div>
              <CodeBlock code={'<Cell type="rating" size="md" value={4} />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Action buttons</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Cell
                    type="actions"
                    size="md"
                    actions={[
                      { label: "Edit" },
                      { label: "Delete", variant: "danger" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Kit ButtonGroup of kit Buttons. Cap at 3.</p>
              </div>
              <CodeBlock
                code={'<Cell type="actions" actions={[{ label: "Edit" }, { label: "Delete", variant: "danger" }]} />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Action icons</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Cell
                    type="actionIcons"
                    size="md"
                    actions={[
                      { icon: "Pencil", ariaLabel: "Edit" },
                      { icon: "Trash2", ariaLabel: "Delete", variant: "danger" },
                    ]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Icon-only kit Buttons. Each needs ariaLabel.</p>
              </div>
              <CodeBlock
                code={'<Cell type="actionIcons" actions={[{ icon: "Pencil", ariaLabel: "Edit" }, { icon: "Trash2", ariaLabel: "Delete" }]} />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Action menu</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Cell type="actionMenu" size="md" label="Row actions" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  One icon-only kit Button, Ellipsis by default. Trigger only — no DropdownMenu cousin.
                </p>
              </div>
              <CodeBlock code={'<Cell type="actionMenu" label="Row actions" />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
