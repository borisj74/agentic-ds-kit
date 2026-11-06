"use client";

import { useSyncExternalStore } from "react";
import { ColorPicker, Field, Input, Section, Select, Slider } from "agentic-ds-kit";
import {
  DEFAULT_PRIMARY_HEX,
  DEFAULT_RADIUS_BASE,
  DEFAULT_SHADOW_SM,
  PLAYGROUND_COLOR_THEMES,
  PLAYGROUND_FONTS,
  PLAYGROUND_HEADING_WEIGHTS,
  applyPlaygroundColorTheme,
  applyPlaygroundFont,
  applyPlaygroundHeadingWeight,
  applyPlaygroundPrimaryHex,
  applyPlaygroundRadiusBase,
  applyPlaygroundShadowSm,
  applyPlaygroundTheme,
  readPlaygroundColorTheme,
  readPlaygroundFont,
  readPlaygroundHeadingWeight,
  readPlaygroundRadiusBase,
  readPlaygroundShadowSm,
  readPlaygroundTheme,
  readStoredPrimaryHex,
  type PlaygroundColorTheme,
  type PlaygroundFont,
  type PlaygroundHeadingWeight,
  type PlaygroundTheme,
} from "@/lib/playground-theme";
import styles from "./StudioControls.module.css";

function subscribeRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-color", "data-font", "style"],
  });
  return () => observer.disconnect();
}

const PRIMARY_SWATCHES = [
  { value: "#000000", label: "Ink" },
  { value: "#2563eb", label: "Blue" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#0d9488", label: "Teal" },
];

export function StudioControls() {
  const theme = useSyncExternalStore(subscribeRoot, readPlaygroundTheme, (): PlaygroundTheme => "light");
  const color = useSyncExternalStore(subscribeRoot, readPlaygroundColorTheme, (): PlaygroundColorTheme => "ink");
  const font = useSyncExternalStore(subscribeRoot, readPlaygroundFont, (): PlaygroundFont => "ibm-plex");
  const weight = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundHeadingWeight,
    (): PlaygroundHeadingWeight => "600",
  );
  const radius = useSyncExternalStore(subscribeRoot, readPlaygroundRadiusBase, () => DEFAULT_RADIUS_BASE);
  const shadow = useSyncExternalStore(subscribeRoot, readPlaygroundShadowSm, () => DEFAULT_SHADOW_SM);
  const primaryHex =
    useSyncExternalStore(subscribeRoot, () => readStoredPrimaryHex() ?? DEFAULT_PRIMARY_HEX, () => DEFAULT_PRIMARY_HEX);

  return (
    <Section title="Live controls" size="sm">
      <div className={styles.grid}>
        <Field label="Font" htmlFor="studio-font">
          <Select id="studio-font" size="sm" value={font} onChange={(value) => {
            if (typeof value === "string" && (value === "ibm-plex" || value === "inter" || value === "geist" || value === "system")) {
              applyPlaygroundFont(value);
            }
          }} options={PLAYGROUND_FONTS} />
        </Field>
        <Field label="Heading weight" htmlFor="studio-weight">
          <Select id="studio-weight" size="sm" value={weight} onChange={(value) => {
            if (typeof value === "string" && (value === "400" || value === "500" || value === "600" || value === "700")) {
              applyPlaygroundHeadingWeight(value);
            }
          }} options={PLAYGROUND_HEADING_WEIGHTS} />
        </Field>
        <Field label="Color shortcut" htmlFor="studio-color">
          <Select id="studio-color" size="sm" value={color} onChange={(value) => {
            if (typeof value !== "string") return;
            if (value === "ink" || value === "blue" || value === "violet" || value === "teal" || value === "custom") {
              applyPlaygroundColorTheme(value);
            }
          }} options={PLAYGROUND_COLOR_THEMES} />
        </Field>
        <Field label="Theme" htmlFor="studio-theme">
          <Select
            id="studio-theme"
            size="sm"
            value={theme}
            onChange={(value) => {
              if (value === "light" || value === "dark") applyPlaygroundTheme(value);
            }}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Field>
        <div className={styles.span2}>
          <Field label="Primary" htmlFor="studio-primary" hint="Shortcuts stay Ink/Blue/Violet/Teal. Any hex generates the live ramp.">
            <ColorPicker
              id="studio-primary"
              value={primaryHex}
              onChange={(hex) => applyPlaygroundPrimaryHex(hex)}
              swatches={PRIMARY_SWATCHES}
            />
          </Field>
        </div>
        <div className={styles.span2}>
          <p className={styles.sliderLabel} id="studio-radius-label">
            Radius base {radius}px
          </p>
          <Slider
            value={radius}
            min={2}
            max={24}
            step={1}
            onValueChange={(value) => {
              if (typeof value === "number") applyPlaygroundRadiusBase(value);
            }}
            aria-label="Radius base"
            aria-labelledby="studio-radius-label"
          />
        </div>
        <div className={styles.span2}>
          <Field label="Card shadow" htmlFor="studio-shadow" hint="Writes --shadow-sm. Cards keep using the semantic role.">
            <Input
              id="studio-shadow"
              value={shadow}
              onChange={(value) => applyPlaygroundShadowSm(value)}
            />
          </Field>
        </div>
      </div>
    </Section>
  );
}
