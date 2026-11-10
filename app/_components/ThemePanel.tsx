"use client";

import { useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button, ColorPicker, SegmentedControl, Select, Slider } from "agentic-ds-kit";
import { contrastRatio } from "agentic-ds-kit/color-ramp";
import { ensureThemeSnapshot, publishTheme, resetTheme, subscribeTheme } from "@/lib/theme-store";
import {
  DEFAULT_THEME,
  DISPLAY_FONTS,
  PRESETS,
  SANS_FONTS,
  clampRadius,
  exportCss,
  presetState,
  syncPreset,
  themePalette,
  type DisplayFont,
  type HeadingWeight,
  type PresetId,
  type SansFont,
  type ShadowPreset,
  type ThemeMode,
  type ThemeState,
} from "@/lib/theme-playground";
import styles from "./ThemePanel.module.css";

/** The four starting points the site offers. Nistha is the kit default. */
const START_FROM = ["nistha", "ink", "violet", "teal"] as const satisfies readonly Exclude<PresetId, "custom">[];

const RADIUS_MAX = 16;

type ShadowChoice = "none" | "soft" | "strong";

const SHADOW_TO_PRESET: Record<ShadowChoice, ShadowPreset> = {
  none: "none",
  soft: "subtle",
  strong: "raised",
};

function shadowChoice(preset: ShadowPreset): ShadowChoice {
  if (preset === "none" || preset === "flat") return "none";
  if (preset === "raised" || preset === "dramatic") return "strong";
  return "soft";
}

function presetOf(id: (typeof START_FROM)[number]) {
  return PRESETS.find((preset) => preset.id === id)!;
}

/** A preset colour chip. The colour is theme data, painted with inline style like ColorPicker does. */
function Swatch({ color }: { color: string }) {
  return <span className={styles.swatch} style={{ backgroundColor: color }} aria-hidden="true" />;
}

function Group({ label, end, children }: { label: string; end?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section className={styles.group} aria-labelledby={id}>
      <div className={styles.groupHead}>
        <h3 id={id} className={styles.overline}>
          {label}
        </h3>
        {end}
      </div>
      {children}
    </section>
  );
}

export function themePrompt(state: ThemeState): string {
  return [
    "Theme this app with nistha (the agentic-ds-kit package).",
    "Load the CSS below after agentic-ds-kit/tokens.css. It sets semantic tokens only.",
    "Do not restyle kit components, add hex to components, or invent new tokens.",
    "",
    "```css",
    exportCss(state).trim(),
    "```",
  ].join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export interface ThemePanelProps {
  /** Closes the panel. Omitted where the panel is pinned (the Theme page). */
  onClose?: () => void;
  /** The bottom sheet passes its own footer, so the panel leaves the actions out. */
  showActions?: boolean;
  /** Hides the title row when a Drawer already shows one. */
  showHeader?: boolean;
}

/**
 * Theme for previews. The site chrome stays Nistha; only kit previews follow this.
 * State lives in lib/theme-store (localStorage), so the choice follows you across pages.
 */
export function ThemePanel({ onClose, showActions = true, showHeader = true }: ThemePanelProps) {
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const state = useSyncExternalStore(subscribeTheme, ensureThemeSnapshot, () => DEFAULT_THEME);
  const palette = useMemo(() => themePalette(state), [state]);
  const primary = palette.brand[state.step];
  const ratio = contrastRatio("#ffffff", primary);
  const inkRatio = contrastRatio(palette.neutral["950"], primary);
  const best = Math.max(ratio, inkRatio);
  const passes = best >= 4.5;

  function update(patch: Partial<ThemeState>) {
    publishTheme(syncPreset({ ...state, ...patch }));
  }

  function applyPreset(id: string) {
    const preset = START_FROM.find((item) => item === id);
    if (preset) publishTheme(presetState(preset, state.mode));
  }

  return (
    <div className={styles.panel}>
      {showHeader ? (
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 className={styles.title}>Theme</h2>
            <p className={styles.subtitle}>Applies to previews only</p>
          </div>
          <div className={styles.headActions}>
            <Button size="sm" appearance="ghost" mode="neutral" onClick={resetTheme}>
              Reset
            </Button>
            {onClose ? (
              <Button size="sm" appearance="ghost" mode="neutral" iconStart="X" ariaLabel="Close theme" onClick={onClose} />
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.sheetIntro}>
          <p className={styles.subtitle}>Applies to previews only</p>
          <Button size="sm" appearance="ghost" mode="neutral" onClick={resetTheme}>
            Reset
          </Button>
        </div>
      )}

      <div className={showHeader ? styles.body : `${styles.body} ${styles.bodyFlush}`}>
        <Group label="Start from">
          <SegmentedControl
            ariaLabel="Start from a preset"
            size="sm"
            value={START_FROM.find((id) => id === state.preset) ?? ""}
            onChange={applyPreset}
            items={START_FROM.map((id) => ({
              value: id,
              label: presetOf(id).label,
              icon: <Swatch color={presetOf(id).brand} />,
            }))}
          />
        </Group>

        <Group label="Mode">
          <SegmentedControl
            ariaLabel="Preview mode"
            size="sm"
            value={state.mode}
            onChange={(value) => update({ mode: value as ThemeMode })}
            items={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Group>

        <Group label="Primary colour">
          <ColorPicker
            id={`${baseId}-primary`}
            ariaLabel="Primary colour"
            value={state.brand}
            onChange={(hex) => {
              const match = START_FROM.map(presetOf).find((preset) => preset.brand.toLowerCase() === hex.toLowerCase());
              if (match) {
                publishTheme(presetState(match.id, state.mode));
                return;
              }
              update({ brand: hex.toLowerCase() });
            }}
            swatches={START_FROM.map((id) => ({ value: presetOf(id).brand, label: presetOf(id).label }))}
          />
          <p className={passes ? styles.pass : styles.fail} role="status">
            {passes ? "✓" : "✕"} {ratio >= inkRatio ? "White" : "Ink"} text on it {best.toFixed(1)}:1
            {passes ? "" : " (needs 4.5:1)"}
          </p>
        </Group>

        <Group label="Type">
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor={`${baseId}-font`}>
              Interface
            </label>
            <Select
              id={`${baseId}-font`}
              size="sm"
              value={state.font}
              onChange={(value) => update({ font: String(value) as SansFont })}
              options={SANS_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor={`${baseId}-display`}>
              Headings
            </label>
            <Select
              id={`${baseId}-display`}
              size="sm"
              value={state.display}
              onChange={(value) => update({ display: String(value) as DisplayFont })}
              options={DISPLAY_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel} id={`${baseId}-weight`}>
              Weight
            </span>
            <SegmentedControl
              ariaLabel="Heading weight"
              size="sm"
              value={state.headingWeight}
              onChange={(value) => update({ headingWeight: value as HeadingWeight })}
              items={["400", "500", "600", "700"].map((value) => ({ value, label: value }))}
            />
          </div>
        </Group>

        <Group label="Radius" end={<span className={styles.readout}>{clampRadius(state.radius)}px</span>}>
          <Slider
            aria-label="Radius"
            min={0}
            max={RADIUS_MAX}
            step={2}
            value={Math.min(RADIUS_MAX, clampRadius(state.radius))}
            onValueChange={(value) => update({ radius: clampRadius(Array.isArray(value) ? value[0] : value) })}
          />
          <div className={styles.scale} aria-hidden="true">
            <span>0</span>
            <span>{RADIUS_MAX}</span>
          </div>
        </Group>

        <Group label="Shadow">
          <SegmentedControl
            ariaLabel="Shadow"
            size="sm"
            value={shadowChoice(state.shadowPreset)}
            onChange={(value) => update({ shadowPreset: SHADOW_TO_PRESET[value as ShadowChoice] })}
            items={[
              { value: "none", label: "None" },
              { value: "soft", label: "Soft" },
              { value: "strong", label: "Strong" },
            ]}
          />
        </Group>
      </div>

      {showActions ? (
        <div className={styles.actions}>
          <ThemeActions state={state} />
        </div>
      ) : null}
    </div>
  );
}

/** Copy theme CSS (the one solid primary in the panel) and Copy as prompt. */
export function ThemeActions({ state: given, compact = false }: { state?: ThemeState; compact?: boolean }) {
  const stored = useSyncExternalStore(subscribeTheme, ensureThemeSnapshot, () => DEFAULT_THEME);
  const state = given ?? stored;
  const [copied, setCopied] = useState<"css" | "prompt" | null>(null);

  async function run(kind: "css" | "prompt") {
    const ok = await copyText(kind === "css" ? exportCss(state) : themePrompt(state));
    if (!ok) return;
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className={styles.actionStack}>
      <Button block appearance="solid" mode="primary" iconStart={copied === "css" ? "Check" : "Copy"} onClick={() => void run("css")}>
        {copied === "css" ? "Copied theme CSS" : "Copy theme CSS"}
      </Button>
      <Button block appearance="outline" mode="neutral" onClick={() => void run("prompt")}>
        {copied === "prompt" ? "Copied prompt" : "Copy as prompt for your agent"}
      </Button>
      {compact ? null : <p className={styles.footnote}>Writes semantic tokens only</p>}
      <span className={styles.srOnly} role="status">
        {copied ? "Copied to the clipboard" : ""}
      </span>
    </div>
  );
}
