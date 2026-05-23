import { test, expect, type Page } from "@playwright/test";

// Visual-parity baseline for the public site. These screenshots are the
// contract that the page-builder enhancements must not change unless a visual
// change is the explicit point of a PR (then re-baseline with --update-snapshots
// and call it out in the PR). Baselines are platform-specific (e.g. -darwin);
// regenerate on the same OS where they were captured.
const PUBLIC_ROUTES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "research", path: "/research" },
  { name: "studies", path: "/studies" },
  { name: "team", path: "/team" },
  { name: "contact", path: "/contact" },
  { name: "collaborations", path: "/collaborations" },
  { name: "collaborations-academic", path: "/collaborations/academic" },
  { name: "collaborations-industry", path: "/collaborations/industry" },
  { name: "study-ferdinand", path: "/studies/ferdinand" },
] as const;

// Scroll the full page to trigger lazy-loaded images/sections, then return to
// the top and wait for web fonts so the screenshot is fully rendered.
async function settlePage(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let total = 0;
        const distance = window.innerHeight;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          total += distance;
          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 60);
      }),
  );
  await page.evaluate(() => document.fonts.ready);
}

test.describe("public site visual parity", () => {
  for (const route of PUBLIC_ROUTES) {
    test(route.name, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "load" });
      await settlePage(page);
      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        animations: "disabled",
        // Embeds (autoplaying YouTube on /about, Google Maps on /contact) paint
        // non-deterministic pixels; mask them so only our markup is compared.
        mask: [page.locator("iframe")],
      });
    });
  }
});
