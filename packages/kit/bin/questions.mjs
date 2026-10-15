/**
 * agentic-ds-kit questions: turn the kit's contracts into a neutral, closed option list
 * ("which of these views does the request need?") plus the enum props of those
 * contracts. Apps feed it to whatever decision model or LLM they use. No network,
 * no model calls, no dependencies: Node built-ins only.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

export const SCHEMA = 1;
export const MAX_OPTIONS = 255;
export const NONE_LABEL = "None of these";
export const ASK_STYLES = ["part", "strict"];
export const ENUM_MODES = ["own", "all", "none"];

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const QUESTIONS_HELP = `Usage: npx agentic-ds-kit questions [options]

Build a closed option list from the kit's contracts: one option per component and
pattern (label, description from intent / useWhen / doNotUseWhen, the contract ids
it renders, and a yes/no question), plus the enum props of those contracts. Feed it
to whatever decision model or LLM your app uses; keep thresholds and wording in app code.

Options:
  --only <id,...>         Only these contract ids (components or patterns); replaces
                          the overlay's "only" list. Composites are always kept.
  --group <group>         Only one group: component or pattern
  --overlay <file.json>   App-owned overlay: allowlist, composites, extra sentences,
                          renamed labels, replacement descriptions, dropped options
                          (see docs/questions.md)
  --use-when <n>          useWhen lines per description (default 2)
  --not-when <n>          doNotUseWhen lines per description (default 2); lines that
                          point only to components outside the option set are skipped
  --ask-style <style>     part (default): "Would <label> show part of what the request
                          asks to see?"; strict: "Does the request need <label>?"
  --enums <mode>          own (default): enum props of each option's own contract
                          (a composite's base); all: also pattern and composite parts;
                          none: empty list
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

/**
 * Generated description: intent, the overlay sentence, useWhen, doNotUseWhen.
 * `pointsOutside(line)` is true for a doNotUseWhen line that names kit components
 * none of which is in the option set; those lines are skipped before counting.
 */
function describe(contract, { extra, useWhen, notWhen, pointsOutside }) {
  const parts = [];
  if (contract?.intent) parts.push(sentence(contract.intent));
  if (extra) parts.push(sentence(extra));
  const use = (contract?.useWhen ?? []).slice(0, useWhen);
  if (use.length) parts.push(`Use when: ${use.join("; ")}.`);
  const not = (contract?.doNotUseWhen ?? []).filter((line) => !pointsOutside(line)).slice(0, notWhen);
  if (not.length) parts.push(`Not for: ${not.join("; ")}.`);
  return parts.join(" ");
}

function ask(style, label, summary) {
  const detail = summary ? ` (${clause(summary)})` : "";
  return style === "strict"
    ? `Does the request need ${label}${detail}?`
    : `Would ${label}${detail} show part of what the request asks to see?`;
}

function validateOverlay(overlay, known) {
  if (!isObject(overlay)) fail("overlay must be a JSON object with only, composites, options and/or drop.");
  for (const key of Object.keys(overlay)) {
    if (!["$comment", "only", "composites", "options", "drop"].includes(key)) {
      fail(`overlay has an unknown key "${key}". Allowed: only, composites, options, drop.`);
    }
  }
  const checkId = (id, where) => {
    if (!known.has(id)) fail(`${where}: unknown contract id "${id}". Ids are listed in contracts/index.json.`);
  };
  const { only, composites = [], options = {}, drop = [] } = overlay;
  if (only !== undefined) {
    if (!Array.isArray(only) || !only.length || !only.every(isText)) fail("overlay.only must be a non-empty array of contract ids.");
    only.forEach((id) => checkId(id, "overlay.only"));
  }
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
      if (!["label", "sentence", "description"].includes(key)) {
        fail(`overlay.options.${id} has an unknown key "${key}". Allowed: label, sentence, description.`);
      }
    }
    for (const key of ["label", "sentence", "description"]) {
      if (o[key] !== undefined && !isText(o[key])) fail(`overlay.options.${id}.${key} must be a non-empty string.`);
    }
  }
  if (!Array.isArray(drop) || !drop.every(isText)) fail("overlay.drop must be an array of contract ids.");
  drop.forEach((id) => checkId(id, "overlay.drop"));
  return { only, composites, options, drop };
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
 * @param {string[]} [opts.only] contract ids to keep (replaces overlay.only)
 * @param {"component"|"pattern"} [opts.group]
 * @param {object} [opts.overlay] parsed overlay JSON
 * @param {boolean} [opts.none] add a "None of these" option
 * @param {number} [opts.useWhen] useWhen lines per description (default 2)
 * @param {number} [opts.notWhen] doNotUseWhen lines per description (default 2)
 * @param {"part"|"strict"} [opts.askStyle] wording of `ask` (default part)
 * @param {"own"|"all"|"none"} [opts.enums] which enum props to list (default own)
 */
export function buildQuestions({
  root = defaultRoot,
  only,
  group,
  overlay,
  none = false,
  useWhen = 2,
  notWhen = 2,
  askStyle = "part",
  enums: enumMode = "own",
} = {}) {
  for (const [flag, n] of [["use-when", useWhen], ["not-when", notWhen]]) {
    if (!Number.isInteger(n) || n < 0) fail(`--${flag} must be a whole number of 0 or more.`);
  }
  if (group !== undefined && group !== "component" && group !== "pattern") {
    fail(`--group must be component or pattern, not "${group}".`);
  }
  if (!ASK_STYLES.includes(askStyle)) fail(`--ask-style must be part or strict, not "${askStyle}".`);
  if (!ENUM_MODES.includes(enumMode)) fail(`--enums must be own, all or none, not "${enumMode}".`);
  const indexFile = join(root, "contracts/index.json");
  if (!existsSync(indexFile)) fail(`contracts are missing from this install (${indexFile}). Reinstall agentic-ds-kit.`);
  const { version } = readJson(join(root, "package.json"), "package.json");
  const index = readJson(indexFile, "contracts/index.json").filter((e) => e.group === "component" || e.group === "pattern");
  const known = new Map(index.map((e) => [e.id, e]));
  const contracts = new Map(index.map((e) => [e.id, readJson(join(root, e.path), `contract ${e.id}`)]));
  const labels = new Map(index.map((e) => [e.id, labelFor(e, contracts.get(e.id))]));

  const layer = overlay === undefined ? { composites: [], options: {}, drop: [] } : validateOverlay(overlay, known);
  if (only) only.forEach((id) => known.has(id) || fail(`--only: unknown contract id "${id}".`));
  // The CLI list wins over the overlay's, so one run can try a different set without editing the file.
  const allow = only ?? layer.only;
  const keep = (e) => (!allow || allow.includes(e.id)) && (!group || e.group === group) && !layer.drop.includes(e.id);
  const kept = index.filter(keep);

  // Contracts the option set renders, and the code names that point at them ("use PieChart").
  const rendered = new Set([
    ...kept.flatMap((e) => (e.group === "pattern" ? [e.id, ...(contracts.get(e.id).contains ?? [])] : [e.id])),
    ...layer.composites.flatMap((c) => c.contracts),
  ]);
  const byName = new Map(index.map((e) => [labels.get(e.id), e.id]));
  const pointsOutside = (line) => {
    const named = [...line.matchAll(/\b[A-Z][A-Za-z0-9]*\b/g)].map(([w]) => byName.get(w)).filter(Boolean);
    return named.length > 0 && !named.some((id) => rendered.has(id));
  };
  const text = { useWhen, notWhen, pointsOutside };

  const options = kept.map((e) => {
    const contract = contracts.get(e.id);
    const o = layer.options[e.id] ?? {};
    const label = o.label?.trim() ?? labels.get(e.id);
    const description = o.description
      ? [o.description, o.sentence].filter(Boolean).map(sentence).join(" ")
      : describe(contract, { ...text, extra: o.sentence });
    return {
      id: e.id,
      label,
      description,
      contracts: e.group === "pattern" ? [e.id, ...(contract.contains ?? [])] : [e.id],
      kind: e.group,
      ask: ask(askStyle, label, o.sentence ?? o.description ?? contract.intent),
      own: [e.id],
    };
  });

  for (const c of layer.composites) {
    const label = c.label.trim();
    const base = c.base ? contracts.get(c.base) : undefined;
    options.push({
      id: c.id ?? slug(label),
      label,
      description: base ? describe(base, { ...text, extra: c.sentence }) : sentence(c.sentence),
      contracts: [...c.contracts],
      kind: "composite",
      ask: ask(askStyle, label, c.sentence),
      own: c.base ? [c.base] : [],
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
      ask:
        askStyle === "strict"
          ? "Does the request need something none of the other options covers?"
          : "Would none of the other options show any of what the request asks to see?",
      own: [],
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
  if (!options.length) fail("no options left after --only / overlay.only, --group and overlay.drop.");
  if (options.length > MAX_OPTIONS) {
    fail(`${options.length} options is more than ${MAX_OPTIONS}. Narrow with --only, --group or overlay.drop.`);
  }

  const listed = enumMode === "none" ? [] : options.flatMap((o) => (enumMode === "all" ? o.contracts : o.own));
  const enums = [];
  for (const id of [...new Set(listed)].sort(byText)) {
    const props = contracts.get(id)?.props ?? {};
    for (const prop of Object.keys(props).sort(byText)) {
      const p = props[prop];
      if (!Array.isArray(p?.values)) continue;
      enums.push({ component: id, prop, values: [...p.values], default: p.default ?? null });
    }
  }

  for (const o of options) delete o.own;
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

const WRITE_ERRORS = {
  EEXIST: "a file is in the way of a folder in that path",
  ENOTDIR: "a file is in the way of a folder in that path",
  EACCES: "permission denied",
  EPERM: "permission denied",
  EISDIR: "that path is a folder",
  EROFS: "read-only file system",
  ENOSPC: "no space left on the device",
};

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
          "ask-style": { type: "string" },
          enums: { type: "string" },
          help: { type: "boolean", short: "h" },
        },
      });
    } catch (error) {
      fail(`${error.message.replace(/\.? To specify a positional argument.*$/s, "")}. Run npx agentic-ds-kit questions --help.`);
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
      askStyle: o["ask-style"],
      enums: o.enums,
    });
    const json = `${JSON.stringify(set, null, o.pretty ? 2 : undefined)}\n`;
    if (o.out) {
      const out = resolve(cwd, o.out);
      try {
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, json);
      } catch (error) {
        const why = WRITE_ERRORS[error.code] ?? error.code ?? error.message;
        fail(`could not write ${o.out}: ${why}${error.code ? ` (${error.code})` : ""}.`);
      }
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
