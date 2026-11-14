/**
 * Small, careful scanners for `review`. No parser dependency: we only read what we can read
 * reliably (imports, JSX opening tags and their attributes, CSS declarations) and treat
 * anything dynamic as unknown.
 */

/** 1-based line for every offset. */
export function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

const blank = (text) => text.replace(/[^\n]/g, " ");

/**
 * Replace comments with spaces (newlines kept, so offsets and lines stay true).
 * Quote strings end at the end of a line at the latest, so an apostrophe in JSX text
 * can only confuse the rest of its own line.
 */
export function stripComments(src, { css = false } = {}) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += blank(src.slice(i, stop));
      i = stop;
      continue;
    }
    if (!css && c === "/" && next === "/" && src[i - 1] !== ":") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      out += blank(src.slice(i, stop));
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (!css && c === "`") {
      const j = skipTemplate(src, i);
      out += src.slice(i, j);
      i = j;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** From a backtick at `i`, return the offset just past the closing backtick. */
function skipTemplate(src, i) {
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === "\\") {
      j += 2;
      continue;
    }
    if (src[j] === "`") return j + 1;
    if (src[j] === "$" && src[j + 1] === "{") {
      j = skipBalanced(src, j + 1);
      continue;
    }
    j++;
  }
  return src.length;
}

/** From an opening bracket at `i`, return the offset just past its match. Strings are skipped. */
export function skipBalanced(src, i) {
  const open = src[i];
  const close = { "{": "}", "(": ")", "[": "]" }[open];
  let depth = 0;
  let j = i;
  while (j < src.length) {
    const c = src[j];
    if (c === '"' || c === "'") {
      j++;
      while (j < src.length && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      j++;
      continue;
    }
    if (c === "`") {
      j = skipTemplate(src, j);
      continue;
    }
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") {
      depth--;
      if (depth === 0 && c === close) return j + 1;
    }
    j++;
  }
  return src.length;
}

/**
 * Imports and re-exports. Each: { source, names: [{ imported, local }], typeOnly, offset }.
 * `imported` is "default" or "*" for those forms.
 */
export function readImports(code) {
  const out = [];
  const re = /\bimport\s+(type\s+)?([\w*{}\s,$]+?)\s+from\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']|\bexport\s+(type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s*["']([^"']+)["']|\b(?:require|import)\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of code.matchAll(re)) {
    if (m[3]) {
      out.push({ source: m[3], names: importNames(m[2]), typeOnly: Boolean(m[1]), offset: m.index });
    } else {
      const source = m[4] ?? m[6] ?? m[7];
      out.push({ source, names: [], typeOnly: Boolean(m[5]), offset: m.index });
    }
  }
  return out;
}

function importNames(clause) {
  const names = [];
  const braces = clause.match(/\{([^}]*)\}/);
  const head = clause.replace(/\{[^}]*\}/, "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of head) {
    const star = part.match(/^\*\s+as\s+([\w$]+)$/);
    if (star) names.push({ imported: "*", local: star[1] });
    else if (/^[\w$]+$/.test(part)) names.push({ imported: "default", local: part });
  }
  if (braces) {
    for (const raw of braces[1].split(",")) {
      const part = raw.trim().replace(/^type\s+/, "");
      if (!part || raw.trim().startsWith("type ")) continue;
      const [imported, local] = part.split(/\s+as\s+/).map((s) => s.trim());
      names.push({ imported, local: local ?? imported });
    }
  }
  return names;
}

const TAG_BEFORE = /[\w$.)\]]/;

/**
 * JSX opening tags. Each: { name, offset, attrs: Map(name -> { kind, value, offset }), spread,
 * selfClosing, end, children } where kind is "string", "expr" or "bool" and `children` is the
 * raw text up to the matching close tag ("" when self-closing or not found).
 */
export function readJsxTags(code) {
  const tags = [];
  const masked = maskStrings(code);
  const re = /<([A-Za-z][\w.]*)(?=[\s/>])/g;
  for (const m of masked.matchAll(re)) {
    const before = masked.slice(0, m.index).match(/(\S)\s*$/)?.[1] ?? "";
    if (TAG_BEFORE.test(before) && !/return$/.test(masked.slice(Math.max(0, m.index - 12), m.index).trimEnd())) {
      // `useState<T>`, `Array<T>` and `a<b` are not JSX.
      continue;
    }
    const tag = readTag(code, m.index + 1 + m[1].length, m[1], m.index);
    if (tag) tags.push(tag);
  }
  return tags;
}

/**
 * The code with the inside of string literals blanked, so `<Button` in a code sample string is
 * not read as JSX. JSX attribute strings (`="…"`) and `${…}` in template literals are kept.
 */
function maskStrings(code) {
  let out = "";
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== c && code[j] !== "\n") j += code[j] === "\\" ? 2 : 1;
      const attr = /[\w:.-]=$/.test(out.slice(-20)); // JSX attributes: name="…", no space before =
      out += attr ? code.slice(i, j + 1) : c + blank(code.slice(i + 1, j)) + (code[j] ?? "");
      i = j + 1;
      continue;
    }
    if (c === "`") {
      out += c;
      let j = i + 1;
      while (j < code.length && code[j] !== "`") {
        if (code[j] === "\\") {
          out += "  ";
          j += 2;
          continue;
        }
        if (code[j] === "$" && code[j + 1] === "{") {
          const end = skipBalanced(code, j + 1);
          out += "$" + maskStrings(code.slice(j + 1, end));
          j = end;
          continue;
        }
        out += code[j] === "\n" ? "\n" : " ";
        j++;
      }
      if (j < code.length) out += "`";
      i = j + 1;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function readTag(code, start, name, offset) {
  const attrs = new Map();
  let spread = false;
  let i = start;
  while (i < code.length) {
    while (/\s/.test(code[i] ?? "")) i++;
    if (code[i] === "/" && code[i + 1] === ">") {
      return { name, offset, attrs, spread, selfClosing: true, end: i + 2, children: "" };
    }
    if (code[i] === ">") {
      const end = i + 1;
      const close = code.indexOf(`</${name}>`, end);
      const children = close === -1 ? "" : code.slice(end, close);
      return { name, offset, attrs, spread, selfClosing: false, end, children };
    }
    if (code[i] === "{") {
      spread = true;
      i = skipBalanced(code, i);
      continue;
    }
    const attr = code.slice(i).match(/^[\w:.-]+/);
    if (!attr) return null;
    const attrName = attr[0];
    const attrOffset = i;
    i += attrName.length;
    while (/\s/.test(code[i] ?? "")) i++;
    if (code[i] !== "=") {
      attrs.set(attrName, { kind: "bool", value: true, offset: attrOffset });
      continue;
    }
    i++;
    while (/\s/.test(code[i] ?? "")) i++;
    const q = code[i];
    if (q === '"' || q === "'") {
      const close = code.indexOf(q, i + 1);
      if (close === -1) return null;
      attrs.set(attrName, { kind: "string", value: code.slice(i + 1, close), offset: i + 1 });
      i = close + 1;
    } else if (q === "{") {
      const end = skipBalanced(code, i);
      attrs.set(attrName, { kind: "expr", value: code.slice(i + 1, end - 1), offset: i + 1 });
      i = end;
    } else {
      return null;
    }
  }
  return null;
}

/** Every plain string and the static parts of template literals in an expression: [{ text, offset }]. */
export function stringsIn(expr, base = 0) {
  const out = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < expr.length && expr[j] !== c && expr[j] !== "\n") j += expr[j] === "\\" ? 2 : 1;
      out.push({ text: expr.slice(i + 1, j), offset: base + i + 1 });
      i = j + 1;
      continue;
    }
    if (c === "`") {
      let j = i + 1;
      let partStart = j;
      while (j < expr.length && expr[j] !== "`") {
        if (expr[j] === "\\") {
          j += 2;
          continue;
        }
        if (expr[j] === "$" && expr[j + 1] === "{") {
          out.push({ text: expr.slice(partStart, j), offset: base + partStart });
          j = skipBalanced(expr, j + 1);
          partStart = j;
          continue;
        }
        j++;
      }
      out.push({ text: expr.slice(partStart, j), offset: base + partStart });
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}

/**
 * Top-level `key: value` pairs of an object literal written as `{ ... }` (the braces included).
 * value is { kind: "string" | "number" | "unknown", value, offset }.
 */
export function objectEntries(text, base = 0) {
  const open = text.indexOf("{");
  if (open === -1) return [];
  const end = skipBalanced(text, open);
  const body = text.slice(open + 1, end - 1);
  const bodyBase = base + open + 1;
  const parts = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'" || c === "`") {
      i = (c === "`" ? skipTemplate(body, i) : skipQuoted(body, i)) - 1;
      continue;
    }
    if ("{([".includes(c)) depth++;
    else if ("})]".includes(c)) depth--;
    else if (c === "," && depth === 0) {
      parts.push([body.slice(last, i), last]);
      last = i + 1;
    }
  }
  parts.push([body.slice(last), last]);
  const out = [];
  for (const [part, at] of parts) {
    const m = part.match(/^\s*(?:["']([^"']+)["']|([\w$]+))\s*:\s*([\s\S]*?)\s*$/);
    if (!m) continue;
    const key = m[1] ?? m[2];
    const raw = m[3];
    const valueOffset = bodyBase + at + part.indexOf(raw, part.indexOf(":") + 1);
    let value;
    const str = raw.match(/^(["'])([^"'\n]*)\1$/) ?? raw.match(/^`([^`$]*)`$/);
    if (str) value = { kind: "string", value: str[2] ?? str[1], offset: valueOffset + 1 };
    else if (/^-?\d*\.?\d+$/.test(raw)) value = { kind: "number", value: Number(raw), offset: valueOffset };
    else value = { kind: "unknown", value: raw, offset: valueOffset };
    out.push({ key, value });
  }
  return out;
}

function skipQuoted(text, i) {
  const q = text[i];
  let j = i + 1;
  while (j < text.length && text[j] !== q && text[j] !== "\n") j += text[j] === "\\" ? 2 : 1;
  return j + 1;
}

/** CSS declarations: [{ prop, value, offset }] (offset of the value). */
export function readCssDeclarations(css) {
  const out = [];
  const re = /([-\w]+)\s*:\s*([^;{}]+?)\s*(?=;|\})/g;
  for (const m of css.matchAll(re)) {
    // Selectors like `a:hover {` never reach `;` or `}` before `{`, so the lookahead skips them.
    const valueOffset = m.index + m[0].indexOf(m[2], m[1].length + 1);
    out.push({ prop: m[1].toLowerCase(), value: m[2], offset: valueOffset });
  }
  return out;
}

export const kebabProp = (key) =>
  key.startsWith("--") ? key : key.replace(/^(Webkit|Moz|ms)/, (p) => `-${p.toLowerCase()}`).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
