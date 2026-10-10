"use client";

import { useState } from "react";
import { Field } from "agentic-ds-kit";
import { Select } from "agentic-ds-kit";
import type { SelectSize, SelectValueDisplay } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const SIZES: SelectSize[] = ["sm", "md"];
const DISPLAYS: SelectValueDisplay[] = ["text", "tags"];
const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
  { value: "pineapple", label: "Pineapple" },
];
const CITIES = [
  { value: "amsterdam", label: "Amsterdam" },
  { value: "athens", label: "Athens" },
  { value: "belgrade", label: "Belgrade" },
  { value: "berlin", label: "Berlin" },
  { value: "chicago", label: "Chicago" },
  { value: "copenhagen", label: "Copenhagen" },
  { value: "dublin", label: "Dublin" },
  { value: "helsinki", label: "Helsinki" },
  { value: "lisbon", label: "Lisbon" },
  { value: "london", label: "London" },
  { value: "madrid", label: "Madrid" },
  { value: "oslo", label: "Oslo" },
  { value: "paris", label: "Paris" },
  { value: "prague", label: "Prague" },
  { value: "rome", label: "Rome" },
  { value: "stockholm", label: "Stockholm" },
  { value: "tokyo", label: "Tokyo" },
  { value: "toronto", label: "Toronto" },
  { value: "vienna", label: "Vienna" },
  { value: "warsaw", label: "Warsaw" },
  { value: "zagreb", label: "Zagreb" },
  { value: "zurich", label: "Zurich" },
];
const TEAMS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;

function masterCode(size: SelectSize, display: SelectValueDisplay) {
  const tags = display === "tags";
  const lines = [
    `<Field label="${tags ? "Fruits" : "Fruit"}" htmlFor="${tags ? "fruits" : "fruit"}">`,
    "  <Select",
    `    id="${tags ? "fruits" : "fruit"}"`,
  ];
  if (tags) lines.push("    multiple", '    valueDisplay="tags"');
  lines.push(`    placeholder="${tags ? "Select fruits" : "Select a fruit"}"`, "    options={fruits}");
  if (size !== "md") lines.push(`    size="${size}"`);
  lines.push("  />", "</Field>");
  return lines.join("\n");
}

export function SelectDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<SelectSize>("md");
  const [display, setDisplay] = useState<SelectValueDisplay>("text");
  const [previewFruits, setPreviewFruits] = useState<string | string[]>(["apple", "banana"]);
  const [teams, setTeams] = useState<string | string[]>([
    "design",
    "engineering",
    "marketing",
    "product",
  ]);
  const [fruit, setFruit] = useState<string | string[]>("");
  const [fruits, setFruits] = useState<string | string[]>(["apple", "banana"]);
  const [checkedFruits, setCheckedFruits] = useState<string | string[]>([
    "apple",
    "banana",
    "blueberry",
    "grapes",
  ]);
  const [city, setCity] = useState<string | string[]>("");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Select</h1>
        <p className={styles.lede}>
          Choose from a list. Field trigger, kit DropdownMenu panel. One piece. multiple for several
          values. searchable for a long fixed list. Not a native select.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="select-master">
        <div className={styles.masterHeader}>
          <h2 id="select-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Placeholder until you pick a fruit. Size lives in the panel. Multiple, checkboxes, and
            search are variants.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  {display === "tags" ? (
                    <Field label="Fruits" htmlFor="select-fruit-tags">
                      <Select
                        id="select-fruit-tags"
                        size={size}
                        multiple
                        valueDisplay="tags"
                        placeholder="Select fruits"
                        options={FRUITS}
                        value={previewFruits}
                        onChange={setPreviewFruits}
                      />
                    </Field>
                  ) : (
                    <Field label="Fruit" htmlFor="select-fruit">
                      <Select
                        id="select-fruit"
                        size={size}
                        placeholder="Select a fruit"
                        options={FRUITS}
                        value={fruit}
                        onChange={setFruit}
                      />
                    </Field>
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
                  <span className={styles.panelLabel}>Value display</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Value display">
                    {DISPLAYS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.sizeTab} ${display === step ? styles.sizeTabActive : ""}`}
                        aria-pressed={display === step}
                        onClick={() => setDisplay(step)}
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
                  Wrap with Field. Use multiple for several values. searchable for a long fixed
                  list. Command for a command palette. Do not invent SelectTrigger, SelectContent,
                  or MultiSelect.
                </p>
              </div>
              <CodeBlock code={masterCode(size, display)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Multiple</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Fruits" htmlFor="select-fruits">
                    <Select
                      id="select-fruits"
                      multiple
                      placeholder="Select fruits"
                      options={FRUITS}
                      value={fruits}
                      onChange={setFruits}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  multiple keeps the menu open and checks each pick. Same Select, not a MultiSelect
                  cousin. Trigger lists the labels.
                </p>
              </div>
              <CodeBlock code={'<Select id="fruits" multiple placeholder="Select fruits" options={fruits} />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Checkboxes</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Fruits" htmlFor="select-checkboxes">
                    <Select
                      id="select-checkboxes"
                      multiple
                      itemCheck="checkbox"
                      maxVisible={2}
                      placeholder="Select fruits"
                      options={FRUITS}
                      value={checkedFruits}
                      onChange={setCheckedFruits}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  itemCheck=&quot;checkbox&quot; composes kit Checkbox in the menu. After maxVisible
                  labels, the trigger shows a kit Badge with the overflow count. Not
                  DropdownMenuCheckboxItem.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Select id="fruits" multiple itemCheck="checkbox" maxVisible={2} placeholder="Select fruits" options={fruits} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Tags</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Teams" htmlFor="select-tags">
                    <Select
                      id="select-tags"
                      multiple
                      valueDisplay="tags"
                      itemCheck="checkbox"
                      maxVisible={2}
                      placeholder="Select teams"
                      options={TEAMS}
                      value={teams}
                      onChange={setTeams}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  valueDisplay=&quot;tags&quot; shows each pick as a removable kit Tag that wraps
                  inside the field. The X deselects without opening the menu. Tags sit beside the
                  trigger button, not inside it: Tab visits each remove, then the trigger.
                  maxVisible still caps Tags with the +N Badge.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Select id="teams" multiple valueDisplay="tags" itemCheck="checkbox" maxVisible={2} placeholder="Select teams" options={teams} />'
                }
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Search</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="City" htmlFor="select-search">
                    <Select
                      id="select-search"
                      searchable
                      placeholder="Select a city"
                      options={CITIES}
                      value={city}
                      onChange={setCity}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  searchable puts a kit Input at the top of the panel and filters labels. Use it
                  for a long fixed list. Command still owns command palettes, not this.
                </p>
              </div>
              <CodeBlock
                code={'<Select id="city" searchable placeholder="Select a city" options={cities} />'}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
