### Added

- **UsageMeter `overage`.** Pass `{ rateLabel, amount }` and, past the limit, the warning and the meter's name say the rate and what is billed so far. The badge reads Over limit.
- **UsageBilling `upcoming` and `plan.fit`.** The next invoice shows as an InvoiceDocument estimate beside the other limits, and the plan card can say whether the upgrade plan covers this period.
- **InvoiceDocument `status="estimate"`, `period` and `onPay`.** Estimates read Estimated total and cannot be paid; `onPay` puts Pay {total} as the solid primary for the customer's view.
- **PricingPlans `fit`.** One line per plan on how it covers current usage.

### Changed

- **UsageMeter `warnAt` now defaults to 0.8**, the same line as UsageList (was 0.9).
- **UsageBilling Upgrade is solid only at or past the allowance's `warnAt`**; below it the button is outline. Invoice rows take `status: "issued"` and say Issued like InvoiceDocument; `"open"` still works and also reads Issued.
- **InvoiceDocument lines stack below 30rem**: Qty × Unit moves under the description and the Table keeps its four columns for screen readers. The footnote icon follows the status (clock for issued and estimate).
- **PricingPlans highlights only the recommended plan** and the Current plan badge is neutral. Below 30rem the cards become a TileGroup with one button.
- **TileGroup focus uses the shared box-shadow ring**, like Button and Input.
