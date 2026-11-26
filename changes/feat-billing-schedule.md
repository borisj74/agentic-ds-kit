### Added

- **BillingSchedule component.** One customer's billing schedule in a kit Card with its own header, exported from `agentic-ds-kit`. One closed prop, `view`: `full` (every charge in one Table, the next charge marked in words), `nextOnly` (the next charge, Pays with and Change card) or `failed` (the open failed payment as a danger Alert with Update card, over the charges still owed). Each view has its own empty, loading and error states. It takes the same `Charge` and `NextCharge` data as the billing-schedule pattern, and exports both types.

### Changed

- **The billing-schedule pattern renders `<BillingSchedule view="full" />`.** Its table, failure Alert, next-charge panel and states now come from the kit component (`nextOnly` maps to `view="nextOnly"`). The pattern keeps the edit Drawer, the Skip AlertDialog and the summary card. Its `Charge`, `ChargeStatus` and `NextCharge` types are re-exported from the kit, so a copied-in pattern needs a kit version with BillingSchedule.
