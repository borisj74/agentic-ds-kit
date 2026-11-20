### Added

- **Chat `embedded`.** Inside a host that already has a title, an edge and padding (a work panel tab, a Drawer), Chat drops its header band, outer border and side insets and fills the host's height, with the suggestions lined up to the thread text. `title` still names the section.
- **Tabs `fill`.** The tab panel takes the height left under the tab list, so a full-height child can reach the bottom.

### Changed

- **AppShellPattern work panel tabs fill the panel height**, so a tab like Chat embedded reaches the bottom instead of leaving an empty band.
