/**
 * Screenshot Engine
 * Usa Playwright para converter HTML em imagens PNG de alta qualidade
 */

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { SCREENSHOT_OPTIONS } from '../config.js';

/**
 * Gera screenshot de HTML para PNG
 * @param {string} html - HTML completo
 * @param {string} outputPath - Caminho do arquivo de saída
 * @param {Object} dimensions - {width, height}
 * @param {number} scale - Escala de qualidade (1 = normal, 2 = 2x retina)
 */
export async function htmlToImage(html, outputPath, dimensions, scale = 2) {
  let browser = null;

  try {
    // Criar diretório se não existir
    await mkdir(dirname(outputPath), { recursive: true });

    // Iniciar navegador
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: {
        width: dimensions.width,
        height: dimensions.height
      },
      deviceScaleFactor: scale,
    });

    const page = await context.newPage();

    // Definir conteúdo HTML
    await page.setContent(html, {
      waitUntil: 'networkidle',
    });

    // Aguardar fontes carregarem
    await page.waitForTimeout(1000);

    // Tirar screenshot
    await page.screenshot({
      path: outputPath,
      ...SCREENSHOT_OPTIONS,
      clip: {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height
      }
    });

    await browser.close();

    return {
      success: true,
      path: outputPath,
      size: dimensions,
      scale
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }

    throw new Error(`Failed to generate screenshot: ${error.message}`);
  }
}

/**
 * Gera múltiplos screenshots em paralelo
 * @param {Array} jobs - Array de {html, outputPath, dimensions, scale}
 * @param {number} concurrency - Número de screenshots simultâneos
 */
export async function batchHtmlToImage(jobs, concurrency = 4) {
  const results = [];
  const errors = [];

  // Processar em lotes
  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map(job =>
        htmlToImage(job.html, job.outputPath, job.dimensions, job.scale)
      )
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push({
          job: batch[index],
          error: result.reason
        });
      }
    });
  }

  return {
    successful: results,
    failed: errors,
    total: jobs.length,
    successCount: results.length,
    errorCount: errors.length
  };
}
