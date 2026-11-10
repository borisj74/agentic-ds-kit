"use client";

import { useId, useMemo, useSyncExternalStore } from "react";
import {
  Button,
  ColorPicker,
  Field,
  Section,
  SegmentedControl,
  Select,
  Slider,
  Switch,
} from "agentic-ds-kit";
import type { RampStep } from "agentic-ds-kit/color-ramp";
import { ensureThemeSnapshot, publishTheme, subscribeTheme } from "@/lib/theme-store";
import {
  DEFAULT_ACCENT,
  DEFAULT_THEME,
  DISPLAY_FONTS,
  PRESETS,
  RADIUS_PRESETS,
  RAMP_STEPS,
  SANS_FONTS,
  SHADOW_PRESETS,
  clampRadius,
  presetState,
  radiusReadout,
  syncPreset,
  themePalette,
  type DisplayFont,
  type HeadingWeight,
  type NeutralChoice,
  type PresetId,
  type SansFont,
  type ShadowPreset,
  type ShadowTint,
  type ThemeMode,
  type ThemeState,
} from "@/lib/theme-playground";
import { ThemeRamp } from "./ThemeRamp";
import styles from "./theme.module.css";

const NEUTRAL_OPTIONS: { value: NeutralChoice; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "zinc", label: "Zinc" },
  { value: "slate", label: "Slate" },
  { value: "stone", label: "Stone" },
  { value: "gray", label: "Gray" },
  { value: "tint", label: "Tint toward brand" },
];

const WEIGHTS: { value: HeadingWeight; label: string }[] = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

function asNumber(value: number | number[]): number {
  return Array.isArray(value) ? value[0] : value;
}

export interface ThemeControlsProps {
  /** Docked header panel passes this so the column can close. The Theme page omits it. */
  onCollapse?: () => void;
}

export function ThemeControls({ onCollapse }: ThemeControlsProps) {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const fieldId = (name: string) => `${baseId}-${name}`;
  const state = useSyncExternalStore(subscribeTheme, ensureThemeSnapshot, () => DEFAULT_THEME);
  const palette = useMemo(() => themePalette(state), [state]);
  const readout = radiusReadout(state.radius, state.pill);

  function update(patch: Partial<ThemeState>) {
    publishTheme(syncPreset({ ...state, ...patch }));
  }

  function applyPreset(id: string) {
    if (id === "custom") return;
    publishTheme(presetState(id as Exclude<PresetId, "custom">, state.mode));
  }

  return (
    <div className={styles.controls}>
      {onCollapse ? (
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Theme</h2>
          <Button
            size="sm"
            appearance="ghost"
            mode="neutral"
            iconStart="PanelLeftClose"
            ariaLabel="Collapse theme"
            onClick={onCollapse}
          />
        </div>
      ) : null}
      <Section title="Mode" size="sm">
        <SegmentedControl
          ariaLabel="Color mode"
          size="sm"
          value={state.mode}
          onChange={(value) => update({ mode: value as ThemeMode })}
          items={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Section>
      <Section title="Colour" size="sm" collapsible defaultOpen>
        <div className={styles.stack}>
          <Field label="Preset" htmlFor={fieldId("preset")}>
            <Select
              id={fieldId("preset")}
              value={state.preset}
              onChange={(value) => applyPreset(String(value))}
              options={[
                ...PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
                { value: "custom", label: "Custom" },
              ]}
            />
          </Field>
          <Field label="Primary" htmlFor={fieldId("brand")}>
            <ColorPicker
              id={fieldId("brand")}
              ariaLabel="Primary colour"
              value={state.brand}
              onChange={(hex) => {
                const match = PRESETS.find((preset) => preset.brand.toLowerCase() === hex.toLowerCase());
                if (match) {
                  publishTheme(presetState(match.id, state.mode));
                  return;
                }
                update({ brand: hex.toLowerCase() });
              }}
              swatches={PRESETS.map((preset) => ({ value: preset.brand, label: preset.label }))}
            />
          </Field>
          <ThemeRamp label="Primary ramp" ramp={palette.brand} marked={state.step} />
          <SegmentedControl
            ariaLabel="Accent"
            size="sm"
            value={state.accent ? "on" : "off"}
            onChange={(value) => update({ accent: value === "on" ? state.accent || DEFAULT_ACCENT : "" })}
            items={[
              { value: "off", label: "No accent" },
              { value: "on", label: "Accent" },
            ]}
          />
          {state.accent ? (
            <Field label="Accent" htmlFor={fieldId("accent")}>
              <ColorPicker
                id={fieldId("accent")}
                ariaLabel="Accent colour"
                value={state.accent}
                onChange={(hex) => update({ accent: hex.toLowerCase() })}
              />
            </Field>
          ) : null}
          {palette.accent ? <ThemeRamp label="Accent ramp" ramp={palette.accent} /> : null}
          <Field label="Neutrals" htmlFor={fieldId("neutral")}>
            <Select
              id={fieldId("neutral")}
              value={state.neutral}
              onChange={(value) => update({ neutral: String(value) as NeutralChoice })}
              options={NEUTRAL_OPTIONS}
            />
          </Field>
          <Field label="Action step" htmlFor={fieldId("step")}>
            <Select
              id={fieldId("step")}
              value={state.step}
              onChange={(value) => update({ step: String(value) as RampStep })}
              options={RAMP_STEPS.map((step) => ({ value: step, label: step }))}
            />
          </Field>
        </div>
      </Section>
      <Section title="Type" size="sm" collapsible defaultOpen={false}>
        <div className={styles.stack}>
          <Field label="Typography" htmlFor={fieldId("font")}>
            <Select
              id={fieldId("font")}
              value={state.font}
              onChange={(value) => update({ font: String(value) as SansFont })}
              options={SANS_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            />
          </Field>
          <Field label="Display" htmlFor={fieldId("display")}>
            <Select
              id={fieldId("display")}
              value={state.display}
              onChange={(value) => update({ display: String(value) as DisplayFont })}
              options={DISPLAY_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            />
          </Field>
          <Field label="Heading weight" htmlFor={fieldId("weight")}>
            <Select
              id={fieldId("weight")}
              value={state.headingWeight}
              onChange={(value) => update({ headingWeight: String(value) as HeadingWeight })}
              options={WEIGHTS}
            />
          </Field>
        </div>
      </Section>
      <Section title="Shape" size="sm" collapsible defaultOpen={false}>
        <div className={styles.stack}>
          <p className={styles.caption}>Base radius {readout.lg}px</p>
          <Slider
            aria-label="Base radius"
            min={0}
            max={48}
            step={2}
            value={clampRadius(state.radius)}
            onValueChange={(value) => update({ radius: clampRadius(asNumber(value)) })}
          />
          <p className={styles.readout}>
            xs {readout.xs} · sm {readout.sm} · md {readout.md} · lg {readout.lg} · xl {readout.xl} · card {readout.card}
          </p>
          <div className={styles.chips} role="group" aria-label="Radius presets">
            {RADIUS_PRESETS.map((item) => {
              const active = item.pill ? state.pill && state.radius === item.px : !state.pill && state.radius === item.px;
              return (
                <Button
                  key={item.id}
                  size="sm"
                  appearance={active ? "solid" : "outline"}
                  mode="neutral"
                  aria-pressed={active}
                  onClick={() => update({ radius: item.px, pill: item.pill })}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
          <Field label="Buttons and inputs" htmlFor={fieldId("pill")}>
            <Switch
              id={fieldId("pill")}
              label="Full / pill"
              checked={state.pill}
              onChange={(checked) => update({ pill: checked })}
            />
          </Field>
          <SegmentedControl
            ariaLabel="Spacing density"
            size="sm"
            value={state.density}
            onChange={(value) => update({ density: value as ThemeState["density"] })}
            items={[
              { value: "compact", label: "Compact" },
              { value: "default", label: "Default" },
              { value: "comfy", label: "Comfy" },
            ]}
          />
        </div>
      </Section>
      <Section title="Depth" size="sm" collapsible defaultOpen={false}>
        <div className={styles.stack}>
          <Field label="Shadow" htmlFor={fieldId("shadow")}>
            <Select
              id={fieldId("shadow")}
              value={state.shadowPreset}
              onChange={(value) => update({ shadowPreset: String(value) as ShadowPreset })}
              options={SHADOW_PRESETS.map((item) => ({ value: item.id, label: item.label }))}
            />
          </Field>
          <p className={styles.caption}>Intensity {state.shadowIntensity}</p>
          <Slider
            aria-label="Shadow intensity"
            min={0}
            max={200}
            step={5}
            value={state.shadowIntensity}
            onValueChange={(value) => update({ shadowIntensity: asNumber(value) })}
          />
          <p className={styles.caption}>Blur and spread {state.shadowScale}</p>
          <Slider
            aria-label="Shadow blur and spread"
            min={50}
            max={200}
            step={5}
            value={state.shadowScale}
            onValueChange={(value) => update({ shadowScale: asNumber(value) })}
          />
          <SegmentedControl
            ariaLabel="Shadow tint"
            size="sm"
            value={state.shadowTint}
            onChange={(value) => update({ shadowTint: value as ShadowTint })}
            items={[
              { value: "neutral", label: "Neutral" },
              { value: "primary", label: "Primary" },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
