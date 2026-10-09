import { test, expect } from './fixtures.mjs';

/* The in-person, aligners and smile makeover pages post to the same lead webhook as the
   full arch funnel, so each lead must say which treatment it came from, and
   each page must land on its own thank-you page. */
const CASES = [
  ['/in-person.html', 'Full Arch — In-Person Consultation', /thank-you-in-person\.html\?name=Jane$/],
  ['/aligners.html', 'Pristine Aligners', /thank-you-aligners\.html\?name=Jane$/],
  ['/smile-makeover.html', 'Smile Makeover', /thank-you-smile-makeover\.html\?name=Jane$/],
];

for (const [path, treatment, landing] of CASES) {
  test(`${path} — the lead carries its treatment and lands on its own thank-you page`, async ({ page }) => {
    const posts = [];
    await page.route(/services\.leadconnectorhq\.com\/hooks/, (route) => {
      posts.push(route.request().postDataJSON());
      return route.fulfill({ status: 200, body: '{}' });
    });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto(path, { waitUntil: 'load' });

    await page.locator('.step[data-step="1"] .opt').first().click();
    await expect(page.locator('.step[data-step="2"]')).toBeVisible();
    await page.locator('.step[data-step="2"] .opt').first().click();
    await expect(page.locator('.step[data-step="3"]')).toBeVisible();
    await page.fill('input[name=firstName]', 'Jane');
    await page.fill('input[name=lastName]', 'Doe');
    await page.fill('input[name=phone]', '07700 900123');
    await page.fill('input[name=email]', 'jane@example.com');
    await page.locator('.step[data-step="3"] button[type=submit]').click();

    await page.waitForURL(landing);
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({ treatment, firstName: 'Jane', email: 'jane@example.com' });
    await expect(page.locator('#greet-name')).toHaveText(', Jane');
  });
}
