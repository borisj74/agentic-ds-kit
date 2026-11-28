### Deprecated

- **AgentFleet is deprecated: use AgentOverview.** It is still exported and its docs page still works, but it is no longer in the docs nav, gallery, command palette or sitemap.
- **AgentLanes is deprecated: use AgentOverview with `view="timeline"`.** Still exported; the docs page stays reachable for old links.
- **LiveSession is deprecated: use RunDetail with `messages` and `onSend`, plus AgentOverview.** Still exported; `/blocks/live-session` still works, but the `/blocks` index no longer lists it.
- **AppDirectory is deprecated: use IntegrationPicker with `connectFlow="detail"` and `showConnected`.** Still exported; `/blocks/app-directory` still works, but the `/blocks` index no longer lists it.

### Changed

- **The MCP `list_components` and `search_components` tools skip deprecated components.** `get_component` still returns them, now with a `status` field (`stable` or `deprecated`). `inspect` still names deprecated pieces it finds on a page.
- **`npx agentic-ds-kit add --list` skips deprecated entries.**
- **Deprecated block pages show a "deprecated" badge**, as deprecated component pages already did.
- **AgentTrail, AgentMonitor, AgentInbox and TaskBoard stay stable.** Their contract intents no longer say they will become internal parts of a larger block.
