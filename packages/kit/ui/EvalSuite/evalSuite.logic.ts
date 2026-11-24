import type { DiffLine } from "../InlineDiff/InlineDiff.types";
import type { EvalCase, EvalResult, EvalView } from "./EvalSuite.types";

/** Pure helpers behind EvalSuite. No React here. */

export const RESULT_LABEL: Record<EvalResult, string> = { pass: "Pass", fail: "Fail", error: "Error" };

export function isRegression(c: EvalCase): boolean {
  return c.baseline.result === "pass" && c.candidate.result !== "pass";
}

export function isImprovement(c: EvalCase): boolean {
  return c.baseline.result !== "pass" && c.candidate.result === "pass";
}

export function isReviewed(c: EvalCase): boolean {
  return Boolean(c.accepted || c.flagged);
}

export function improvements(cases: EvalCase[]): EvalCase[] {
  return cases.filter(isImprovement);
}

/** Review column: only regressions need a review; accepted wins over flagged. */
export function reviewState(c: EvalCase): "review" | "accepted" | "flagged" | null {
  if (!isRegression(c)) return null;
  return c.accepted ? "accepted" : c.flagged ? "flagged" : "review";
}

export function regressions(cases: EvalCase[]): EvalCase[] {
  return cases.filter(isRegression);
}

export function unreviewedRegressions(cases: EvalCase[]): EvalCase[] {
  return cases.filter((c) => isRegression(c) && !isReviewed(c));
}

function rank(c: EvalCase): number {
  if (isRegression(c)) return 0;
  if (c.candidate.result === "error") return 1;
  if (isImprovement(c)) return 2;
  return 3;
}

/** Regressions first, then errors, improvements, the rest; stable within each. */
export function sortCases(cases: EvalCase[]): EvalCase[] {
  return cases
    .map((c, i) => ({ c, i }))
    .sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i)
    .map(({ c }) => c);
}

export function viewCases(cases: EvalCase[], view: EvalView, filters: { tag?: string; dataset?: string } = {}): EvalCase[] {
  return sortCases(cases).filter(
    (c) =>
      (view === "all" || (view === "regressions" ? isRegression(c) : isImprovement(c))) &&
      (!filters.tag || (c.tags ?? []).includes(filters.tag)) &&
      (!filters.dataset || c.dataset === filters.dataset),
  );
}

export function signed(value: number, digits = 2): string {
  const fixed = Math.abs(value).toFixed(digits);
  if (Number(fixed) === 0) return (0).toFixed(digits);
  return `${value > 0 ? "+" : "−"}${fixed}`;
}

export function percent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

export function money(value: number, currency = "USD", locale = "en"): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
  } catch {
    return `${value.toFixed(3)} ${currency}`;
  }
}

/** A signed money change with three decimals, e.g. "+$0.004" or "−$0.002". */
export function signedMoney(value: number, currency = "USD", locale = "en"): string {
  const abs = money(Math.abs(value), currency, locale);
  if (Number(Math.abs(value).toFixed(3)) === 0) return money(0, currency, locale);
  return `${value > 0 ? "+" : "−"}${abs}`;
}

export function ms(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`;
}

/** Line diff (LCS) from the baseline output to the candidate output, for InlineDiff. */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "context", text: a[i], oldNo: i + 1, newNo: j + 1 });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "remove", text: a[i], oldNo: i + 1 });
      i++;
    } else {
      out.push({ type: "add", text: b[j], newNo: j + 1 });
      j++;
    }
  }
  while (i < n) out.push({ type: "remove", text: a[i], oldNo: ++i });
  while (j < m) out.push({ type: "add", text: b[j], newNo: ++j });
  return out;
}

export function distinct(values: string[]): string[] {
  return [...new Set(values)];
}
