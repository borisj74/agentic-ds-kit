/** Joins class names, skipping empty values. Kit classes first, the user's `className` last. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
