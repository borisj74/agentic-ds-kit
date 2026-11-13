/**
 * agentic-ds-kit init <folder> [--template <pattern-id>] [--force]: a new Next app (App Router,
 * TypeScript) in <folder> that starts from a pattern, or from a blank page. Writes the files in
 * templates/next-app/, then copies the pattern in with addPattern (same as `add`). No network,
 * no npm install. No dependencies.
 */
import { existsSync, readdirSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { addPattern, kindOf, kitVersion, loadManifest, normalize, pkgRoot, srcRoot } from "./add.mjs";

const templateRoot = join(pkgRoot, "templates", "next-app");

export const INIT_HELP = `Usage: npx agentic-ds-kit init <folder> [options]

Start a new Next app in <folder> from a working screen (a pattern) instead of
a blank page. Nothing is installed and nothing is downloaded: run npm install
yourself afterwards.

Options:
  --template <id>  Pattern to start from, e.g. dashboard (default: a blank page).
                   See the list: npx agentic-ds-kit add --list
  --force          Use a folder that already has files: only write files that
                   are not there yet, and list the ones skipped
  -h, --help       Show this help

Example:
  npx agentic-ds-kit init my-app --template dashboard`;

/** Template files whose name gets a leading dot when written (npm drops a packed .gitignore). */
const DOTFILES = new Set(["gitignore", "mcp.json"]);

/** Every file under templates/next-app/, as paths relative to it. */
async function templateFiles(dir = templateRoot, prefix = "") {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await templateFiles(join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out.sort();
}

/** `layout.tsx.tmpl` → `layout.tsx`, `gitignore.tmpl` → `.gitignore`. */
function outputName(rel) {
  const path = rel.replace(/\.tmpl$/, "");
  const name = basename(path);
  return DOTFILES.has(name) ? join(dirname(path), `.${name}`) : path;
}

const fill = (text, vars) => text.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? vars[key] : match));

/** A valid npm package name from the folder name: `My App` → `my-app`. */
function packageName(folder) {
  const name = basename(folder)
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^[._-]+|-+$/g, "");
  return name || "my-app";
}

/**
 * How app/page.tsx holds the pattern, read from the pattern's own source and contract `must` lines
 * ("Render inside a main landmark"):
 * - "own-main": it renders its own <main> (onboarding, settings); render it as is.
 * - "shell": app-shell is chrome (header + nav) around page content; the content goes in <main>.
 * - "section": its root is a kit Section (a block for one area of a page); <main> gets the kit
 *   canvas and content classes around it.
 * - "main": anything else (a whole page body); wrap it in <main>.
 */
async function placement(pattern) {
  const source = await readFile(join(srcRoot, pattern.id, `${pattern.name}.tsx`), "utf8");
  if (/<main[\s>]/.test(source)) return "own-main";
  if (pattern.id === "app-shell") return "shell";
  const body = source.slice(source.indexOf(`export function ${pattern.name}`));
  if (/return \(\s*<Section[\s>]/.test(body)) return "section";
  return "main";
}

const NEXT_STEP = "Open this folder in Claude or Cursor and ask for your first screen.";

function blankPage(title) {
  return `import { PageHeader } from "agentic-ds-kit";

export default function Page() {
  return (
    <main className="layout-canvas">
      <div className="layout-header">
        <PageHeader title=${JSON.stringify(title)} subtitle=${JSON.stringify(NEXT_STEP)} />
      </div>
    </main>
  );
}
`;
}

function patternPage(pattern, how, title) {
  const spec = `@/components/patterns/${pattern.id}`;
  const tag = `<${pattern.name} />`;
  if (how === "shell") {
    // The shell is chrome only: a side nav (a Drawer on small screens) around the page's <main>.
    return `import { PageHeader } from "agentic-ds-kit";
import { ${pattern.name} } from "${spec}";

export default function Page() {
  return (
    <${pattern.name}
      className="layout-shell--viewport"
      nav={{ title: ${JSON.stringify(title)}, items: [{ id: "home", label: "Home", icon: "House", active: true }] }}
    >
      <main className="layout-canvas">
        <div className="layout-header">
          <PageHeader title="Home" subtitle=${JSON.stringify(NEXT_STEP)} />
        </div>
      </main>
    </${pattern.name}>
  );
}
`;
  }
  const body =
    how === "own-main"
      ? `    ${tag}`
      : how === "section"
        ? `    <main className="layout-canvas">
      <div className="layout-content">
        ${tag}
      </div>
    </main>`
        : `    <main>
      ${tag}
    </main>`;
  return `import { ${pattern.name} } from "${spec}";

export default function Page() {
  return (
${body}
  );
}
`;
}

function fail(message) {
  console.error(`agentic-ds-kit: ${message}`);
  return 1;
}

/** Runs `init`; returns the exit code. */
export async function runInit(argv, { cwd = process.cwd(), log = console.log } = {}) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        template: { type: "string", short: "t" },
        force: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (error) {
    return fail(`${error.message}\n\n${INIT_HELP}`);
  }
  const { values: opts, positionals } = parsed;
  if (opts.help) {
    log(INIT_HELP);
    return 0;
  }
  if (positionals.length !== 1) {
    return fail(`${positionals.length ? "name one folder." : "name the folder for the new app."}\n\n${INIT_HELP}`);
  }

  let manifest;
  try {
    manifest = await loadManifest();
  } catch (error) {
    return fail(error.message);
  }
  const patterns = manifest.filter((p) => kindOf(p) === "pattern");

  let pattern = null;
  if (opts.template !== undefined) {
    pattern = patterns.find((p) => p.id === normalize(opts.template)) ?? null;
    if (!pattern) {
      const list = patterns.map((p) => `  ${p.id}`).join("\n");
      return fail(
        `unknown template "${opts.template}". Pick one of these patterns:\n\n${list}\n\nWhat each one is: npx agentic-ds-kit add --list`,
      );
    }
  }

  const folder = positionals[0];
  const root = resolve(cwd, folder);
  if (existsSync(root) && readdirSync(root).length && !opts.force) {
    return fail(`${folder} already exists and is not empty. Nothing was written.\nPick a new folder, or re-run with --force to add only the files that are missing.`);
  }

  const title = basename(root);
  const version = await kitVersion();
  const vars = {
    packageName: packageName(root),
    title,
    kitVersion: version,
    startingPoint: pattern ? `the ${pattern.id} pattern` : "a blank page",
  };

  // Each file: [path in the app, text]. Rules files come from this package, unchanged.
  const files = [];
  for (const rel of await templateFiles()) {
    files.push([outputName(rel), fill(await readFile(join(templateRoot, rel), "utf8"), vars)]);
  }
  files.push(["app/page.tsx", pattern ? patternPage(pattern, await placement(pattern), title) : blankPage(title)]);

  const written = [];
  const skipped = [];
  for (const [rel, text] of files) {
    const file = join(root, rel);
    if (existsSync(file)) {
      skipped.push(rel);
      continue;
    }
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, text);
    written.push(rel);
  }
  for (const rel of ["AGENTS.md", "CLAUDE.md"]) {
    if (existsSync(join(root, rel))) {
      skipped.push(rel);
      continue;
    }
    await copyFile(join(pkgRoot, rel), join(root, rel));
    written.push(rel);
  }

  log(`Created ${title} (agentic-ds-kit ${version}) in ${relative(cwd, root) || "."}/`);
  for (const rel of written.sort()) log(`  ${rel}`);

  if (pattern) {
    // Same copy as `add`: the pattern, its contract, and any patterns it requires.
    const lines = [];
    try {
      await addPattern({ cwd: root, name: pattern.id, manifest, log: (line) => lines.push(line) });
      for (const line of lines) if (line.startsWith("Added ")) log(line.replace(/ \(agentic-ds-kit [^)]+\)/, ""));
    } catch (error) {
      if (!opts.force) return fail(error.message);
      skipped.push(`components/patterns/${pattern.id}/ (already there, kept)`);
    }
  }

  if (skipped.length) {
    log(`\nSkipped (already there, not changed):`);
    for (const rel of skipped.sort()) log(`  ${rel}`);
  }

  const cd = relative(cwd, root) || ".";
  log(`
Next steps:
  cd ${/\s/.test(cd) ? JSON.stringify(cd) : cd}
  npm install
  npm run dev

Then open the folder in Claude or Cursor and ask for a change in your own words.`);
  return 0;
}
