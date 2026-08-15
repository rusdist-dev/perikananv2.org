import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * axe di SETIAP halaman, di SEMUA locale, di kedua viewport.
 *
 * Semua locale, bukan hanya default: teks yang lebih panjang dalam satu bahasa
 * bisa memaksa pembungkusan yang merusak target sentuh, dan atribut lang yang
 * salah hanya muncul di locale non-default.
 */

const PAGES = [
  { path: '', name: 'beranda' },
  { path: '/berita', name: 'daftar berita' },
  { path: '/berita/contoh-artikel-pertama', name: 'detail artikel' },
];

const LOCALE_PREFIXES = [
  { prefix: '', name: 'id' },
  { prefix: '/en', name: 'en' },
];

for (const locale of LOCALE_PREFIXES) {
  for (const page_ of PAGES) {
    const url = `${locale.prefix}${page_.path}` || '/';

    test(`axe: ${page_.name} (${locale.name})`, async ({ page }) => {
      await page.goto(url);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Pelanggarannya dicetak utuh: "expected 0, got 3" tidak memberi tahu
      // apa pun tentang apa yang harus diperbaiki.
      expect(
        results.violations,
        results.violations
          .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target).join('\n  ')}`)
          .join('\n\n'),
      ).toEqual([]);
    });
  }
}

test.describe('nav mobile terbuka juga bersih', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 768, 'hanya di viewport mobile');

  test('axe: dialog nav terbuka', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /buka menu/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
