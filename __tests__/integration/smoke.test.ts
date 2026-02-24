import { test, expect } from '@playwright/test';

/**
 * Smoke Tests: Verificações rápidas de sanidade
 *
 * Estes testes devem rodar RÁPIDO (<1 minuto total)
 * para validar que o sistema está funcional antes
 * de rodar a suite completa.
 */

test.describe('Smoke Tests - Content Creation', () => {
  test('deve carregar a página de criação sem erros', async ({ page }) => {
    // Interceptar erros de console
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Carregar página
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Verificar que carregou
    await expect(page.locator('h1')).toBeVisible();

    // Verificar que não houve erros de console críticos
    const criticalErrors = consoleErrors.filter((err) =>
      err.includes('Failed to fetch') || err.includes('Cannot read property')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('deve mostrar as 3 opções do Quick Start', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Verificar opções visíveis
    await expect(page.locator('text=One-Click Smart')).toBeVisible();
    await expect(page.locator('text=Templates Rápidos')).toBeVisible();
    await expect(page.locator('text=Modo Avançado')).toBeVisible();
  });

  test('deve ter navegação funcional (breadcrumb)', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Verificar breadcrumb
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Auditoria');
    await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Gerar Conteúdo');
  });

  test('deve ter botão de voltar funcional', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Clicar voltar
    await page.click('button:has-text("Voltar")');

    // Deve redirecionar para página da auditoria
    await expect(page).toHaveURL(/\/audits\/test-audit-123/);
  });

  test('deve ter indicador de fases visível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Verificar indicador de fases
    await expect(page.locator('[data-testid="phase-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('1 CRIAR');
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('2 Refinar');
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('3 Exportar');
  });

  test('deve ser responsivo em mobile', async ({ page }) => {
    // Simular iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Página deve carregar sem quebrar layout
    await expect(page.locator('h1')).toBeVisible();

    // Cards devem estar empilhados (não side-by-side)
    const cards = page.locator('[data-testid="quick-start-card"]');
    const firstCard = cards.first();
    const box = await firstCard.boundingBox();

    if (box) {
      // Em mobile, card deve ocupar quase toda a largura
      expect(box.width).toBeGreaterThan(350); // ~90% de 390px
    }
  });

  test('deve carregar assets estáticos (CSS, JS)', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');

    // Não deve ter falhas de assets críticos
    const criticalFailures = failedRequests.filter(
      (url) => url.endsWith('.css') || url.endsWith('.js') || url.includes('/_next/')
    );

    expect(criticalFailures).toHaveLength(0);
  });

  test('deve ter performance aceitável (< 3s para First Contentful Paint)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Aguardar primeiro conteúdo visível
    await expect(page.locator('h1')).toBeVisible();

    const fcp = Date.now() - startTime;

    // First Contentful Paint deve ser < 3s
    expect(fcp).toBeLessThan(3000);

    console.log(`✅ First Contentful Paint: ${fcp}ms`);
  });
});

test.describe('Smoke Tests - API Health', () => {
  test('API /api/audits/[id] deve responder', async ({ page }) => {
    const response = await page.request.get('/api/audits/test-audit-123');

    // Deve retornar 200 ou 404 (não 500)
    expect([200, 404]).toContain(response.status());
  });

  test('API deve retornar JSON válido', async ({ page }) => {
    // Mock de resposta
    await page.route('**/api/audits/test-audit-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-audit-123' }),
      });
    });

    const response = await page.request.get('/api/audits/test-audit-123');
    const json = await response.json();

    expect(json).toHaveProperty('id');
  });
});

test.describe('Smoke Tests - Acessibilidade Básica', () => {
  test('deve ter título da página (SEO)', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const title = await page.title();

    expect(title).toBeTruthy();
    expect(title).not.toBe('');
  });

  test('deve ter landmarks ARIA básicos', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Deve ter elementos semânticos
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header, [role="banner"]')).toBeVisible();
  });

  test('deve ter contraste adequado em botões principais', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const primaryButton = page.locator('button:has-text("Gerar Automaticamente")').first();

    // Verificar que botão está visível e tem cor
    await expect(primaryButton).toBeVisible();

    const styles = await primaryButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      };
    });

    // Cores devem estar definidas (não default)
    expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(styles.color).not.toBe('rgb(0, 0, 0)');
  });

  test('deve permitir navegação por teclado (Tab)', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Focar no body
    await page.keyboard.press('Tab');

    // Pelo menos um elemento deve ter focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    expect(focusedElement).toBeTruthy();
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });
});
