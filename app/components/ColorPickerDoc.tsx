"use client";

import { useState } from "react";
import { ColorPicker, Field, Switch } from "agentic-ds-kit";
import type { ColorPickerSwatch } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const PREVIEW_FILL = { maxWidth: "20rem" } as const;

/** Demo data: a brand palette. These hex values are user content, not kit styling. */
const BRAND: ColorPickerSwatch[] = [
  { value: "#2F6FEB", label: "Brand blue" },
  { value: "#0E9F6E", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#E02424", label: "Red" },
  { value: "#7E3AF2", label: "Violet" },
  { value: "#111827", label: "Ink" },
  { value: "#FFFFFF", label: "White" },
];

function masterCode(hex: string, swatches: boolean, alpha: boolean, disabled: boolean) {
  const lines = ["<ColorPicker", `  value="${hex}"`, "  onChange={setColour}"];
  if (swatches) lines.push('  swatches={["#2F6FEB", { value: "#0E9F6E", label: "Green" }, …]}');
  if (alpha) lines.push("  showAlpha");
  if (disabled) lines.push("  disabled");
  lines.push("/>");
  return lines.join("\n");
}

export function ColorPickerDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [hex, setHex] = useState("#2F6FEB");
  const [swatches, setSwatches] = useState(true);
  const [alpha, setAlpha] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [brand, setBrand] = useState("#0E9F6E");
  const [accent, setAccent] = useState<string | undefined>(undefined);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>ColorPicker</h1>
        <p className={styles.lede}>
          Inline colour picker: saturation and brightness area, hue, optional opacity, a hex Input,
          and preset swatches. The picked colour is user data, painted with inline style; all chrome
          uses tokens. Not ColorArea, HueSlider, or input type=color.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="colorpicker-master">
        <div className={styles.masterHeader}>
          <h2 id="colorpicker-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Drag the area or hue, use the arrow keys (Shift for ×10), pick a swatch, or type a hex.
            Current value: <code>{hex}</code>
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <ColorPicker
                    value={hex}
                    onChange={setHex}
                    swatches={swatches ? BRAND : undefined}
                    showAlpha={alpha}
                    disabled={disabled}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <Switch label="Swatches" size="sm" checked={swatches} onChange={setSwatches} />
                  <Switch label="Opacity" size="sm" checked={alpha} onChange={setAlpha} />
                  <Switch label="Disabled" size="sm" checked={disabled} onChange={setDisabled} />
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  The area is one 2D slider: left and right set saturation, up and down set
                  brightness. Hue and opacity are sliders. Swatches are a radio group with one Tab
                  stop. A full hex applies as you type; an invalid hex shows a message and keeps the
                  last valid colour. With opacity, onChange returns #RRGGBBAA below 100%.
                </p>
              </div>
              <CodeBlock code={masterCode(hex, swatches, alpha, disabled)} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>In a Field</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field
                    label="Brand colour"
                    htmlFor="doc-brand-colour"
                    hint="Used for buttons and links."
                  >
                    <ColorPicker
                      id="doc-brand-colour"
                      ariaLabel="Brand colour"
                      value={brand}
                      onChange={setBrand}
                      swatches={BRAND.slice(0, 5)}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Field owns the label and hint. Pass the same id as htmlFor: the label names the hex
                  Input, and ariaLabel names the area, hue, and swatches.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Field label="Brand colour" htmlFor="brand-colour" hint="Used for buttons and links.">\n  <ColorPicker id="brand-colour" ariaLabel="Brand colour" value={brand} onChange={setBrand} swatches={palette} />\n</Field>'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Field error</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <Field
                    label="Accent colour"
                    htmlFor="doc-accent-colour"
                    error={accent ? undefined : "Pick an accent colour."}
                  >
                    <ColorPicker
                      id="doc-accent-colour"
                      ariaLabel="Accent colour"
                      value={accent}
                      onChange={setAccent}
                      swatches={BRAND.slice(0, 4)}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  App validation goes in Field error: it sets the danger border and describedBy on the
                  hex Input. The built-in invalid-hex message is separate and only covers typing.
                </p>
              </div>
              <CodeBlock
                code={
                  '<Field label="Accent colour" htmlFor="accent" error={accent ? undefined : "Pick an accent colour."}>\n  <ColorPicker id="accent" ariaLabel="Accent colour" value={accent} onChange={setAccent} />\n</Field>'
                }
              />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Opacity</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <ColorPicker defaultValue="#2F6FEBB3" showAlpha ariaLabel="Overlay colour" />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  showAlpha adds an opacity track over a checkerboard. The hex Input shows six digits;
                  typing eight sets opacity too.
                </p>
              </div>
              <CodeBlock code={'<ColorPicker defaultValue="#2F6FEBB3" showAlpha onChange={setOverlay} />'} />
            </section>
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_FILL}>
                  <ColorPicker defaultValue="#7E3AF2" swatches={BRAND.slice(0, 4)} disabled />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  No pointer, no keys, nothing in the Tab order. Use it when the theme is locked by
                  an admin.
                </p>
              </div>
              <CodeBlock code={'<ColorPicker value={brand} disabled />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
