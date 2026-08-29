# Kit sandbox rules

Before writing UI, read `contracts/index.json`, then only the matching contract file(s).
If a contract exists, use the kit component from `ui/`. Never invent a local cousin.
If a needed component has no contract, stop and ask. Do not add a one-off.
Never put hex in components; use semantic tokens from `lib/tokens.css`.
One `variant="primary"` Button per view.
Scoreboard must import Scorecard — no inline metric tiles, no CSS border dividers.
