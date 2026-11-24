/** Shared by Table and DataTable: what a column's sortValue may return, and how two values compare. */
export type SortValue = string | number | Date;

function sortKeyOf(value: SortValue): number | string {
  if (value instanceof Date) return value.getTime();
  return value;
}

/** Numbers and Dates compare numerically, strings locale-aware with numeric collation. Numbers sort before strings. */
export function compareSortValues(a: SortValue, b: SortValue): number {
  const av = sortKeyOf(a);
  const bv = sortKeyOf(b);
  const aNum = typeof av === "number" && !Number.isNaN(av);
  const bNum = typeof bv === "number" && !Number.isNaN(bv);
  if (aNum && bNum) return (av as number) - (bv as number);
  if (aNum !== bNum) return aNum ? -1 : 1;
  return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
}

/** Sort cycle shared by both tables: off, then ascending, then descending, then off. */
export function nextSort(
  current: { key: string | null; dir: "asc" | "desc" },
  key: string,
): { key: string | null; dir: "asc" | "desc" } {
  if (current.key !== key) return { key, dir: "asc" };
  if (current.dir === "asc") return { key, dir: "desc" };
  return { key: null, dir: "asc" };
}
