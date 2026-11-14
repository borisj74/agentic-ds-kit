/**
 * agentic-ds-kit review <path>: compare UI files with the kit's contracts and tokens and say
 * exactly what to fix. Plain Node, read-only. Rules live in ./review/rules.mjs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { loadKit } from "./review/kit.mjs";
import { COUNTED_NATIVE_TAGS, RULES, countElements, reviewSource } from "./review/rules.mjs";
import { lineIndex } from "./review/scan.mjs";

export const REVIEW_HELP = `Usage: npx agentic-ds-kit review <path> [options]

Check UI files against the kit's contracts and tokens, and say what to fix.
<path> is a file or a folder. Folders are read recursively.

Files: .tsx .ts .jsx .js .css (CSS modules too). Skipped: node_modules, dist,
.next, and token source files (tokens.css, tokens.ts).

Rules:
  raw-value     error    Hardcoded colour, spacing, radius or shadow, or a primitive
                         --color-* ramp. The fix names the closest semantic token.
  wrong-use     error    Button with href, to or as="a" (use Link); more than one
                         solid primary Button in a file; icon-only Button with no
                         aria label.
  outside-kit   error    Imports from other UI libraries (Radix, MUI, Chakra, shadcn
                         and similar), or a local copy such as components/ui/button.
  rebuild       warning  The file builds a kit organism or block by hand from its parts.
  pattern-fits  warning  The file looks like a kit pattern; start from the pattern.

Contract fit (--score): a 0-100 number for how much of the UI comes from the kit.
  UI elements are opening JSX tags: kit components count as kit; the native tags
  ${COUNTED_NATIVE_TAGS.join(", ")} count as other. Layout and text tags,
  icons and other components are not counted. CSS files add findings, not elements.
  share = kitElements / (kitElements + otherElements), or 1 with no elements
  score = share x 100, minus 5 per error and 2 per warning for every 100
          elements (screens with up to 100 elements count as 100), kept 0-100

Options:
  --json        Print the findings and the error and warning counts as JSON
  --score       Also print the contract fit score (adds "score" to --json)
  --min <n>     Exit 1 when the score is below n (0-100). Turns on --score
  --cwd <path>  Folder that <path> and the printed file names are relative to
                (default: current folder)
  -h, --help    Show this help

Exit codes: 0 no errors (warnings are fine), 1 one or more errors (or, with
--min, a score below n), 2 the review could not run (for example, the path
does not exist, or n is not a number from 0 to 100).

Examples:
  npx agentic-ds-kit review app
  npx agentic-ds-kit review app/page.tsx --json
  npx agentic-ds-kit review app --score --min 80`;

export class ReviewError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReviewError";
  }
}

const SKIP_DIRS = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTENSIONS = /\.(tsx|ts|jsx|js|css)$/i;
const TOKEN_SOURCE = /^tokens\.(css|ts|js)$/i;

/** Files `review` reads, for a path that is a file or a folder. */
export function listFiles(target) {
  if (!existsSync(target)) throw new ReviewError(`${target} does not exist.`);
  const stat = statSync(target);
  if (stat.isFile()) {
    if (!EXTENSIONS.test(target) || target.endsWith(".d.ts")) {
      throw new ReviewError(`review reads .tsx, .ts, .jsx, .js and .css files, not ${basename(target)}.`);
    }
    return [target];
  }
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (EXTENSIONS.test(entry.name) && !entry.name.endsWith(".d.ts") && !TOKEN_SOURCE.test(entry.name)) {
        out.push(full);
      }
    }
  };
  walk(target);
  return out;
}

function withIds(findings) {
  const seen = new Map();
  return findings.map((finding) => {
    const base = `${finding.rule}:${finding.file}:${finding.line}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return {
      id: n === 1 ? base : `${base}:${n}`,
      rule: finding.rule,
      severity: finding.severity,
      file: finding.file,
      line: finding.line,
      contractId: finding.contractId,
      message: finding.message,
      fix: finding.fix,
    };
  });
}

/** Review one source text. `file` is the name printed in findings; `absPath` resolves relative imports. */
export function reviewText(text, file, absPath) {
  const kit = loadKit();
  const lineOf = lineIndex(text);
  return reviewSource(kit, { file, absPath, text }).map((finding) => ({ ...finding, file, line: lineOf(finding.offset) }));
}

/** Elements in one source text, for contract fit: { kit, other }. */
export function elementsInText(text, file, absPath) {
  return countElements(loadKit(), { file, absPath, text });
}

export const SCORE_FORMULA =
  "share = kitElements / (kitElements + otherElements), or 1 when there are no countable elements; " +
  "scale = 100 / max(100, kitElements + otherElements); " +
  "value = max(0, min(100, round(100 * share - (5 * errors + 2 * warnings) * scale)))";

/** The contract fit score: { value, kitElements, otherElements, errors, warnings, formula }. */
export function contractFit({ kitElements, otherElements, errors, warnings }) {
  const total = kitElements + otherElements;
  const share = total === 0 ? 1 : kitElements / total;
  // Penalties are per 100 elements, so a big folder is not pushed to 0 by its size alone.
  // Up to 100 elements the scale is 1: each error costs 5 points and each warning 2.
  const scale = 100 / Math.max(100, total);
  const value = Math.max(0, Math.min(100, Math.round(100 * share - (5 * errors + 2 * warnings) * scale)));
  return { value, kitElements, otherElements, errors, warnings, formula: SCORE_FORMULA };
}

function summarize(findings, files, elements, { score = false } = {}) {
  const sorted = findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  const out = withIds(sorted);
  const result = {
    kit: loadKit().version,
    files,
    errors: out.filter((f) => f.severity === "error").length,
    warnings: out.filter((f) => f.severity === "warning").length,
    findings: out,
  };
  if (score) {
    result.score = contractFit({ kitElements: elements.kit, otherElements: elements.other, errors: result.errors, warnings: result.warnings });
  }
  return result;
}

const display = (cwd, file) => {
  const rel = relative(cwd, file) || basename(file);
  return rel.split(sep).join("/");
};

/**
 * Review a file or folder. Returns { kit, files, errors, warnings, findings }, plus
 * score ({ value, kitElements, otherElements, errors, warnings, formula }) when `score` is true.
 */
export function reviewPath(path, { cwd = process.cwd(), score = false } = {}) {
  if (typeof path !== "string" || !path.trim()) throw new ReviewError("path is required. Pass a file or folder, such as app.");
  const target = isAbsolute(path) ? path : resolve(cwd, path);
  const files = listFiles(target);
  const findings = [];
  const elements = { kit: 0, other: 0 };
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const name = display(cwd, file);
    findings.push(...reviewText(text, name, file));
    if (score) {
      const counted = elementsInText(text, name, file);
      elements.kit += counted.kit;
      elements.other += counted.other;
    }
  }
  return summarize(findings, files.length, elements, { score });
}

/** Review a draft that is not saved yet. `filename` picks the rules (.css or script) and names the file. */
export function reviewCode(code, filename, { cwd = process.cwd(), score = false } = {}) {
  if (typeof code !== "string") throw new ReviewError("code is required with filename.");
  if (typeof filename !== "string" || !filename.trim()) {
    throw new ReviewError("filename is required with code, such as app/page.tsx. It picks the rules and names the file.");
  }
  if (!EXTENSIONS.test(filename)) throw new ReviewError(`filename must end in .tsx, .ts, .jsx, .js or .css, not ${basename(filename)}.`);
  const absPath = isAbsolute(filename) ? filename : resolve(cwd, filename);
  const name = filename.split(sep).join("/");
  const elements = score ? elementsInText(code, name, absPath) : { kit: 0, other: 0 };
  return summarize(reviewText(code, name, absPath), 1, elements, { score });
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function printScore(score) {
  const { value, kitElements, otherElements, errors, warnings } = score;
  console.log(`\nContract fit: ${value}/100`);
  console.log(`  ${kitElements} kit element${kitElements === 1 ? "" : "s"}, ${otherElements} other, ${plural(errors, "error")}, ${plural(warnings, "warning")}.`);
  console.log("  share = kitElements / (kitElements + otherElements), or 1 when there are no countable elements");
  console.log("  scale = 100 / max(100, kitElements + otherElements)");
  console.log("  value = max(0, min(100, round(100 * share - (5 * errors + 2 * warnings) * scale)))");
}

function printText(result) {
  if (!result.findings.length) {
    console.log(`No problems found in ${result.files} file${result.files === 1 ? "" : "s"}.`);
    if (result.score) printScore(result.score);
    return;
  }
  let current = null;
  for (const f of result.findings) {
    if (f.file !== current) {
      if (current !== null) console.log("");
      console.log(f.file);
      current = f.file;
    }
    console.log(`  ${String(f.line).padStart(4)}  ${f.severity.padEnd(7)}  ${f.rule.padEnd(12)}  ${f.message}`);
    console.log(`  ${" ".repeat(4)}  ${" ".repeat(7)}  ${" ".repeat(12)}  Fix: ${f.fix}`);
  }
  console.log(`\n${plural(result.errors, "error")}, ${plural(result.warnings, "warning")} in ${plural(result.files, "file")}.`);
  if (result.score) printScore(result.score);
}

/** --min value: a number from 0 to 100, or null when it is not one. */
function parseMin(raw) {
  if (typeof raw !== "string" || !/^\s*\d+(\.\d+)?\s*$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 0 && n <= 100 ? n : null;
}

/** CLI entry. Returns the exit code. */
export function runReview(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        json: { type: "boolean" },
        score: { type: "boolean" },
        min: { type: "string" },
        cwd: { type: "string" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (error) {
    console.error(`agentic-ds-kit: ${error.message}\n\n${REVIEW_HELP}`);
    return 2;
  }
  const { values, positionals } = parsed;
  if (values.help) {
    console.log(REVIEW_HELP);
    return 0;
  }
  if (positionals.length !== 1) {
    console.error(`agentic-ds-kit: ${positionals.length ? "review one path at a time." : "name a file or folder to review."}\n\n${REVIEW_HELP}`);
    return 2;
  }
  let min = null;
  if (values.min !== undefined) {
    min = parseMin(values.min);
    if (min === null) {
      console.error(`agentic-ds-kit: --min needs a number from 0 to 100, not "${values.min}".`);
      return 2;
    }
  }
  const score = Boolean(values.score) || min !== null;
  let result;
  try {
    result = reviewPath(positionals[0], { cwd: values.cwd ? resolve(values.cwd) : process.cwd(), score });
  } catch (error) {
    console.error(`agentic-ds-kit: ${error.message}`);
    return 2;
  }
  if (values.json) console.log(JSON.stringify(result, null, 2));
  else printText(result);
  if (min !== null && result.score.value < min) {
    if (!values.json) console.log(`Contract fit ${result.score.value} is below --min ${min}.`);
    return 1;
  }
  return result.errors > 0 ? 1 : 0;
}

export { RULES };
