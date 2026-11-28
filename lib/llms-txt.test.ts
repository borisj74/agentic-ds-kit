import assert from "node:assert/strict";
import { describe, test } from "node:test";
import index from "../packages/kit/contracts/index.json";
import { buildLlmsTxt, SITE } from "../scripts/build-llms-txt.mjs";
import { BLOCK_DOCS } from "./blocks";
import { PATTERN_VIEWS } from "./pattern-screens";

interface Row {
  id: string;
  group: string;
  kind?: string;
  status?: string;
}

const rows = index as Row[];
const text: string = buildLlmsTxt();
const lines = text.split("\n");
const live = (row: Row) => row.status !== "deprecated";

/** The entry line that links to this URL, or undefined. */
const entryFor = (url: string) => lines.find((line) => line.startsWith("- [") && line.includes(`](${url}):`));

describe("llms.txt", () => {
  test("sections in order: Foundations, Components, Blocks, Patterns", () => {
    const headings = lines.filter((line) => line.startsWith("## "));
    assert.deepEqual(headings, ["## Foundations", "## Components", "## Blocks", "## Patterns"]);
  });

  test("one Foundations entry pointing at the foundations page", () => {
    assert.ok(entryFor(`${SITE}/foundations`));
    assert.equal(lines.filter((line) => line.includes("/foundations")).length, 1);
  });

  test("every non-deprecated component links to /components/{id}", () => {
    const components = rows.filter((row) => row.group === "component" && row.kind !== "block" && live(row));
    assert.ok(components.length > 0);
    for (const row of components) assert.ok(entryFor(`${SITE}/components/${row.id}`), `missing component ${row.id}`);
  });

  test("every non-deprecated block links to its BLOCK_DOCS slug", () => {
    const slugById = new Map(BLOCK_DOCS.map((doc) => [doc.contract.id, doc.slug]));
    const blocks = rows.filter((row) => row.kind === "block" && live(row));
    assert.ok(blocks.length > 0);
    for (const row of blocks) {
      const slug = slugById.get(row.id);
      assert.ok(slug, `no BLOCK_DOCS entry for ${row.id}`);
      assert.ok(entryFor(`${SITE}/blocks/${slug}`), `missing block ${row.id} at /blocks/${slug}`);
    }
    assert.ok(entryFor(`${SITE}/blocks/eval-suite`));
  });

  test("every pattern page is listed at /patterns/{id}, and nothing else", () => {
    const patterns = Object.keys(PATTERN_VIEWS);
    for (const id of patterns) assert.ok(entryFor(`${SITE}/patterns/${id}`), `missing pattern ${id}`);
    const listed = lines.filter((line) => line.includes(`](${SITE}/patterns/`));
    assert.equal(listed.length, patterns.length);
    assert.ok(!text.includes("/patterns/layouts"));
  });

  test("deprecated rows are left out", () => {
    const deprecated = rows.filter((row) => row.group !== "foundation" && !live(row));
    assert.ok(deprecated.length > 0);
    for (const row of deprecated) assert.ok(!text.includes(`/${row.id})`), `deprecated ${row.id} is listed`);
    for (const slug of ["live-session", "app-directory"]) assert.ok(!text.includes(`/blocks/${slug})`));
  });

  test("each entry is one line with a description", () => {
    for (const line of lines.filter((row) => row.startsWith("- "))) assert.match(line, /^- \[[^\]]+\]\(https:\/\/[^)]+\): \S/);
  });
});
