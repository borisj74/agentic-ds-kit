import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildChangelog, parseSections } from "./changelog.mjs";

const HEAD = "# Changelog\n\nIntro.\n\n";
const OLD = "## [0.1.0] - 2026-01-01\n\n### Added\n\n- First release\n";

test("entries land under a new version heading in Keep a Changelog order", () => {
  const before = `${HEAD}## [Unreleased]\n\n${OLD}`;
  const after = buildChangelog(
    before,
    [
      { name: "b.md", text: "### Fixed\n\n- Fix B\n" },
      { name: "a.md", text: "### Changed\n\n- Change A\n\n### Added\n\n- Add A\n" },
    ],
    "0.2.0",
    "2026-02-02",
  );
  assert.equal(
    after,
    `${HEAD}## [Unreleased]\n\n## [0.2.0] - 2026-02-02\n\n### Added\n\n- Add A\n\n### Changed\n\n- Change A\n\n### Fixed\n\n- Fix B\n\n${OLD}`,
  );
});

test("entries already under [Unreleased] come first and [Unreleased] is left empty", () => {
  const before = `${HEAD}## [Unreleased]\n\n### Changed\n\n- Old change\n\n${OLD}`;
  const after = buildChangelog(before, [{ name: "x.md", text: "### Changed\n- New change\n" }], "0.2.0", "2026-02-02");
  assert.match(after, /## \[Unreleased\]\n\n## \[0\.2\.0\] - 2026-02-02\n\n### Changed\n\n- Old change\n- New change\n\n## \[0\.1\.0\]/);
});

test("a wrapped bullet keeps its continuation line", () => {
  const sections = parseSections("### Added\n\n- One\n  still one\n- Two\n", "t");
  assert.deepEqual(sections, { Added: ["- One", "  still one", "- Two"] });
});

test("bad input is refused with the file name", () => {
  const before = `${HEAD}## [Unreleased]\n\n${OLD}`;
  assert.throws(() => buildChangelog(before, [{ name: "x.md", text: "### Improved\n- y\n" }], "0.2.0", "2026-02-02"), /changes\/x\.md: unknown section/);
  assert.throws(() => buildChangelog(before, [{ name: "x.md", text: "- no heading\n" }], "0.2.0", "2026-02-02"), /changes\/x\.md: text before/);
  assert.throws(() => buildChangelog(before, [{ name: "x.md", text: "### Added\n" }], "0.2.0", "2026-02-02"), /changes\/x\.md has no entry lines/);
  assert.throws(() => buildChangelog(before, [], "0.2.0", "2026-02-02"), /Nothing to release/);
  assert.throws(() => buildChangelog(before, [{ name: "x.md", text: "### Added\n- y\n" }], "0.1.0", "2026-02-02"), /already has a \[0\.1\.0\]/);
  assert.throws(() => buildChangelog(before, [{ name: "x.md", text: "### Added\n- y\n" }], "next", "2026-02-02"), /not a version/);
});

test("the CLI writes CHANGELOG.md, deletes the entries and keeps the README", () => {
  const root = mkdtempSync(join(tmpdir(), "changelog-"));
  mkdirSync(join(root, "scripts"));
  mkdirSync(join(root, "changes"));
  mkdirSync(join(root, "packages/kit"), { recursive: true });
  copyFileSync(join(dirname(fileURLToPath(import.meta.url)), "changelog.mjs"), join(root, "scripts/changelog.mjs"));
  writeFileSync(join(root, "packages/kit/package.json"), JSON.stringify({ version: "0.3.0" }));
  writeFileSync(join(root, "CHANGELOG.md"), `${HEAD}## [Unreleased]\n\n${OLD}`);
  writeFileSync(join(root, "changes/README.md"), "How to write an entry.\n");
  writeFileSync(join(root, "changes/feat-x.md"), "### Added\n\n- X\n");

  const dry = execFileSync(process.execPath, [join(root, "scripts/changelog.mjs"), "--dry-run", "--date", "2026-03-03"], { encoding: "utf8" });
  assert.match(dry, /## \[0\.3\.0\] - 2026-03-03\n\n### Added\n\n- X\n/);
  assert.deepEqual(readdirSync(join(root, "changes")).sort(), ["README.md", "feat-x.md"]);

  execFileSync(process.execPath, [join(root, "scripts/changelog.mjs"), "--date", "2026-03-03"], { encoding: "utf8" });
  assert.match(readFileSync(join(root, "CHANGELOG.md"), "utf8"), /## \[Unreleased\]\n\n## \[0\.3\.0\] - 2026-03-03\n\n### Added\n\n- X\n\n## \[0\.1\.0\]/);
  assert.deepEqual(readdirSync(join(root, "changes")), ["README.md"]);
});
