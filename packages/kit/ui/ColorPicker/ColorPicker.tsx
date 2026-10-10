"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Input } from "../Input";
import {
  hsvaToHex,
  hueName,
  parseHex,
  rgbaToHsva,
  type Hsva,
} from "./color";
import type { ColorPickerProps, ColorPickerSwatch } from "./ColorPicker.types";
import styles from "./ColorPicker.module.css";

export type { ColorPickerProps, ColorPickerSwatch } from "./ColorPicker.types";

/*
 * The picked colour is user data, so it is painted with inline style (area hue, thumbs,
 * preview, swatches). The gradients are built from the colour math below, never literals.
 * All chrome (borders, focus, radius, text, checkerboard) lives in the CSS module as tokens.
 */

const BLACK: Hsva = { h: 0, s: 0, v: 0, a: 1 };
const HUE_STOPS = [0, 60, 120, 180, 240, 300, 360]
  .map((h) => hsvaToHex({ h, s: 1, v: 1, a: 1 }))
  .join(", ");
const AREA_OVERLAY = `linear-gradient(to top, ${hsvaToHex(BLACK)}, transparent), linear-gradient(to right, ${hsvaToHex({ h: 0, s: 0, v: 1, a: 1 })}, transparent)`;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fromHex(hex: string | undefined, fallbackHue = 0): Hsva | null {
  if (!hex) return null;
  const rgba = parseHex(hex);
  return rgba ? rgbaToHsva(rgba, fallbackHue) : null;
}

function toSwatch(swatch: string | ColorPickerSwatch): ColorPickerSwatch {
  return typeof swatch === "string" ? { value: swatch } : swatch;
}

/** Arrow step: 1, or 10 with Shift. Returns null for keys the control ignores. */
function arrowDelta(event: KeyboardEvent): { dx: number; dy: number } | null {
  const step = event.shiftKey ? 10 : 1;
  switch (event.key) {
    case "ArrowRight":
      return { dx: step, dy: 0 };
    case "ArrowLeft":
      return { dx: -step, dy: 0 };
    case "ArrowUp":
      return { dx: 0, dy: step };
    case "ArrowDown":
      return { dx: 0, dy: -step };
    default:
      return null;
  }
}

function ratioFromPointer(element: HTMLElement, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.width > 0 ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0,
    y: rect.height > 0 ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0,
  };
}

interface ChannelProps {
  label: string;
  value: number;
  max: number;
  valueText: string;
  disabled: boolean;
  /** Painted inside the track (user colour or hue spectrum). */
  fill: string;
  checkered?: boolean;
  onValue: (next: number) => void;
}

/** Hue and opacity track: one focusable role=slider with a decorative thumb. */
function Channel({ label, value, max, valueText, disabled, fill, checkered, onValue }: ChannelProps) {
  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
    } else if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const { x } = ratioFromPointer(event.currentTarget, event.clientX, event.clientY);
    onValue(Math.round(x * max));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const delta = arrowDelta(event);
    let next: number | null = null;
    if (delta) next = value + delta.dx + delta.dy;
    else if (event.key === "PageUp") next = value + 10;
    else if (event.key === "PageDown") next = value - 10;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = max;
    if (next === null) return;
    event.preventDefault();
    onValue(clamp(Math.round(next), 0, max));
  };

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      className={`${styles.channel}${checkered ? ` ${styles.checkered}` : ""}`}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onKeyDown={onKeyDown}
    >
      <span className={styles.channelFill} style={{ backgroundImage: fill }} aria-hidden />
      <span
        className={styles.channelThumb}
        style={{ left: `${(value / max) * 100}%` }}
        aria-hidden
      />
    </div>
  );
}

export function ColorPicker({
  value,
  defaultValue,
  onChange,
  swatches,
  showAlpha = false,
  disabled = false,
  id,
  describedBy,
  error = false,
  ariaLabel = "Colour",
  invalidMessage = "Enter a hex colour like 3366FF.",
}: ColorPickerProps) {
  const uid = useId();
  const inputId = id ?? `${uid}-hex`;
  const messageId = `${inputId}-invalid`;

  const [color, setColor] = useState<Hsva>(() => fromHex(value ?? defaultValue) ?? BLACK);
  const hex = hsvaToHex(color, showAlpha);
  const opaqueHex = hsvaToHex({ ...color, a: 1 });
  const [draft, setDraft] = useState(opaqueHex.slice(1));
  const [invalid, setInvalid] = useState(false);
  const lastHex = useRef(hex);
  const hueRef = useRef(color.h);
  hueRef.current = color.h;
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Follow a controlled value the parent changes from outside.
  useEffect(() => {
    if (value === undefined || value.toUpperCase() === lastHex.current) return;
    const next = fromHex(value, hueRef.current);
    if (!next) return;
    const nextHex = hsvaToHex(next, showAlpha);
    lastHex.current = nextHex;
    setColor(next);
    setDraft(nextHex.slice(1, 7));
    setInvalid(false);
  }, [value, showAlpha]);

  function commit(next: Hsva, syncDraft = true) {
    if (disabled) return;
    const normalized = showAlpha ? next : { ...next, a: 1 };
    setColor(normalized);
    setInvalid(false);
    const nextHex = hsvaToHex(normalized, showAlpha);
    if (syncDraft) setDraft(nextHex.slice(1, 7));
    if (nextHex !== lastHex.current) {
      lastHex.current = nextHex;
      onChange?.(nextHex);
    }
  }

  // Saturation and brightness area
  const onAreaPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.focus();
    } else if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const { x, y } = ratioFromPointer(event.currentTarget, event.clientX, event.clientY);
    commit({ ...color, s: x, v: 1 - y });
  };

  const onAreaKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const delta = arrowDelta(event);
    let s = Math.round(color.s * 100);
    let v = Math.round(color.v * 100);
    if (delta) {
      s += delta.dx;
      v += delta.dy;
    } else if (event.key === "PageUp") v += 10;
    else if (event.key === "PageDown") v -= 10;
    else if (event.key === "Home") s = 0;
    else if (event.key === "End") s = 100;
    else return;
    event.preventDefault();
    commit({ ...color, s: clamp(s, 0, 100) / 100, v: clamp(v, 0, 100) / 100 });
  };

  // Hex input: commits complete hex while typing, short forms on blur or Enter.
  // Typed hex keeps the current opacity unless it carries alpha digits (4 or 8).
  const fromDraft = (text: string): Hsva | null => {
    const next = fromHex(text, color.h);
    if (!next) return null;
    const body = text.trim().replace(/^#/, "");
    return body.length === 4 || body.length === 8 ? next : { ...next, a: color.a };
  };

  const applyDraft = (text: string) => {
    const next = fromDraft(text);
    if (next) commit(next);
    else setInvalid(true);
  };

  const onDraftChange = (text: string) => {
    const body = text.trim().replace(/^#/, "");
    setDraft(body);
    if (/[^0-9a-f]/i.test(body) || body.length > 8) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (body.length === 6 || body.length === 8) {
      const next = fromDraft(body);
      if (next) commit(next, false);
    }
  };

  const items = (swatches ?? []).map(toSwatch);
  const selectedIndex = items.findIndex(
    (swatch) => parseHex(swatch.value) && hsvaToHex(fromHex(swatch.value)!, showAlpha) === hex,
  );
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const pickSwatch = (index: number) => {
    const next = fromHex(items[index]?.value, color.h);
    if (next) commit(next);
  };

  const onSwatchKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    let target: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") target = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = index === 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target === null) return;
    event.preventDefault();
    pickSwatch(target);
    swatchRefs.current[target]?.focus();
  };

  const saturation = Math.round(color.s * 100);
  const brightness = Math.round(color.v * 100);
  const hue = Math.round(color.h) % 360;
  const alpha = Math.round(color.a * 100);
  const inputDescribedBy = [describedBy, invalid ? messageId : undefined].filter(Boolean).join(" ");

  return (
    <div
      className={styles.root}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
    >
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${ariaLabel} saturation and brightness`}
        aria-roledescription="2D slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={saturation}
        aria-valuetext={`Saturation ${saturation}%, brightness ${brightness}%`}
        aria-disabled={disabled || undefined}
        className={styles.area}
        style={{
          backgroundColor: hsvaToHex({ h: color.h, s: 1, v: 1, a: 1 }),
          backgroundImage: AREA_OVERLAY,
        }}
        onPointerDown={onAreaPointer}
        onPointerMove={onAreaPointer}
        onKeyDown={onAreaKeyDown}
      >
        <span
          className={styles.areaThumb}
          style={{ left: `${saturation}%`, top: `${100 - brightness}%`, backgroundColor: opaqueHex }}
          aria-hidden
        />
      </div>

      <Channel
        label={`${ariaLabel} hue`}
        value={hue}
        max={359}
        valueText={`${hue} degrees, ${hueName(hue)}`}
        disabled={disabled}
        fill={`linear-gradient(to right, ${HUE_STOPS})`}
        onValue={(h) => commit({ ...color, h })}
      />

      {showAlpha ? (
        <Channel
          label={`${ariaLabel} opacity`}
          value={alpha}
          max={100}
          valueText={`${alpha}%`}
          disabled={disabled}
          checkered
          fill={`linear-gradient(to right, transparent, ${opaqueHex})`}
          onValue={(a) => commit({ ...color, a: a / 100 })}
        />
      ) : null}

      <div className={styles.hexRow}>
        <span className={`${styles.preview} ${styles.checkered}`} aria-hidden>
          <span className={styles.previewFill} style={{ backgroundColor: hex }} />
        </span>
        <div
          className={styles.hexInput}
          onBlur={() => applyDraft(draft)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyDraft(draft);
            }
          }}
        >
          <Input
            id={inputId}
            size="md"
            start="#"
            value={draft}
            onChange={onDraftChange}
            disabled={disabled}
            error={error || invalid}
            describedBy={inputDescribedBy || undefined}
            ariaLabel={id ? undefined : `${ariaLabel} hex`}
          />
        </div>
        {showAlpha ? (
          <span className={styles.alphaText} aria-hidden>
            {alpha}%
          </span>
        ) : null}
      </div>
      {invalid ? (
        <p id={messageId} className={styles.message} role="alert">
          {invalidMessage}
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className={styles.swatches} role="radiogroup" aria-label={`${ariaLabel} presets`}>
          {items.map((swatch, index) => {
            const checked = index === selectedIndex;
            return (
              <button
                key={`${swatch.value}-${index}`}
                ref={(node) => {
                  swatchRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={swatch.label ?? swatch.value.toUpperCase()}
                tabIndex={index === tabbableIndex && !disabled ? 0 : -1}
                disabled={disabled}
                className={`${styles.swatch} ${styles.checkered}`}
                onClick={() => pickSwatch(index)}
                onKeyDown={(event) => onSwatchKeyDown(event, index)}
              >
                <span className={styles.previewFill} style={{ backgroundColor: swatch.value }} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
