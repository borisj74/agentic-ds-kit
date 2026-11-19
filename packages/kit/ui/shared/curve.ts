/**
 * Line paths shared by the charts (LineChart, ComboChart). Moved out of LineChart so new charts
 * draw the same curve instead of keeping a copy.
 */

export type PathPoint = { x: number; y: number };

export function linearPath(points: PathPoint[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

/** Longest Bézier handle, as a share of a segment's width. 1/3 is a plain Hermite curve; 1/2 gives rounder, fuller bends. */
export const CURVE_HANDLE = 0.5;

/**
 * A smooth line through every point. Tangents come from a monotone cubic (Fritsch–Carlson), so the
 * line never bends above a peak or below a dip and still reads the real values. Handles then reach
 * up to half way along each segment for rounder bends. Where a long handle would push past the
 * segment's end values, that segment's handles get shorter instead: the tangent direction is kept,
 * so the line stays smooth through every point.
 */
export function smoothPath(points: PathPoint[]): string {
  const n = points.length;
  if (n < 3) return linearPath(points);
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(points[i + 1].x - points[i].x);
    slope.push(dx[i] === 0 ? 0 : (points[i + 1].y - points[i].y) / dx[i]);
  }
  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i += 1) {
    // The control points stay in order between the end values while (a + b) * share <= 1,
    // a and b being the end tangents relative to this segment's slope.
    const ab = slope[i] === 0 ? 0 : (tangent[i] + tangent[i + 1]) / slope[i];
    const share = ab > 0 ? Math.min(CURVE_HANDLE, 1 / ab) : CURVE_HANDLE;
    const reach = dx[i] * share;
    const p0 = points[i];
    const p1 = points[i + 1];
    d += ` C ${p0.x + reach} ${p0.y + tangent[i] * reach} ${p1.x - reach} ${p1.y - tangent[i + 1] * reach} ${p1.x} ${p1.y}`;
  }
  return d;
}
