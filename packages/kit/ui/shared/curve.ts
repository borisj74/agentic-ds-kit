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
  if (points.length < 3) return linearPath(points);
  const segments = smoothSegments(points);
  let d = `M ${points[0].x} ${points[0].y}`;
  segments.forEach((segment, i) => {
    const p1 = points[i + 1];
    d += ` C ${segment.c1x} ${segment.c1y} ${segment.c2x} ${segment.c2y} ${p1.x} ${p1.y}`;
  });
  return d;
}

/** Control points of each cubic segment of `smoothPath` (one per gap between points). Needs three or more points. */
type CurveSegment = { c1x: number; c1y: number; c2x: number; c2y: number };

function smoothSegments(points: PathPoint[]): CurveSegment[] {
  const n = points.length;
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
  const segments: CurveSegment[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    // The control points stay in order between the end values while (a + b) * share <= 1,
    // a and b being the end tangents relative to this segment's slope.
    const ab = slope[i] === 0 ? 0 : (tangent[i] + tangent[i + 1]) / slope[i];
    const share = ab > 0 ? Math.min(CURVE_HANDLE, 1 / ab) : CURVE_HANDLE;
    const reach = dx[i] * share;
    const p0 = points[i];
    const p1 = points[i + 1];
    segments.push({
      c1x: p0.x + reach,
      c1y: p0.y + tangent[i] * reach,
      c2x: p1.x - reach,
      c2y: p1.y - tangent[i + 1] * reach,
    });
  }
  return segments;
}

/**
 * Path commands that trace the same curve as `smoothPath` (or `linearPath`) backwards, from the last
 * point to the first, with the pen already on the last point. Stacked areas close each band along the
 * band below with these, so the two share one edge and leave no gap.
 */
export function reversedCurveCommands(points: PathPoint[], curve: "smooth" | "linear"): string {
  const n = points.length;
  if (n < 2) return "";
  if (curve === "linear" || n < 3) {
    return points
      .slice(0, -1)
      .reverse()
      .map((point) => `L ${point.x} ${point.y}`)
      .join(" ");
  }
  const segments = smoothSegments(points);
  let d = "";
  for (let i = n - 2; i >= 0; i -= 1) {
    const segment = segments[i];
    const p0 = points[i];
    d += `${d ? " " : ""}C ${segment.c2x} ${segment.c2y} ${segment.c1x} ${segment.c1y} ${p0.x} ${p0.y}`;
  }
  return d;
}
