import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Testes de Acessibilidade WCAG AA
 *
 * Usa axe-core para validar conformidade com WCAG 2.1 Level AA
 * automaticamente em todas as páginas do fluxo de criação de conteúdo.
 */

test.describe('WCAG AA Compliance - Content Creation Flow', () => {
  test('Fase 1: Quick Start deve ser acessível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Fase 2: Preview & Refine deve ser acessível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Simular One-Click Smart
    await page.click('button:has-text("Gerar Automaticamente")');

    // Aguardar FASE 2
    await page.waitForSelector('[data-testid="phase-2"]', { timeout: 35000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Fase 3: Exportar deve ser acessível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Simular fluxo até FASE 3
    await page.evaluate(() => {
      (window as any).__mockPhase = 3;
    });
    await page.reload();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Template Rápido deve ser acessível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Abrir Templates Rápidos
    await page.click('button:has-text("Escolher Template")');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Modo Avançado deve ser acessível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Abrir Modo Avançado
    await page.click('button:has-text("Customizar Tudo")');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('WCAG AA - Critérios Específicos', () => {
  test('1.4.3 - Contraste de cores (mínimo 4.5:1)', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="quick-start-card"]')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('2.1.1 - Todas funcionalidades acessíveis por teclado', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Testar navegação por Tab
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);

    // Verificar que todos os botões são focáveis
    const buttons = await page.locator('button:visible').all();

    for (const button of buttons) {
      const isFocusable = await button.evaluate((el) => {
        return el.tabIndex >= 0 || el.hasAttribute('tabindex');
      });

      expect(isFocusable).toBe(true);
    }
  });

  test('2.4.7 - Focus visível', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Focar em botão
    const button = page.locator('button').first();
    await button.focus();

    // Verificar que há outline visível
    const outlineStyle = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow,
      };
    });

    // Deve ter outline OU box-shadow para focus
    const hasFocusIndicator =
      outlineStyle.outline !== 'none' ||
      outlineStyle.outlineWidth !== '0px' ||
      outlineStyle.boxShadow !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });

  test('4.1.2 - Name, Role, Value para componentes UI', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const ariaViolations = accessibilityScanResults.violations.filter(
      (v) =>
        v.id === 'aria-required-attr' ||
        v.id === 'aria-roles' ||
        v.id === 'button-name' ||
        v.id === 'label'
    );

    expect(ariaViolations).toHaveLength(0);
  });

  test('1.3.1 - Estrutura semântica (headings)', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Verificar que há h1
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);

    // Verificar ordem lógica de headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const levels = await Promise.all(
      headings.map((h) => h.evaluate((el) => parseInt(el.tagName.substring(1))))
    );

    // Não deve pular níveis (ex: h1 → h3 sem h2)
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      expect(Math.abs(diff)).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('WCAG AA - Keyboard Navigation', () => {
  test('Tab order deve ser lógico', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const tabOrder: string[] = [];

    // Coletar ordem de Tab
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('data-testid') || el?.textContent?.trim().substring(0, 20);
      });

      if (focused) tabOrder.push(focused);
    }

    // Ordem esperada (ajustar conforme implementação)
    // 1. Quick Start cards
    // 2. Breadcrumb
    // 3. Phase indicator
    // etc.

    console.log('Tab Order:', tabOrder);

    // Verificar que não está vazio
    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test('Não deve haver keyboard trap', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Tentar "escapar" de qualquer elemento focável
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    // Deve conseguir focar em elementos diferentes
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Tentar Shift+Tab também
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+Tab');
    }

    const stillFocusable = await page.evaluate(() => document.activeElement?.tagName);
    expect(stillFocusable).toBeTruthy();
  });

  test('Atalhos customizados (←→ Enter Esc) devem funcionar', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });
    await page.reload();

    // Testar seta direita
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Deve ter navegado para próximo carrossel
    const indicator = await page.locator('[data-testid="carousel-indicator"]').textContent();
    expect(indicator).toContain('2/'); // Carrossel 2

    // Testar Esc (voltar)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Deve ter voltado para FASE 1
    const phaseIndicator = await page.locator('[data-testid="phase-indicator"]').textContent();
    expect(phaseIndicator).toContain('1 CRIAR');
  });
});

test.describe('WCAG AA - Screen Reader Simulation', () => {
  test('Aria-live regions para atualizações dinâmicas', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Verificar que há aria-live para loading states
    const liveRegions = await page.locator('[aria-live]').count();
    expect(liveRegions).toBeGreaterThan(0);

    // Verificar valores corretos
    const liveValues = await page.locator('[aria-live]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('aria-live'))
    );

    // Deve usar 'polite' ou 'assertive' (não 'off')
    for (const value of liveValues) {
      expect(['polite', 'assertive']).toContain(value);
    }
  });

  test('Status messages têm role="status"', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Clicar em gerar (deve mostrar loading)
    await page.click('button:has-text("Gerar Automaticamente")');

    // Verificar que loading tem role adequado
    const statusElements = await page.locator('[role="status"], [role="alert"]').count();
    expect(statusElements).toBeGreaterThan(0);
  });

  test('Labels descritivos para inputs', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Abrir Modo Avançado
    await page.click('button:has-text("Customizar Tudo")');

    // Verificar que inputs têm labels
    const inputs = await page.locator('input, textarea').all();

    for (const input of inputs) {
      const label = await input.evaluate((el) => {
        const id = el.id;
        if (id) {
          const labelEl = document.querySelector(`label[for="${id}"]`);
          return labelEl?.textContent || el.getAttribute('aria-label');
        }
        return el.getAttribute('aria-label');
      });

      expect(label).toBeTruthy();
    }
  });
});

test.describe('WCAG AA - Relatório de Violações', () => {
  test('Gerar relatório completo de acessibilidade', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log detalhado de violações
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n🚨 VIOLAÇÕES DE ACESSIBILIDADE ENCONTRADAS:\n');

      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   Descrição: ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Elementos afetados: ${violation.nodes.length}`);

        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   ${nodeIndex + 1}. ${node.html}`);
          console.log(`      Target: ${node.target.join(' > ')}`);
          console.log(`      Mensagem: ${node.failureSummary}`);
        });
      });

      console.log('\n');
    }

    // Gerar score
    const totalRules = accessibilityScanResults.violations.length +
      accessibilityScanResults.passes.length +
      accessibilityScanResults.incomplete.length +
      accessibilityScanResults.inapplicable.length;

    const passedRules = accessibilityScanResults.passes.length;
    const score = Math.round((passedRules / totalRules) * 100);

    console.log(`\n✅ Score de Acessibilidade: ${score}%`);
    console.log(`   Passou: ${passedRules}/${totalRules} regras`);
    console.log(`   Violações: ${accessibilityScanResults.violations.length}`);
    console.log(`   Incompleto: ${accessibilityScanResults.incomplete.length}`);

    // Deve ter score >= 95%
    expect(score).toBeGreaterThanOrEqual(95);
  });
});
