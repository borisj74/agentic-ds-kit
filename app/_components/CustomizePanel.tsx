"use client";

import { useSyncExternalStore } from "react";
import { Button, ButtonGroup, ColorPicker, Field, Input, Select, Slider } from "agentic-ds-kit";
import {
  DEFAULT_PRIMARY_HEX,
  DEFAULT_RADIUS_BASE,
  DEFAULT_SHADOW_SM,
  PLAYGROUND_FONTS,
  PLAYGROUND_HEADING_WEIGHTS,
  PLAYGROUND_PRIMARY_SWATCHES,
  applyPlaygroundFont,
  applyPlaygroundHeadingWeight,
  applyPlaygroundPrimaryChoice,
  applyPlaygroundRadiusBase,
  applyPlaygroundShadowSm,
  applyPlaygroundTheme,
  readPlaygroundFont,
  readPlaygroundHeadingWeight,
  readPlaygroundPrimaryHex,
  readPlaygroundRadiusBase,
  readPlaygroundShadowSm,
  readPlaygroundTheme,
  resetPlaygroundAppearance,
  type PlaygroundFont,
  type PlaygroundHeadingWeight,
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
    attributeFilter: ["data-theme", "data-color", "data-font", "style"],
  });
  return () => observer.disconnect();
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
  const font = useSyncExternalStore(subscribeRoot, readPlaygroundFont, (): PlaygroundFont => "ibm-plex");
  const weight = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundHeadingWeight,
    (): PlaygroundHeadingWeight => "600",
  );
  const radius = useSyncExternalStore(subscribeRoot, readPlaygroundRadiusBase, () => DEFAULT_RADIUS_BASE);
  const shadow = useSyncExternalStore(subscribeRoot, readPlaygroundShadowSm, () => DEFAULT_SHADOW_SM);
  const primaryHex = useSyncExternalStore(
    subscribeRoot,
    readPlaygroundPrimaryHex,
    () => DEFAULT_PRIMARY_HEX,
  );

  return (
    <div className={`${styles.panel} ${variant === "dock" ? styles.dock : ""}`}>
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
        <Field label="Font" htmlFor="customize-font">
          <Select
            id="customize-font"
            size="sm"
            value={font}
            options={PLAYGROUND_FONTS}
            onChange={(value) => {
              if (value === "ibm-plex" || value === "inter" || value === "geist" || value === "system") {
                applyPlaygroundFont(value);
              }
            }}
          />
        </Field>
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

      <section className={styles.section} aria-labelledby="customize-shadow">
        <h3 id="customize-shadow" className={styles.sectionLabel}>
          Shadow
        </h3>
        <Field label="shadow-sm" htmlFor="customize-shadow-value" hint="Writes --shadow-sm.">
          <Input
            id="customize-shadow-value"
            value={shadow}
            onChange={(value) => applyPlaygroundShadowSm(value)}
          />
        </Field>
      </section>
    </div>
  );
}
