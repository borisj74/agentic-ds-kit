"use client";

import { useState } from "react";
import { Tag } from "agentic-ds-kit";
import type { TagDotTone, TagSize } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: TagSize[] = ["sm", "md", "lg"];
const DOTS: TagDotTone[] = ["neutral", "success", "warning", "danger", "info"];
type Leading = "none" | "dot" | "avatar";
const LEADING: Leading[] = ["none", "dot", "avatar"];

const BADGE_OR_TAG =
  "Badge is read-only status or category the system sets, like Paid, Overdue, or Beta. Tag is a label the user applies or manages: filter chips, keywords, assigned people. If the user can remove or select it, use Tag.";

function masterCode(opts: {
  size: TagSize;
  removable: boolean;
  selectable: boolean;
  withCount: boolean;
  leading: Leading;
  disabled: boolean;
}) {
  const lines = ["<Tag", `  size="${opts.size}"`];
  if (opts.selectable) {
    lines.push("  selectable");
    lines.push("  selected={selected}");
    lines.push("  onSelectedChange={setSelected}");
  }
  if (opts.leading === "dot") lines.push('  dot="success"');
  if (opts.leading === "avatar") lines.push('  avatar={{ name: "Ana Ruiz" }}');
  if (opts.withCount) lines.push("  count={4}");
  if (opts.removable) {
    lines.push("  removable");
    lines.push("  onRemove={() => {}}");
  }
  if (opts.disabled) lines.push("  disabled");
  lines.push(">", `  ${opts.leading === "avatar" ? "Ana Ruiz" : "Design"}`, "</Tag>");
  return lines.join("\n");
}

const FILTERS = ["Design", "Engineering", "Marketing", "Sales"];

export function TagDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<TagSize>("md");
  const [leading, setLeading] = useState<Leading>("none");
  const [removable, setRemovable] = useState(true);
  const [selectable, setSelectable] = useState(false);
  const [withCount, setWithCount] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selected, setSelected] = useState(true);
  const [removed, setRemoved] = useState(false);
  const [keywords, setKeywords] = useState(["Billing", "Invoices", "Refunds"]);
  const [picked, setPicked] = useState<string[]>(["Design"]);
  const label = leading === "avatar" ? "Ana Ruiz" : "Design";

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Tags</h1>
        <p className={styles.lede}>Labels the user applies or manages. Removable, selectable, with an optional count, dot, or avatar.</p>
      </header>

      <section className={styles.master} aria-labelledby="tag-master">
        <div className={styles.masterHeader}>
          <h2 id="tag-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>Toggle size, leading visual, count, removable, selectable, and disabled.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  {removed ? null : (
                    <Tag
                      size={size}
                      selectable={selectable}
                      selected={selected}
                      onSelectedChange={setSelected}
                      dot={leading === "dot" ? "success" : undefined}
                      avatar={leading === "avatar" ? { name: "Ana Ruiz" } : undefined}
                      count={withCount ? 4 : undefined}
                      removable={removable}
                      onRemove={() => setRemoved(true)}
                      disabled={disabled}
                    >
                      {label}
                    </Tag>
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
                  <span className={styles.panelLabel}>Leading</span>
                  <div className={styles.radioList} role="radiogroup" aria-label="Leading">
                    {LEADING.map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          name="tag-leading"
                          value={option}
                          checked={leading === option}
                          onChange={() => setLeading(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>States</span>
                  <Switch
                    label="Removable"
                    size="sm"
                    checked={removable}
                    onChange={(next) => {
                      setRemovable(next);
                      setRemoved(false);
                    }}
                  />
                  <Switch label="Selectable" size="sm" checked={selectable} onChange={setSelectable} />
                  <Switch label="Count" size="sm" checked={withCount} onChange={setWithCount} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Tag for labels the user adds, removes, or picks. Only the checkbox and the X are interactive; the Tag
                  itself is not a button.
                </p>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Badge or Tag?</h3>
                <p className={styles.usageBody}>{BADGE_OR_TAG}</p>
              </div>
              <CodeBlock code={masterCode({ size, removable, selectable, withCount, leading, disabled })} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Sizes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Tag key={step} size={step}>
                      Design
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Same sizes as Badge. md is the default; sm for dense rows and triggers.</p>
              </div>
              <CodeBlock code={SIZES.map((step) => `<Tag size="${step}">Design</Tag>`).join("\n")} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Removable</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {keywords.map((word) => (
                    <Tag key={word} removable onRemove={() => setKeywords((prev) => prev.filter((w) => w !== word))}>
                      {word}
                    </Tag>
                  ))}
                  {keywords.length === 0 ? (
                    <button
                      type="button"
                      className={styles.sizeTab}
                      onClick={() => setKeywords(["Billing", "Invoices", "Refunds"])}
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Keywords or filters the user can clear. The X is a button labelled Remove {"{text}"}. Move focus to a
                  sensible place after removal.
                </p>
              </div>
              <CodeBlock
                code={'{keywords.map((word) => (\n  <Tag key={word} removable onRemove={() => remove(word)}>\n    {word}\n  </Tag>\n))}'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Selectable</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow} role="group" aria-label="Teams">
                  {FILTERS.map((name) => (
                    <Tag
                      key={name}
                      selectable
                      selected={picked.includes(name)}
                      onSelectedChange={(next) =>
                        setPicked((prev) => (next ? [...prev, name] : prev.filter((p) => p !== name)))
                      }
                    >
                      {name}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Filter chips. A leading kit Checkbox is the control and the Tag text is its label; Space toggles it.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Tag\n  selectable\n  selected={picked.includes("Design")}\n  onSelectedChange={(next) => toggle("Design", next)}\n>\n  Design\n</Tag>'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Count</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Tag count={12}>Open</Tag>
                  <Tag selectable defaultSelected count={4}>
                    Engineering
                  </Tag>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Trailing kit Count (sm, neutral, subtle) for how many items match.</p>
              </div>
              <CodeBlock code={'<Tag count={12}>Open</Tag>\n<Tag selectable defaultSelected count={4}>\n  Engineering\n</Tag>'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Dot</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {DOTS.map((tone) => (
                    <Tag key={tone} dot={tone}>
                      {tone}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  A leading dot in a status color. Decorative: the text must still say what it means.
                </p>
              </div>
              <CodeBlock code={DOTS.map((tone) => `<Tag dot="${tone}">${tone}</Tag>`).join("\n")} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Avatar</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  {SIZES.map((step) => (
                    <Tag key={step} size={step} avatar={{ name: "Ana Ruiz" }} removable onRemove={() => {}}>
                      Ana Ruiz
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Assigned people. Leading kit Avatar, scaled to the Tag line.</p>
              </div>
              <CodeBlock code={'<Tag avatar={{ name: "Ana Ruiz" }} removable onRemove={() => {}}>\n  Ana Ruiz\n</Tag>'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewRow}>
                  <Tag disabled removable onRemove={() => {}}>
                    Design
                  </Tag>
                  <Tag disabled selectable defaultSelected>
                    Engineering
                  </Tag>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>Dims the Tag and disables both the checkbox and the X.</p>
              </div>
              <CodeBlock code={'<Tag disabled removable onRemove={() => {}}>\n  Design\n</Tag>'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
