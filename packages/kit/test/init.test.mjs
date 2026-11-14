/**
 * CLI `init`: a new Next app in a temp folder for every pattern (and a blank one), the pattern copied
 * in with its contract and `requires`, the right import in app/page.tsx, this kit's version in
 * package.json and the repo's next / react majors. No network: nothing is installed.
 * `init` reads patterns-src, which the kit build writes; `npm test` builds first.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../bin/agentic-ds-kit.mjs", import.meta.url));
const readJson = (url) => JSON.parse(readFileSync(url, "utf8"));
const { version } = readJson(new URL("../package.json", import.meta.url));
const repoRoot = readJson(new URL("../../../package.json", import.meta.url));
const manifest = readJson(new URL("../patterns-src/index.json", import.meta.url));
const patterns = manifest.filter((entry) => (entry.kind ?? "pattern") === "pattern");
const root = mkdtempSync(join(tmpdir(), "kit-init-"));
after(() => rmSync(root, { recursive: true, force: true }));

const run = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd: root });
const runFail = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd: root });
const major = (range) => Number(/\d+/.exec(range)[0]);

const APP_FILES = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  ".gitignore",
  ".mcp.json",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "app/layout.tsx",
  "app/icons-on-demand.tsx",
  "app/page.tsx",
];

function assertApp(dir) {
  for (const file of APP_FILES) assert.ok(existsSync(join(dir, file)), `${file} is missing`);
  const layout = readFileSync(join(dir, "app/layout.tsx"), "utf8");
  assert.match(layout, /import "agentic-ds-kit\/tokens\.css";/);
  assert.match(layout, /import "agentic-ds-kit\/layout\.css";/);
  assert.match(layout, /<html lang="en">/);
  const tsconfig = readJson(new URL(`file://${join(dir, "tsconfig.json")}`));
  assert.deepEqual(tsconfig.compilerOptions.paths["@/*"], ["./*"]);
  const mcp = readJson(new URL(`file://${join(dir, ".mcp.json")}`));
  assert.deepEqual(mcp.mcpServers["agentic-ds-kit"].args.slice(-2), ["agentic-ds-kit", "mcp"]);
  const kit = fileURLToPath(new URL("..", import.meta.url));
  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), readFileSync(join(kit, "AGENTS.md"), "utf8"));
  assert.equal(readFileSync(join(dir, "CLAUDE.md"), "utf8"), readFileSync(join(kit, "CLAUDE.md"), "utf8"));
}

describe("agentic-ds-kit init", () => {
  for (const pattern of patterns) {
    test(`--template ${pattern.id} writes an app that renders ${pattern.name}`, () => {
      const dir = join(root, `app-${pattern.id}`);
      const out = run("init", `app-${pattern.id}`, "--template", pattern.id);
      assert.match(out, /npm install/);
      assertApp(dir);

      const page = readFileSync(join(dir, "app/page.tsx"), "utf8");
      assert.match(page, new RegExp(`import \\{ (?:[\\w, ]+, )?${pattern.name} \\} from "@/components/patterns/${pattern.id}";`));
      assert.match(page, new RegExp(`<${pattern.name}[\\s/>]`));
      // One main landmark: the page's, or the pattern's own.
      const source = readFileSync(join(dir, "components/patterns", pattern.id, `${pattern.name}.tsx`), "utf8");
      const ownMain = /<main[\s>]/.test(source);
      assert.equal(/<main[\s>]/.test(page), !ownMain, "page.tsx wraps the pattern in <main> unless the pattern has its own");

      const target = join(dir, "components/patterns", pattern.id);
      for (const file of pattern.files) assert.ok(existsSync(join(target, file)), `${pattern.id}/${file} is missing`);
      assert.ok(existsSync(join(target, `${pattern.id}.contract.json`)), "contract sits beside the pattern");
      for (const dep of pattern.requires ?? []) {
        const entry = manifest.find((p) => p.id === dep);
        for (const file of entry.files) {
          assert.ok(existsSync(join(dir, "components/patterns", dep, file)), `required ${dep}/${file} is missing`);
        }
      }
    });
  }

  test("--template settings hosts the pattern in the app-shell example, as its contract asks", () => {
    const dir = join(root, "app-settings");
    const page = readFileSync(join(dir, "app/page.tsx"), "utf8");
    assert.match(page, /import \{ AppShellPattern \} from "@\/components\/patterns\/app-shell";/);
    assert.match(page, /import \{ SETTINGS_SECTIONS, SettingsPattern \} from "@\/components\/patterns\/settings";/);
    assert.match(page, /className="layout-shell--inset layout-shell--viewport"/);
    assert.match(page, /label: `Settings · \$\{SETTINGS_SECTIONS\.length\}`/);
    assert.match(page, /active: item\.id === section/);
    assert.ok(existsSync(join(dir, "components/patterns/app-shell/app-shell.contract.json")), "app-shell is copied too");
  });

  test("accepts the same name forms as add", () => {
    run("init", "named", "--template", "DashboardPattern");
    assert.match(readFileSync(join(root, "named/app/page.tsx"), "utf8"), /from "@\/components\/patterns\/dashboard"/);
  });

  test("without --template writes a blank page with a PageHeader in <main>", () => {
    run("init", "blank");
    const dir = join(root, "blank");
    assertApp(dir);
    const page = readFileSync(join(dir, "app/page.tsx"), "utf8");
    assert.match(page, /import \{ PageHeader \} from "agentic-ds-kit";/);
    assert.match(page, /<main className="layout-canvas">/);
    assert.ok(!existsSync(join(dir, "components")));
  });

  test("package.json uses this kit's version and the repo's next / react majors", () => {
    run("init", "Version Check");
    const pkg = readJson(new URL(`file://${join(root, "Version Check", "package.json")}`));
    assert.equal(pkg.name, "version-check");
    assert.equal(pkg.private, true);
    assert.deepEqual(Object.keys(pkg.scripts).sort(), ["build", "dev", "start"]);
    assert.equal(pkg.dependencies["agentic-ds-kit"], `^${version}`);
    for (const name of ["next", "react", "react-dom"]) {
      assert.equal(major(pkg.dependencies[name]), major(repoRoot.dependencies[name]), `${name} major`);
    }
    for (const name of ["typescript", "@types/node", "@types/react", "@types/react-dom"]) {
      assert.ok(pkg.devDependencies[name], `${name} in devDependencies`);
    }
  });

  test("refuses a folder that is not empty, unless --force (then it only adds missing files)", () => {
    const dir = join(root, "busy");
    mkdirSync(dir);
    writeFileSync(join(dir, "README.md"), "mine\n");
    const result = runFail("init", "busy", "--template", "dashboard");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /already exists and is not empty/);
    assert.ok(!existsSync(join(dir, "package.json")), "nothing written");

    const out = run("init", "busy", "--template", "dashboard", "--force");
    assert.match(out, /Skipped[^\n]*\n\s+README\.md/);
    assert.equal(readFileSync(join(dir, "README.md"), "utf8"), "mine\n");
    assert.ok(existsSync(join(dir, "package.json")));
    assert.ok(existsSync(join(dir, "components/patterns/dashboard/dashboard.contract.json")));
  });

  test("an unknown template fails and lists the patterns (not recipes)", () => {
    const result = runFail("init", "nope", "--template", "app-header");
    assert.equal(result.status, 1);
    for (const pattern of patterns) assert.match(result.stderr, new RegExp(`^  ${pattern.id}$`, "m"));
    assert.ok(!/^ {2}app-header$/m.test(result.stderr));
    assert.ok(!existsSync(join(root, "nope")));
  });

  test("needs a folder", () => {
    const result = runFail("init");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /name the folder/);
  });
});
