### Added

- **BarList.** A ranked list for one measure: each row shows its label and value as text, with a quiet `--chart-1` bar behind the label sized against the largest value. Props: `data` (`label`, `value`, optional `href`), `sort` (`descending`, `ascending`, `none`), `maxRows` with a Show all / Show fewer toggle, `valueFormatter` and an accessible `label`. Use it for top pages or top customers in a side column. Several series or an axis stay BarChart, and usage against a limit stays UsageList.
