/**
 * agentic-ds-kit review <path>: compare UI files with the kit's contracts and tokens and say
 * exactly what to fix. Plain Node, read-only. Rules live in ./review/rules.mjs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import { loadKit } from "./review/kit.mjs";
import { RULES, reviewSource } from "./review/rules.mjs";
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

Options:
  --json        Print the findings and the error and warning counts as JSON
  --cwd <path>  Folder that <path> and the printed file names are relative to
                (default: current folder)
  -h, --help    Show this help

Exit codes: 0 no errors (warnings are fine), 1 one or more errors,
2 the review could not run (for example, the path does not exist).

Examples:
  npx agentic-ds-kit review app
  npx agentic-ds-kit review app/page.tsx --json`;

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

function summarize(findings, files) {
  const sorted = findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  const out = withIds(sorted);
  return {
    kit: loadKit().version,
    files,
    errors: out.filter((f) => f.severity === "error").length,
    warnings: out.filter((f) => f.severity === "warning").length,
    findings: out,
  };
}

const display = (cwd, file) => {
  const rel = relative(cwd, file) || basename(file);
  return rel.split(sep).join("/");
};

/** Review a file or folder. Returns { kit, files, errors, warnings, findings }. */
export function reviewPath(path, { cwd = process.cwd() } = {}) {
  if (typeof path !== "string" || !path.trim()) throw new ReviewError("path is required. Pass a file or folder, such as app.");
  const target = isAbsolute(path) ? path : resolve(cwd, path);
  const files = listFiles(target);
  const findings = [];
  for (const file of files) findings.push(...reviewText(readFileSync(file, "utf8"), display(cwd, file), file));
  return summarize(findings, files.length);
}

/** Review a draft that is not saved yet. `filename` picks the rules (.css or script) and names the file. */
export function reviewCode(code, filename, { cwd = process.cwd() } = {}) {
  if (typeof code !== "string") throw new ReviewError("code is required with filename.");
  if (typeof filename !== "string" || !filename.trim()) {
    throw new ReviewError("filename is required with code, such as app/page.tsx. It picks the rules and names the file.");
  }
  if (!EXTENSIONS.test(filename)) throw new ReviewError(`filename must end in .tsx, .ts, .jsx, .js or .css, not ${basename(filename)}.`);
  const absPath = isAbsolute(filename) ? filename : resolve(cwd, filename);
  return summarize(reviewText(code, filename.split(sep).join("/"), absPath), 1);
}

function printText(result) {
  if (!result.findings.length) {
    console.log(`No problems found in ${result.files} file${result.files === 1 ? "" : "s"}.`);
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
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  console.log(`\n${plural(result.errors, "error")}, ${plural(result.warnings, "warning")} in ${plural(result.files, "file")}.`);
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
  let result;
  try {
    result = reviewPath(positionals[0], { cwd: values.cwd ? resolve(values.cwd) : process.cwd() });
  } catch (error) {
    console.error(`agentic-ds-kit: ${error.message}`);
    return 2;
  }
  if (values.json) console.log(JSON.stringify(result, null, 2));
  else printText(result);
  return result.errors > 0 ? 1 : 0;
}

export { RULES };
