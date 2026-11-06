# Changelog

All notable changes to `agentic-ds-kit` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-11-06

### Added

- SegmentedControl: one choice in a joined track, controlled or uncontrolled, sm or md, optional icons, `role="radiogroup"` with roving tabindex and arrow keys
- TileGroup: selectable cards for a plan or option picker, single or multi select, with title, description, a price or meta slot, and checked or disabled tiles
- Kbd: a shortcut chip for one key, placed in a row for a chord
- Customize panel slots for interface, heading, and mono fonts, a neutrals scale, a spacing scale, and shadow intensity, each writing the existing CSS variables

### Fixed

- `agentic-ds-kit questions` writes its JSON with a blocking stdout write so the catalog is not cut off when it grows past the pipe buffer

## [0.11.0] - 2026-11-06

### Added

- Combobox, DateRangePicker, NumberInput, CurrencyInput, MultiSelect, TagInput, AnchorNav, FilterBar, Popover, ContextMenu, Resizable, TimePicker, and DateTimePicker

### Breaking: removed patterns

- Inbox (`inbox`), Activity (`activity`), Invite (`invite-members`), Delivery (`delivery`), and Assistant (`assistant-workspace`). They were too app-specific.

## [0.10.0] - 2026-11-06

Cards-inspired restyle of tokens, type, radius, and shadow, plus playground theming and a follow-up of live studio controls.

### Added

- Font roles (`--font-heading` / `--font-body`, aliases of `--font-display` / `--font-sans`) and a `data-font` switcher (Inter, IBM Plex, Geist, system)
- Copy prompt for AI from the active tokens and contracts catalog
- Token `useWhen` / `doNot` / notes via `packages/kit/tokens/usage.json`
- Primary hex → ramp, with Ink / Blue / Violet / Teal shortcuts and a coherent dark pair
- Live `--radius-base` and `--shadow-sm` controls in `/studio`
- `delivery` pattern (Scoreboard + Timeline + members DataTable)
- Playground `/studio` for live token controls
- Badge `appearance`: `soft` | `tint` | `solid` | `outline` (default `soft`)

### Changed

- Semantic tokens follow Cards: canvas / subtle / tray / surface / raised / floating ladders, type ladders, radius derived from `--radius-base`, soft shadow scale
- Playground light/dark and color presets
- Old token names (`--surface-page`, `--text-primary`, `--action-primary`, numbered radius/shadow) remain aliases

### Breaking

**Button** no longer takes `variant: primary | secondary | tertiary | danger`. It is now `appearance` × `mode`, with an optional `flat` set:

| 0.9.0 | 0.10.0 |
| --- | --- |
| `variant="primary"` | `appearance="solid" mode="primary"` |
| `variant="secondary"` | `appearance="outline" mode="neutral"` |
| `variant="tertiary"` | `appearance="ghost" mode="neutral"` |
| `variant="danger"` | `appearance="solid" mode="danger"` |

`appearance`: `solid` | `outline` | `soft` | `ghost`. `mode`: `primary` | `neutral` | `danger`. `flat` removes elevation (combine with solid, outline, or soft; ghost is coerced to soft). Sizes stay `lg` | `md` | `sm`. One `appearance="solid" mode="primary"` Button per view.

**Badge** now has `appearance: soft | tint | solid | outline` (default `soft`). Tones: `neutral | primary | brand | success | warning | danger | info | highlight` (`brand` aliases `primary`).
