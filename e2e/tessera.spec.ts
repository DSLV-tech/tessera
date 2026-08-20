import { test, expect, type Page } from '@playwright/test';

/**
 * Regressioni verificate qui — tutte già emerse almeno una volta su dispositivo
 * reale, quindi vale la pena tenerle inchiodate:
 *  - il tabellone che sborda dallo schermo stretto;
 *  - la pedina non centrata nella casella (WebKit non stira un SVG con solo inset);
 *  - la barra di stato che tronca il nome del livello o si sovrappone al punteggio;
 *  - i progressi che non sopravvivono a un ricaricamento.
 */

const PHONE = { width: 360, height: 740 };

async function openFirstLevel(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Ho capito/ }).click().catch(() => {});
  await page.locator('ol button:not([disabled])').first().click();
  await page.getByRole('button', { name: 'Salta' }).click().catch(() => {});
}

test.describe('layout su schermo stretto', () => {
  test.use({ viewport: PHONE });

  test('nessun elemento sborda in orizzontale', async ({ page }) => {
    await openFirstLevel(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test('il tabellone sta dentro il viewport', async ({ page }) => {
    await openFirstLevel(page);
    const box = await page.locator('[data-cell]').first().boundingBox();
    const grid = await page.locator('[data-cell]').last().boundingBox();
    expect(box).not.toBeNull();
    expect(grid).not.toBeNull();
    expect(grid!.x + grid!.width).toBeLessThanOrEqual(PHONE.width);
    expect(box!.x).toBeGreaterThanOrEqual(0);
  });

  test('il nome del livello resta leggibile accanto al punteggio', async ({ page }) => {
    await openFirstLevel(page);
    const title = page.locator('h1, h2').first();
    const box = await title.boundingBox();
    expect(box).not.toBeNull();
    // Il titolo non deve essere schiacciato a zero né uscire dallo schermo.
    expect(box!.width).toBeGreaterThan(60);
    expect(box!.x + box!.width).toBeLessThanOrEqual(PHONE.width);
  });

  test('la pedina è centrata nella casella', async ({ page }) => {
    await openFirstLevel(page);
    await page.locator('[data-cell]:not([disabled])').first().click();
    // La pedina entra con un'animazione: misurarla a metà volo darebbe un falso
    // negativo, quindi si aspetta che tutte le animazioni siano concluse.
    await page.waitForFunction(() => {
      const stone = document.querySelector('svg[class*="stone"]');
      return stone !== null && stone.getAnimations().every((a) => a.playState === 'finished');
    });
    const insets = await page.evaluate(() => {
      const stone = document.querySelector('svg[class*="stone"]');
      if (stone === null) return null;
      const tile = stone.closest('button');
      if (tile === null) return null;
      const s = stone.getBoundingClientRect();
      const t = tile.getBoundingClientRect();
      return {
        left: s.x - t.x,
        right: t.x + t.width - (s.x + s.width),
        top: s.y - t.y,
        bottom: t.y + t.height - (s.y + s.height),
      };
    });
    expect(insets).not.toBeNull();
    expect(Math.abs(insets!.left - insets!.right)).toBeLessThan(1);
    expect(Math.abs(insets!.top - insets!.bottom)).toBeLessThan(1);
    expect(insets!.left).toBeGreaterThan(0);
  });
});

test.describe('regole e stato', () => {
  test.use({ viewport: PHONE });

  test('posare una pedina consuma una mossa e si può annullare', async ({ page }) => {
    await openFirstLevel(page);
    const before = await page.locator('svg[class*="stone"]').count();
    await page.locator('[data-cell]:not([disabled])').first().click();
    expect(await page.locator('svg[class*="stone"]').count()).toBe(before + 1);
    await page.getByRole('button', { name: 'Annulla' }).click();
    expect(await page.locator('svg[class*="stone"]').count()).toBe(before);
  });

  test('i progressi sopravvivono al ricaricamento', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ho capito/ }).click().catch(() => {});
    await page.evaluate(() => {
      localStorage.setItem(
        'tessera:v2',
        JSON.stringify({ version: 2, levels: { d01: { tier: 'gold', best: 17 } } }),
      );
    });
    await page.reload();
    // Il record deve comparire sulla scheda del livello, non solo nel totale.
    await expect(page.getByText('record 17').first()).toBeVisible();
  });
});

test.describe('accessibilità di base', () => {
  // La tastiera si prova senza emulazione touch: è lo scenario desktop.
  test.use({ viewport: { width: 1024, height: 768 }, isMobile: false, hasTouch: false });

  test('si può navigare da tastiera', async ({ page }) => {
    await openFirstLevel(page);
    const first = page.locator('[data-cell]').first();
    await first.focus();
    await page.keyboard.press('ArrowRight');
    const focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('data-cell'),
    );
    expect(focused).toBe('1');
  });

  test('ogni casella ha un nome accessibile', async ({ page }) => {
    await openFirstLevel(page);
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('[data-cell]')].filter(
        (el) => (el.getAttribute('aria-label') ?? '').length === 0,
      ).length,
    );
    expect(missing).toBe(0);
  });
});
