export const RAMP_STEPS: readonly [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

export type RampStep = (typeof RAMP_STEPS)[number];
export type ColorRamp = Record<RampStep, string>;

export function normalizeHex(input: string): string | null;
export function hexToOklch(hex: string): { l: number; c: number; h: number };
export function oklchToHex(l: number, c: number, h: number): string;
export function oklchLightness(hex: string): number;
export function deltaE(hexA: string, hexB: string): number;
export function relativeLuminance(hex: string): number;
export function contrastRatio(foreground: string, background: string): number;
export function generateColorRamp(hex: string): ColorRamp;
export function tintToward(base: string, toward: string, amount?: number): string;
