/**
 * Response shaping for the MCP tools: lean summaries by default, `detail: "full"` for the
 * previous payloads, and offset paging. Pure functions over catalog / questions output, so the
 * transport (SDK or not) does not matter.
 */

/** Default and maximum page sizes. A missing `limit` returns everything (after filters). */
export const MAX_LIMIT = 500;

/** First sentence of a purpose line, capped so a summary row stays short. */
export function shortPurpose(text, max = 100) {
  if (typeof text !== "string") return text;
  const sentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).trimEnd()}…`;
}

/** Slice `items` by offset/limit and describe the page. */
export function paginate(items, { offset = 0, limit } = {}) {
  const total = items.length;
  const start = Math.max(0, Math.min(offset, total));
  const size = limit === undefined ? total - start : Math.max(0, Math.min(limit, MAX_LIMIT));
  const slice = items.slice(start, start + size);
  const end = start + slice.length;
  return {
    items: slice,
    page: { offset: start, limit: limit ?? null, total, next: end < total ? end : null },
  };
}

/** list_components: summary rows by default; full keeps every field (category included). */
export function shapeComponents(listed, { detail = "summary", kind, offset, limit } = {}) {
  let rows = listed.components;
  if (kind) rows = rows.filter((row) => row.kind === kind);
  if (detail !== "full") {
    rows = rows.map(({ id, name, kind: rowKind, purpose }) => ({ id, name, kind: rowKind, purpose: shortPurpose(purpose) }));
  }
  const { items, page } = paginate(rows, { offset, limit });
  return { kit: listed.kit, detail: detail === "full" ? "full" : "summary", components: items, page };
}

/** get_tokens: name, group, value (and dark for color) by default; full adds the usage notes. */
export function shapeTokens(result, { detail = "summary", offset, limit } = {}) {
  let rows = result.tokens;
  if (detail !== "full") {
    rows = rows.map(({ name, group, value, dark }) => (group === "color" ? { name, group, value, dark } : { name, group, value }));
  }
  const { items, page } = paginate(rows, { offset, limit });
  return { kit: result.kit, group: result.group, detail: detail === "full" ? "full" : "summary", tokens: items, page };
}

/**
 * questions: the full CLI JSON by default (same as `npx agentic-ds-kit questions`). Summary keeps
 * id, label and kind per option and drops enums; limit/offset page the options in either mode.
 */
export function shapeQuestions(result, { detail = "full", offset, limit } = {}) {
  const paged = offset !== undefined || limit !== undefined;
  if (detail !== "summary" && !paged) return result;
  const options = detail === "summary" ? result.options.map(({ id, label, kind }) => ({ id, label, kind })) : result.options;
  const { items, page } = paginate(options, { offset, limit });
  const shaped = { ...result, options: items, page };
  if (detail === "summary") {
    shaped.detail = "summary";
    delete shaped.enums;
  }
  return shaped;
}
