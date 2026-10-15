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
| `--only <id,…>` | Only these contract ids |
| `--group component\|pattern` | Only one group |
| `--overlay <file.json>` | App-owned changes (below) |
| `--use-when <n>` / `--not-when <n>` | `useWhen` / `doNotUseWhen` lines per description (default 2 each) |
| `--none` | Add a "None of these" option (`kind: "none"`), always last |
| `--out <file>` | Write a file instead of stdout |
| `--pretty` | Indent the JSON |

## Output

```json
{
  "schema": 1,
  "kit": "0.7.1",
  "options": [
    {
      "id": "barchart",
      "label": "BarChart",
      "description": "Compare magnitudes across categories with vertical or horizontal bars. Use when: Ranking values at a glance; Grouped comparisons with categories plus series. Not for: Part-to-whole share — use PieChart; Change over time — use LineChart.",
      "contracts": ["barchart"],
      "kind": "component",
      "ask": "Does the request need BarChart (compare magnitudes across categories with vertical or horizontal bars)?"
    }
  ],
  "enums": [
    { "component": "barchart", "prop": "orientation", "values": ["vertical", "horizontal"], "default": "vertical" }
  ]
}
```

- `label` is the component's code name (`BarChart`, `DashboardPattern`). `description` is the contract's `intent` plus up to two `useWhen` and two `doNotUseWhen` lines.
- `contracts` lists what the option renders: the component itself, or a pattern and every component in its `contains`.
- `kind` is `component`, `pattern`, `composite` (from an overlay) or `none`.
- `ask` is the same option as one yes/no question, for models that score each option on its own instead of choosing one from a list.
- `enums` holds every prop with `values` in the contracts the options render, so a second question can pick a variant (bar orientation, card size) after the view is chosen.
- Options are sorted by label (`None of these` stays last). `schema` changes only when the shape does. The same kit version, flags and overlay give byte-identical output, so the file can be generated in a build step and checked in.

## Overlay

The overlay is a JSON file your app owns. Every id must be a contract id from `contracts/index.json`.

```json
{
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
    "scoreboard": { "sentence": "The overview to give when the request is general or vague." },
    "empty": { "label": "Nothing to show" }
  },
  "drop": ["spinner", "skeleton"]
}
```

- `composites` add options that render several contracts together. `sentence` describes them. With `base`, the description also carries that contract's intent, `useWhen` and `doNotUseWhen`. `id` defaults to the label in kebab case.
- `options.<id>.sentence` adds one sentence after the contract intent. `options.<id>.label` renames the option.
- `drop` removes options.

The command exits non-zero with a message for an unknown contract id, a duplicate label, more than 255 options, or an overlay with the wrong shape.

## Using it

Feed the output to whatever decision model or LLM your app uses: the `options` as a single choice, the `ask` lines as separate yes/no checks, or both. Keep the rest in app code: the prompt context around the request, score thresholds, what to render when nothing passes, and any wording specific to your product (in the overlay). Regenerate the file when you upgrade the kit.
