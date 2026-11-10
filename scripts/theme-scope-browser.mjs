/**
 * Radius stays on the preview. Docs chrome does not move.
 * Requires the playground at http://127.0.0.1:43123.
 *
 *   npx --yes playwright install chromium
 *   node scripts/theme-scope-browser.mjs
 */
import { chromium } from "playwright";

const base = process.env.THEME_SCOPE_URL ?? "http://127.0.0.1:43123";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(`${base}/theme`, { waitUntil: "networkidle" });
  const docs = page.getByRole("button", { name: "Theme" });
  const preview = page.getByRole("button", { name: "New order" });
  await docs.waitFor();
  await preview.waitFor();

  const before = await docs.evaluate((element) => getComputedStyle(element).borderRadius);

  const query = "preset=custom&brand=e11d48&accent=none&neutral=neutral&step=600&density=default&shadow=default&shade=100&blur=100&tint=neutral&font=ibm-plex&display=ibm-plex&weight=600&mode=light";
  await page.goto(`${base}/theme?${query}&radius=48&pill=0`, { waitUntil: "networkidle" });
  await preview.waitFor();

  const docsAfter = await docs.evaluate((element) => getComputedStyle(element).borderRadius);
  const previewAfter = await preview.evaluate((element) => getComputedStyle(element).borderRadius);
  if (previewAfter !== "36px") {
    throw new Error(`Radius 48 should set the preview control to 36px, got ${previewAfter}`);
  }

  await page.goto(`${base}/theme?${query}&radius=48&pill=1`, { waitUntil: "networkidle" });
  await preview.waitFor();
  const pillRadius = await preview.evaluate((element) => getComputedStyle(element).borderRadius);
  if (pillRadius !== "9999px") {
    throw new Error(`Pill should set the preview control to 9999px, got ${pillRadius}`);
  }
  const docsPill = await docs.evaluate((element) => getComputedStyle(element).borderRadius);
  const htmlTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  const scopeTheme = await page.evaluate(() => document.querySelector("[data-theme-scope]")?.getAttribute("data-theme") ?? null);

  if (docsAfter !== before || docsPill !== before) {
    throw new Error(`Docs header button radius changed from ${before} to ${docsAfter} / ${docsPill}`);
  }
  if (previewAfter === docsAfter) {
    throw new Error(`Preview button radius ${previewAfter} did not change from the docs button`);
  }
  if (htmlTheme) {
    throw new Error(`html data-theme is ${htmlTheme}; dark mode must stay on the preview`);
  }
  if (scopeTheme) {
    throw new Error(`Light preview set data-theme=${scopeTheme} on the scope`);
  }

  console.log(`docs radius stayed ${docsPill}; radius 48 is ${previewAfter}; pill is ${pillRadius}`);
} finally {
  await browser.close();
}
