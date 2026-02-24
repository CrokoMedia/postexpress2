# 🧪 Testes E2E - Croko Lab

Suite completa de testes End-to-End para o fluxo de criação de conteúdo otimizado.

## 📁 Estrutura

```
__tests__/
├── integration/
│   └── content-creation-flow.test.ts  # Testes E2E do fluxo completo
├── fixtures/
│   └── mock-audit.ts                  # Dados mock para testes
└── README.md                          # Esta documentação
```

---

## 🚀 Como Rodar os Testes

### Instalação

```bash
npm install --legacy-peer-deps
npx playwright install chromium
```

### Comandos Disponíveis

```bash
# Rodar todos os testes
npm run test:e2e

# Rodar testes com UI interativa
npm run test:e2e:ui

# Rodar testes com browser visível (headed mode)
npm run test:e2e:headed

# Rodar testes em modo debug
npm run test:e2e:debug

# Ver relatório HTML dos testes
npm run test:e2e:report
```

### Rodar testes específicos

```bash
# Apenas Cenário 1 (One-Click Smart)
npx playwright test --grep "Cenário 1"

# Apenas Cenário 2 (Template Rápido)
npx playwright test --grep "Cenário 2"

# Apenas Cenário 3 (Modo Avançado)
npx playwright test --grep "Cenário 3"

# Apenas testes de navegação
npx playwright test --grep "Navegação"

# Apenas testes de performance
npx playwright test --grep "Performance"
```

---

## 📋 Cenários Testados

### ✅ Cenário 1: One-Click Smart (Fluxo Rápido)

**Objetivo:** Validar o fluxo mais rápido de criação de conteúdo.

**Passos:**
1. Abrir página de criação
2. Clicar "Gerar Automaticamente"
3. Aguardar geração (IA decide tudo)
4. Aprovar todos os carrosséis
5. Exportar

**Tempo esperado:** < 2 minutos

**Testes incluídos:**
- ✅ Fluxo completo em menos de 2 minutos
- ✅ Feedback de progresso durante geração
- ✅ Transição correta entre fases (1 → 2 → 3)
- ✅ Geração de 3 carrosséis com 8 slides cada

---

### ✅ Cenário 2: Template Rápido + Bulk Actions

**Objetivo:** Validar escolha de templates pré-configurados e ações em massa.

**Passos:**
1. Escolher template (Educacional/Vendas/Autoridade/Viral)
2. Gerar carrosséis com configurações do template
3. Aplicar bulk actions (IA em todos, sem imagem em todos)
4. Editar slides individuais
5. Aprovar e exportar

**Testes incluídos:**
- ✅ 4 templates disponíveis
- ✅ Aplicar "IA em todos os slides"
- ✅ Aplicar "Sem imagem em todos"
- ✅ Edição individual de slides
- ✅ Preview atualiza em tempo real

---

### ✅ Cenário 3: Modo Avançado (Controle Total)

**Objetivo:** Validar configuração manual de todos os parâmetros.

**Passos:**
1. Escolher "Modo Avançado"
2. Configurar manualmente:
   - Tema do conteúdo (opcional)
   - Template visual (6 opções)
   - Formato (Feed/Story/Square)
   - Tema de cores (Claro/Escuro)
   - Estratégia de imagens
3. Gerar carrosséis
4. Refinar e exportar

**Testes incluídos:**
- ✅ 5 passos de configuração visíveis
- ✅ Todas as configurações aplicadas corretamente
- ✅ Validação de campos obrigatórios

---

## ⌨️ Testes de Navegação e Atalhos

### Atalhos de Teclado Testados

| Atalho | Ação | Status |
|--------|------|--------|
| `←` / `→` | Navegar entre carrosséis | ✅ Testado |
| `Enter` | Aprovar e avançar | ✅ Testado |
| `Esc` | Voltar para fase anterior | ✅ Testado |
| `Space` | Expandir/colapsar slides | 🚧 Aguardando implementação |

---

## ✅ Testes de Validação

### Validações Testadas

- ✅ **Impedir exportar sem aprovar pelo menos 1 carrossel**
  - Botão "Exportar" desabilitado
  - Mensagem de aviso exibida

- ✅ **Alertar sobre slides sem configuração de imagem**
  - Destacar slides pendentes
  - Contagem de slides incompletos
  - Auto-scroll para primeiro pendente

- ✅ **Validação de campos obrigatórios no Modo Avançado**
  - Template obrigatório
  - Formato obrigatório
  - Tema obrigatório

---

## ⚡ Testes de Performance

### Métricas Monitoradas

| Métrica | Meta | Status |
|---------|------|--------|
| Carregamento inicial | < 3s | ✅ Testado |
| Atualização do preview | < 500ms | ✅ Testado |
| Geração de conteúdo | < 35s | ✅ Testado |
| Aplicar bulk action | < 2s | ✅ Testado |

---

## 📱 Testes de Responsividade

### Breakpoints Testados

| Dispositivo | Resolução | Layout | Status |
|-------------|-----------|--------|--------|
| iPhone 12 | 390×844 | Empilhado (Tabs) | ✅ Testado |
| iPad | 768×1024 | Híbrido | 🚧 Aguardando implementação |
| Desktop | >1024px | Split View | ✅ Testado |

### Comportamentos Validados

- ✅ **Mobile (<768px):**
  - Quick Start cards empilhados verticalmente
  - Tabs em vez de split view (Conteúdo | Preview)
  - Botão fixo de trocar view

- 🚧 **Tablet (768-1024px):**
  - Layout híbrido
  - Preview menor mas visível

- ✅ **Desktop (>1024px):**
  - Split view 50/50
  - Preview em tempo real

---

## 🔧 Configuração dos Testes

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './__tests__/integration',
  timeout: 120000,          // 2 minutos por teste
  workers: 1,               // Sequencial para evitar conflitos
  webServer: {
    command: 'npm run dev',
    port: 3001,
  },
  use: {
    baseURL: 'http://localhost:3001',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

### Mock de APIs

Os testes usam mocks para evitar chamadas reais ao backend:

```typescript
await page.route('**/api/audits/**', async (route) => {
  // Mock de generate-smart
  if (url.includes('/generate-smart')) {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockContent),
    });
  }
});
```

---

## 📊 Relatórios

### HTML Report

Após rodar os testes, um relatório HTML é gerado:

```bash
npm run test:e2e
npm run test:e2e:report
```

O relatório inclui:
- ✅ Status de cada teste
- 📸 Screenshots de falhas
- 🎥 Vídeos de falhas
- 🔍 Traces para debug

### CI/CD Integration

Os testes são configurados para rodar no CI:

```yaml
# .github/workflows/e2e.yml (exemplo)
- name: Install dependencies
  run: npm ci --legacy-peer-deps

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

---

## 🐛 Debug de Testes

### Modo Debug

```bash
npm run test:e2e:debug
```

**Features:**
- Pausa antes de cada ação
- Inspector visual do Playwright
- Console do browser visível
- Seletores destacados

### UI Mode

```bash
npm run test:e2e:ui
```

**Features:**
- Interface gráfica interativa
- Rodar testes individualmente
- Time travel (voltar passos)
- Watch mode (re-run automático)

### Headed Mode

```bash
npm run test:e2e:headed
```

**Features:**
- Browser visível durante execução
- Útil para ver o fluxo real
- Mais lento mas visual

---

## 📝 Boas Práticas

### 1. Usar data-testid para seletores estáveis

```typescript
// ❌ Evitar
await page.click('button:has-text("Gerar")');

// ✅ Preferir
await page.click('[data-testid="generate-button"]');
```

### 2. Aguardar elementos com timeout

```typescript
await expect(page.locator('[data-testid="preview"]')).toBeVisible({
  timeout: 10000, // 10 segundos
});
```

### 3. Testar estados de erro

```typescript
test('deve mostrar erro se API falhar', async ({ page }) => {
  // Mock de erro
  await page.route('**/api/**', route => route.abort('failed'));

  // Verificar tratamento de erro
  await expect(page.locator('text=Erro ao gerar')).toBeVisible();
});
```

### 4. Limpar estado entre testes

```typescript
test.beforeEach(async ({ page }) => {
  // Limpar localStorage
  await page.evaluate(() => localStorage.clear());

  // Limpar cookies
  await page.context().clearCookies();
});
```

---

## 🎯 KPIs de Teste

### Cobertura de Funcionalidades

| Feature | Cobertura | Status |
|---------|-----------|--------|
| Quick Start | 100% | ✅ |
| Split Preview | 90% | ✅ |
| Bulk Actions | 100% | ✅ |
| Navegação | 100% | ✅ |
| Validações | 90% | ✅ |
| Performance | 100% | ✅ |
| Responsividade | 75% | 🚧 |

### Tempo de Execução

- **Suite completa:** ~8-10 minutos
- **Cenário 1:** ~2 minutos
- **Cenário 2:** ~3 minutos
- **Cenário 3:** ~2 minutos
- **Navegação:** ~1 minuto
- **Performance:** ~1 minuto

---

## 🚀 Próximos Passos

### Testes Pendentes

- [ ] Testes de acessibilidade (WCAG AA)
- [ ] Testes de integração com Supabase real
- [ ] Testes de geração de slides (Puppeteer)
- [ ] Testes de export (ZIP, Google Drive)
- [ ] Testes de erros de rede
- [ ] Testes de timeout

### Melhorias Planejadas

- [ ] Adicionar visual regression testing (Percy/Chromatic)
- [ ] Adicionar testes de carga (Artillery/k6)
- [ ] Adicionar testes de segurança (OWASP ZAP)
- [ ] Configurar CI/CD completo
- [ ] Adicionar badges de status no README principal

---

## 📚 Referências

- [Playwright Documentation](https://playwright.dev)
- [UX Specification](../docs/ux/content-creation-flow-optimization.md)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

---

**Última atualização:** 2026-02-23
**Autor:** QA Team - Croko Lab
**Versão:** 1.0.0
