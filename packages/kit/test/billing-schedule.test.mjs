/**
 * BillingSchedule: the three closed views (full, nextOnly, failed), each with its own empty, loading
 * and error states, built only from kit pieces. Runs against the built kit (dist): build first.
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import { before, describe, test } from "node:test";

register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "", shortCircuit: true };
  return next(url, context);
}`),
);

let React;
let renderToStaticMarkup;
let BillingSchedule;

before(async () => {
  React = await import("react");
  ({ renderToStaticMarkup } = await import("react-dom/server"));
  ({ BillingSchedule } = await import("../dist/ui/BillingSchedule/BillingSchedule.js"));
});

const h = (props) => renderToStaticMarkup(React.createElement(BillingSchedule, props));
const noop = () => {};
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

const CHARGES = [
  { id: "dec", date: "2026-12-01", label: "Pro plan · monthly", amount: "$480.00", status: "scheduled", invoice: "INV-0118" },
  { id: "nov", date: "2026-11-01", label: "Pro plan · monthly", amount: "$480.00", status: "paid", invoice: "INV-0117" },
  { id: "seat", date: "2026-10-18", label: "Seat added", amount: "$22.40", status: "invoiced", invoice: "INV-0112", note: "Prorated for 14 days" },
  { id: "oct", date: "2026-10-01", label: "Pro plan · monthly", amount: "$480.00", status: "failed", invoice: "INV-0109", note: "Card declined" },
  { id: "sep", date: "2026-09-01", label: "Pro plan · monthly", amount: "$0.00", status: "waived", invoice: "INV-0101", note: "Credit applied" },
];
/** Nothing paid since the October failure: the failure is still open. */
const OPEN_FAILURE = CHARGES.filter((charge) => charge.id === "seat" || charge.id === "oct");
const NEXT = { date: "01 Dec 2026", amount: "$480.00", paysWith: "Visa ending 4242" };
const DETAIL = "The card was declined. We retry on 04 Oct 2026, so update it before then to keep the plan active.";

const dates = (html) => [...html.matchAll(/>(\d\d \w{3} \d{4})</g)].map((m) => m[1]);
const headers = (html) => [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));

describe("BillingSchedule shared", () => {
  test("a kit Card with its own header: Billing schedule and the plan as description", () => {
    for (const view of ["full", "nextOnly", "failed"]) {
      const html = h({ view, charges: CHARGES, next: NEXT, description: "Pro plan" });
      assert.match(html, /^<article[^>]*aria-labelledby="[^"]+"/, `${view}: article named by its heading`);
      assert.match(html, /<h2[^>]*>Billing schedule<\/h2>/);
      assert.match(html, /<p[^>]*>Pro plan<\/p>/);
    }
  });

  test("view defaults to full; className and native attributes reach the article", () => {
    const html = h({ charges: CHARGES, className: "mine", id: "schedule" });
    assert.match(html, /^<article[^>]*class="[^"]*mine"/);
    assert.match(html, /^<article[^>]*id="schedule"/);
    assert.match(html, /data-charge-table="schedule"/);
  });
});

describe("BillingSchedule view=full", () => {
  test("one Table: Date, Description, Status, Amount; upcoming first, then billed newest first", () => {
    const html = h({ view: "full", charges: [...CHARGES].reverse() });
    assert.equal((html.match(/<table/g) ?? []).length, 1);
    assert.deepEqual(headers(html), ["Date", "Description", "Status", "Amount"]);
    assert.deepEqual(dates(html), ["01 Dec 2026", "01 Nov 2026", "18 Oct 2026", "01 Oct 2026", "01 Sep 2026"]);
  });

  test("status is a word in a Badge; the next charge says Next charge once", () => {
    const html = h({ view: "full", charges: CHARGES });
    for (const word of ["Upcoming", "Paid", "Invoiced", "Failed", "Waived"]) assert.ok(text(html).includes(` ${word} `), word);
    assert.equal((html.match(/>Next charge</g) ?? []).length, 1);
    assert.match(text(html), /Pro plan · monthly Next charge/);
  });

  test("Next charge sits on the earliest row still due, a retrying charge included", () => {
    const retry = { id: "retry", date: "2026-11-20", label: "Seat added", amount: "$22.40", status: "retrying", invoice: "INV-0119" };
    const html = h({ view: "full", charges: [...CHARGES, retry] });
    assert.equal((html.match(/>Next charge</g) ?? []).length, 1);
    assert.match(text(html), /Seat added Next charge/);
    assert.doesNotMatch(text(html), /Pro plan · monthly Next charge/);
  });

  test("no failure Alert when a later charge was paid; Download all shows", () => {
    const html = h({ view: "full", charges: CHARGES, onDownloadAll: noop, onUpdateCard: noop });
    assert.ok(!text(html).includes("failed on"));
    assert.ok(!text(html).includes("Update card"));
    assert.ok(text(html).includes("Download all"));
  });

  test("an open failure shows the danger Alert over the table and hides Download all", () => {
    const html = h({ view: "full", charges: OPEN_FAILURE, failureDetail: DETAIL, onDownloadAll: noop, onUpdateCard: noop });
    assert.ok(text(html).includes("$480.00 failed on 01 Oct 2026"));
    assert.ok(text(html).includes(DETAIL));
    assert.ok(text(html).includes("Update card"));
    assert.ok(!text(html).includes("Download all"));
    assert.ok(html.indexOf("failed on") < html.indexOf("<table"), "Alert above the table");
  });

  test("row actions only with their handlers: pencil on scheduled rows, Download on billed rows", () => {
    assert.ok(!h({ view: "full", charges: CHARGES }).includes('aria-label="Edit'));
    const html = h({ view: "full", charges: CHARGES, onEditCharge: noop, onDownloadInvoice: noop });
    assert.match(html, /aria-label="Edit Pro plan monthly, 01 Dec 2026"/);
    assert.match(html, /aria-label="Download INV-0117"/);
    assert.ok(!html.includes('aria-label="Download INV-0118"'), "no Download on the scheduled row");
  });

  test("empty, loading and error", () => {
    const empty = text(h({ view: "full", charges: [] }));
    assert.ok(empty.includes("No charges yet"));
    assert.ok(text(h({ view: "full", charges: [], emptyDescription: "Your first charge shows here" })).includes("Your first charge shows here"));

    const loading = h({ view: "full", loading: true, charges: CHARGES, onDownloadAll: noop });
    assert.match(loading, /^<article[^>]*aria-busy="true"/);
    assert.deepEqual(headers(loading), ["Date", "Description", "Status", "Amount"], "the header stays");
    assert.ok(!text(loading).includes("Download all"));

    const error = h({ view: "full", error: "Check your connection, then try again", onRetry: noop });
    assert.ok(text(error).includes("Couldn’t load the billing schedule"));
    assert.ok(text(error).includes("Check your connection, then try again"));
    assert.ok(text(error).includes("Retry"));
  });
});

describe("BillingSchedule view=nextOnly", () => {
  test("the panel: Next charge on the date, the figure, Pays with and Change card; no table", () => {
    const html = h({ view: "nextOnly", charges: CHARGES, next: NEXT, onChangeCard: noop });
    assert.ok(!html.includes("<table"));
    assert.match(html, /<section[^>]*aria-label="Next charge"/);
    const t = text(html);
    assert.ok(t.includes("Next charge on 01 Dec 2026"));
    assert.ok(t.includes("$480.00"));
    assert.ok(t.includes("Pays with Visa ending 4242"));
    assert.ok(t.includes("Change card"));
  });

  test("never shows the failure Alert or Download all", () => {
    const t = text(h({ view: "nextOnly", charges: OPEN_FAILURE, next: NEXT, onUpdateCard: noop, onDownloadAll: noop }));
    assert.ok(!t.includes("failed on"));
    assert.ok(!t.includes("Download all"));
  });

  test("empty, loading and error of its own", () => {
    assert.ok(text(h({ view: "nextOnly", charges: CHARGES })).includes("No upcoming charge"));

    const loading = h({ view: "nextOnly", loading: true, next: NEXT });
    assert.match(loading, /^<article[^>]*aria-busy="true"/);
    assert.ok(!loading.includes("<table"), "panel-shaped Skeleton, not the table");
    assert.equal((loading.match(/Loading the next charge/g) ?? []).length, 1, "announces once");
    assert.ok(!text(loading).includes("Visa ending 4242"));

    const error = text(h({ view: "nextOnly", error: "Check your connection, then try again", onRetry: noop }));
    assert.ok(error.includes("Couldn’t load the next charge"));
    assert.ok(error.includes("Retry"));
  });
});

describe("BillingSchedule view=failed", () => {
  test("the open failure: danger Alert with Update card, then the failed charge first and what is still owed", () => {
    const html = h({ view: "failed", charges: CHARGES.filter((c) => c.id !== "nov"), failureDetail: DETAIL, onUpdateCard: noop });
    const t = text(html);
    assert.ok(t.includes("$480.00 failed on 01 Oct 2026"));
    assert.ok(t.includes("Update card"));
    assert.deepEqual(dates(html), ["01 Oct 2026", "18 Oct 2026"], "failed first, then invoiced; no paid, waived or scheduled rows");
    assert.ok(!t.includes("Next charge"));
    assert.ok(!t.includes("Download all"));
  });

  test("a failure that a later payment settled is not open: the empty state", () => {
    const t = text(h({ view: "failed", charges: CHARGES }));
    assert.ok(t.includes("No failed payments"));
    assert.ok(!t.includes("failed on"));
  });

  test("a failure that a later waived charge settled is not open either", () => {
    const waived = { id: "nov-waived", date: "2026-11-01", label: "Pro plan · monthly", amount: "$0.00", status: "waived", invoice: "INV-0117", note: "Credit applied" };
    const charges = [...OPEN_FAILURE, waived];
    assert.ok(text(h({ view: "failed", charges })).includes("No failed payments"));
    const full = text(h({ view: "full", charges, onUpdateCard: noop }));
    assert.ok(!full.includes("failed on"));
    assert.ok(!full.includes("Update card"));
  });

  test("loading and error of its own", () => {
    const loading = h({ view: "failed", loading: true, charges: OPEN_FAILURE });
    assert.match(loading, /^<article[^>]*aria-busy="true"/);
    assert.deepEqual(headers(loading), ["Date", "Description", "Status", "Amount"]);
    assert.ok(!text(loading).includes("failed on"));

    const error = text(h({ view: "failed", error: "Check your connection, then try again", onRetry: noop }));
    assert.ok(error.includes("Couldn’t load failed payments"));
    assert.ok(error.includes("Retry"));
  });
});
