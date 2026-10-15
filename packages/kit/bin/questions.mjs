/**
 * agentic-ds-kit questions: turn the kit's contracts into a neutral, closed option list
 * ("which of these views does the request need?") plus the enum props of those
 * contracts. Apps feed it to whatever decision model or LLM they use. No network,
 * no model calls, no dependencies: Node built-ins only.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

export const SCHEMA = 1;
export const MAX_OPTIONS = 255;
export const NONE_LABEL = "None of these";

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const QUESTIONS_HELP = `Usage: npx agentic-ds-kit questions [options]

Build a closed option list from the kit's contracts: one option per component and
pattern (label, description from intent / useWhen / doNotUseWhen, the contract ids
it renders, and a yes/no question), plus every enum prop with its values. Feed it to
whatever decision model or LLM your app uses; keep thresholds and wording in app code.

Options:
  --only <id,...>         Only these contract ids (components or patterns)
  --group <group>         Only one group: component or pattern
  --overlay <file.json>   App-owned overlay: composites, extra sentences, renamed
                          labels, dropped options (see docs/questions.md)
  --use-when <n>          useWhen lines per description (default 2)
  --not-when <n>          doNotUseWhen lines per description (default 2)
  --none                  Add a "None of these" option (kind none), listed last
  --out <file>            Write to a file instead of stdout
  --pretty                Indent the JSON
  -h, --help              Show this help

Output: { "schema": ${SCHEMA}, "kit": "<version>", "options": [...], "enums": [...] }
Options are sorted by label; the same input gives byte-identical output.

Examples:
  npx agentic-ds-kit questions --pretty
  npx agentic-ds-kit questions --group pattern
  npx agentic-ds-kit questions --overlay questions.overlay.json --none --out lib/questions.json`;

export class QuestionsError extends Error {}

const fail = (message) => {
  throw new QuestionsError(message);
};

const readJson = (file, what) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return fail(`could not read ${what} (${file}): ${error.message}`);
  }
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim() !== "";
const sentence = (text) => text.trim().replace(/\.?$/, ".");

/** Strip the full stop and lowercase a leading capital unless it starts an acronym ("KPI"). */
const clause = (text) => {
  const t = text.trim().replace(/\.$/, "");
  return /^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t;
};

/** Code-point order, not locale order, so output never depends on the machine. */
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const byLabel = (a, b) => byText(a.label.toLowerCase(), b.label.toLowerCase()) || byText(a.label, b.label);

/** The component name as written in code: the PascalCase tag in the snippet that spells the id. */
function labelFor(entry, contract) {
  const bare = entry.id.replace(/-/g, "");
  for (const [, name] of (contract.snippet ?? "").matchAll(/\b([A-Z][A-Za-z0-9]*)\b/g)) {
    if (name.toLowerCase() === bare) return name;
  }
  const imported = (contract.import ?? "").match(/import \{ ([A-Za-z0-9]+)/);
  if (imported) return imported[1];
  const pascal = entry.id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  return entry.group === "pattern" ? `${pascal}Pattern` : pascal;
}

function describe(contract, { extra, useWhen, notWhen }) {
  const parts = [];
  if (contract?.intent) parts.push(sentence(contract.intent));
  if (extra) parts.push(sentence(extra));
  const use = (contract?.useWhen ?? []).slice(0, useWhen);
  if (use.length) parts.push(`Use when: ${use.join("; ")}.`);
  const not = (contract?.doNotUseWhen ?? []).slice(0, notWhen);
  if (not.length) parts.push(`Not for: ${not.join("; ")}.`);
  return parts.join(" ");
}

const ask = (label, summary) => `Does the request need ${label}${summary ? ` (${clause(summary)})` : ""}?`;

function validateOverlay(overlay, known) {
  if (!isObject(overlay)) fail("overlay must be a JSON object with composites, options and/or drop.");
  for (const key of Object.keys(overlay)) {
    if (!["$comment", "composites", "options", "drop"].includes(key)) {
      fail(`overlay has an unknown key "${key}". Allowed: composites, options, drop.`);
    }
  }
  const checkId = (id, where) => {
    if (!known.has(id)) fail(`${where}: unknown contract id "${id}". Ids are listed in contracts/index.json.`);
  };
  const { composites = [], options = {}, drop = [] } = overlay;
  if (!Array.isArray(composites)) fail("overlay.composites must be an array.");
  composites.forEach((c, i) => {
    const where = `overlay.composites[${i}]`;
    if (!isObject(c)) fail(`${where} must be an object.`);
    for (const key of Object.keys(c)) {
      if (!["id", "label", "contracts", "sentence", "base"].includes(key)) {
        fail(`${where} has an unknown key "${key}". Allowed: id, label, contracts, sentence, base.`);
      }
    }
    if (!isText(c.label)) fail(`${where}.label must be a non-empty string.`);
    if (!isText(c.sentence)) fail(`${where}.sentence must be a non-empty string.`);
    if (c.id !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(c.id)) fail(`${where}.id must be lowercase letters, digits and dashes.`);
    if (!Array.isArray(c.contracts) || !c.contracts.length || !c.contracts.every(isText)) {
      fail(`${where}.contracts must be a non-empty array of contract ids.`);
    }
    c.contracts.forEach((id) => checkId(id, `${where}.contracts`));
    if (c.base !== undefined) {
      if (!isText(c.base)) fail(`${where}.base must be a contract id.`);
      checkId(c.base, `${where}.base`);
    }
  });
  if (!isObject(options)) fail("overlay.options must be an object keyed by contract id.");
  for (const [id, o] of Object.entries(options)) {
    checkId(id, "overlay.options");
    if (!isObject(o)) fail(`overlay.options.${id} must be an object.`);
    for (const key of Object.keys(o)) {
      if (!["label", "sentence"].includes(key)) fail(`overlay.options.${id} has an unknown key "${key}". Allowed: label, sentence.`);
    }
    if (o.label !== undefined && !isText(o.label)) fail(`overlay.options.${id}.label must be a non-empty string.`);
    if (o.sentence !== undefined && !isText(o.sentence)) fail(`overlay.options.${id}.sentence must be a non-empty string.`);
  }
  if (!Array.isArray(drop) || !drop.every(isText)) fail("overlay.drop must be an array of contract ids.");
  drop.forEach((id) => checkId(id, "overlay.drop"));
  return { composites, options, drop };
}

const slug = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Build the question set. Throws QuestionsError on bad input.
 * @param {object} [opts]
 * @param {string} [opts.root] kit package root (default: this package)
 * @param {string[]} [opts.only] contract ids to keep
 * @param {"component"|"pattern"} [opts.group]
 * @param {object} [opts.overlay] parsed overlay JSON
 * @param {boolean} [opts.none] add a "None of these" option
 * @param {number} [opts.useWhen] useWhen lines per description (default 2)
 * @param {number} [opts.notWhen] doNotUseWhen lines per description (default 2)
 */
export function buildQuestions({ root = defaultRoot, only, group, overlay, none = false, useWhen = 2, notWhen = 2 } = {}) {
  for (const [flag, n] of [["use-when", useWhen], ["not-when", notWhen]]) {
    if (!Number.isInteger(n) || n < 0) fail(`--${flag} must be a whole number of 0 or more.`);
  }
  if (group !== undefined && group !== "component" && group !== "pattern") {
    fail(`--group must be component or pattern, not "${group}".`);
  }
  const indexFile = join(root, "contracts/index.json");
  if (!existsSync(indexFile)) fail(`contracts are missing from this install (${indexFile}). Reinstall agentic-ds-kit.`);
  const { version } = readJson(join(root, "package.json"), "package.json");
  const index = readJson(indexFile, "contracts/index.json").filter((e) => e.group === "component" || e.group === "pattern");
  const known = new Map(index.map((e) => [e.id, e]));
  const contracts = new Map(index.map((e) => [e.id, readJson(join(root, e.path), `contract ${e.id}`)]));
  const labels = new Map(index.map((e) => [e.id, labelFor(e, contracts.get(e.id))]));

  const layer = overlay === undefined ? { composites: [], options: {}, drop: [] } : validateOverlay(overlay, known);
  if (only) only.forEach((id) => known.has(id) || fail(`--only: unknown contract id "${id}".`));
  const keep = (e) => (!only || only.includes(e.id)) && (!group || e.group === group) && !layer.drop.includes(e.id);

  const options = index.filter(keep).map((e) => {
    const contract = contracts.get(e.id);
    const extra = layer.options[e.id]?.sentence;
    const label = layer.options[e.id]?.label?.trim() ?? labels.get(e.id);
    return {
      id: e.id,
      label,
      description: describe(contract, { extra, useWhen, notWhen }),
      contracts: e.group === "pattern" ? [e.id, ...(contract.contains ?? [])] : [e.id],
      kind: e.group,
      ask: ask(label, contract.intent),
    };
  });

  for (const c of layer.composites) {
    const label = c.label.trim();
    const base = c.base ? contracts.get(c.base) : undefined;
    options.push({
      id: c.id ?? slug(label),
      label,
      description: base ? describe(base, { extra: c.sentence, useWhen, notWhen }) : sentence(c.sentence),
      contracts: [...c.contracts],
      kind: "composite",
      ask: ask(label, c.sentence),
    });
  }

  options.sort(byLabel);
  if (none) {
    options.push({
      id: "none",
      label: NONE_LABEL,
      description: "None of the other options fits the request.",
      contracts: [],
      kind: "none",
      ask: "Does the request need something none of the other options covers?",
    });
  }

  const seenLabels = new Map();
  const seenIds = new Set();
  for (const o of options) {
    const key = o.label.toLowerCase();
    if (seenLabels.has(key)) fail(`duplicate label "${o.label}" (options ${seenLabels.get(key)} and ${o.id}). Rename one in the overlay.`);
    seenLabels.set(key, o.id);
    if (seenIds.has(o.id)) fail(`duplicate option id "${o.id}". Give the composite its own id in the overlay.`);
    seenIds.add(o.id);
  }
  if (!options.length) fail("no options left after --only, --group and overlay.drop.");
  if (options.length > MAX_OPTIONS) {
    fail(`${options.length} options is more than ${MAX_OPTIONS}. Narrow with --only, --group or overlay.drop.`);
  }

  const rendered = new Set(options.flatMap((o) => o.contracts));
  const enums = [];
  for (const id of [...rendered].sort(byText)) {
    const props = contracts.get(id)?.props ?? {};
    for (const prop of Object.keys(props).sort(byText)) {
      const p = props[prop];
      if (!Array.isArray(p?.values)) continue;
      enums.push({ component: id, prop, values: [...p.values], default: p.default ?? null });
    }
  }

  return { schema: SCHEMA, kit: version, options, enums };
}

const splitIds = (value) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function toCount(value, flag) {
  if (value === undefined) return undefined;
  if (!/^\d+$/.test(value)) fail(`--${flag} must be a whole number of 0 or more.`);
  return Number(value);
}

/** CLI entry: returns the exit code. */
export function runQuestions(argv, { root = defaultRoot, cwd = process.cwd() } = {}) {
  try {
    let parsed;
    try {
      parsed = parseArgs({
        args: argv,
        allowPositionals: false,
        options: {
          only: { type: "string" },
          group: { type: "string" },
          overlay: { type: "string" },
          out: { type: "string" },
          pretty: { type: "boolean" },
          none: { type: "boolean" },
          "use-when": { type: "string" },
          "not-when": { type: "string" },
          help: { type: "boolean", short: "h" },
        },
      });
    } catch (error) {
      fail(`${error.message}\n\n${QUESTIONS_HELP}`);
    }
    const { values: o } = parsed;
    if (o.help) {
      console.log(QUESTIONS_HELP);
      return 0;
    }
    const overlay = o.overlay === undefined ? undefined : readJson(resolve(cwd, o.overlay), "overlay");
    const set = buildQuestions({
      root,
      only: o.only === undefined ? undefined : splitIds(o.only),
      group: o.group,
      overlay,
      none: Boolean(o.none),
      useWhen: toCount(o["use-when"], "use-when"),
      notWhen: toCount(o["not-when"], "not-when"),
    });
    const json = `${JSON.stringify(set, null, o.pretty ? 2 : undefined)}\n`;
    if (o.out) {
      const out = resolve(cwd, o.out);
      writeFileSync(out, json);
      console.error(`agentic-ds-kit: wrote ${o.out} (${set.options.length} options, ${set.enums.length} enums)`);
    } else {
      process.stdout.write(json);
    }
    return 0;
  } catch (error) {
    if (!(error instanceof QuestionsError)) throw error;
    console.error(`agentic-ds-kit: ${error.message}`);
    return 1;
  }
}
