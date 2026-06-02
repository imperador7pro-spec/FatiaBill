import { test, expect } from '@playwright/test';

test.describe('Landing page — golden paths', () => {
  test('hero renders with primary CTA', async ({ page }) => {
    await page.goto('/');
    // Hero headline (Playfair Display, broken across <br/>)
    await expect(page.getByText(/Le copilote de vos/i).first()).toBeVisible();
    await expect(page.getByText(/jamais de votre vie/i).first()).toBeVisible();
    // Primary CTA visible
    const heroCta = page.getByRole('button', { name: /Ouvrir mon compte/i }).first();
    await expect(heroCta).toBeVisible();
  });

  test('TopBar CTA opens auth signup screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ouvrir mon compte/i }).first().click();
    await expect(page.getByRole('heading', { name: /Créer un compte|Connexion/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByPlaceholder(/votre@email/i)).toBeVisible();
  });

  test('pricing shows two paid plans only — no free tier', async ({ page }) => {
    await page.goto('/');
    // Both plans
    await expect(page.getByText(/Privé Premium/i).first()).toBeVisible();
    await expect(page.getByText(/Pro Premium/i).first()).toBeVisible();
    // Prices
    await expect(page.getByText(/9 CHF|9.- CHF/i).first()).toBeVisible();
    await expect(page.getByText(/29 CHF|29.- CHF/i).first()).toBeVisible();
    // No discovery/free tier anywhere
    await expect(page.getByText(/Découverte/i)).toHaveCount(0);
    await expect(page.getByText(/Gratuit pour toujours/i)).toHaveCount(0);
  });

  test('FAQ mentions read-only post-trial (not "plan gratuit")', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/lecture seule/i).first()).toBeVisible();
  });

  test('footer attribution to Duares Systems', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Duares Systems/i)).toBeVisible();
  });
});
