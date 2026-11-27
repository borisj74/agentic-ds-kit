"use client";

import { useEffect, useRef, useState } from "react";
import { Combobox, Field } from "agentic-ds-kit";
import type { ComboboxSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";
import { ControlsPanel, SizeControl } from "./ControlsPanel";

const SIZES: ComboboxSize[] = ["sm", "md", "lg"];
const PREVIEW_FILL = { maxWidth: "20rem" } as const;
const CITIES = [
  { value: "amsterdam", label: "Amsterdam" },
  { value: "berlin", label: "Berlin" },
  { value: "lisbon", label: "Lisbon" },
  { value: "london", label: "London" },
  { value: "oslo", label: "Oslo" },
  { value: "paris", label: "Paris" },
  { value: "tokyo", label: "Tokyo" },
];

export function ComboboxDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [size, setSize] = useState<ComboboxSize>("md");
  const [city, setCity] = useState("");
  const [asyncCity, setAsyncCity] = useState("");
  const [options, setOptions] = useState<typeof CITIES>([]);
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Combobox</h2>
        <p className={styles.lede}>
          Type to filter one value. Arrow keys move through the list, Enter selects, and Escape
          closes. Pass onQueryChange when the list loads asynchronously.
        </p>
      </header>
      <section className={styles.master} aria-labelledby="combobox-master">
        <div className={styles.masterHeader}>
          <h2 id="combobox-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>A fixed list filtered as you type. Async search is a variant.</p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>
        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="City" htmlFor="combobox-city">
                    <Combobox
                      id="combobox-city"
                      size={size}
                      placeholder="Search cities"
                      options={CITIES}
                      value={city}
                      onChange={setCity}
                    />
                  </Field>
                </div>
              </div>
              <ControlsPanel>
                <SizeControl options={SIZES} value={size} onChange={setSize} />
              </ControlsPanel>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Wrap with Field. Use Select for a short fixed menu. Use Combobox when the person
                  types to search, including when options arrive later. Command is still the command
                  palette.
                </p>
              </div>
              <CodeBlock
                code={'<Field label="City" htmlFor="city"><Combobox id="city" options={cities} /></Field>'}
              />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Async</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="City" htmlFor="combobox-async">
                    <Combobox
                      id="combobox-async"
                      placeholder="Search cities"
                      options={options}
                      loading={loading}
                      startLabel="Start typing to find a city"
                      loadingLabel="Loading cities"
                      emptyLabel="No city matches"
                      value={asyncCity}
                      onChange={setAsyncCity}
                      onQueryChange={(query) => {
                        if (timer.current) window.clearTimeout(timer.current);
                        if (!query.trim()) {
                          setOptions([]);
                          setLoading(false);
                          return;
                        }
                        setLoading(true);
                        timer.current = window.setTimeout(() => {
                          const needle = query.trim().toLowerCase();
                          setOptions(
                            CITIES.filter((item) => item.label.toLowerCase().includes(needle)),
                          );
                          setLoading(false);
                        }, 400);
                      }}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  onQueryChange means the parent owns the list. The popup shows one state at a time:
                  startLabel before any query, loadingLabel with a Spinner while the request is in
                  flight, emptyLabel when nothing matches, then the options.
                </p>
              </div>
              <CodeBlock
                code={'<Combobox id="city" options={cities} loading={loading} onQueryChange={loadCities}\n  startLabel="Start typing to find a city" loadingLabel="Loading cities" emptyLabel="No city matches" />'}
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Custom value</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field label="Label" htmlFor="combobox-custom">
                    <Combobox
                      id="combobox-custom"
                      placeholder="Type or pick"
                      allowCustomValue
                      options={[{ value: "priority", label: "Priority" }, { value: "blocked", label: "Blocked" }]}
                      value={custom}
                      onChange={setCustom}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  allowCustomValue lets Enter commit the typed text when nothing is highlighted.
                  Tags the person keeps adding are TagInput.
                </p>
              </div>
              <CodeBlock code={'<Combobox id="label" allowCustomValue options={labels} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
