/**
 * Copies pattern sources into patterns-src/<id>/ for `agentic-ds-kit add`:
 * - patterns/<Name>Pattern/: every pattern (app-shell, sign-in, dashboard, inbox, …). Copy-in
 *   examples only; not in dist.
 * - the RECIPES below (component presets rebuilt from their blocks, in recipes/).
 * Kit-relative imports (`../../ui/Button`, `../../ui/shared/chartMath`) become one import from
 * "agentic-ds-kit", so the copied files compile inside a user's app.
 * Writes patterns-src/index.json: id, kind (pattern | recipe), export name, intent, files.
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "patterns-src");
const contractIndex = JSON.parse(await readFile(join(root, "contracts/index.json"), "utf8"));
const publicBarrel = await readFile(join(root, "src/index.ts"), "utf8");

/** `AssistantWorkspacePattern` → `assistant-workspace` */
function toId(dirName) {
  return dirName
    .replace(/Pattern$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Component presets rebuilt from their blocks. `add <id>` copies recipes/<dir>/ plus the
 * listed component contracts, so agents keep the kit rules in the copy.
 */
const RECIPES = [
  {
    id: "app-header",
    dir: "AppHeaderRecipe",
    name: "ShellHeader",
    contracts: ["appheader"],
    intent: "AppHeader preset built from AppHeader.Root / Brand / Title / Search / Actions. Standalone; pass menuButton to host it in app-shell.",
  },
  {
    id: "side-nav",
    dir: "SideNavRecipe",
    name: "ShellNav",
    contracts: ["sidenav"],
    intent: "SideNav built from SideNavRoot / Header / Brand / Toggle / Nav / Section / Item / Footer. Standalone closeable rail; pass placement to host it in app-shell's rail or Drawer.",
  },
];

const KIT_IMPORT = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+"(\.\.\/[^"]+)";\n/gm;
/** Patterns and recipes sit in patterns/ and recipes/ (beside ui/) and import `../../ui/<Name>`. */
const KIT_SPEC = /^\.\.\/\.\.\/ui\/(?:[A-Z][A-Za-z]*|shared\/[A-Za-z]+)$/;

function rewriteImports(source, file) {
  const values = [];
  const types = [];
  let firstAt = -1;
  const stripped = source.replace(KIT_IMPORT, (_match, typeOnly, names, spec, offset) => {
    if (!KIT_SPEC.test(spec)) {
      throw new Error(`${file}: cannot map import "${spec}" to agentic-ds-kit`);
    }
    for (const raw of names.split(",")) {
      const name = raw.trim();
      if (!name) continue;
      const isType = Boolean(typeOnly) || name.startsWith("type ");
      const bare = name.replace(/^type\s+/, "");
      if (/^\.\.\/\.\.\/ui\/shared\//.test(spec) && !new RegExp(`\\b${bare}\\b`).test(publicBarrel)) {
        throw new Error(`${file}: ${bare} from "${spec}" is not exported by src/index.ts`);
      }
      (isType ? types : values).push(bare);
    }
    if (firstAt === -1) firstAt = offset;
    return "";
  });
  if (/from\s+"\.\.\//.test(stripped)) {
    throw new Error(`${file}: unmapped import outside the pattern folder`);
  }
  if (firstAt === -1) return source;
  const specifiers = [
    ...[...new Set(values)].sort(),
    ...[...new Set(types)].filter((t) => !values.includes(t)).sort().map((t) => `type ${t}`),
  ];
  const merged =
    specifiers.join(", ").length > 80
      ? `import {\n${specifiers.map((s) => `  ${s},`).join("\n")}\n} from "agentic-ds-kit";\n`
      : `import { ${specifiers.join(", ")} } from "agentic-ds-kit";\n`;
  return stripped.slice(0, firstAt) + merged + stripped.slice(firstAt);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const manifest = [];
const patternsDir = join(root, "patterns");
const dirs = (await readdir(patternsDir, { withFileTypes: true }))
  .filter((ent) => ent.isDirectory() && ent.name.endsWith("Pattern"))
  .map((ent) => ent.name)
  .sort();

for (const dirName of dirs) {
  const id = toId(dirName);
  const entry = contractIndex.find((c) => c.group === "pattern" && c.id === id);
  if (!entry) throw new Error(`${dirName}: no pattern contract with id "${id}" in contracts/index.json`);

  const target = join(outDir, id);
  await mkdir(target, { recursive: true });
  const files = [];
  for (const file of (await readdir(join(patternsDir, dirName))).sort()) {
    const from = join(patternsDir, dirName, file);
    if (/\.(tsx?|jsx?)$/.test(file)) {
      const source = await readFile(from, "utf8");
      await writeFile(join(target, file), rewriteImports(source, `${dirName}/${file}`));
    } else {
      await cp(from, join(target, file));
    }
    files.push(file);
  }
  await cp(join(root, entry.path), join(target, `${id}.contract.json`));
  files.push(`${id}.contract.json`);

  manifest.push({ id, kind: "pattern", name: dirName, intent: entry.intent, files });
}

for (const recipe of RECIPES) {
  const source = join(root, "recipes", recipe.dir);
  const target = join(outDir, recipe.id);
  await mkdir(target, { recursive: true });
  const files = [];
  for (const file of (await readdir(source)).sort()) {
    const from = join(source, file);
    if (/\.(tsx?|jsx?)$/.test(file)) {
      const text = await readFile(from, "utf8");
      await writeFile(join(target, file), rewriteImports(text, `recipes/${recipe.dir}/${file}`));
    } else {
      await cp(from, join(target, file));
    }
    files.push(file);
  }
  for (const contractId of recipe.contracts) {
    const entry = contractIndex.find((c) => c.group !== "pattern" && c.id === contractId);
    if (!entry) throw new Error(`recipe ${recipe.id}: no component contract "${contractId}" in contracts/index.json`);
    await cp(join(root, entry.path), join(target, `${contractId}.contract.json`));
    files.push(`${contractId}.contract.json`);
  }
  manifest.push({ id: recipe.id, kind: "recipe", name: recipe.name, intent: recipe.intent, files });
}

await writeFile(join(outDir, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
const count = (kind) => manifest.filter((m) => m.kind === kind).length;
console.log(`patterns-src: ${count("pattern")} patterns, ${count("recipe")} recipes`);
