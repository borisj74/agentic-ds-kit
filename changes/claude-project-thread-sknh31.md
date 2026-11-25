### Changed

- **Breaking: the onboarding pattern is now Business, Plan, Billing, Review and Confirm.** If you copied it in with `npx agentic-ds-kit add onboarding`, your copy keeps working; re-adding it replaces the old steps, and code that passes the old names stops type-checking. The renames:
  - Step values (`step`, `defaultStep`, `onStepChange`): `welcome` | `workspace` | `connect` | `done` become `business` | `plan` | `billing` | `review`.
  - `onCreateWorkspace(values)` becomes `onConfirm(values)`. `values` is now `{ business: { name, country, currency, vat? }, plan, billing: { email, terms, prefix } }` (type `OnboardingValues`, was `WorkspaceValues`).
  - `workspaceState` becomes `confirmState`, with the same values (`idle` | `error` | `submitting`). Type `WorkspaceState` becomes `ConfirmState`.
  - `onTaskAction` is removed, with the SetupGuide step. `onSaveAndExit` and `onFinish` stay; `onFinish` now runs after `onConfirm` resolves.
- **Onboarding picks the plan with a kit TileGroup** and reviews everything in a kit ListView, one group per step with an Edit action and the first invoice's amount.
- **Confirm on Review stays disabled until Business, Plan and Billing are all valid.** An invalid step is marked as an error in ProgressSteps and shows its Field error when you go back to it. While the account is created, Confirm uses Button `loading` with "Creating account…".
- **Onboarding footer:** Save and exit is a ghost Button at the start of the footer on wide screens, and in the AppHeader below md. Back is ghost. Skip for now is gone, since every step is required.
