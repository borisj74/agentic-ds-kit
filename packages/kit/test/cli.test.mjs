/**
 * CLI: `--version`, and `add` printing the "@/..." import from the app's tsconfig paths
 * (comments allowed, root or src/ alias, baseUrl), with the folder path when there is no alias.
 * `add` reads patterns-src, which the kit build writes; `npm test` builds first.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../bin/agentic-ds-kit.mjs", import.meta.url));
const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const root = mkdtempSync(join(tmpdir(), "kit-cli-"));
after(() => rmSync(root, { recursive: true, force: true }));

const run = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: "utf8" });

function app(name, files) {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    writeFileSync(join(dir, file), text);
  }
  return dir;
}

describe("agentic-ds-kit CLI", () => {
  test("--version and -v print the package version", () => {
    assert.equal(run("--version").trim(), version);
    assert.equal(run("-v").trim(), version);
    assert.equal(run("add", "--version").trim(), version);
  });

  test("add prints the @/ import for a root alias in a commented tsconfig", () => {
    const cwd = app("root-alias", {
      "tsconfig.json": '{\n  // Next app\n  "compilerOptions": { /* paths */ "paths": { "@/*": ["./*"] }, },\n}\n',
    });
    assert.match(run("add", "dashboard", "--cwd", cwd), /import \{ DashboardPattern \} from "@\/components\/patterns\/dashboard";/);
  });

  test("add prints the @/ import for a src/ alias with baseUrl", () => {
    const cwd = app("src-alias", {
      "tsconfig.json": '{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }',
      "src/app/page.tsx": "export default function Page() { return null; }\n",
    });
    const out = run("add", "dashboard", "--cwd", cwd);
    assert.match(out, /to src\/components\/patterns\/dashboard\//);
    assert.match(out, /from "@\/components\/patterns\/dashboard";/);
  });

  test("add reads jsconfig.json too", () => {
    const cwd = app("js-alias", { "jsconfig.json": '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }' });
    assert.match(run("add", "dashboard", "--cwd", cwd), /from "@\/components\/patterns\/dashboard";/);
  });

  test("add falls back to the folder path without an @/ alias", () => {
    const cwd = app("no-alias", { "package.json": "{}" });
    assert.match(run("add", "dashboard", "--cwd", cwd), /from "components\/patterns\/dashboard";/);
  });
});
