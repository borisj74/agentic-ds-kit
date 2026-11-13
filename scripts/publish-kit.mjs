#!/usr/bin/env node
/**
 * Publishes agentic-ds-kit and tags the release.
 *
 *   npm run publish:kit                 # publish, then tag vX.Y.Z on HEAD and push the tag
 *   npm run publish:kit -- --otp=123456 # extra args go to `npm publish`
 *   npm run publish:kit -- --dry-run    # no publish, no tag
 *
 * Order: sync version pins in the docs, check the tree is clean and the tag is new,
 * `npm publish`, then `git tag -a vX.Y.Z` and `git push <remote> vX.Y.Z`.
 * The tag goes on HEAD, so commit the bump (`npm run bump:kit`) before publishing.
 * Remote: `github` by default, or set KIT_RELEASE_REMOTE.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const remote = process.env.KIT_RELEASE_REMOTE || "github";
const publishArgs = process.argv.slice(2);

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n${cmd} ${args.join(" ")} failed (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`publish:kit: ${message}`);
  process.exit(1);
}

const { version, homepage } = JSON.parse(readFileSync(join(root, "packages/kit/package.json"), "utf8"));
if (!/^https?:\/\//.test(homepage ?? "")) {
  fail(`packages/kit/package.json "homepage" is not a URL (${homepage}). Set the live docs URL first.`);
}
const tag = `v${version}`;

run("node", ["scripts/sync-kit-version-docs.mjs"]);

const dirty = git(["status", "--porcelain"]);
if (dirty) {
  fail(`working tree is not clean. Commit the ${version} bump (and the synced docs) first, so ${tag} marks what was published:\n${dirty}`);
}
if (git(["tag", "--list", tag])) fail(`tag ${tag} already exists locally. Bump the version first.`);
if (git(["ls-remote", "--tags", remote, `refs/tags/${tag}`])) fail(`tag ${tag} already exists on ${remote}.`);

run("npm", ["publish", "-w", "agentic-ds-kit", "--access", "public", ...publishArgs]);

if (publishArgs.includes("--dry-run")) {
  console.log(`\nDry run: nothing published, so ${tag} was not created.`);
  process.exit(0);
}

run("git", ["tag", "-a", tag, "-m", `agentic-ds-kit ${version}`]);
run("git", ["push", remote, tag]);

console.log(`\nPublished agentic-ds-kit@${version} and pushed ${tag} to ${remote}.`);
console.log(`GitHub Release (optional): gh release create ${tag} -R borisj74/agentic-ds-kit --title "${tag}" --notes-file <notes.md>`);
