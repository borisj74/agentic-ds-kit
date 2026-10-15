# Questions: contracts as an option list

`npx agentic-ds-kit questions` turns the kit's contracts into a closed list of options: one per component and pattern, each with a label, a description, the contract ids it renders and a yes/no question. Use it when your app lets a model pick which kit view to render for a request (an Ask box, a chat reply, a generated screen) and you want the choices to come from the contracts instead of hand-written lists.

The command only reads the contracts installed with the package. It makes no network or model calls and needs no keys.

```bash
npx agentic-ds-kit questions --pretty                       # all 85 options to stdout
npx agentic-ds-kit questions --group pattern                # patterns only
npx agentic-ds-kit questions --only barchart,linechart,piechart
npx agentic-ds-kit questions --overlay questions.overlay.json --none --out lib/questions.json
```

| Flag | Meaning |
| --- | --- |
| `--only <id,…>` | Only these contract ids. Replaces the overlay's `only` list for this run. Composites are always kept |
| `--group component\|pattern` | Only one group |
| `--overlay <file.json>` | App-owned changes (below) |
| `--use-when <n>` / `--not-when <n>` | `useWhen` / `doNotUseWhen` lines per description (default 2 each) |
| `--ask-style part\|strict` | Wording of `ask` (default `part`, see below) |
| `--enums own\|all\|none` | Which enum props to list (default `own`, see below) |
| `--none` | Add a "None of these" option (`kind: "none"`), always last |
| `--out <file>` | Write a file instead of stdout. Missing folders are created |
| `--pretty` | Indent the JSON |

## Output

```json
{
  "schema": 1,
  "kit": "0.8.0",
  "options": [
    {
      "id": "barchart",
      "label": "BarChart",
      "description": "Compare magnitudes across categories with vertical or horizontal bars. Use when: Ranking values at a glance; Grouped comparisons with categories plus series. Not for: Part-to-whole share — use PieChart; Change over time — use LineChart.",
      "contracts": ["barchart"],
      "kind": "component",
      "ask": "Would BarChart (compare magnitudes across categories with vertical or horizontal bars) show part of what the request asks to see?"
    }
  ],
  "enums": [
    { "component": "barchart", "prop": "orientation", "values": ["vertical", "horizontal"], "default": "vertical" }
  ]
}
```

- `label` is the component's code name (`BarChart`, `DashboardPattern`). `description` is the contract's `intent` plus up to two `useWhen` and two `doNotUseWhen` lines. A `doNotUseWhen` line that names kit components, none of which the option set renders ("use PieChart" when PieChart is not an option), is skipped: it would steer the model away from this option with nowhere to go. The full set is unaffected; the next line in the contract takes its place.
- `contracts` lists what the option renders: the component itself, or a pattern and every component in its `contains`.
- `kind` is `component`, `pattern`, `composite` (from an overlay) or `none`.
- `ask` is the same option as one yes/no question, for models that score each option on its own instead of choosing one from a list. The part in brackets is the overlay `sentence` when there is one, else the overlay `description`, else the contract intent.
  - `part` (default): "Would BarChart (…) show part of what the request asks to see?" Use it to gate which views to show: a request that asks for several things passes each view that covers one of them.
  - `strict`: "Does the request need BarChart (…)?" (the 0.8.0 wording). A view that covers only part of a multi-part request scores low, so it drops correct extra views. Use it as a final check on a view you already picked, not as the gate for extra views.
- `enums` lists props with `values`, so a second question can pick a variant (bar orientation, card size) after the view is chosen. `own` (default): the option's own contract only, which for a composite is its `base` (none without one) and for a pattern the pattern contract, not its parts. `all`: every contract the options render, including composite and pattern parts (the 0.8.0 behaviour). `none`: an empty list.
- Options are sorted by label (`None of these` stays last). `schema` changes only when the shape does. The same kit version, flags and overlay give byte-identical output, so the file can be generated in a build step and checked in.

## Overlay

The overlay is a JSON file your app owns. Every id must be a contract id from `contracts/index.json`.

```json
{
  "only": ["barchart", "datatable", "scoreboard", "empty"],
  "composites": [
    {
      "id": "table-card",
      "label": "Table card",
      "contracts": ["card", "datatable"],
      "sentence": "Invoice rows in a flush Card: invoice, customer, due date, amount, status.",
      "base": "datatable"
    }
  ],
  "options": {
    "scoreboard": { "label": "Studio KPIs", "description": "This week's headline studio numbers side by side" },
    "barchart": { "sentence": "In this app it compares monthly totals by region" },
    "empty": { "label": "Nothing to show" }
  },
  "drop": ["spinner", "skeleton"]
}
```

- `only` keeps just these contract ids, so the overlay file alone reproduces the set. Composites are always kept. `--only` on the command line replaces this list for that run (it does not intersect with it), so you can try another set without editing the file. `drop` still applies to either list.
- `composites` add options that render several contracts together. `sentence` describes them. With `base`, the description starts with that contract's intent, then the sentence, then its `useWhen` and `doNotUseWhen`. `id` defaults to the label in kebab case.
- `options.<id>.label` renames the option.
- `options.<id>.sentence` is appended after the contract intent (or after your `description`), so write it as a continuation: "In Tempo it shows this week's classes", not a stand-alone heading. It is also what `ask` quotes.
- `options.<id>.description` replaces the generated description entirely: no contract intent, no `useWhen`, no `doNotUseWhen`. Use it when the contract's developer wording ("Metrics strip of kit Scorecards…", "add / edit / delete events") would mislead a request router, or when you renamed the option and do not want kit vocabulary next to your app's.
- `drop` removes options.

The command exits 1 with a one-line message for an unknown contract id, a duplicate label, more than 255 options, an overlay with the wrong shape, a bad flag value, or a file it cannot write.

### Lean descriptions

The `useWhen` and `doNotUseWhen` lines are written for developers choosing a component, not for routing a user's request. In the first app that used this command (7 components, 2 composites, a per-option yes/no model), `--use-when 0 --not-when 0` scored the same or slightly better than the defaults with about 15% fewer tokens. If your overlay gives each option a `sentence` or `description`, try the lean form first:

```bash
npx agentic-ds-kit questions --overlay questions.overlay.json --use-when 0 --not-when 0 --none --out lib/questions.json
```

## Using it

Feed the output to whatever decision model or LLM your app uses: the `options` as a single choice, the `ask` lines as separate yes/no checks, or both. Keep the rest in app code: the prompt context around the request, score thresholds, what to render when nothing passes, and any wording specific to your product (in the overlay). Regenerate the file when you upgrade the kit.
