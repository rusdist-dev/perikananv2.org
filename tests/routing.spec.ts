import { test, expect } from '@playwright/test';

/**
 * Kontrak middleware. Kalau salah satu tes ini jatuh, satu halaman sedang hidup
 * di dua URL sekaligus atau aset statis sedang di-rewrite jadi rute.
 */

test.describe('routing locale', () => {
  test('locale default disajikan tanpa prefiks, tanpa redirect', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id-ID');
  });

  test('prefiks default di-redirect 308 ke bentuk kanonik', async ({ request }) => {
    const response = await request.get('/id/berita', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers()['location'], 'http://x').pathname).toBe('/berita');
  });

  test('/id polos juga di-redirect ke /', async ({ request }) => {
    const response = await request.get('/id', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers()['location'], 'http://x').pathname).toBe('/');
  });

  test('locale berprefiks disajikan apa adanya', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('aset statis tidak di-rewrite ke locale', async ({ request }) => {
    // Regresi yang pernah nyata: matcher berbasis daftar kecualian me-rewrite
    // /sitemap.xml jadi /id/sitemap.xml lalu 404.
    for (const asset of ['/sitemap.xml', '/robots.txt']) {
      const response = await request.get(asset, { maxRedirects: 0 });
      expect(response.status(), `${asset} harus 200`).toBe(200);
    }
  });

  test('sitemap memuat URL kanonik, bukan /id/', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toContain('/id/');
    expect(xml).toContain('/en');
  });

  test('language switcher bertahan di halaman yang sama', async ({ page, viewport }) => {
    await page.goto('/berita');

    // Pemilih bahasa hidup di dalam panel. Di bawah lg panel itu overlay, jadi
    // harus dibuka dulu; scope-nya dipertegas supaya tes tidak diam-diam
    // mengenai salinan panel yang sedang display:none.
    const mobile = (viewport?.width ?? 0) < 1024;
    if (mobile) await page.getByRole('button', { name: /buka menu/i }).click();
    const scope = mobile ? page.getByRole('dialog') : page.getByRole('banner');

    await scope
      .getByRole('navigation', { name: /pilih bahasa/i })
      .getByRole('link', { name: /english/i })
      .click();

    await expect(page).toHaveURL(/\/en\/berita$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('link internal di locale berprefiks membawa prefiksnya', async ({ page }) => {
    await page.goto('/en');
    // :not([hreflang]) mengecualikan language switcher, yang memang HARUS
    // menaut ke /berita tanpa prefiks untuk menunjuk versi locale default.
    const hrefs = await page.locator('a[href^="/"]:not([hreflang])').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? ''),
    );
    const routeLinks = hrefs.filter((h) => !h.split('/').pop()?.includes('.'));
    expect(routeLinks.length).toBeGreaterThan(0);
    for (const href of routeLinks) {
      expect(href, `${href} kehilangan prefiks /en`).toMatch(/^\/en(\/|$)/);
    }
  });
});
