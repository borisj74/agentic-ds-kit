"use client";

import { useEffect, useMemo, useSyncExternalStore, type CSSProperties } from "react";
import {
  Button,
  CodeSnippet,
  ColorPicker,
  Field,
  Section,
  SegmentedControl,
  Select,
  Slider,
} from "agentic-ds-kit";
import { PLAYGROUND_THEME_STORAGE_KEY } from "@/lib/playground-theme";
import {
  DEFAULT_ACCENT,
  DEFAULT_THEME,
  DISPLAY_FONTS,
  PRESETS,
  RAMP_STEPS,
  SANS_FONTS,
  contrastReport,
  exportCss,
  exportDesign,
  exportTokens,
  presetState,
  previewCss,
  radiusLabel,
  readStoredTheme,
  syncPreset,
  themeDeclarations,
  themeFromSearch,
  themePalette,
  themeToSearch,
  writeStoredTheme,
  type DisplayFont,
  type NeutralChoice,
  type PresetId,
  type RadiusStep,
  type SansFont,
  type ShadowStrength,
  type ThemeMode,
  type ThemeState,
} from "@/lib/theme-playground";
import type { RampStep } from "agentic-ds-kit/color-ramp";
import { ContrastList } from "./ContrastList";
import { ThemePreview } from "./ThemePreview";
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

function download(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copy(contents: string) {
  await navigator.clipboard.writeText(contents);
}

let themeSnapshot = DEFAULT_THEME;
let themeLoaded = false;
const themeListeners = new Set<() => void>();

function documentMode(): ThemeMode {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function loadThemeSnapshot(): ThemeState {
  const mode = documentMode();
  return themeFromSearch(new URLSearchParams(window.location.search), mode) ?? readStoredTheme() ?? { ...DEFAULT_THEME, mode };
}

function ensureThemeSnapshot(): ThemeState {
  if (typeof window === "undefined") return themeSnapshot;
  const loc = window.location.search.replace(/^\?/, "");
  const fromUrl = themeFromSearch(new URLSearchParams(loc), documentMode());
  if (!themeLoaded) {
    themeLoaded = true;
    themeSnapshot = fromUrl ?? readStoredTheme() ?? { ...DEFAULT_THEME, mode: documentMode() };
    return themeSnapshot;
  }
  if (fromUrl && loc !== themeToSearch(themeSnapshot)) themeSnapshot = fromUrl;
  return themeSnapshot;
}

function publishTheme(next: ThemeState) {
  themeSnapshot = next;
  writeStoredTheme(next);
  const nextUrl = `${window.location.pathname}?${themeToSearch(next)}`;
  if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
  themeListeners.forEach((listener) => listener());
}

function subscribeTheme(onChange: () => void) {
  themeListeners.add(onChange);
  const onPop = () => {
    themeSnapshot = loadThemeSnapshot();
    onChange();
  };
  window.addEventListener("popstate", onPop);
  return () => {
    themeListeners.delete(onChange);
    window.removeEventListener("popstate", onPop);
  };
}

export function ThemePlayground({ fontClassName }: { fontClassName: string }) {
  const state = useSyncExternalStore(subscribeTheme, ensureThemeSnapshot, () => DEFAULT_THEME);

  useEffect(() => {
    const root = document.documentElement;
    if (state.mode === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem(PLAYGROUND_THEME_STORAGE_KEY, state.mode);
    } catch {
      // The attribute still updates for this view.
    }
  }, [state.mode]);

  useEffect(() => {
    const root = document.documentElement;
    const classes = fontClassName.split(" ").filter(Boolean);
    classes.forEach((name) => root.classList.add(name));
    const observer = new MutationObserver(() => {
      const mode = documentMode();
      const current = ensureThemeSnapshot();
      if (current.mode !== mode) publishTheme({ ...current, mode });
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      observer.disconnect();
      classes.forEach((name) => root.classList.remove(name));
    };
  }, [fontClassName]);

  const palette = useMemo(() => themePalette(state), [state]);
  const css = useMemo(() => previewCss(state), [state]);
  const cssExport = useMemo(() => exportCss(state), [state]);
  const jsonExport = useMemo(() => exportTokens(state), [state]);
  const designExport = useMemo(() => exportDesign(state), [state]);
  const pairs = useMemo(() => contrastReport(state), [state]);
  const drawerStyle = themeDeclarations(state, state.mode, "preview") as CSSProperties;

  function update(patch: Partial<ThemeState>) {
    publishTheme(syncPreset({ ...state, ...patch }));
  }

  function applyPreset(id: string) {
    if (id === "custom") return;
    publishTheme(presetState(id as Exclude<PresetId, "custom">, state.mode));
  }

  return (
    <div className={`layout-content ${styles.page}`}>
      <header className={styles.stack}>
        <h1 className={styles.title}>Theme</h1>
        <p className={styles.lead}>
          Pick a look, preview it on the kit, and export overrides for tokens.css. Semantic roles
          point at primitive ramps. The docs chrome keeps its own tokens.
        </p>
      </header>
      <div className="layout-split layout-split--secondary">
        <div className={styles.controls}>
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
          <Field label="Preset" htmlFor="theme-preset" hint="Ink, Blue, Violet, and Teal match the current overlays.">
            <Select
              id="theme-preset"
              value={state.preset}
              onChange={(value) => applyPreset(String(value))}
              options={[
                ...PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
                { value: "custom", label: "Custom" },
              ]}
            />
          </Field>
          <Field label="Brand colour" htmlFor="theme-brand" hint="Step 500 of the ramp. Actions use the step below.">
            <ColorPicker
              id="theme-brand"
              ariaLabel="Brand colour"
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
          <ThemeRamp label="Brand ramp" ramp={palette.brand} marked={state.step} />
          <Section title="Accent" size="sm" description="Optional second brand for highlight roles.">
            <div className={styles.stack}>
              <SegmentedControl
                ariaLabel="Second brand"
                size="sm"
                value={state.accent ? "on" : "off"}
                onChange={(value) => update({ accent: value === "on" ? state.accent || DEFAULT_ACCENT : "" })}
                items={[
                  { value: "off", label: "None" },
                  { value: "on", label: "Accent" },
                ]}
              />
              {state.accent ? (
                <Field label="Accent colour" htmlFor="theme-accent">
                  <ColorPicker
                    id="theme-accent"
                    ariaLabel="Accent colour"
                    value={state.accent}
                    onChange={(hex) => update({ accent: hex.toLowerCase() })}
                  />
                </Field>
              ) : null}
            </div>
          </Section>
          {palette.accent ? <ThemeRamp label="Accent ramp" ramp={palette.accent} /> : null}
          <Field label="Neutral" htmlFor="theme-neutral">
            <Select
              id="theme-neutral"
              value={state.neutral}
              onChange={(value) => update({ neutral: String(value) as NeutralChoice })}
              options={NEUTRAL_OPTIONS}
            />
          </Field>
          <ThemeRamp label="Neutral ramp" ramp={palette.neutral} />
          <Field label="Action step" htmlFor="theme-step" hint="The ramp step that drives action and focus.">
            <Select
              id="theme-step"
              value={state.step}
              onChange={(value) => update({ step: String(value) as RampStep })}
              options={RAMP_STEPS.map((step) => ({ value: step, label: step }))}
            />
          </Field>
          <Section title="Radius" size="sm" description={`Step ${state.radius} · ${radiusLabel(state.radius)}`}>
            <Slider
              aria-label="Radius scale"
              min={0}
              max={4}
              step={1}
              value={state.radius}
              onValueChange={(value) => update({ radius: Number(value) as RadiusStep })}
            />
          </Section>
          <Section title="Density" size="sm">
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
          </Section>
          <Section title="Shadow" size="sm" description={`Strength ${state.shadow}`}>
            <Slider
              aria-label="Shadow strength"
              min={0}
              max={3}
              step={1}
              value={state.shadow}
              onValueChange={(value) => update({ shadow: Number(value) as ShadowStrength })}
            />
          </Section>
          <Field label="Default font" htmlFor="theme-font">
            <Select
              id="theme-font"
              value={state.font}
              onChange={(value) => update({ font: String(value) as SansFont })}
              options={SANS_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            />
          </Field>
          <Field label="Display font" htmlFor="theme-display">
            <Select
              id="theme-display"
              value={state.display}
              onChange={(value) => update({ display: String(value) as DisplayFont })}
              options={DISPLAY_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            />
          </Field>
        </div>
        <div className={styles.previewColumn}>
          <ThemePreview
            css={css}
            fontClassName={fontClassName}
            drawerStyle={drawerStyle}
            showAccentSeries={Boolean(state.accent)}
          />
          <ContrastList pairs={pairs} />
        </div>
      </div>
      <Section title="Export" description="Overrides only. Load them after tokens.css." size="sm">
        <div className={styles.stack}>
          <CodeSnippet
            title="Theme export"
            maxHeight="20rem"
            tabs={[
              { label: "tokens-override.css", language: "css", code: cssExport },
              { label: "tokens.json", language: "json", code: jsonExport },
              { label: "DESIGN.md", language: "markdown", code: designExport },
            ]}
          />
          <div className={styles.exports}>
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={() => void copy(cssExport)}>
              Copy CSS
            </Button>
            <Button
              appearance="outline"
              mode="neutral"
              size="sm"
              iconStart="Download"
              onClick={() => download("tokens-override.css", cssExport, "text/css")}
            >
              Download CSS
            </Button>
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={() => void copy(jsonExport)}>
              Copy JSON
            </Button>
            <Button
              appearance="outline"
              mode="neutral"
              size="sm"
              iconStart="Download"
              onClick={() => download("tokens.json", jsonExport, "application/json")}
            >
              Download JSON
            </Button>
            <Button appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={() => void copy(designExport)}>
              Copy DESIGN.md
            </Button>
            <Button
              appearance="outline"
              mode="neutral"
              size="sm"
              iconStart="Download"
              onClick={() => download("DESIGN.md", designExport, "text/markdown")}
            >
              Download DESIGN.md
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
