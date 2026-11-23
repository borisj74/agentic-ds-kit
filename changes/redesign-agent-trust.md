### Added

- **CitedAnswer `emptyText`.** An answer with no citations now says so ("No sources. Check before you act on this.") under the text. Pass `""` to hide it.
- **MessageActions `selectedReason`.** The picked reason's toggle Button is pressed and the thanks line names it ("Thanks, noted: Source is wrong").
- **AssumptionLog `limit`.** Long lists show the weakest 5 with "Show n more"; `limit={0}` shows every row.
- **GuardrailLog event `summary`.** A one-line "what happened and why" becomes the row title; rule, agent and time drop to the caption.
- **RedactionPreview `status="error"`, `errorText`, `onRetry`, `layout` and `keepLast`.** A failed send keeps the card, says nothing left the product and offers Try again. `layout="split"` shows Before and After side by side (After first on a narrow card). `keepLast={{ card: 4 }}` sends a card as "[Card number •••• 4242]".

### Changed

- **CitedAnswer missing sources are said in the text.** A missing mark reads "[n] missing", the toggle reads "3 sources · 1 missing", and the source list opens on first render when any source is missing. Marks get a 24px hit area.
- **MessageActions reasons are kit toggle Buttons** (sm, `aria-pressed`) in a group named "What went wrong?", and the thanks line has a check icon.
- **AssumptionLog confidence shows the percent** ("Low 46%"), and the steps Button reads "n steps".
- **GuardrailLog Flagged is a neutral outline Badge**, so it no longer looks like a filled status.
