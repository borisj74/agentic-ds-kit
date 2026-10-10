# Paste-ready: Jev token triage (agentic-ds-kit)

Copy into Cursor Agent or Claude Code when reviewing UI for tokens. Both have the **jev-token-check** skill (`.cursor/skills/` and `.claude/skills/`) and the `jev` MCP server (Cursor: `~/.cursor/mcp.json`; Claude Code: `.mcp.json`, tool `mcp__jev__jev_triage`).

---

Run the **jev-token-check** skill.

1. Deterministic scan of these paths for hex, `rgb(`, primitive `--color-*` in UI, and raw font sizes:  
   `packages/kit/ui/` and any app files in this PR / selection.
2. Call **`jev_triage`** on suspect files with questions `uses_only_tokens` (`check`), `token_correctness` (`classify`: correct | wrong_semantic | missing_token | literals_present), `needs_new_token` (`check`).
3. Allowed API: semantic vars from `packages/kit/lib/tokens.css` (`--text-*`, `--surface-*`, `--border-*`, `--type-*`, `--space-*`, …). Forbidden: hex and primitive `--color-*` ramps in components.
4. Report a table. Fix only high-confidence failures. If `needs_new_token` is yes, stop and ask — do not invent tokens or rewrite JSX for taste.

Do not use Jev to write components.
