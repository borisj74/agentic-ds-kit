"use client";

import { useState } from "react";
import { Card, Field, Input, SaveBar, Select, type SaveBarState } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import local from "./SaveBarDoc.module.css";

const SAVED = { legalName: "Northwind Traders Ltd", currency: "usd" };
const CURRENCIES = [
  { value: "usd", label: "USD · US dollar" },
  { value: "gbp", label: "GBP · Pound sterling" },
  { value: "eur", label: "EUR · Euro" },
];
const CHANGES = ["Legal name", "Invoice currency"];
const noop = () => {};

/** Live demo: edit a field and the bar lists it; Save stamps the time; an empty legal name fails the save. */
function BillingDetailsDemo({ narrow }: { narrow: boolean }) {
  const [saved, setSaved] = useState(SAVED);
  const [legalName, setLegalName] = useState("Northwind Traders Limited");
  const [currency, setCurrency] = useState("gbp");
  const [savedAt, setSavedAt] = useState("Nov 14 by Maya Chen");
  const [failed, setFailed] = useState(false);

  const nameChanged = legalName !== saved.legalName;
  const currencyChanged = currency !== saved.currency;
  const changes = [nameChanged ? "Legal name" : null, currencyChanged ? "Invoice currency" : null].filter(
    (name): name is string => name !== null,
  );
  const state: SaveBarState = failed ? "error" : changes.length > 0 ? "dirty" : "saved";
  const currencyLabel = CURRENCIES.find((c) => c.value === saved.currency)?.label ?? saved.currency;

  function save() {
    if (legalName.trim() === "") {
      setFailed(true);
      return;
    }
    setFailed(false);
    setSaved({ legalName, currency });
    setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
  }

  function discard() {
    setLegalName(saved.legalName);
    setCurrency(saved.currency);
    setFailed(false);
  }

  return (
    <div className={narrow ? `${local.frame} ${local.narrow}` : local.frame}>
      <div className={local.scroll}>
        <Card title="Company" description="Printed on every invoice Northwind sends">
          <Field
            label="Legal name"
            htmlFor="savebar-legal-name"
            changed={nameChanged}
            hint={nameChanged ? `Was “${saved.legalName}”. Use the name on your Companies House record.` : "Use the name on your Companies House record."}
            error={failed ? "Enter the legal name. It goes on every invoice." : undefined}
          >
            <Input id="savebar-legal-name" value={legalName} onChange={(next) => { setLegalName(next); setFailed(false); }} />
          </Field>
          <Field
            label="Invoice currency"
            htmlFor="savebar-currency"
            changed={currencyChanged}
            hint={currencyChanged ? `Was ${currencyLabel}. Applies from INV-1843.` : "Applies from the next invoice."}
          >
            <Select id="savebar-currency" options={CURRENCIES} value={currency} onChange={(next) => setCurrency(String(next))} />
          </Field>
        </Card>
      </div>
      <SaveBar
        state={state}
        changes={changes}
        savedAt={state === "saved" ? savedAt.split(" by ")[0] : savedAt}
        message={failed ? "Not saved · 1 field to fix" : undefined}
        onDiscard={discard}
        onSave={save}
      />
    </div>
  );
}

export function SaveBarDoc() {
  const [width, setWidth] = useState<"wide" | "390">("wide");
  return (
    <AgentDocFrame
      id="savebar"
      name="SaveBar"
      lede="A save bar that sticks to the bottom of main: what is unsaved, when it was last saved, then Discard and Save changes."
      summary="Edit a field: it says Edited and the bar lists it. Clear the legal name and Save to see the error state."
      preview={<BillingDetailsDemo narrow={width === "390"} />}
      controls={<DocOptions label="Width" options={["wide", "390"] as const} value={width} onChange={setWidth} />}
      usage="Put SaveBar last inside main, after the form, and set scroll-padding-bottom on the scroller to the bar height. Pass the changed field labels in changes and mark the same Fields with changed, old value in hint. Save is the page's one solid primary. On Save with field errors, set state error, say what to fix in message and focus an Alert summary (see Field). Leaving with changes opens AlertDialog in the app; closing the tab can only use the browser's own prompt."
      code={`<main style={{ scrollPaddingBottom: "4rem" }}>
  <form>…</form>
  <SaveBar
    state="dirty"
    changes={["Legal name", "Invoice currency"]}
    savedAt="Nov 14 by Maya Chen"
    onDiscard={discard}
    onSave={save}
  />
</main>`}
      variants={[
        {
          title: "Dirty",
          about: "The count in words, then the changed fields and when it was last saved.",
          code: `<SaveBar changes={["Legal name", "Invoice currency"]} savedAt="Nov 14 by Maya Chen" onDiscard={discard} onSave={save} />`,
          render: (
            <div className={local.wide}>
              <SaveBar changes={CHANGES} savedAt="Nov 14 by Maya Chen" onDiscard={noop} onSave={noop} />
            </div>
          ),
        },
        {
          title: "Error",
          about: "Save failed or a field needs fixing. The message says what to fix; the Alert summary on the page takes focus.",
          code: `<SaveBar state="error" message="Not saved · 1 field to fix" changes={changes} onDiscard={discard} onSave={save} />`,
          render: (
            <div className={local.wide}>
              <SaveBar state="error" message="Not saved · 1 field to fix" changes={CHANGES} onDiscard={noop} onSave={noop} />
            </div>
          ),
        },
        {
          title: "Saved",
          about: "Nothing to save: Discard hides and Save is disabled. The status line announces the time once.",
          code: `<SaveBar state="saved" savedAt="10:42" onSave={save} />`,
          render: (
            <div className={local.wide}>
              <SaveBar state="saved" savedAt="10:42" onSave={noop} />
            </div>
          ),
        },
        {
          title: "Saving",
          about: "saving puts Save in its loading state and disables Discard until the request returns.",
          code: `<SaveBar changes={changes} saving onDiscard={discard} onSave={save} />`,
          render: (
            <div className={local.wide}>
              <SaveBar changes={CHANGES} saving onDiscard={noop} onSave={noop} />
            </div>
          ),
        },
        {
          title: "Narrow, Cancel",
          about: "Under 30rem the status stacks over the buttons; Save takes two thirds at lg 40. discardLabel Cancel when the outcome is leaving.",
          code: `<SaveBar changes={["Workspace name"]} discardLabel="Cancel" onDiscard={cancel} onSave={save} />`,
          render: (
            <div className={local.phone}>
              <SaveBar changes={["Workspace name"]} discardLabel="Cancel" onDiscard={noop} onSave={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}
