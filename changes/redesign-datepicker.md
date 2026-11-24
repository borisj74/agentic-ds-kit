### Added

- **DatePicker, DateRangePicker and DateTimePicker have an lg size (40px), like Input.**
- **DatePicker and DateRangePicker take `weekStart` (0 Sunday, 1 Monday) and `isDateDisabled`.** Days turned off, and days outside minDate/maxDate, are struck through and read as unavailable.
- **DateTimePicker takes `minDate` and `maxDate`.**
- **DateRangePicker has typed start and end fields in its footer.** A valid, available day updates the pending range. New KitLabels keys: `startDate`, `endDate`, `rangeTo`.

### Changed

- **The three date pickers open with the shared overlay header**: CalendarDays icon, the picked value or range status as the eyebrow, the Choose date title, and Close. Opening focuses the picked day instead of the month arrow.
- **Below 40rem DateRangePicker opens as the kit Drawer bottom sheet**, with one month, the presets and the typed fields, and Cancel and Apply in the sheet footer.
- **Today shows a short bar under the number instead of a border ring.**
- **The picked value in the trigger is set in Geist Mono** (a preset name in DateRangePicker stays in Geist).
- **DatePicker uses the shared Escape stack** (useOverlayDismiss), so Escape closes only the newest open overlay.
- **DateTimePicker's panel is modal**: Tab stays inside, like the other two pickers.
- **DashboardPattern's period control is a DateRangePicker** with Last 30 days, Last 3 months and Last 12 months as presets, or a custom range, in a Field labelled Period.
- **Field lists DateRangePicker and DateTimePicker as allowed children.**

### Deprecated

- **DatePicker `mode="range"`.** It still works and warns once in development. Use DateRangePicker, with `presets={[]}` for the months only.
