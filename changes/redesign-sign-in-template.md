### Changed

- Sign in template: SSO buttons now sit above the email form under a Divider "or use email", the Card title is the page's h1, and the copy is "Work email", "Stay signed in 30 days" and an invite line ("No account? Ask your admin for an invite.") instead of a Sign up footer when `onSwitchMode` is left out. Below `--grid-breakpoint-sm` the card is size sm and Forgot password moves under Sign in.
- Sign in template: `error` also takes `{ title, detail }`, so the Alert says what happened and what to do next. A plain string still works. A new error clears the password (email kept) and focuses it.

### Added

- Sign in template: `step` (`"credentials"` | `"code"`) and `onVerifyCode` for a one-time code step on InputOTP md (6 digits, groups 3 + 3, `autoComplete="one-time-code"`), with Verify as that step's one primary.
- Sign in template: `onBack` and `onBackupCode` show ghost "Back" and "Use a backup code" buttons under Verify on the code step.
