### Added

- **FileUpload has `variant="compact"`.** The Choose files Button and the limits line on one row, for drawers and tight forms. Dropped files still land. `variant="zone"` is the default.
- **TagInput has `size="lg"` and `maxTags`.** lg is the 40px frame, matching Input and Button. `maxTags` shows a count such as `3/8` at the end of the field and blocks adds past it with a message.
- **KitLabels keys `tagExists`, `tagLimit`, `tagCount` and `removeTagHint`** for the TagInput duplicate, limit, count and Backspace messages.

### Changed

- **FileUpload's action is a neutral sm Choose files Button.** The brand "Click to upload" text is gone, and the dashed zone is no longer a button: `id`, `ref` and native attributes now go to the Choose files Button. While files are dragged over, the zone reads "Drop files here".
- **FileUpload rows are tidier.** Zone and rows use `--radius-control-md`. Uploading rows put the Progress bar and "Uploading 40%" on one line. Error rows lead with an alert icon, and Retry is a labelled sm Button (full width on small screens).
- **TagInput tells the person what happened.** A duplicate shows "finance is already added" instead of being silently dropped. The first Backspace on an empty query highlights the last tag and says so; the second removes it. Messages are announced.
- **TagInput keeps the 32 / 36 / 40 frame with tags inside it.**
