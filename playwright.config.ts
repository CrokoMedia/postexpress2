import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Projeto: Croko Lab - Content Creation Flow
 */
export default defineConfig({
  testDir: './__tests__/integration',

  // Timeout padrão para cada teste
  timeout: 120000, // 2 minutos (geração pode demorar)

  // Timeout para expects
  expect: {
    timeout: 10000,
  },

  // Configuração do servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    port: 3001,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },

  // Executar testes em paralelo
  fullyParallel: false, // Sequencial para evitar conflitos de dados

  // Falhar build no CI se testes falharem
  forbidOnly: !!process.env.CI,

  // Retry no CI
  retries: process.env.CI ? 2 : 0,

  // Workers (1 para evitar conflitos)
  workers: 1,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Configurações compartilhadas
  use: {
    // URL base
    baseURL: 'http://localhost:3001',

    // Screenshot em falhas
    screenshot: 'only-on-failure',

    // Video em falhas
    video: 'retain-on-failure',

    // Trace em falhas
    trace: 'retain-on-failure',

    // Navigation timeout
    navigationTimeout: 30000,

    // Action timeout
    actionTimeout: 10000,
  },

  // Projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Descomentar para testar em múltiplos browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
});
