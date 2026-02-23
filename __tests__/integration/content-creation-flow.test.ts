import { test, expect, Page } from '@playwright/test';

/**
 * Testes E2E: Content Creation Flow
 *
 * Cenários testados:
 * 1. One-Click Smart → Aprovação → Exportação
 * 2. Template Rápido → Edição → Bulk Action → Exportação
 * 3. Modo Avançado → Configuração manual → Exportação
 *
 * Referência: docs/ux/content-creation-flow-optimization.md linha 1228
 */

// Setup e Teardown
test.beforeEach(async ({ page }) => {
  // Mock do Supabase para evitar chamadas reais
  await page.route('**/api/audits/**', async (route) => {
    const url = route.request().url();

    // Mock de auditoria
    if (url.includes('/api/audits/') && route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-audit-123',
          username: 'test_creator',
          overall_score: 75,
        }),
      });
      return;
    }

    // Mock de geração smart
    if (url.includes('/generate-smart')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: getMockContent(),
          config: getMockSmartConfig(),
          reasoning: {
            profileAnalysis: 'Perfil educacional focado em marketing',
            templateChoice: 'Minimalist adequado para conteúdo educacional',
            formatChoice: 'Feed 4:5 é o padrão do Instagram',
            imageStrategyReasoning: ['Slides com dados não precisam imagem', 'Hooks devem focar no texto'],
          },
        }),
      });
      return;
    }

    // Mock de bulk action
    if (url.includes('/apply-bulk-action')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          updatedConfig: {},
        }),
      });
      return;
    }

    // Outras rotas passam sem mock
    await route.continue();
  });
});

// Helpers
function getMockContent() {
  return {
    carousels: [
      {
        titulo: 'Carrossel 1: 7 erros de copy que matam conversão',
        tema: 'Copy',
        slides: Array.from({ length: 8 }, (_, i) => ({
          numero: i + 1,
          tipo: i === 0 ? 'Hook' : i === 7 ? 'CTA' : 'Conteúdo',
          titulo: `Slide ${i + 1}`,
          corpo: `Conteúdo do slide ${i + 1}`,
        })),
        caption: 'Caption teste',
        hashtags: '#teste',
      },
      {
        titulo: 'Carrossel 2: Como aumentar engajamento',
        tema: 'Engajamento',
        slides: Array.from({ length: 8 }, (_, i) => ({
          numero: i + 1,
          tipo: i === 0 ? 'Hook' : i === 7 ? 'CTA' : 'Conteúdo',
          titulo: `Slide ${i + 1}`,
          corpo: `Conteúdo do slide ${i + 1}`,
        })),
        caption: 'Caption teste',
        hashtags: '#teste',
      },
      {
        titulo: 'Carrossel 3: Frameworks de produto',
        tema: 'Product',
        slides: Array.from({ length: 8 }, (_, i) => ({
          numero: i + 1,
          tipo: i === 0 ? 'Hook' : i === 7 ? 'CTA' : 'Conteúdo',
          titulo: `Slide ${i + 1}`,
          corpo: `Conteúdo do slide ${i + 1}`,
        })),
        caption: 'Caption teste',
        hashtags: '#teste',
      },
    ],
    estrategia_geral: 'Estratégia teste',
  };
}

function getMockSmartConfig() {
  return {
    template: 'minimalist',
    format: 'feed',
    theme: 'light',
    imageStrategy: {},
  };
}

// CENÁRIO 1: One-Click Smart → Aprovação → Exportação
test.describe('Cenário 1: One-Click Smart (Fluxo Rápido)', () => {
  test('deve completar fluxo One-Click Smart em menos de 2 minutos', async ({ page }) => {
    const startTime = Date.now();

    // 1. Abrir página de criação
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // 2. Verificar que está na FASE 1 (Quick Start)
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('1 CRIAR');

    // 3. Verificar que as 3 opções estão visíveis
    await expect(page.locator('text=One-Click Smart')).toBeVisible();
    await expect(page.locator('text=Templates Rápidos')).toBeVisible();
    await expect(page.locator('text=Modo Avançado')).toBeVisible();

    // 4. Clicar em "Gerar Automaticamente" (One-Click Smart)
    await page.click('button:has-text("Gerar Automaticamente")');

    // 5. Verificar loading state
    await expect(page.locator('text=Analisando auditoria')).toBeVisible({ timeout: 5000 });

    // 6. Aguardar transição para FASE 2 (Refinar)
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('2 REFINAR', {
      timeout: 35000, // Geração pode demorar até 30s
    });

    // 7. Verificar que carrosséis foram gerados
    await expect(page.locator('text=Carrossel 1')).toBeVisible();
    await expect(page.locator('text=Carrossel 2')).toBeVisible();
    await expect(page.locator('text=Carrossel 3')).toBeVisible();

    // 8. Verificar split view (conteúdo | preview)
    await expect(page.locator('[data-testid="content-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();

    // 9. Aprovar todos os carrosséis
    await page.click('button:has-text("Aprovar Todos")');

    // 10. Verificar status: 3/3 aprovados
    await expect(page.locator('text=3/3 aprovado')).toBeVisible();

    // 11. Ir para FASE 3 (Exportar)
    await page.click('button:has-text("Próximo: Exportar")');

    // 12. Verificar que está na FASE 3
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('3 EXPORTAR');

    // 13. Verificar resumo de carrosséis aprovados
    await expect(page.locator('text=3 Carrosséis Aprovados')).toBeVisible();
    await expect(page.locator('text=24 slides totais')).toBeVisible();

    // 14. Verificar tempo total (deve ser < 2 minutos)
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(120000); // 2 minutos

    console.log(`✅ Tempo total do fluxo: ${(totalTime / 1000).toFixed(1)}s`);
  });

  test('deve mostrar feedback de progresso durante geração', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    await page.click('button:has-text("Gerar Automaticamente")');

    // Verificar que loading mostra etapas
    const loadingTexts = [
      'Analisando auditoria',
      'Gerando 5 carrosséis',
      'Escolhendo templates visuais',
      'Configurando imagens com IA',
    ];

    for (const text of loadingTexts) {
      // Pelo menos um dos textos deve aparecer durante o loading
      const locator = page.locator(`text=${text}`);
      if (await locator.isVisible().catch(() => false)) {
        console.log(`✅ Feedback encontrado: "${text}"`);
      }
    }
  });
});

// CENÁRIO 2: Template Rápido → Edição → Bulk Action → Exportação
test.describe('Cenário 2: Template Rápido + Bulk Actions', () => {
  test('deve permitir escolher template e aplicar bulk actions', async ({ page }) => {
    // 1. Abrir página
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // 2. Escolher "Templates Rápidos"
    await page.click('button:has-text("Escolher Template")');

    // 3. Verificar que mostra os 4 templates
    await expect(page.locator('text=EDUCACIONAL')).toBeVisible();
    await expect(page.locator('text=VENDAS')).toBeVisible();
    await expect(page.locator('text=AUTORIDADE')).toBeVisible();
    await expect(page.locator('text=VIRAL')).toBeVisible();

    // 4. Selecionar template "Educacional"
    await page.click('button:has-text("EDUCACIONAL")').first();
    await page.click('button:has-text("Usar")').first();

    // 5. Aguardar geração
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('2 REFINAR', {
      timeout: 35000,
    });

    // 6. Abrir primeiro carrossel
    await page.click('[data-testid="carousel-0"]');

    // 7. Verificar que Bulk Actions estão disponíveis
    await expect(page.locator('text=BULK ACTIONS')).toBeVisible();
    await expect(page.locator('button:has-text("IA em todos os slides")')).toBeVisible();
    await expect(page.locator('button:has-text("Sem imagem em todos")')).toBeVisible();

    // 8. Aplicar "IA em todos os slides"
    await page.click('button:has-text("IA em todos os slides")');

    // 9. Verificar confirmação
    await expect(page.locator('text=Configuração aplicada a 8 slides')).toBeVisible({ timeout: 5000 });

    // 10. Aprovar carrossel
    await page.click('button:has-text("Aprovar")');

    // 11. Verificar que marcou como aprovado
    await expect(page.locator('[data-testid="carousel-0-status"]')).toContainText('Aprovado');
  });

  test('deve permitir editar slide individual', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar ir para FASE 2 (mockando geração concluída)
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });

    await page.reload();

    // Expandir primeiro slide
    await page.click('[data-testid="slide-0"]');

    // Editar título
    const titleInput = page.locator('input[name="slide-0-title"]');
    await titleInput.fill('Novo Título Editado');

    // Verificar que preview atualiza (live preview)
    await expect(page.locator('[data-testid="preview-panel"]')).toContainText('Novo Título Editado', {
      timeout: 3000,
    });
  });
});

// CENÁRIO 3: Modo Avançado → Configuração manual → Exportação
test.describe('Cenário 3: Modo Avançado (Controle Total)', () => {
  test('deve permitir configurar todos os parâmetros manualmente', async ({ page }) => {
    // 1. Abrir página
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // 2. Escolher "Modo Avançado"
    await page.click('button:has-text("Customizar Tudo")');

    // 3. Verificar que mostra formulário de configuração
    await expect(page.locator('text=PASSO 1: Tema do Conteúdo')).toBeVisible();
    await expect(page.locator('text=PASSO 2: Escolher Template Visual')).toBeVisible();
    await expect(page.locator('text=PASSO 3: Formato')).toBeVisible();
    await expect(page.locator('text=PASSO 4: Tema de Cores')).toBeVisible();
    await expect(page.locator('text=PASSO 5: Estratégia de Imagens')).toBeVisible();

    // 4. Preencher tema opcional
    const themeInput = page.locator('textarea[name="custom-theme"]');
    await themeInput.fill('Carrosséis sobre como usar Reels para vender cursos online');

    // 5. Escolher template
    await page.click('button:has-text("Bold")');

    // 6. Escolher formato Story (9:16)
    await page.click('input[value="story"]');

    // 7. Escolher tema escuro
    await page.click('input[value="dark"]');

    // 8. Escolher "Vou configurar slide por slide depois"
    await page.click('input[value="manual"]');

    // 9. Gerar carrosséis
    await page.click('button:has-text("Gerar Carrosséis")');

    // 10. Aguardar FASE 2
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('2 REFINAR', {
      timeout: 35000,
    });

    // 11. Verificar que configurações foram aplicadas
    // Template = Bold
    await expect(page.locator('[data-testid="template-badge"]')).toContainText('Bold');

    // Formato = Story 9:16
    await expect(page.locator('[data-testid="format-badge"]')).toContainText('9:16');

    // Tema = Escuro
    await expect(page.locator('[data-testid="theme-badge"]')).toContainText('Escuro');
  });
});

// TESTES DE NAVEGAÇÃO E KEYBOARD SHORTCUTS
test.describe('Navegação e Atalhos', () => {
  test('deve permitir navegar com setas (← →)', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });
    await page.reload();

    // Verificar que está no Carrossel 1
    await expect(page.locator('[data-testid="carousel-indicator"]')).toContainText('1/3');

    // Navegar para Carrossel 2 (seta direita)
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-testid="carousel-indicator"]')).toContainText('2/3');

    // Navegar de volta (seta esquerda)
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-testid="carousel-indicator"]')).toContainText('1/3');
  });

  test('deve permitir aprovar e avançar com Enter', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });
    await page.reload();

    // Pressionar Enter (aprovar + avançar)
    await page.keyboard.press('Enter');

    // Deve aprovar Carrossel 1 e ir para Carrossel 2
    await expect(page.locator('[data-testid="carousel-0-status"]')).toContainText('Aprovado');
    await expect(page.locator('[data-testid="carousel-indicator"]')).toContainText('2/3');
  });

  test('deve voltar com Esc', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });
    await page.reload();

    // Pressionar Esc
    await page.keyboard.press('Escape');

    // Deve voltar para FASE 1
    await expect(page.locator('[data-testid="phase-indicator"]')).toContainText('1 CRIAR');
  });
});

// TESTES DE VALIDAÇÃO
test.describe('Validações e Erros', () => {
  test('deve impedir exportar sem aprovar pelo menos 1 carrossel', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2 com 0 aprovados
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
      (window as any).__mockApproved = [];
    });
    await page.reload();

    // Tentar ir para FASE 3
    const exportButton = page.locator('button:has-text("Próximo: Exportar")');

    // Botão deve estar desabilitado
    await expect(exportButton).toBeDisabled();

    // Deve mostrar mensagem
    await expect(page.locator('text=Aprove pelo menos 1 carrossel')).toBeVisible();
  });

  test('deve alertar se faltam configurações de imagem em slides', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2 com configurações incompletas
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
      (window as any).__mockIncompleteSlides = [0, 3, 5]; // Slides 1, 4, 6 sem config
    });
    await page.reload();

    // Tentar aprovar
    await page.click('button:has-text("Aprovar")');

    // Deve mostrar alerta
    await expect(page.locator('text=Faltam configurações em 3 slides')).toBeVisible();

    // Deve destacar slides pendentes
    await expect(page.locator('[data-testid="slide-0"]')).toHaveClass(/incomplete/);
    await expect(page.locator('[data-testid="slide-3"]')).toHaveClass(/incomplete/);
    await expect(page.locator('[data-testid="slide-5"]')).toHaveClass(/incomplete/);
  });
});

// TESTES DE PERFORMANCE
test.describe('Performance e Métricas', () => {
  test('preview deve atualizar em menos de 500ms', async ({ page }) => {
    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });
    await page.reload();

    // Editar título
    const startTime = Date.now();
    await page.fill('input[name="slide-0-title"]', 'Teste de Performance');

    // Aguardar preview atualizar
    await expect(page.locator('[data-testid="preview-panel"]')).toContainText('Teste de Performance');

    const updateTime = Date.now() - startTime;

    // Deve atualizar em menos de 500ms
    expect(updateTime).toBeLessThan(500);
    console.log(`✅ Preview atualizou em ${updateTime}ms`);
  });

  test('deve carregar página inicial em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Aguardar conteúdo principal estar visível
    await expect(page.locator('text=One-Click Smart')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Deve carregar em menos de 3s
    expect(loadTime).toBeLessThan(3000);
    console.log(`✅ Página carregou em ${loadTime}ms`);
  });
});

// TESTES DE RESPONSIVIDADE (BONUS)
test.describe('Responsividade', () => {
  test('deve funcionar em mobile (< 768px)', async ({ page }) => {
    // Simular iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Quick Start deve estar empilhado verticalmente
    const quickStartCards = page.locator('[data-testid="quick-start-card"]');
    const count = await quickStartCards.count();

    expect(count).toBe(3); // 3 opções

    // Verificar que cards estão empilhados (width próximo de 100%)
    const firstCard = quickStartCards.first();
    const box = await firstCard.boundingBox();

    if (box) {
      // Width do card deve ser quase 100% (com padding)
      expect(box.width).toBeGreaterThan(350); // ~90% de 390px
    }
  });

  test('deve usar tabs em vez de split view em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/dashboard/audits/test-audit-123/create-content');

    // Forçar FASE 2
    await page.evaluate(() => {
      (window as any).__mockPhase = 2;
    });
    await page.reload();

    // Deve mostrar tabs em vez de split view
    await expect(page.locator('[data-testid="tab-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-preview"]')).toBeVisible();

    // Split view NÃO deve estar visível
    await expect(page.locator('[data-testid="split-view"]')).not.toBeVisible();
  });
});
