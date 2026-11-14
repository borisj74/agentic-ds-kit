/**
 * `add` as a function: copy a pattern's (or a chrome recipe's) source from patterns-src/ into an
 * app, with its `requires` and contract, and print the `@/` import. The CLI (`add`) and `init` call
 * it. It throws an Error with a user-facing message instead of exiting; the CLI prints it.
 * No dependencies.
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const srcRoot = join(pkgRoot, "patterns-src");

// Removes line and block comments outside strings (tsconfig allows them); strings such as the
// "@/" path key keep their slashes and stars.
function stripJsonComments(text) {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += text[i + 1] ?? "";
        i += 1;
      } else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
    } else if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
    } else out += ch;
  }
  return out;
}

/**
 * The `@/...` import for `target` when tsconfig.json (or jsconfig.json) maps "@/*", else null.
 * Reads compilerOptions.paths and baseUrl (comments and trailing commas allowed), so both
 * "@/*": ["./*"] and "@/*": ["./src/*"] resolve. Falls back to the create-next-app layout
 * (app root, or src/ when the app uses it) if the file cannot be parsed.
 */
export async function aliasImport(cwd, target) {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const file = join(cwd, name);
    if (!existsSync(file)) continue;
    const text = await readFile(file, "utf8");
    let mapped;
    let baseUrl = ".";
    try {
      const json = JSON.parse(stripJsonComments(text).replace(/,(\s*[}\]])/g, "$1"));
      baseUrl = json.compilerOptions?.baseUrl ?? ".";
      mapped = json.compilerOptions?.paths?.["@/*"]?.[0];
    } catch {
      if (!text.includes('"@/*"')) continue;
      mapped = existsSync(join(cwd, "src")) && !existsSync(join(cwd, "components")) ? "./src/*" : "./*";
    }
    if (typeof mapped !== "string" || !mapped.endsWith("*")) continue;
    const aliasRoot = resolve(cwd, baseUrl, mapped.slice(0, -1));
    const inside = relative(aliasRoot, target).split("\\").join("/");
    if (inside && !inside.startsWith("..") && !inside.startsWith("/")) return `@/${inside}`;
  }
  return null;
}

/** This install's version, from package.json. */
export async function kitVersion() {
  return JSON.parse(await readFile(join(pkgRoot, "package.json"), "utf8")).version;
}

export async function loadManifest() {
  const file = join(srcRoot, "index.json");
  if (!existsSync(file)) {
    throw new Error("pattern sources are missing from this install (patterns-src/index.json). Reinstall agentic-ds-kit.");
  }
  return JSON.parse(await readFile(file, "utf8"));
}

/** `DashboardPattern`, `dashboard-pattern`, `Dashboard` → `dashboard` */
export function normalize(name) {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-?pattern$/, "");
}

/** Manifests from before recipes have no `kind`: every entry is a pattern. */
export const kindOf = (entry) => entry.kind ?? "pattern";

/**
 * Copies one pattern or recipe (and the patterns it `requires`) into `cwd`, and logs what it did
 * and the import line through `log`. Returns { pattern, target, spec }.
 * @param {{ cwd: string, name: string, dir?: string, force?: boolean, log?: (line: string) => void, manifest?: object[] }} options
 */
export async function addPattern({ cwd, name, dir, force = false, log = console.log, manifest }) {
  manifest ??= await loadManifest();
  const id = normalize(name);
  const pattern = manifest.find((p) => p.id === id);
  if (!pattern) {
    throw new Error(
      `unknown pattern or recipe "${name}". Available: ${manifest.map((p) => p.id).join(", ")}\nRun: npx agentic-ds-kit add --list`,
    );
  }

  cwd = resolve(cwd);
  const usesSrc = existsSync(join(cwd, "src")) && !existsSync(join(cwd, "components"));
  const folder = kindOf(pattern) === "recipe" ? "components/chrome" : "components/patterns";
  const target = resolve(cwd, dir ?? join(usesSrc ? "src" : "", folder, pattern.id));

  const clashes = pattern.files.filter((file) => existsSync(join(target, file)));
  if (clashes.length && !force) {
    throw new Error(
      `${relative(cwd, target) || "."} already has ${clashes.join(", ")}. Nothing was written.\nRe-run with --force to overwrite.`,
    );
  }

  await mkdir(target, { recursive: true });
  for (const file of pattern.files) {
    await copyFile(join(srcRoot, pattern.id, file), join(target, file));
  }

  const rel = relative(cwd, target).split("\\").join("/");
  const version = await kitVersion();
  log(`Added ${pattern.id} (agentic-ds-kit ${version}) to ${rel}/`);
  for (const file of pattern.files) log(`  ${rel}/${file}${clashes.includes(file) ? "  (overwritten)" : ""}`);
  // A pattern that builds on others (manifest `requires`) imports them as `../<id>`: copy each
  // one beside the target unless that folder is already there (you own it; --force does not touch it).
  const added = new Set([pattern.id]);
  async function addRequired(entry) {
    for (const depId of entry.requires ?? []) {
      if (added.has(depId)) continue;
      added.add(depId);
      const dep = manifest.find((p) => p.id === depId);
      if (!dep) throw new Error(`${entry.id} requires "${depId}", which is missing from this install. Reinstall agentic-ds-kit.`);
      const depTarget = join(dirname(target), depId);
      const depRel = relative(cwd, depTarget).split("\\").join("/");
      if (existsSync(depTarget)) {
        log(`  ${depRel}/  (kept: ${entry.id} imports it as ../${depId})`);
      } else {
        await mkdir(depTarget, { recursive: true });
        for (const file of dep.files) await copyFile(join(srcRoot, dep.id, file), join(depTarget, file));
        log(`Added ${dep.id} to ${depRel}/ (${entry.id} imports it as ../${depId})`);
        for (const file of dep.files) log(`  ${depRel}/${file}`);
      }
      await addRequired(dep);
    }
  }
  await addRequired(pattern);
  // Copies from 0.4.5 and earlier have Foo.module.css; the new Foo.tsx imports Foo.css instead.
  const stale = pattern.files
    .filter((f) => f.endsWith(".css"))
    .map((f) => f.replace(/\.css$/, ".module.css"))
    .filter((f) => existsSync(join(target, f)));
  if (stale.length) {
    log(`\nNo longer imported (patterns now use plain CSS); delete them once any edits are moved over:`);
    for (const file of stale) log(`  ${rel}/${file}`);
  }
  const spec = (await aliasImport(cwd, target)) ?? rel;
  const contracts = pattern.files.filter((f) => f.endsWith(".contract.json")).join(", ");
  const rules =
    kindOf(pattern) === "pattern"
      ? "agents follow its `must` lines (kit look and accessibility); its `defaults` are\nsuggestions you can change"
      : "agents keep the kit rules (tokens, one primary Button, kit components only)";
  log(`
Use it:
  import { ${pattern.name} } from "${spec}";

You own these files now; edit them freely. Keep ${contracts} next to
them so ${rules}.`);
  return { pattern, target, spec };
}
