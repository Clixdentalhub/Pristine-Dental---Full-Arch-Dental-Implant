import { test, expect } from './fixtures.mjs';

/* Virtual consultation page: bookings go straight into the GoHighLevel
   calendar. The landing URL's UTMs and fbclid are carried into the calendar
   URL (and kept for return visits) so GHL attributes the booking to the ad.
   No lead is posted anywhere else. */
const QS = '?utm_source=facebook&utm_medium=paid_social&utm_campaign=virtual_consult&utm_term=full_arch&utm_content=ad3&fbclid=IwAR_test123';

async function open(page, qs = QS) {
  const hooks = [];
  await page.route(/\/hooks\//, (route) => { hooks.push(route.request().url()); route.fulfill({ status: 200, body: '{}' }); });
  await page.route(/widget\/booking/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>calendar</p>' }));
  await page.route(/msgsndr\.com/, (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await page.goto('/virtual.html' + qs, { waitUntil: 'load' });
  return hooks;
}

async function calendarSrc(page) {
  await expect(page.locator('.cal-slot iframe')).toHaveCount(1);
  return new URL(await page.locator('.cal-slot iframe').getAttribute('src'));
}

test('virtual — the calendar loads straight away, carrying UTMs + fbclid', async ({ page }) => {
  const hooks = await open(page);
  const src = await calendarSrc(page);
  expect(src.pathname).toContain('/widget/booking/k4WmyISYYXyCtD2daAUf');
  for (const [k, v] of [['utm_source', 'facebook'], ['utm_medium', 'paid_social'], ['utm_campaign', 'virtual_consult'],
    ['utm_term', 'full_arch'], ['utm_content', 'ad3'], ['fbclid', 'IwAR_test123']]) {
    expect(src.searchParams.get(k), k).toBe(v);
  }
  expect(await page.locator('.cal-slot iframe').getAttribute('id')).toMatch(/^k4WmyISYYXyCtD2daAUf_\d+$/);
  await page.waitForTimeout(300);
  expect(hooks, 'nothing is posted to a webhook').toEqual([]);
});

test('virtual — attribution survives a return visit without the query string', async ({ page }) => {
  await open(page);                 // first visit stores the UTMs
  await open(page, '');             // second visit: clean URL
  const src = await calendarSrc(page);
  expect(src.searchParams.get('utm_source')).toBe('facebook');
  expect(src.searchParams.get('fbclid')).toBe('IwAR_test123');
});

test('virtual — an organic visit adds no attribution parameters', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await open(page, '');
  const src = await calendarSrc(page);
  expect([...src.searchParams.keys()]).toEqual([]);
});
