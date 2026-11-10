/**
 * OKLCH brand ramp. Step 500 stays on the input colour (or within ΔE 3 when the
 * ends of the scale need room). Lightness falls evenly from step 50 to 950.
 * No DOM, no tokens — callers map the hexes onto primitive custom properties.
 */

export const RAMP_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

const LIGHT_CAP = 0.97;
const DARK_FLOOR = 0.02;
const MIN_GAP = 0.008;

export function normalizeHex(input) {
  const match = String(input ?? "")
    .trim()
    .match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  let hex = match[1].toLowerCase();
  if (hex.length === 3) hex = hex.split("").map((channel) => channel + channel).join("");
  return `#${hex}`;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function srgbChannelToLinear(channel) {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linearToSrgbChannel(channel) {
  const x = clamp01(channel);
  const encoded = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return Math.round(clamp01(encoded) * 255);
}

function parseHex(hex) {
  const normalized = normalizeHex(hex) ?? "#000000";
  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16),
  ];
}

function formatHex(r, g, b) {
  return `#${[r, g, b].map((channel) => linearToSrgbChannel(channel).toString(16).padStart(2, "0")).join("")}`;
}

function linearFromHex(hex) {
  const [r, g, b] = parseHex(hex);
  return [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
}

/** OKLab from linear sRGB (Ottosson). */
function linearToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinear(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToOklch(hex) {
  const [r, g, b] = linearFromHex(hex);
  const lab = linearToOklab(r, g, b);
  const c = Math.hypot(lab.a, lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.L, c, h: c < 1e-4 ? 0 : h };
}

function inGamut(linear) {
  return linear.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);
}

/** Convert OKLCH to hex, dropping chroma until the colour fits sRGB. */
export function oklchToHex(l, c, h) {
  const hue = (h * Math.PI) / 180;
  let chroma = Math.max(0, c);
  let linear = [0, 0, 0];
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const a = chroma * Math.cos(hue);
    const b = chroma * Math.sin(hue);
    linear = oklabToLinear(clamp01(l), a, b);
    if (inGamut(linear) || chroma < 1e-4) break;
    chroma *= 0.82;
  }
  return formatHex(linear[0], linear[1], linear[2]);
}

export function oklchLightness(hex) {
  return hexToOklch(hex).l;
}

function hueDegrees(degrees) {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** CIEDE2000. Lab here is CIE L*a*b*, not OKLab. */
function deltaE2000(lab1, lab2) {
  const kL = 1;
  const kC = 1;
  const kH = 1;
  const C1 = Math.hypot(lab1.a, lab1.b);
  const C2 = Math.hypot(lab2.a, lab2.b);
  const cBar = (C1 + C2) / 2;
  const cBar7 = cBar ** 7;
  const G = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + 25 ** 7)));
  const a1 = (1 + G) * lab1.a;
  const a2 = (1 + G) * lab2.a;
  const C1p = Math.hypot(a1, lab1.b);
  const C2p = Math.hypot(a2, lab2.b);

  const hueOf = (a, b, chroma) => {
    if (chroma < 1e-6) return 0;
    return hueDegrees((Math.atan2(b, a) * 180) / Math.PI);
  };
  const h1 = hueOf(a1, lab1.b, C1p);
  const h2 = hueOf(a2, lab2.b, C2p);

  const dL = lab2.L - lab1.L;
  const dC = C2p - C1p;
  let dh = 0;
  if (C1p > 1e-6 && C2p > 1e-6) {
    dh = h2 - h1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(((dh / 2) * Math.PI) / 180);

  const Lbar = (lab1.L + lab2.L) / 2;
  const Cbarp = (C1p + C2p) / 2;
  let Hbar = h1 + h2;
  if (C1p > 1e-6 && C2p > 1e-6) {
    if (Math.abs(h1 - h2) > 180) {
      Hbar = h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
    } else {
      Hbar = (h1 + h2) / 2;
    }
  } else {
    Hbar = h1 + h2;
  }

  const T =
    1 -
    0.17 * Math.cos(((Hbar - 30) * Math.PI) / 180) +
    0.24 * Math.cos(((2 * Hbar) * Math.PI) / 180) +
    0.32 * Math.cos(((3 * Hbar + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * Hbar - 63) * Math.PI) / 180);
  const dTheta = 30 * Math.exp(-(((Hbar - 275) / 25) ** 2));
  const cBarp7 = Cbarp ** 7;
  const Rc = 2 * Math.sqrt(cBarp7 / (cBarp7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2);
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin((2 * dTheta * Math.PI) / 180) * Rc;

  return Math.sqrt(
    (dL / (kL * Sl)) ** 2 +
      (dC / (kC * Sc)) ** 2 +
      (dH / (kH * Sh)) ** 2 +
      Rt * (dC / (kC * Sc)) * (dH / (kH * Sh)),
  );
}

function hexToCieLab(hex) {
  const [r, g, b] = linearFromHex(hex);
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
  const white = { x: 0.95047, y: 1, z: 1.08883 };
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / white.x);
  const fy = f(y / white.y);
  const fz = f(z / white.z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function deltaE(hexA, hexB) {
  return deltaE2000(hexToCieLab(hexA), hexToCieLab(hexB));
}

export function relativeLuminance(hex) {
  const [r, g, b] = linearFromHex(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function chromaAt(stepL, anchor, inputC) {
  if (inputC < 0.004) return 0;
  const distance = Math.abs(stepL - anchor);
  const span = Math.max(anchor - DARK_FLOOR, LIGHT_CAP - anchor, 0.2);
  const towardAnchor = 1 - Math.min(1, distance / span);
  const belly = Math.sin(Math.PI * clamp01(stepL)) ** 0.85;
  return inputC * (0.28 + 0.72 * towardAnchor) * (0.22 + 0.78 * belly);
}

function hexAt(lightness, anchor, input) {
  return oklchToHex(clamp01(lightness), chromaAt(lightness, anchor, input.c), input.h);
}

/** In-gamut colours strictly darker than `fromHex`, lightest first. */
function uniqueDarker(fromHex, anchor, input) {
  const found = [];
  let previous = fromHex;
  let previousL = oklchLightness(fromHex);
  for (let lightness = previousL - 0.001; lightness >= 0; lightness -= 0.001) {
    const next = hexAt(lightness, anchor, input);
    const measured = oklchLightness(next);
    if (next === previous || measured >= previousL - 1e-4) continue;
    found.push(next);
    previous = next;
    previousL = measured;
  }
  return found;
}

/** In-gamut colours strictly lighter than `fromHex`, darkest first. */
function uniqueLighter(fromHex, anchor, input) {
  const found = [];
  let previous = fromHex;
  let previousL = oklchLightness(fromHex);
  for (let lightness = previousL + 0.001; lightness <= 1; lightness += 0.001) {
    const next = hexAt(lightness, anchor, input);
    const measured = oklchLightness(next);
    if (next === previous || measured <= previousL + 1e-4) continue;
    found.push(next);
    previous = next;
    previousL = measured;
  }
  return found;
}

function pickEven(colors, fromL, count) {
  if (colors.length < count) return null;
  const endL = oklchLightness(colors[colors.length - 1]);
  const picks = [];
  let cursor = 0;
  for (let step = 1; step <= count; step += 1) {
    const target = fromL + ((endL - fromL) * step) / count;
    const lastAllowed = colors.length - (count - step) - 1;
    let best = cursor;
    while (
      best < lastAllowed &&
      Math.abs(oklchLightness(colors[best + 1]) - target) <= Math.abs(oklchLightness(colors[best]) - target)
    ) {
      best += 1;
    }
    picks.push(colors[best]);
    cursor = best + 1;
  }
  return picks;
}

function buildRamp(sourceHex, anchor, input) {
  const anchorHex = Math.abs(anchor - input.l) < 1e-4 ? sourceHex : hexAt(anchor, anchor, input);
  const anchorL = oklchLightness(anchorHex);
  const darker = pickEven(uniqueDarker(anchorHex, anchor, input), anchorL, 5);
  const lighter = pickEven(uniqueLighter(anchorHex, anchor, input), anchorL, 5);
  if (!darker || !lighter) return null;
  const hexes = [...lighter.reverse(), anchorHex, ...darker];
  return Object.fromEntries(RAMP_STEPS.map((step, index) => [step, hexes[index]]));
}

function isMonotonic(ramp) {
  const lightness = RAMP_STEPS.map((step) => oklchLightness(ramp[step]));
  return lightness.every((value, index) => index === 0 || value < lightness[index - 1] - 1e-4);
}

/**
 * Eleven-step ramp, keys 50…950. Step 500 matches `hex` when the scale has
 * room; near black or white it shifts just enough to keep lightness monotonic.
 * @param {string} hex
 * @returns {Record<string, string>}
 */
export function generateColorRamp(hex) {
  const source = normalizeHex(hex) ?? "#000000";
  const input = hexToOklch(source);
  const minAnchor = 5 * MIN_GAP;
  const maxAnchor = 1 - 5 * MIN_GAP;
  let fallback = null;

  const shifts = [0];
  for (let step = 1; step <= 80; step += 1) {
    shifts.push(step * 0.003, -step * 0.003);
  }

  for (const shift of shifts) {
    const anchor = Math.min(maxAnchor, Math.max(minAnchor, input.l + shift));
    const ramp = buildRamp(source, anchor, input);
    if (!ramp || !isMonotonic(ramp)) continue;
    if (deltaE(ramp["500"], source) < 3) return ramp;
    fallback ??= ramp;
  }

  return fallback ?? buildRamp(source, Math.min(maxAnchor, Math.max(minAnchor, input.l)), input);
}

/** Keep `base` lightness, move hue toward `toward`, and add a little chroma. */
export function tintToward(base, toward, amount = 0.22) {
  const neutral = hexToOklch(base);
  const brand = hexToOklch(toward);
  const mix = Math.min(1, Math.max(0, amount));
  const chroma = Math.min(0.045, neutral.c * (1 - mix) + brand.c * mix * 0.28);
  const hue = brand.c < 0.01 ? neutral.h : brand.h;
  return oklchToHex(neutral.l, chroma, hue);
}
