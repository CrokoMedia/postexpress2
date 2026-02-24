# Story 4.3: Testes de Integração e E2E

**Epic:** EPIC-001 | **Status:** 📋 To Do | **Priority:** P2 | **Estimate:** 5h
**Sprint:** Sprint 2 - Semana 2

---

## 📋 Descrição

Setup de testes E2E com Playwright para fluxos críticos: adicionar expert, configurar temas, visualizar tweets e health check.

---

## 🎯 Acceptance Criteria

- [ ] Playwright configurado
- [ ] Teste: Adicionar expert completo (form → API → visualização)
- [ ] Teste: Configurar temas (edit → save → regra atualizada)
- [ ] Teste: Visualizar tweets (filtros → cards → link externo)
- [ ] Teste: Health check (status → uptime → logs)
- [ ] CI/CD integrado (GitHub Actions)
- [ ] Coverage report gerado

---

## 🔧 Implementação

```typescript
// e2e/twitter-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Twitter Monitoring Flow', () => {
  test('should add new expert', async ({ page }) => {
    await page.goto('/dashboard/twitter/experts');
    await page.click('text=Adicionar Expert');

    await page.fill('[placeholder="@garyvee"]', '@test_expert');
    await page.fill('[placeholder="Ex: marketing"]', 'test');
    await page.click('text=Add');
    await page.click('text=Salvar');

    await expect(page.locator('text=@test_expert')).toBeVisible();
  });

  test('should edit themes', async ({ page }) => {
    await page.goto('/dashboard/twitter/experts');
    await page.click('text=Editar Temas');

    await page.fill('[placeholder="Ex: marketing"]', 'new-theme');
    await page.click('text=Add');
    await page.click('text=Salvar');

    await expect(page.locator('text=new-theme')).toBeVisible();
  });

  test('should display tweets feed', async ({ page }) => {
    await page.goto('/dashboard/twitter/feed');

    // Aguardar tweets carregarem
    await page.waitForSelector('[data-testid="tweet-card"]');

    const tweetCount = await page.locator('[data-testid="tweet-card"]').count();
    expect(tweetCount).toBeGreaterThan(0);
  });

  test('should show worker status', async ({ page }) => {
    await page.goto('/dashboard/twitter/status');

    await expect(page.locator('text=Conectado')).toBeVisible();
    await expect(page.locator('[data-testid="uptime"]')).toHaveText(/\d+%/);
  });
});
```

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

```json
// package.json (adicionar)
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 📁 Arquivos

- `e2e/twitter-flow.spec.ts` - CRIADO
- `.github/workflows/e2e.yml` - CRIADO
- `playwright.config.ts` - CRIADO
- `package.json` - MODIFICADO

---

## 🧪 Como Testar

```bash
# Instalar Playwright
npm install -D @playwright/test
npx playwright install

# Rodar testes
npm run test:e2e

# Modo interativo
npm run test:e2e:ui
```

---

## ✅ DoD

- [ ] Playwright configurado
- [ ] 4 testes E2E passando
- [ ] CI/CD no GitHub Actions
- [ ] Coverage > 70%
- [ ] Documentação de testes
