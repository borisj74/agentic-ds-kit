export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

export interface ChartSeries {
  label: string;
  data: number[];
  color?: string;
}

export const CHART_COLORS = [
  "var(--fill-brand)",
  "var(--fill-success)",
  "var(--fill-warning)",
  "var(--fill-danger)",
  "var(--fill-info)",
] as const;

export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  if (Number.isInteger(value)) return value.toLocaleString("en-US");
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function formatAxisTick(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 1_000_000) return `${value / 1_000_000}M`;
  if (Math.abs(value) >= 1_000) return `${value / 1_000}k`;
  return String(value);
}

export function colorAt(index: number, override?: string): string {
  return override ?? CHART_COLORS[index % CHART_COLORS.length];
}

export interface PreparedSegment extends ChartDatum {
  share: number;
  color: string;
}

export function prepareSegments(
  data: ChartDatum[],
  options: { maxSegments?: number; sort?: boolean; otherLabel?: string } = {},
): PreparedSegment[] {
  const { maxSegments = 6, sort = true, otherLabel = "Other" } = options;
  const cleaned = data.filter((entry) => Number.isFinite(entry.value) && entry.value > 0);
  const ordered = sort ? [...cleaned].sort((a, b) => b.value - a.value) : [...cleaned];
  const visible = ordered.slice(0, maxSegments);
  const remainder = ordered.slice(maxSegments);
  const remainderTotal = remainder.reduce((sum, entry) => sum + entry.value, 0);
  if (remainderTotal > 0) {
    visible.push({ label: otherLabel, value: remainderTotal });
  }
  const total = visible.reduce((sum, entry) => sum + entry.value, 0);
  return visible.map((entry, index) => ({
    ...entry,
    color: colorAt(index, entry.color),
    share: total > 0 ? entry.value / total : 0,
  }));
}

export function normalizeBarInput(input: {
  data?: ChartDatum[];
  categories?: string[];
  series?: ChartSeries[];
}): { categories: string[]; series: ChartSeries[] } {
  if (input.categories?.length && input.series?.length) {
    return {
      categories: input.categories,
      series: input.series.map((entry, index) => ({
        ...entry,
        color: colorAt(index, entry.color),
      })),
    };
  }
  const data = input.data ?? [];
  return {
    categories: data.map((entry) => entry.label),
    series: [
      {
        label: "Value",
        data: data.map((entry) => entry.value),
        color: CHART_COLORS[0],
      },
    ],
  };
}

export function normalizeLineInput(input: {
  data?: ChartDatum[];
  labels?: string[];
  series?: ChartSeries[];
}): { labels: string[]; series: ChartSeries[] } {
  if (input.labels?.length && input.series?.length) {
    return {
      labels: input.labels,
      series: input.series.map((entry, index) => ({
        ...entry,
        color: colorAt(index, entry.color),
      })),
    };
  }
  const data = input.data ?? [];
  return {
    labels: data.map((entry) => entry.label),
    series: [
      {
        label: "Value",
        data: data.map((entry) => entry.value),
        color: CHART_COLORS[0],
      },
    ],
  };
}

export function seriesExtent(
  series: ChartSeries[],
  options: { includeZero?: boolean } = {},
): [number, number] {
  const values = series.flatMap((entry) => entry.data).filter((value) => Number.isFinite(value));
  if (!values.length) return [0, 1];
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (options.includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (min === max) {
    return min === 0 ? [0, 1] : [min * 0.9, max * 1.1];
  }
  return [min, max];
}

export function niceTicks(min: number, max: number, count = 5): { ticks: number[]; min: number; max: number } {
  const range = niceNum(max - min, false);
  const step = niceNum(range / Math.max(count - 1, 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax + step / 2; tick += step) {
    ticks.push(Number(tick.toFixed(10)));
  }
  return { ticks, min: niceMin, max: niceMax };
}

function niceNum(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(Math.abs(value) || 1));
  const fraction = value / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

export function linearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

export const CHART_MARGINS = { top: 12, right: 12, bottom: 36, left: 44 } as const;

export const TAU = Math.PI * 2;

export function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle - Math.PI / 2),
    y: cy + radius * Math.sin(angle - Math.PI / 2),
  };
}

export function pointOnCircle(cx: number, cy: number, radius: number, angle: number) {
  return polarToCartesian(cx, cy, radius, angle);
}

export function wedgePath(options: {
  cx: number;
  cy: number;
  radius: number;
  startAngle: number;
  endAngle: number;
}): string {
  const { cx, cy, radius, startAngle, endAngle } = options;
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export function ringPath(options: {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}): string {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle } = options;
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}
