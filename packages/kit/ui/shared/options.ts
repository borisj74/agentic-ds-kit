export interface OptionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export function filterOptions<T extends OptionItem>(options: T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return options;
  return options.filter(
    (option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
  );
}

/** Next enabled option, wrapping. `index` may be -1. Returns -1 when every option is disabled. */
export function nextEnabled<T extends { disabled?: boolean }>(options: T[], index: number, delta: number): number {
  if (options.length === 0) return -1;
  let next = index;
  for (let step = 0; step < options.length; step += 1) {
    next = (next + delta + options.length) % options.length;
    if (!options[next]?.disabled) return next;
  }
  return -1;
}

export function firstEnabled<T extends { disabled?: boolean }>(options: T[]): number {
  return options.findIndex((option) => !option.disabled);
}

export function lastEnabled<T extends { disabled?: boolean }>(options: T[]): number {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index]?.disabled) return index;
  }
  return -1;
}
