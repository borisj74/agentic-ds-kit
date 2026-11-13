/**
 * Where a kit piece sits, smallest to biggest. Every contract has one in its `level` field,
 * and contracts/index.json copies it (scripts/sync-index-intents.mjs).
 * Blocks (`kind: "block"`) are `block`; patterns are `template`; no component is `template`.
 * Tokens are a foundation, not a level.
 *
 * Pure data with no imports, so the MCP server, the sync script, tests and the docs site can all
 * read the one list.
 */
export const LEVELS = Object.freeze(["atom", "molecule", "organism", "block", "template"]);

/** Levels a component or block can have (every level except `template`, which is patterns only). */
export const COMPONENT_LEVELS = Object.freeze(LEVELS.filter((level) => level !== "template"));
