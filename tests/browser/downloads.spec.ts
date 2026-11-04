import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
import path from "node:path";

// Serial: exercise the real Next.js production cache across releases and outages.
test("desktop/mobile downloads, navigation, SEO and live revalidation", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/download");
  await expect(page.getByRole("heading", { name: "Download Chuchu · v1.2.3" })).toBeVisible();
  const buttons = page.getByRole("link", { name: /^Download Chuchu 1\.2\.3 for / });
  await expect(buttons).toHaveCount(4);
  for (const button of await buttons.all()) expect(await button.getAttribute("href")).toMatch(/^https:\/\/downloads\.chuchu-lang\.org\//);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.chuchu-lang.org/download");
  await expect(page.getByRole("heading", { name: "A home in VS Code." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build Cheeku yourself (advanced)" })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Downloads', exact: true })).toHaveAttribute("aria-current", "page");
  const redirect = await request.get("/downloads", { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe("/download");
  await expect(page.locator(".installer-checksum summary")).toHaveCount(4);
  await page.locator(".installer-checksum summary").first().click();
  await expect(page.locator(".installer-checksum > code").first()).toHaveText("a".repeat(64));
  await page.screenshot({ path: "test-results/downloads-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(buttons).toHaveCount(4);
  for (const button of await buttons.all()) await expect(button).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/downloads-mobile.png", fullPage: true });
  await buttons.first().focus();
  await expect(buttons.first()).toBeFocused();

  writeFileSync(path.resolve("tests/.release-state.json"), JSON.stringify({ version: "1.3.0" }));
  await expect.poll(async () => {
    await page.reload();
    return page.getByRole("heading", { name: "Download Chuchu · v1.3.0" }).count();
  }, { timeout: 85000, intervals: [5000] }).toBe(1);
  await expect(page.getByRole("link", { name: /^Download Chuchu 1\.3\.0 for / })).toHaveCount(4);
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.some((text) => text.includes('"softwareVersion":"1.3.0"'))).toBe(true);

  writeFileSync(path.resolve("tests/.release-state.json"), JSON.stringify({ version: "1.3.0", status: 403 }));
  await expect.poll(async () => {
    await page.reload();
    return page.getByRole("heading", { name: "No downloadable compiler release is available right now." }).count();
  }, { timeout: 85000, intervals: [5000] }).toBe(1);
  await expect(page.getByRole("link", { name: /^Download Chuchu .* for / })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "A home in VS Code." })).toBeVisible();
  expect(errors).toEqual([]);
});
