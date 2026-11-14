/**
 * agentic-ds-kit inspect <url-or-file>: read a rendered page and list the kit pieces on it, by
 * level, from the data-nistha markers kit components write in inspect mode. Also checks the
 * page landmarks (one main, an h1). Plain Node, read-only.
 *
 * Default: Node fetch of the server-rendered HTML (or a local HTML file). --browser loads the page
 * in Playwright and reads the live DOM after hydration; Playwright is optional and loaded only then.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { CatalogError, listComponents } from "./catalog.mjs";
import { LEVELS } from "./levels.mjs";

export const INSPECT_ATTR = "data-nistha";
const FETCH_TIMEOUT_MS = 20_000;

export const INSPECT_HELP = `Usage: npx agentic-ds-kit inspect <url-or-file> [options]

Read a rendered page and list the kit pieces on it, grouped by level, with
counts. Also checks the page landmarks.

<url-or-file> is an http(s) URL or a local .html file.

Kit pieces are found by the ${INSPECT_ATTR}="<id>" attribute that kit components
write on their root in inspect mode. Turn it on in the app you run:
  NEXT_PUBLIC_NISTHA_INSPECT=1 npm run dev
Production builds never write it, unless NEXT_PUBLIC_NISTHA_INSPECT_FORCE=1 is
also set when the app is built. With no markers on the page, inspect says that
inspect mode may be off; that is not an error.

Landmark checks (errors):
  no-main        The page has no <main> (or role="main").
  multiple-main  The page has more than one <main>.
  no-h1          The page has no <h1>.

By default inspect fetches the HTML the server sends, without a browser, so
parts that render only in the browser (open dialogs, toasts) are not seen.
--browser loads the page in Playwright and reads the page after it hydrates.
Playwright is not installed with the kit; add it with: npm i -D playwright

Options:
  --json        Print the result as JSON
  --browser     Read the live page in Playwright instead of the server HTML
  -h, --help    Show this help

Exit codes: 0 no landmark errors, 1 one or more landmark errors, 2 inspect
could not run (for example, the URL did not answer, the file does not exist,
or --browser was set and Playwright is not installed).

Examples:
  npx agentic-ds-kit inspect http://localhost:3000
  npx agentic-ds-kit inspect http://localhost:3000/settings --json
  npx agentic-ds-kit inspect page.html
  npx agentic-ds-kit inspect http://localhost:3000 --browser`;

export class InspectError extends Error {
  constructor(message) {
    super(message);
    this.name = "InspectError";
  }
}

const isUrl = (target) => /^https?:\/\//i.test(target);

/** Drop script, style, template and comment bodies so markers in JSON payloads are not counted. */
function visibleMarkup(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
}

const TAG = /<([a-zA-Z][\w:-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>`]+))?)*)\s*\/?>/g;
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+)))?/g;

function attributes(raw) {
  const out = {};
  for (const match of raw.matchAll(ATTR)) {
    const name = match[1].toLowerCase();
    if (!(name in out)) out[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return out;
}

function decode(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Every opening tag in the visible markup: { tag, attrs }. */
function openingTags(html) {
  const tags = [];
  for (const match of visibleMarkup(html).matchAll(TAG)) {
    tags.push({ tag: match[1].toLowerCase(), attrs: attributes(match[2] ?? "") });
  }
  return tags;
}

function kitIndex() {
  const { kit, components } = listComponents();
  return { kit, byId: new Map(components.map((component) => [component.id, component])) };
}

/**
 * Inspect HTML text. `source` names the page in the result. `mode` says how it was read:
 * "html" (server HTML or a file) or "browser" (live DOM).
 */
export function inspectHtml(html, { source = "page", mode = "html" } = {}) {
  if (typeof html !== "string") throw new InspectError("html must be a string.");
  const { kit, byId } = kitIndex();
  const tags = openingTags(html);

  const counts = new Map();
  let markers = 0;
  let main = 0;
  let h1 = 0;
  for (const { tag, attrs } of tags) {
    const role = (attrs.role ?? "").toLowerCase();
    if (tag === "main" || role === "main") main += 1;
    if (tag === "h1" || (role === "heading" && attrs["aria-level"] === "1")) h1 += 1;
    const marker = attrs[INSPECT_ATTR];
    if (marker === undefined) continue;
    const ids = decode(marker).split(/\s+/).filter(Boolean);
    if (ids.length) markers += 1;
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const groups = new Map();
  const unknown = [];
  for (const [id, count] of counts) {
    const component = byId.get(id);
    if (!component) {
      unknown.push({ id, count });
      continue;
    }
    const level = component.level ?? "unknown";
    if (!groups.has(level)) groups.set(level, []);
    groups.get(level).push({ id, name: component.name, count });
  }
  // Biggest level first, the build order in AGENTS.md.
  const order = [...LEVELS].reverse();
  const levels = [...groups.keys()]
    .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
    .map((level) => {
      const pieces = groups.get(level).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
      return { level, count: pieces.reduce((sum, piece) => sum + piece.count, 0), pieces };
    });
  unknown.sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const problems = [];
  if (main === 0) {
    problems.push({ rule: "no-main", severity: "error", message: "The page has no <main>. Put the page content in one <main>." });
  } else if (main > 1) {
    problems.push({
      rule: "multiple-main",
      severity: "error",
      message: `The page has ${main} <main> elements. Keep one <main> and use <section> for the parts inside it.`,
    });
  }
  if (h1 === 0) {
    problems.push({ rule: "no-h1", severity: "error", message: "The page has no <h1>. Give the page one main heading." });
  }

  const total = levels.reduce((sum, group) => sum + group.count, 0) + unknown.reduce((sum, item) => sum + item.count, 0);
  return {
    source,
    mode,
    kit,
    inspectMode: markers > 0,
    ...(markers === 0
      ? {
          note: `No ${INSPECT_ATTR} markers on this page. Inspect mode may be off: start the app with NEXT_PUBLIC_NISTHA_INSPECT=1 (not a production build), or the page uses no kit components.`,
        }
      : {}),
    total,
    distinct: counts.size,
    levels,
    unknown,
    landmarks: { main, h1 },
    problems,
    errors: problems.filter((problem) => problem.severity === "error").length,
  };
}

async function fetchHtml(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error?.cause?.code ?? error?.cause?.errors?.[0]?.code ?? (error?.name === "TimeoutError" ? "timed out" : "");
    throw new InspectError(`could not load ${url}${reason ? ` (${reason})` : ""}. Is the app running?`);
  }
  if (!response.ok) throw new InspectError(`${url} answered ${response.status} ${response.statusText}.`);
  const type = response.headers.get("content-type") ?? "";
  if (type && !/html/i.test(type)) throw new InspectError(`${url} sent ${type}, not HTML.`);
  return response.text();
}

function readHtmlFile(file) {
  if (!existsSync(file)) throw new InspectError(`${file} does not exist.`);
  if (!statSync(file).isFile()) throw new InspectError(`${file} is a folder. Pass an .html file or a URL.`);
  if (!/\.html?$/i.test(file)) throw new InspectError(`inspect reads .html files or http(s) URLs, not ${file}.`);
  return readFileSync(file, "utf8");
}

/** Load Playwright only when asked. A missing install is an InspectError (exit 2). */
async function loadPlaywright() {
  try {
    const name = "playwright";
    return await import(name);
  } catch {
    throw new InspectError("--browser needs Playwright, which is not installed. Add it with: npm i -D playwright && npx playwright install chromium");
  }
}

async function browserHtml(target) {
  const playwright = await loadPlaywright();
  const chromium = playwright.chromium ?? playwright.default?.chromium;
  if (!chromium) throw new InspectError("Playwright is installed but has no chromium browser.");
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    throw new InspectError(`Playwright could not start a browser: ${String(error.message).split("\n")[0]}. Try: npx playwright install chromium`);
  }
  try {
    const page = await browser.newPage();
    try {
      await page.goto(target, { waitUntil: "networkidle", timeout: FETCH_TIMEOUT_MS });
    } catch (error) {
      throw new InspectError(`could not load ${target}: ${String(error.message).split("\n")[0]}`);
    }
    return await page.content();
  } finally {
    await browser.close();
  }
}

/**
 * Inspect a URL or a local HTML file. `cwd` resolves relative file paths. `browser: true` reads the
 * live DOM with Playwright.
 */
export async function inspectTarget(target, { cwd = process.cwd(), browser = false } = {}) {
  if (typeof target !== "string" || !target.trim()) throw new InspectError("name a URL or an .html file to inspect.");
  const value = target.trim();
  if (isUrl(value)) {
    const html = browser ? await browserHtml(value) : await fetchHtml(value);
    return inspectHtml(html, { source: value, mode: browser ? "browser" : "html" });
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) throw new InspectError(`inspect reads http(s) URLs or local .html files, not ${value}.`);
  const file = resolve(cwd, value);
  const html = readHtmlFile(file);
  if (browser) return inspectHtml(await browserHtml(pathToFileURL(file).href), { source: value, mode: "browser" });
  return inspectHtml(html, { source: value, mode: "html" });
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function printText(result) {
  console.log(`${result.source} (${result.mode === "browser" ? "live page in a browser" : "server HTML"})`);
  if (!result.inspectMode) {
    console.log(`\n${result.note}`);
  } else {
    console.log(`\n${plural(result.total, "kit piece")}, ${result.distinct} different.`);
    const width = Math.max(...result.levels.flatMap((group) => group.pieces.map((piece) => piece.name.length)), ...result.unknown.map((item) => item.id.length), 4);
    for (const group of result.levels) {
      console.log(`\n${group.level} (${group.count})`);
      for (const piece of group.pieces) console.log(`  ${piece.name.padEnd(width)}  ${piece.count}`);
    }
    if (result.unknown.length) {
      console.log("\nNot in this kit's index");
      for (const item of result.unknown) console.log(`  ${item.id.padEnd(width)}  ${item.count}`);
    }
  }
  console.log(`\nLandmarks: ${result.landmarks.main} <main>, ${result.landmarks.h1} <h1>.`);
  if (!result.problems.length) {
    console.log("No landmark problems.");
    return;
  }
  for (const problem of result.problems) console.log(`  ${problem.severity.padEnd(7)}  ${problem.rule.padEnd(13)}  ${problem.message}`);
  console.log(`${plural(result.errors, "error")}.`);
}

/** CLI entry. Resolves to the exit code. */
export async function runInspect(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        json: { type: "boolean" },
        browser: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (error) {
    console.error(`agentic-ds-kit: ${error.message}\n\n${INSPECT_HELP}`);
    return 2;
  }
  const { values, positionals } = parsed;
  if (values.help) {
    console.log(INSPECT_HELP);
    return 0;
  }
  if (positionals.length !== 1) {
    console.error(
      `agentic-ds-kit: ${positionals.length ? "inspect one page at a time." : "name a URL or an .html file to inspect."}\n\n${INSPECT_HELP}`,
    );
    return 2;
  }
  let result;
  try {
    result = await inspectTarget(positionals[0], { browser: Boolean(values.browser) });
  } catch (error) {
    if (!(error instanceof InspectError || error instanceof CatalogError)) throw error;
    console.error(`agentic-ds-kit: ${error.message}`);
    return 2;
  }
  if (values.json) console.log(JSON.stringify(result, null, 2));
  else printText(result);
  return result.errors > 0 ? 1 : 0;
}
