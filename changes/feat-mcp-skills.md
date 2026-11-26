### Added

- **The MCP server ships the prototype-from-kit skill.** `npx agentic-ds-kit mcp` publishes it over Skills over MCP (`skills/list`, `skills/get`, `resources/read` on `skill://prototype-from-kit/SKILL.md`), read from the installed `skills/prototype-from-kit/SKILL.md`. Claude Code picks it up with no copy step. Clients without skills see the same tools as before.

### Changed

- **prototype-from-kit description and pattern line.** It now triggers on "building a product screen from Nistha (agentic-ds-kit)", and says patterns are blueprints that only compose kit pieces, never new primitives.
