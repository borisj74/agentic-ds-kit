### Changed

- **The list-detail pattern follows the redesign, as Northwind's invoices.** One kit ListView (single select) replaces the AppNav and the Table. Rows show the customer, the invoice number and due date, the amount as the row `value` and the lateness in words. A search Input and an All / Overdue / Open / Paid SegmentedControl sit above the list, with a "Showing n of m" line under it. The open invoice sits beside the list in `layout-split--secondary`: status Badge, Ask, Download PDF and Retry payment (the one primary), an amount strip, Line items (Table with a total) and Payment history. With nothing open, kit Empty says so and offers "Open oldest overdue".
- **One URL per record.** `#INV-1842` opens that invoice and an empty hash is the list, so links, reloads and the browser's Back work. A hash on load wins over `selectedId`, and `selectedId` left out now starts with nothing open.
- **Below 640 the list drills.** Rows get a chevron and open the invoice full page, with a PageHeader back link to Invoices. Back returns focus to the row that was open. A polite live region says "INV-1842 open" when a row opens.
- **list-detail contract:** `contains` is now pageheader, listview, empty, card, badge, button, section, table, input and segmentedcontrol (appnav goes). The "Route-level sections are links (AppNav)" must is replaced by: single selection, one URL per record, detail beside the list at 640 and up with Empty when none is open, full-page detail with a back link below 640, and status in words.

### Fixed

- **`review` pattern-fits no longer names a smaller pattern inside a bigger one.** When the parts that matched are ones the file's own pattern already brings (the dashboard or onboarding pattern and list-detail), it stays quiet, and when two patterns fit, the bigger one wins.
