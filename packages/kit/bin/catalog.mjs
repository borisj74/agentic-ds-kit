/**
 * Read-only view of the installed kit. Every answer comes from this package's
 * contracts, tokens, and AGENTS.md. Nothing here is a second copy of that data.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { labelFor } from "./questions.mjs";

export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const TOKEN_GROUPS = ["color", "type", "space", "radius", "grid"];

export class CatalogError extends Error {
  constructor(message) {
    super(message);
    this.name = "CatalogError";
  }
}

const cache = new Map();

const oneLine = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
/** Lowercase letters and digits only, so "AgentOverview", "agent-overview" and "agentoverview" match. */
export const compact = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function readJson(file, what) {
  if (!existsSync(file)) {
    throw new CatalogError(`${what} is missing from this install (${file}). Reinstall agentic-ds-kit.`);
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new CatalogError(`could not read ${what} (${file}): ${error.message}`);
  }
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .replace(/(\d)([A-Za-z])/g, "$1-$2")
    .toLowerCase();
}

/** Same leaf names as scripts/generate-tokens.mjs, so CSS variables match tokens.css. */
function flattenLeaves(obj, prefix = "") {
  const out = [];
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}-${kebab(key)}` : kebab(key);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const children = Object.values(value);
      const leafGroup = children.length > 0 && children.every((child) => typeof child === "string");
      if (leafGroup) {
        for (const [childKey, childVal] of Object.entries(value)) {
          out.push([`${next}-${kebab(childKey)}`, childVal]);
        }
      } else {
        out.push(...flattenLeaves(value, next));
      }
    } else if (typeof value === "string") {
      out.push([next, value]);
    }
  }
  return out;
}

function resolveRef(ref, primitives) {
  if (typeof ref !== "string") return String(ref);
  if (ref.startsWith("mix:")) {
    const rest = ref.slice(4);
    const at = rest.lastIndexOf("@");
    const path = rest.slice(0, at).trim();
    const pct = rest.slice(at + 1);
    return `color-mix(in srgb, ${resolveRef(path, primitives)} ${pct}%, transparent)`;
  }
  if (ref.startsWith("primitive.")) {
    const value = ref
      .slice("primitive.".length)
      .split(".")
      .reduce((acc, key) => acc?.[key], primitives);
    return value === undefined ? ref : String(value);
  }
  return ref;
}

function notesFor(name, usage) {
  const exact = usage.tokens?.[name];
  const families = Object.keys(usage.families ?? {}).sort((a, b) => b.length - a.length);
  const family = families.find((prefix) => name.startsWith(prefix));
  const note = exact ?? (family ? usage.families[family] : {});
  return {
    note: typeof note?.note === "string" ? note.note : "",
    useWhen: typeof note?.useWhen === "string" ? note.useWhen : "",
    doNot: typeof note?.doNot === "string" ? note.doNot : "",
  };
}

function withNotes(entries, group, usage) {
  return entries.map((entry) => ({
    name: entry.name,
    group,
    value: entry.value,
    ...(group === "color" ? { dark: entry.dark } : {}),
    ...notesFor(entry.name, usage),
  }));
}

function colorTokens(tokens) {
  const light = flattenLeaves(tokens.semantic.light ?? {});
  const dark = new Map(flattenLeaves(tokens.semantic.dark ?? {}));
  return light
    .filter(([name]) => !name.startsWith("shadow-"))
    .map(([name, ref]) => ({
      name: `--${name}`,
      value: resolveRef(ref, tokens.primitive),
      dark: dark.has(name) ? resolveRef(dark.get(name), tokens.primitive) : null,
    }));
}

function shadowTokens(tokens) {
  return flattenLeaves(tokens.semantic.light ?? {})
    .filter(([name]) => name.startsWith("shadow-"))
    .map(([name, ref]) => ({ name: `--${name}`, value: resolveRef(ref, tokens.primitive) }));
}

function typeTokens(tokens) {
  const { type } = tokens.semantic;
  const out = [];
  const fonts = {
    sans: "--font-sans",
    display: "--font-display",
    mono: "--font-mono",
    body: "--font-body",
    heading: "--font-heading",
  };
  for (const [key, name] of Object.entries(fonts)) {
    if (typeof type.family?.[key] === "string") out.push({ name, value: type.family[key] });
  }
  for (const [key, step] of Object.entries(type.ladder ?? {})) {
    const css = kebab(key);
    if (typeof step?.size === "string") out.push({ name: `--type-size-${css}`, value: step.size });
    if (typeof step?.line === "string") out.push({ name: `--type-line-${css}`, value: step.line });
  }
  for (const [role, ref] of Object.entries(type.weight ?? {})) {
    out.push({ name: `--type-weight-${kebab(role)}`, value: resolveRef(ref, tokens.primitive) });
  }
  for (const [role, ref] of Object.entries(type.tracking ?? {})) {
    out.push({ name: `--type-tracking-${kebab(role)}`, value: resolveRef(ref, tokens.primitive) });
  }
  return out;
}

function spaceTokens(tokens) {
  const out = [];
  for (const [step, value] of Object.entries(tokens.primitive.space ?? {})) {
    out.push({ name: `--space-${step}`, value: String(value) });
  }
  for (const [family, steps] of Object.entries(tokens.semantic.space ?? {})) {
    for (const [step, ref] of Object.entries(steps)) {
      out.push({ name: `--space-${family}-${step}`, value: resolveRef(ref, tokens.primitive) });
    }
  }
  return out;
}

function radiusTokens(tokens) {
  return Object.entries(tokens.primitive.radius ?? {}).map(([step, value]) => ({
    name: `--radius-${step}`,
    value: String(value),
  }));
}

function gridTokens(tokens) {
  const out = [];
  const walk = (obj, prefix) => {
    for (const [key, value] of Object.entries(obj)) {
      const name = `${prefix}-${kebab(key)}`;
      if (value && typeof value === "object") walk(value, name);
      else out.push({ name, value: resolveRef(value, tokens.primitive) });
    }
  };
  walk(tokens.semantic.grid ?? {}, "--grid");
  return out;
}

function lines(value) {
  return Array.isArray(value) ? value.filter((line) => typeof line === "string") : [];
}

function variantsOf(props) {
  if (!props || typeof props !== "object") return [];
  return Object.entries(props)
    .filter(([, spec]) => Array.isArray(spec?.values))
    .map(([prop, spec]) => ({
      prop,
      values: [...spec.values],
      default: spec.default ?? null,
    }));
}

function keywordText(contract) {
  return [...lines(contract.useWhen), ...lines(contract.doNotUseWhen), ...lines(contract.doNot)].join(" ");
}

function load(root = packageRoot) {
  const hit = cache.get(root);
  if (hit) return hit;

  const index = readJson(join(root, "contracts/index.json"), "contracts/index.json");
  if (!Array.isArray(index)) throw new CatalogError("contracts/index.json must be an array.");
  const { version } = readJson(join(root, "package.json"), "package.json");
  const tokens = readJson(join(root, "tokens/tokens.json"), "tokens/tokens.json");
  const usage = readJson(join(root, "tokens/usage.json"), "tokens/usage.json");
  const rulesFile = join(root, "AGENTS.md");
  if (!existsSync(rulesFile)) {
    throw new CatalogError(`AGENTS.md is missing from this install (${rulesFile}). Reinstall agentic-ds-kit.`);
  }
  const rules = readFileSync(rulesFile, "utf8");

  const listed = index.filter((entry) => entry.group === "component" || entry.group === "pattern");
  const contracts = new Map(listed.map((entry) => [entry.id, readJson(join(root, entry.path), `contract ${entry.id}`)]));

  const components = listed
    .filter((entry) => entry.group === "component")
    .map((entry) => {
      const contract = contracts.get(entry.id);
      const name = labelFor(entry, contract);
      const purpose = oneLine(contract.intent || entry.intent);
      return {
        id: entry.id,
        name,
        category: entry.group,
        kind: contract.kind === "block" || entry.kind === "block" ? "block" : "component",
        level: contract.level ?? entry.level ?? null,
        block:
          contract.kind === "block" || entry.kind === "block"
            ? { category: contract.category ?? entry.category ?? "", summary: oneLine(contract.summary ?? entry.summary) }
            : undefined,
        purpose,
        props: contract.props ?? {},
        variants: variantsOf(contract.props),
        must: lines(contract.must),
        doNot: lines(contract.doNot),
        tokens: lines(contract.tokens),
        import: `import { ${name} } from "agentic-ds-kit";`,
        example: typeof contract.snippet === "string" ? contract.snippet : "",
        keywords: keywordText(contract),
        contains: lines(contract.contains),
      };
    });

  const patterns = listed
    .filter((entry) => entry.group === "pattern")
    .map((entry) => {
      const contract = contracts.get(entry.id);
      return {
        id: entry.id,
        level: contract.level ?? entry.level ?? "template",
        description: oneLine(contract.intent || entry.intent),
        add: contract.add || entry.add || `npx agentic-ds-kit add ${entry.id}`,
        must: lines(contract.must),
        defaults: lines(contract.defaults),
        contains: lines(contract.contains),
        requires: lines(contract.requires),
      };
    });

  const semantic = [
    ...withNotes(colorTokens(tokens), "color", usage),
    ...withNotes(typeTokens(tokens), "type", usage),
    ...withNotes(spaceTokens(tokens), "space", usage),
    ...withNotes(radiusTokens(tokens), "radius", usage),
    ...withNotes(gridTokens(tokens), "grid", usage),
  ];

  const data = { version, rules, components, patterns, semantic, shadows: shadowTokens(tokens), tokens };
  cache.set(root, data);
  return data;
}

/**
 * kind is "block" for blocks (larger compositions such as AgentOverview), else "component". Blocks add { category, summary }.
 * level is where the piece sits: atom, molecule, organism or block (see bin/levels.mjs).
 */
function summary(component) {
  return {
    id: component.id,
    name: component.name,
    category: component.category,
    kind: component.kind,
    level: component.level,
    ...(component.block ? { block: component.block } : {}),
    purpose: component.purpose,
  };
}

function normalizeId(name) {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-?pattern$/, "");
}

function closeMatches(query, items, label) {
  const needle = compact(query);
  if (!needle) return "";
  const hits = items
    .filter((item) => {
      const id = compact(item.id);
      const name = compact(label(item));
      return id.includes(needle) || name.includes(needle) || needle.includes(id);
    })
    .slice(0, 5)
    .map(label);
  return hits.length ? `Close matches: ${hits.join(", ")}. ` : "";
}

function requireText(value, label, example) {
  if (typeof value !== "string" || !value.trim()) {
    throw new CatalogError(`${label} is required. ${example}`);
  }
  return value.trim();
}

/** Everything `review` needs from this install, read once: components (with contains), patterns, tokens. */
export function kitData(root = packageRoot) {
  return load(root);
}

export function listComponents() {
  const data = load();
  return { kit: data.version, components: data.components.map(summary) };
}

export function getComponent(name) {
  const data = load();
  const query = requireText(name, "name", "Pass a component name, such as Button or button.");
  const pattern = data.patterns.find((item) => item.id === normalizeId(query) || compact(item.id) === compact(query));
  if (pattern) {
    throw new CatalogError(`"${query}" is a pattern. Use get_pattern with id "${pattern.id}".`);
  }
  const component = data.components.find((item) => compact(item.id) === compact(query) || compact(item.name) === compact(query));
  if (!component) {
    const near = closeMatches(query, data.components, (item) => item.name);
    throw new CatalogError(`No component named "${query}". ${near}Use list_components or search_components.`);
  }
  return {
    kit: data.version,
    component: {
      id: component.id,
      name: component.name,
      category: component.category,
      kind: component.kind,
      level: component.level,
      ...(component.block ? { block: component.block } : {}),
      purpose: component.purpose,
      props: component.props,
      variants: component.variants,
      must: component.must,
      doNot: component.doNot,
      tokens: component.tokens,
      import: component.import,
      example: component.example,
    },
  };
}

export function searchComponents(query) {
  const data = load();
  const text = requireText(query, "query", 'Pass a name, purpose, or keyword, such as "date" or "kpi".');
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const components = data.components.filter((component) => {
    const haystack = [component.id, component.name, component.purpose, component.keywords].join(" ").toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  return { kit: data.version, query: text, components: components.map(summary) };
}

export function getTokens(group) {
  const data = load();
  if (group !== undefined && group !== null && !TOKEN_GROUPS.includes(group)) {
    throw new CatalogError(`group must be one of: ${TOKEN_GROUPS.join(", ")}.`);
  }
  const tokens = group ? data.semantic.filter((token) => token.group === group) : data.semantic;
  return { kit: data.version, group: group ?? null, tokens };
}

export function listPatterns() {
  const data = load();
  return {
    kit: data.version,
    patterns: data.patterns.map(({ id, level, description, add }) => ({ id, level, description, add })),
  };
}

export function getPattern(id) {
  const data = load();
  const query = requireText(id, "id", "Pass a pattern id, such as dashboard or app-shell.");
  const component = data.components.find((item) => compact(item.id) === compact(query) || compact(item.name) === compact(query));
  const pattern = data.patterns.find((item) => item.id === normalizeId(query) || compact(item.id) === compact(query));
  if (!pattern && component) {
    throw new CatalogError(`"${query}" is a component. Use get_component with name "${component.name}".`);
  }
  if (!pattern) {
    const near = closeMatches(query, data.patterns, (item) => item.id);
    const known = data.patterns.map((item) => item.id).join(", ");
    throw new CatalogError(`No pattern "${query}". ${near}Available: ${known}.`);
  }
  return { kit: data.version, pattern };
}

export function getRules() {
  const data = load();
  return { kit: data.version, source: "AGENTS.md", rules: data.rules };
}
