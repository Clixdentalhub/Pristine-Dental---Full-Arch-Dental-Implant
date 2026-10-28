import { test, expect } from './fixtures.mjs';
import { readFile } from 'node:fs/promises';
import { PAGES } from './helpers.mjs';

test.use({ presetConsent: false });

/* The dataLayer entries Consent Mode writes, as plain arrays. */
const consentCalls = (page) => page.evaluate(() =>
  (window.dataLayer || []).filter((e) => e && e[0] === 'consent').map((e) => [e[0], e[1], { ...e[2] }]));

for (const path of PAGES) {
  test(`${path} — consent defaults run before GTM, and the banner is on the page`, async () => {
    const html = await readFile('.' + path, 'utf8');
    const def = html.indexOf("gtag('consent', 'default'");
    const gtm = html.indexOf('<!-- Google Tag Manager -->');
    expect(def, 'consent default missing').toBeGreaterThan(-1);
    expect(def, 'consent default must come before GTM').toBeLessThan(gtm);
    expect(html).toContain('id="cc"');
    expect(html, 'footer "Cookie settings" link missing').toContain('class="cc-reopen" data-cc-open');
  });
}

test('first visit: everything non-essential is denied and the banner asks', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'load' });
  await expect(page.locator('#cc')).toBeVisible();
  const [first] = await consentCalls(page);
  expect(first[1]).toBe('default');
  expect(first[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  // reject sits beside accept at the same size
  const [r, a] = await Promise.all(['.cc-reject', '.cc-accept'].map((s) => page.locator(s).boundingBox()));
  expect(Math.round(r.height)).toBe(Math.round(a.height));
  expect(Math.abs(r.width - a.width)).toBeLessThan(2);
});

test('reject all: stays denied, is remembered, and the footer link reopens it', async ({ page }) => {
  await page.goto('/virtual.html', { waitUntil: 'load' });
  await page.locator('.cc-reject').click();
  await expect(page.locator('#cc')).toBeHidden();
  const last = (await consentCalls(page)).at(-1);
  expect(last[1]).toBe('update');
  expect(last[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });

  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('#cc')).toBeHidden();

  await page.locator('[data-cc-open]').click();
  await expect(page.locator('#cc')).toBeVisible();
  await expect(page.locator('.cc-reject')).toBeFocused();
});

test('accept all: grants consent and tells GTM', async ({ page }) => {
  await page.goto('/in-person.html', { waitUntil: 'load' });
  await page.locator('.cc-accept').click();
  const last = (await consentCalls(page)).at(-1);
  expect(last[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
  const ev = await page.evaluate(() => window.dataLayer.filter((e) => e && e.event === 'consent_update').at(-1));
  expect(ev).toMatchObject({ consent_analytics: 'granted', consent_marketing: 'granted' });

  // the returning visit applies the stored choice in <head>, before GTM
  await page.reload({ waitUntil: 'load' });
  const calls = await consentCalls(page);
  expect(calls[1][1]).toBe('update');
  expect(calls[1][2]).toMatchObject({ analytics_storage: 'granted' });
});

test('manage preferences: analytics only', async ({ page }) => {
  await page.goto('/aligners.html', { waitUntil: 'load' });
  await page.locator('[data-cc="manage"]').click();
  await expect(page.locator('#cc-prefs')).toBeVisible();
  await page.locator('label[for="cc-analytics"]').click();
  await page.locator('[data-cc="save"]').click();
  await expect(page.locator('#cc')).toBeHidden();
  const last = (await consentCalls(page)).at(-1);
  expect(last[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied' });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pdg_consent')));
  expect(stored).toMatchObject({ v: 1, analytics: true, marketing: false });
});

test('mobile: the banner fits the screen with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/index.html', { waitUntil: 'load' });
  const box = await page.locator('#cc').boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  expect(box.y + box.height).toBeLessThanOrEqual(740);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test('opening preferences swaps the link for a save button', async ({ page }) => {
  await page.goto('/thank-you.html', { waitUntil: 'load' });
  await page.locator('[data-cc="manage"]').click();
  await expect(page.locator('[data-cc="manage"]')).toBeHidden();
  await expect(page.locator('[data-cc="save"]')).toBeVisible();
});
