import { test, expect } from './fixtures.mjs';

/* Virtual consultation page: the details step posts the lead, with the
   landing URL's UTMs and fbclid, to the GHL inbound webhook, then reveals a
   calendar whose URL carries the same attribution and prefills the person. */
const WEBHOOK = /hooks\/Qh2Etm9DVw9ouOs9EgCL\/webhook-trigger\/871094b9-8424-4a6c-862d-98de89564df5/;
const QS = '?utm_source=facebook&utm_medium=paid_social&utm_campaign=virtual_consult&utm_term=full_arch&utm_content=ad3&fbclid=IwAR_test123';

async function open(page, qs = QS) {
  const posts = [];
  await page.route(WEBHOOK, (route) => { posts.push(route.request().postDataJSON()); route.fulfill({ status: 200, body: '{}' }); });
  await page.route(/widget\/booking/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>calendar</p>' }));
  await page.route(/msgsndr\.com/, (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await page.goto('/virtual.html' + qs, { waitUntil: 'load' });
  return posts;
}

async function fill(page) {
  await page.fill('#b-first', 'Jane');
  await page.fill('#b-last', 'Doe');
  await page.fill('#b-phone', '07700 900123');
  await page.fill('#b-email', 'jane@example.com');
}

test('virtual — details step shows first; the calendar waits', async ({ page }) => {
  await open(page);
  await expect(page.locator('#book-details')).toBeVisible();
  await expect(page.locator('.cal-slot')).toBeHidden();
});

test('virtual — empty or invalid details are blocked, nothing is posted', async ({ page }) => {
  const posts = await open(page);
  await page.click('#book-details button[type=submit]');
  await expect(page.locator('#err-b-first')).toHaveText('Please fill this in.');
  await fill(page);
  await page.fill('#b-email', 'not-an-email');
  await page.click('#book-details button[type=submit]');
  await expect(page.locator('#err-b-email')).toHaveText('Please enter a valid email address.');
  await expect(page.locator('.cal-slot')).toBeHidden();
  expect(posts).toHaveLength(0);
});

test('virtual — the lead is posted with UTMs + fbclid, then the calendar carries them', async ({ page }) => {
  const posts = await open(page);
  await fill(page);
  await page.click('#book-details button[type=submit]');

  await expect(page.locator('.cal-slot iframe')).toBeVisible();
  await expect.poll(() => posts.length).toBe(1);
  const lead = posts[0];
  expect(lead).toMatchObject({
    firstName: 'Jane', lastName: 'Doe', phone: '07700 900123', email: 'jane@example.com',
    utm_source: 'facebook', utm_medium: 'paid_social', utm_campaign: 'virtual_consult',
    utm_term: 'full_arch', utm_content: 'ad3', fbclid: 'IwAR_test123',
  });
  expect(lead.fbc).toMatch(/^fb\.1\.\d+\.IwAR_test123$/);
  expect(lead.landing_page).toContain('fbclid=IwAR_test123');

  const src = new URL(await page.locator('.cal-slot iframe').getAttribute('src'));
  expect(src.pathname).toContain('/widget/booking/k4WmyISYYXyCtD2daAUf');
  for (const [k, v] of [['utm_source', 'facebook'], ['utm_campaign', 'virtual_consult'], ['fbclid', 'IwAR_test123'],
    ['first_name', 'Jane'], ['email', 'jane@example.com']]) expect(src.searchParams.get(k)).toBe(v);
  await expect(page.locator('#book-details')).toBeHidden();
});

test('virtual — attribution survives a return visit without the query string', async ({ page }) => {
  await open(page);                        // first visit stores the UTMs
  const posts = await open(page, '');      // second visit: clean URL
  await fill(page);
  await page.click('#book-details button[type=submit]');
  await expect.poll(() => posts.length).toBe(1);
  expect(posts[0]).toMatchObject({ utm_source: 'facebook', fbclid: 'IwAR_test123' });
});

test('virtual — the honeypot shows the calendar but sends nothing', async ({ page }) => {
  const posts = await open(page);
  await fill(page);
  await page.evaluate(() => { document.getElementById('b-company').value = 'Bot Ltd'; });
  await page.click('#book-details button[type=submit]');
  await expect(page.locator('.cal-slot iframe')).toBeVisible();
  await page.waitForTimeout(300);
  expect(posts).toHaveLength(0);
});
