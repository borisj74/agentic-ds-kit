/**
 * FileUpload variants and the Choose files Button; TagInput lg, maxTags count and notes.
 * Runs against the built kit (dist); `npm test` builds first.
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

let h;
let render;
let FileUpload;
let TagInput;

before(async () => {
  const React = await import("react");
  h = React.createElement;
  ({ renderToStaticMarkup: render } = await import("react-dom/server"));
  ({ FileUpload } = await import("../dist/ui/FileUpload/FileUpload.js"));
  ({ TagInput } = await import("../dist/ui/TagInput/TagInput.js"));
});

describe("FileUpload", () => {
  test("zone renders a Choose files Button with the id and limits line linked", () => {
    const html = render(h(FileUpload, { id: "att", maxSizeLabel: "PDF or PNG, max 10 MB", onFilesSelected() {} }));
    assert.match(html, /<button[^>]*id="att"[^>]*>/);
    assert.match(html, /Choose files/);
    assert.match(html, /or drag and drop/);
    assert.doesNotMatch(html, /Click to upload/);
    const describedBy = html.match(/<button[^>]*aria-describedby="([^"]+)"/)[1];
    const hintId = describedBy.split(" ")[0];
    assert.match(html, new RegExp(`id="${hintId}"[^>]*>PDF or PNG, max 10 MB<`));
    assert.equal((html.match(/<button/g) || []).length, 1, "only the Choose files Button is a button");
  });

  test("compact drops the drag copy and keeps the limits line", () => {
    const html = render(h(FileUpload, { variant: "compact", maxSizeLabel: "max 10 MB", onFilesSelected() {} }));
    assert.match(html, /Choose files/);
    assert.match(html, /max 10 MB/);
    assert.doesNotMatch(html, /or drag and drop/);
  });

  test("error row shows a labelled Retry Button named for the file", () => {
    const html = render(
      h(FileUpload, {
        onFilesSelected() {},
        onRetry() {},
        files: [{ id: "1", name: "statement-q3.csv", size: 12_600_000, status: "error", error: "Over the 10 MB limit" }],
      }),
    );
    const [, retryId, nameId] = html.match(/<button[^>]*id="([^"]+)"[^>]*aria-labelledby="\1 ([^"]+)"/) ?? [];
    assert.ok(retryId, "Retry is labelled by itself plus the file name");
    assert.match(html, new RegExp(`id="${nameId}"[^>]*>statement-q3.csv<`));
    assert.match(html, />Retry</);
    assert.match(html, /Over the 10 MB limit/);
  });
});

describe("TagInput", () => {
  test("lg size is accepted and maxTags shows a count linked to the input", () => {
    const html = render(h(TagInput, { id: "labels", size: "lg", maxTags: 8, defaultValue: ["finance", "net-30", "northwind"] }));
    assert.match(html, /data-size="lg"/);
    assert.match(html, />3(<!-- -->)?\/(<!-- -->)?8</);
    const describedBy = html.match(/<input[^>]*aria-describedby="([^"]+)"/)[1];
    assert.match(html, new RegExp(`id="${describedBy}"[^>]*>3 of 8 tags<`));
  });

  test("renders a polite live region for duplicate, limit and Backspace notes", () => {
    const html = render(h(TagInput, { id: "kw" }));
    assert.match(html, /<p[^>]*aria-live="polite"/);
    assert.doesNotMatch(html, /<input[^>]*aria-describedby/);
  });
});
