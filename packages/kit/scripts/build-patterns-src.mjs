/**
 * Copies ui/patterns/<Name>Pattern/ into patterns-src/<id>/ for `agentic-ds-kit add`.
 * Kit-relative imports (`../../Button`, `../../shared/chartMath`) become one import
 * from "agentic-ds-kit", so the copied files compile inside a user's app.
 * Writes patterns-src/index.json: id, export name, intent, files.
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const patternsDir = join(root, "ui/patterns");
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

const KIT_IMPORT = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+"(\.\.\/[^"]+)";\n/gm;

function rewriteImports(source, file) {
  const values = [];
  const types = [];
  let firstAt = -1;
  const stripped = source.replace(KIT_IMPORT, (_match, typeOnly, names, spec, offset) => {
    if (!/^\.\.\/\.\.\/(?:[A-Z][A-Za-z]*|shared\/[A-Za-z]+)$/.test(spec)) {
      throw new Error(`${file}: cannot map import "${spec}" to agentic-ds-kit`);
    }
    for (const raw of names.split(",")) {
      const name = raw.trim();
      if (!name) continue;
      const isType = Boolean(typeOnly) || name.startsWith("type ");
      const bare = name.replace(/^type\s+/, "");
      if (spec.startsWith("../../shared/") && !new RegExp(`\\b${bare}\\b`).test(publicBarrel)) {
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

  manifest.push({ id, name: dirName, intent: entry.intent, files });
}

await writeFile(join(outDir, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`patterns-src: ${manifest.length} patterns`);
