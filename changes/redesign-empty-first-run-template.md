### Changed

- **Empty first run template is now a new billing workspace.** It renders inside the app-shell example (`add empty-first-run` also copies app-shell). Empty (first-use, lg) holds Create invoice, the one solid primary, and an outline Try sample data, with a one-line setup status and Open setup under it in the same Card. The New invoice Modal adds a customer inline (Combobox), picks a plan (Select) and a due date (DatePicker). Sample data shows an info Alert with Clear sample data over the invoices Table, and Create invoice moves to the header. New props `setup`, `onOpenSetup` and `shell`; `onCreate` now gets `{ customer, newCustomer, plan, dueDate }`.

### Fixed

- **Combobox no longer swallows Escape when its list is closed.** Escape in a closed Combobox inside a Modal or Drawer now closes the Modal or Drawer.
