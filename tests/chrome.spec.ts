import { test, expect } from '@playwright/test';

/**
 * Chrome diuji lewat KEYBOARD, bukan klik.
 *
 * Klik lolos bahkan ketika fokus tidak pernah masuk panel, tidak pernah
 * kembali ke pemicu, dan Escape tidak melakukan apa-apa. Tiga kegagalan itu
 * hanya terlihat kalau yang dijalankan Tab/Enter/Escape.
 */

const isMobile = (w?: number | null) => (w ?? 0) < 1024;

test.describe('skip link', () => {
  test('elemen pertama yang difokus, dan memindahkan fokus ke <main>', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: /lompat ke konten utama/i });
    await expect(skip).toBeFocused();
    // Harus terlihat saat difokus: pengguna keyboard yang awas perlu melihat
    // fokusnya bergerak, bukan menebak.
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});

test.describe('panel navigasi — minimize (desktop)', () => {
  test.skip(({ viewport }) => isMobile(viewport?.width), 'sidebar hanya ada di lg ke atas');

  test('menyisakan seksi Program, dan mengumumkannya lewat aria-expanded', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /perkecil menu/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Semua seksi terlihat sebelum diminimalkan.
    for (const heading of ['Program', 'Jelajahi', 'Data', 'Hubungi']) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }

    await toggle.focus();
    await page.keyboard.press('Enter');

    const expand = page.getByRole('button', { name: /perbesar menu/i });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    // Fokus harus tetap di tombol yang sama setelah label & ikonnya berubah;
    // kalau ia hilang, pengguna keyboard terlempar ke awal dokumen.
    await expect(expand).toBeFocused();

    await expect(page.getByRole('heading', { name: 'Program', exact: true })).toBeVisible();
    for (const heading of ['Jelajahi', 'Data', 'Hubungi']) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeHidden();
    }
    // Pencarian dan pemilih bahasa ikut tersembunyi bersama seksi lain.
    await expect(page.getByRole('navigation', { name: /pilih bahasa/i })).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Hubungi', exact: true })).toBeVisible();
  });

  test('card mengambang, dan tingginya menyusut saat diminimalkan', async ({ page, viewport }) => {
    await page.goto('/');
    const card = page.locator('#site-nav-card');

    const expanded = (await card.boundingBox())!;
    // Mengambang, bukan menempel: ada jarak dari tepi atas dan tepi kiri.
    expect(expanded.y).toBeGreaterThan(0);
    expect(expanded.x).toBeGreaterThan(0);
    // Dan tidak setinggi viewport -- itu yang membedakan card dari sidebar.
    expect(expanded.height).toBeLessThan(viewport!.height);

    await page.getByRole('button', { name: /perkecil menu/i }).click();
    await expect(page.getByRole('heading', { name: 'Data', exact: true })).toBeHidden();

    const minimized = (await card.boundingBox())!;
    expect(minimized.height).toBeLessThan(expanded.height);
    // Lebarnya TIDAK ikut berubah: yang diminta menyesuaikan hanya tinggi.
    expect(minimized.width).toBe(expanded.width);
  });

  test('aria-controls menunjuk wilayah yang benar-benar ada', async ({ page }) => {
    await page.goto('/');
    const ids = (await page
      .getByRole('button', { name: /perkecil menu/i })
      .getAttribute('aria-controls'))!.split(/\s+/);

    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});

test.describe('panel navigasi — overlay (mobile)', () => {
  test.skip(({ viewport }) => !isMobile(viewport?.width), 'overlay hanya di bawah lg');

  test('dibuka dengan keyboard, memerangkap fokus, ditutup dengan Escape', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: /buka menu/i });
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(':focus')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Fokus kembali ke pemicu: tanpa ini pengguna keyboard terlempar ke awal
    // dokumen dan harus menelusuri ulang dari nol.
    await expect(trigger).toBeFocused();
  });

  test('Tab berputar di dalam dialog, tidak bocor ke halaman', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /buka menu/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(inside, `fokus bocor keluar dialog pada Tab ke-${i + 1}`).toBe(true);
    }
  });

  test('memilih link menutup panel dan berpindah halaman', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /buka menu/i }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('link', { name: 'Berita dan Kegiatan' }).click();

    await expect(page).toHaveURL(/\/berita$/);
    // Tanpa penutupan eksplisit, navigasi client-side memindahkan halaman
    // sementara panel tetap menutupi layar.
    await expect(dialog).toBeHidden();
  });
});

test.describe('halaman aktif', () => {
  test('ditandai aria-current, bukan hanya dicetak tebal', async ({ page, viewport }) => {
    await page.goto('/berita');
    if (isMobile(viewport?.width)) {
      await page.getByRole('button', { name: /buka menu/i }).click();
    }

    const scope = isMobile(viewport?.width) ? page.getByRole('dialog') : page.getByRole('banner');
    await expect(
      scope.getByRole('link', { name: 'Berita dan Kegiatan' }),
    ).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('landmark', () => {
  for (const path of ['/', '/en']) {
    test(`tepat satu banner/main/contentinfo di ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      // Satu <h1> per halaman: lebih dari satu membuat outline dokumen ambigu.
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }
});
