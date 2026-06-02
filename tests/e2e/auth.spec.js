import { test, expect } from '@playwright/test';

test.describe('Auth screen — validation', () => {
  test('empty submit shows error', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ouvrir mon compte/i }).first().click();
    await page.getByRole('button', { name: /Créer mon compte/i }).click();
    await expect(page.getByText(/Email et mot de passe requis/i)).toBeVisible();
  });

  test('short password rejected on signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ouvrir mon compte/i }).first().click();
    await page.getByPlaceholder(/votre@email/i).fill('test@example.com');
    await page.getByPlaceholder(/••••••/i).fill('123');
    await page.getByRole('button', { name: /Créer mon compte/i }).click();
    await expect(page.getByText(/6 caractères minimum/i)).toBeVisible();
  });

  test('toggle between signup and login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ouvrir mon compte/i }).first().click();
    await expect(page.getByRole('heading', { name: /Créer un compte/i })).toBeVisible();
    await page.getByRole('button', { name: /^Connexion$/ }).click();
    await expect(page.getByRole('heading', { name: /^Connexion$/i })).toBeVisible();
  });

  test('back to landing from auth', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ouvrir mon compte/i }).first().click();
    await page.getByRole('button', { name: /Retour à l'accueil/i }).click();
    await expect(page.getByText(/Le copilote de vos/i).first()).toBeVisible();
  });
});
