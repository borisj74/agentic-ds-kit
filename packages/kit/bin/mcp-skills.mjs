/**
 * Skills over MCP (extension io.modelcontextprotocol/skills) for agentic-ds-kit mcp.
 * One source: each skill is read from this install's skills/<name>/SKILL.md at request time,
 * never copied. Served as skill://<name>/SKILL.md through skills/list, skills/get and
 * resources/read.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const SKILLS_EXTENSION_ID = "io.modelcontextprotocol/skills";
/** The skills the server publishes, by folder name under skills/. */
export const PUBLISHED_SKILLS = ["prototype-from-kit"];

const SKILL_FILE = "SKILL.md";
const MIME_TYPE = "text/markdown";

export function skillUri(name) {
  return `skill://${name}/${SKILL_FILE}`;
}

/** A request for a skill or file this server does not have (JSON-RPC -32602). */
export class SkillNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = -32602;
  }
}

/**
 * Parse the flat `key: value` YAML frontmatter our skills use into a plain object.
 * Returns null when the file has no frontmatter block.
 */
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) return null;
  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!field) continue;
    let value = field[2].trim();
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    frontmatter[field[1]] = value;
  }
  return frontmatter;
}

/** Skill source over `<root>/skills`. Everything is read fresh on each call. */
export function createSkills(root, names = PUBLISHED_SKILLS) {
  function read(name) {
    const path = join(root, "skills", name, SKILL_FILE);
    if (!existsSync(path)) throw new Error(`Skill file missing: skills/${name}/${SKILL_FILE}`);
    const bytes = readFileSync(path);
    const text = bytes.toString("utf8");
    const frontmatter = parseFrontmatter(text);
    if (!frontmatter?.name || !frontmatter.description) {
      throw new Error(`skills/${name}/${SKILL_FILE} needs name and description in its frontmatter`);
    }
    if (frontmatter.name !== name) {
      throw new Error(`skills/${name}/${SKILL_FILE} frontmatter name is "${frontmatter.name}", expected "${name}"`);
    }
    const uri = skillUri(name);
    const entry = {
      uri,
      frontmatter,
      resources: [{ uri, digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`, size: bytes.length }],
    };
    return { entry, text };
  }

  function nameFor(uri) {
    const name = names.find((candidate) => skillUri(candidate) === uri);
    if (!name) throw new SkillNotFoundError(`Unknown skill resource: ${uri}`);
    return name;
  }

  return {
    list: () => names.map((name) => read(name).entry),
    get: (uri) => read(nameFor(uri)).entry,
    resources: () =>
      names.map((name) => {
        const { entry } = read(name);
        return {
          uri: entry.uri,
          name,
          description: entry.frontmatter.description,
          mimeType: MIME_TYPE,
          size: entry.resources[0].size,
        };
      }),
    read: (uri) => ({ contents: [{ uri, mimeType: MIME_TYPE, text: read(nameFor(uri)).text }] }),
  };
}
