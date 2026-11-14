/**
 * Inspect mode: when on, every kit component writes `data-nistha="<contract id>"` on its root so
 * `npx agentic-ds-kit inspect <url>` (or the MCP tool `inspect_ui`) can list the kit pieces on a
 * rendered page. When off, the helper returns an empty object and the markup is unchanged.
 *
 * On: `NEXT_PUBLIC_NISTHA_INSPECT` is `1` or `true`.
 * Off in production builds (`NODE_ENV === "production"`) unless
 * `NEXT_PUBLIC_NISTHA_INSPECT_FORCE` is also `1` or `true`.
 *
 * No "use client": server components (Button, Card, Table…) call it too. It reads the variables on
 * every call, written out in full so Next.js can inline `NEXT_PUBLIC_*` at the app build. Where
 * `process` does not exist (a plain browser bundle), the read throws and mode stays off.
 */

export const INSPECT_ATTR = "data-nistha";

export type InspectAttr = { "data-nistha"?: string };

function isOn(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function readInspect(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_NISTHA_INSPECT;
  } catch {
    return undefined;
  }
}

function readForce(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_NISTHA_INSPECT_FORCE;
  } catch {
    return undefined;
  }
}

function readNodeEnv(): string | undefined {
  try {
    return process.env.NODE_ENV;
  } catch {
    return undefined;
  }
}

/** True when kit components should write `data-nistha` on their roots. */
export function inspectMode(): boolean {
  if (!isOn(readInspect())) return false;
  if (readNodeEnv() === "production" && !isOn(readForce())) return false;
  return true;
}

/**
 * Spread on a component's root: `<div {...nisthaAttr("card", rest)}>`.
 * Pass the props that reach the root (or the outer value itself) as `outer` when another kit
 * component renders this one, so both ids land on the shared node, space-separated.
 */
export function nisthaAttr(id: string, outer?: unknown): InspectAttr {
  if (!inspectMode()) return {};
  const inherited =
    typeof outer === "string"
      ? outer
      : outer && typeof outer === "object"
        ? (outer as Record<string, unknown>)[INSPECT_ATTR]
        : undefined;
  if (typeof inherited !== "string" || inherited.trim() === "") return { [INSPECT_ATTR]: id };
  const ids = inherited.split(/\s+/).filter(Boolean);
  return { [INSPECT_ATTR]: ids.includes(id) ? ids.join(" ") : [...ids, id].join(" ") };
}

/**
 * For a component whose `...rest` goes to an inner element (DropdownMenu's trigger) while another
 * kit component (Select) passes its id through: drop the id from those props so it lands only on
 * the root. With inspect mode off this returns the props unchanged.
 */
export function withoutInspectAttr<T extends object>(props: T): T {
  if (!inspectMode() || !(INSPECT_ATTR in props)) return props;
  const copy = { ...props } as Record<string, unknown>;
  delete copy[INSPECT_ATTR];
  return copy as T;
}
