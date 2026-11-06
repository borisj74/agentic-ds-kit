"use client";

import { useSyncExternalStore } from "react";
import { Button, ButtonGroup, ColorPicker, Field, Select, Slider } from "agentic-ds-kit";
import {
  DEFAULT_PRIMARY_HEX,
  DEFAULT_RADIUS_BASE,
  DEFAULT_SHADOW_INTENSITY,
  DEFAULT_SPACE_SCALE,
  NEUTRAL_RAMPS,
  NEUTRAL_STEPS,
  PLAYGROUND_FONTS,
  PLAYGROUND_HEADING_WEIGHTS,
  PLAYGROUND_NEUTRAL_OPTIONS,
  PLAYGROUND_PRIMARY_SWATCHES,
  applyPlaygroundFontRole,
  applyPlaygroundHeadingWeight,
  applyPlaygroundNeutralScale,
  applyPlaygroundPrimaryChoice,
  applyPlaygroundRadiusBase,
  applyPlaygroundShadowIntensity,
  applyPlaygroundSpaceScale,
  applyPlaygroundTheme,
  readPlaygroundFontRole,
  readPlaygroundHeadingWeight,
  readPlaygroundNeutralScale,
  readPlaygroundPrimaryHex,
  readPlaygroundRadiusBase,
  readPlaygroundShadowIntensity,
  readPlaygroundSpaceScale,
  readPlaygroundTheme,
  resetPlaygroundAppearance,
  type PlaygroundFont,
  type PlaygroundFontRole,
  type PlaygroundHeadingWeight,
  type PlaygroundNeutralScale,
  type PlaygroundTheme,
} from "@/lib/playground-theme";
import styles from "./CustomizePanel.module.css";

const RADIUS_SCALE = [
  { name: "xs", chip: styles.radiusXs },
  { name: "sm", chip: styles.radiusSm },
  { name: "md", chip: styles.radiusMd },
  { name: "lg", chip: styles.radiusLg },
  { name: "xl", chip: styles.radiusXl },
  { name: "2xl", chip: styles.radius2xl },
  { name: "3xl", chip: styles.radius3xl },
] as const;

function subscribeRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      "data-theme",
      "data-color",
      "data-font",
      "data-font-interface",
      "data-font-heading",
      "data-font-mono",
      "data-neutral",
      "data-space",
      "data-shadow",
      "style",
    ],
  });
  return () => observer.disconnect();
}

function applyFont(role: PlaygroundFontRole, value: string | string[]) {
  if (value === "ibm-plex" || value === "inter" || value === "geist" || value === "system") {
    applyPlaygroundFontRole(role, value);
  }
}

function applyNeutral(value: string | string[]) {
  if (value === "neutral" || value === "zinc" || value === "slate" || value === "stone" || value === "gray") {
    applyPlaygroundNeutralScale(value);
  }
}

function ResetButton() {
  return (
    <Button size="sm" appearance="ghost" mode="neutral" onClick={() => resetPlaygroundAppearance()}>
      Reset
    </Button>
  );
}

export function CustomizePanel({
  variant,
  onCollapse,
}: {
  variant: "dock" | "sheet";
  onCollapse?: () => void;
}) {
  const theme = useSyncExternalStore(subscribeRoot, readPlaygroundTheme, (): PlaygroundTheme => "light");
  const interfaceFont = useSyncExternalStore(
    subscribeRoot,
    () => readPlaygroundFontRole("interface"),
    (): PlaygroundFont => "ibm-plex",
  );
  const headingFont = useSyncExternalStore(
    subscribeRoot,
    () => readPlaygroundFontRole("heading"),
    (): PlaygroundFont => "ibm-plex",
  );
  const monoFont = useSyncExternalStore(
    subscribeRoot,
    () => readPlaygroundFontRole("mono"),
    (): PlaygroundFont => "ibm-plex",
  );
  const weight = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundHeadingWeight,
    (): PlaygroundHeadingWeight => "600",
  );
  const neutral = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundNeutralScale,
    (): PlaygroundNeutralScale => "neutral",
  );
  const space = useSyncExternalStore(subscribeRoot, readPlaygroundSpaceScale, () => DEFAULT_SPACE_SCALE);
  const shadow = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundShadowIntensity,
    () => DEFAULT_SHADOW_INTENSITY,
  );
  const radius = useSyncExternalStore(subscribeRoot, readPlaygroundRadiusBase, () => DEFAULT_RADIUS_BASE);
  const primaryHex = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundPrimaryHex,
    () => DEFAULT_PRIMARY_HEX,
  );

  return (
    <div className={styles.panel}>
      {variant === "dock" ? (
        <header className={styles.header}>
          <h2 className={styles.title}>Customize</h2>
          <div className={styles.headerActions}>
            <ResetButton />
            <Button
              size="sm"
              appearance="ghost"
              mode="neutral"
              iconStart="PanelLeftClose"
              ariaLabel="Collapse customize"
              onClick={onCollapse}
            />
          </div>
        </header>
      ) : (
        <div className={styles.sheetHeader}>
          <ResetButton />
        </div>
      )}

      <section className={styles.section} aria-labelledby="customize-mode">
        <h3 id="customize-mode" className={styles.sectionLabel}>
          Mode
        </h3>
        <ButtonGroup className={styles.segments} ariaLabel="Mode">
          {(["light", "dark"] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              appearance={theme === option ? "solid" : "outline"}
              mode="neutral"
              aria-pressed={theme === option}
              onClick={() => applyPlaygroundTheme(option)}
            >
              {option === "light" ? "Light" : "Dark"}
            </Button>
          ))}
        </ButtonGroup>
      </section>

      <section className={styles.section} aria-labelledby="customize-type">
        <h3 id="customize-type" className={styles.sectionLabel}>
          Typography
        </h3>
        <Field label="Interface" htmlFor="customize-font-interface">
          <Select
            id="customize-font-interface"
            size="sm"
            value={interfaceFont}
            options={PLAYGROUND_FONTS}
            onChange={(value) => applyFont("interface", value)}
          />
        </Field>
        <Field label="Headings" htmlFor="customize-font-heading">
          <Select
            id="customize-font-heading"
            size="sm"
            value={headingFont}
            options={PLAYGROUND_FONTS}
            onChange={(value) => applyFont("heading", value)}
          />
        </Field>
        <Field label="Mono" htmlFor="customize-font-mono">
          <Select
            id="customize-font-mono"
            size="sm"
            value={monoFont}
            options={PLAYGROUND_FONTS}
            onChange={(value) => applyFont("mono", value)}
          />
        </Field>
        <p className={styles.fontInterface}>Interface sample</p>
        <p className={styles.fontHeading}>Heading sample</p>
        <p className={styles.fontMono}>Mono sample</p>
        <div className={styles.group}>
          <p className={styles.controlLabel} id="customize-weight-label">
            Heading weight
          </p>
          <ButtonGroup className={styles.segments} ariaLabel="Heading weight">
            {PLAYGROUND_HEADING_WEIGHTS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                appearance={weight === option.value ? "solid" : "outline"}
                mode="neutral"
                aria-pressed={weight === option.value}
                onClick={() => applyPlaygroundHeadingWeight(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="customize-neutrals">
        <h3 id="customize-neutrals" className={styles.sectionLabel}>
          Neutrals
        </h3>
        <Field label="Scale" htmlFor="customize-neutral" hint="Writes --color-neutral-* and the surface, text, and line roles.">
          <Select
            id="customize-neutral"
            size="sm"
            value={neutral}
            options={PLAYGROUND_NEUTRAL_OPTIONS}
            onChange={applyNeutral}
          />
        </Field>
        <div className={styles.swatches} aria-hidden>
          {NEUTRAL_STEPS.map((step) => (
            <span
              key={step}
              className={styles.swatch}
              style={{ backgroundColor: NEUTRAL_RAMPS[neutral][step] }}
            />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="customize-primary">
        <h3 id="customize-primary" className={styles.sectionLabel}>
          Primary color
        </h3>
        <ColorPicker
          id="customize-primary-hex"
          ariaLabel="Primary color"
          value={primaryHex}
          swatches={PLAYGROUND_PRIMARY_SWATCHES.map((swatch) => ({
            value: swatch.value,
            label: swatch.label,
          }))}
          onChange={applyPlaygroundPrimaryChoice}
        />
      </section>

      <section className={styles.section} aria-labelledby="customize-radius">
        <h3 id="customize-radius" className={styles.sectionLabel}>
          Radius
        </h3>
        <div className={styles.group}>
          <p className={styles.controlLabel} id="customize-radius-label">
            Base {radius}px
          </p>
          <Slider
            value={radius}
            min={2}
            max={24}
            step={1}
            aria-labelledby="customize-radius-label"
            onValueChange={(value) => {
              if (typeof value === "number") applyPlaygroundRadiusBase(value);
            }}
          />
        </div>
        <div className={styles.scale}>
          {RADIUS_SCALE.map((step) => (
            <div key={step.name} className={styles.scaleItem}>
              <span className={`${styles.scaleChip} ${step.chip}`} />
              <span className={styles.scaleName}>{step.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="customize-space">
        <h3 id="customize-space" className={styles.sectionLabel}>
          Spacing
        </h3>
        <div className={styles.group}>
          <p className={styles.controlLabel} id="customize-space-label">
            Scale {space}%
          </p>
          <Slider
            value={space}
            min={75}
            max={150}
            step={5}
            aria-labelledby="customize-space-label"
            onValueChange={(value) => {
              if (typeof value === "number") applyPlaygroundSpaceScale(value);
            }}
          />
        </div>
        <div className={styles.spaceBars} aria-hidden>
          <span className={`${styles.spaceBar} ${styles.space1}`} />
          <span className={`${styles.spaceBar} ${styles.space2}`} />
          <span className={`${styles.spaceBar} ${styles.space4}`} />
          <span className={`${styles.spaceBar} ${styles.space6}`} />
          <span className={`${styles.spaceBar} ${styles.space8}`} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="customize-shadow">
        <h3 id="customize-shadow" className={styles.sectionLabel}>
          Shadow
        </h3>
        <div className={styles.group}>
          <p className={styles.controlLabel} id="customize-shadow-label">
            Intensity {shadow}%
          </p>
          <Slider
            value={shadow}
            min={0}
            max={200}
            step={10}
            aria-labelledby="customize-shadow-label"
            onValueChange={(value) => {
              if (typeof value === "number") applyPlaygroundShadowIntensity(value);
            }}
          />
        </div>
        <div className={styles.shadowPreview} aria-hidden />
      </section>
    </div>
  );
}
