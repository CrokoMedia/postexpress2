#!/usr/bin/env node

/**
 * 🎨 POST EXPRESS - IMAGE GENERATOR ENGINE
 *
 * Gera automaticamente imagens PNG de alta qualidade para carrosséis
 * Suporta múltiplos formatos (Post, Stories) e estilos (Figma, Gradient)
 *
 * @author Croko Labs Team
 * @version 1.0.0
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, writeFile } from 'fs/promises';
import { renderTemplate, generateTemplateData } from './lib/template-renderer.js';
import { htmlToImage, batchHtmlToImage } from './lib/screenshot-engine.js';
import { createCarouselZip, createIndividualZips } from './lib/zip-creator.js';
import { FORMATS, STYLES, OUTPUT } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Classe principal do Image Generator Engine
 */
export class ImageGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || join(__dirname, OUTPUT.baseDir);
    this.templatePath = options.templatePath || join(__dirname, 'templates/base-template.html');
    this.scale = options.scale || OUTPUT.scale;
    this.concurrency = options.concurrency || 4;
  }

  /**
   * Gera imagens para um carrossel completo
   * @param {Object} carousel - Dados do carrossel
   * @param {Array} carousel.slides - Array de slides {title, subtitle, text, cta, etc}
   * @param {string} carousel.id - ID único do carrossel
   * @param {Object} options - Opções de geração
   * @returns {Promise<Object>} Resultado da geração
   */
  async generateCarousel(carousel, options = {}) {
    const {
      formats = [FORMATS.POST, FORMATS.STORIES],
      styles = [STYLES.FIGMA, STYLES.GRADIENT],
      createZip = OUTPUT.createZip
    } = options;

    console.log(`\n🎨 Gerando carrossel: ${carousel.id}`);
    console.log(`📊 ${carousel.slides.length} slides × ${formats.length} formatos × ${styles.length} estilos = ${carousel.slides.length * formats.length * styles.length} imagens\n`);

    const jobs = [];
    const results = {
      carouselId: carousel.id,
      formats: {},
      totalImages: 0,
      outputDir: join(this.outputDir, carousel.id)
    };

    // Criar estrutura de pastas
    await mkdir(results.outputDir, { recursive: true });

    // Gerar jobs para cada combinação de formato + estilo + slide
    for (const format of formats) {
      for (const style of styles) {
        const formatStyleKey = `${format.name}-${style.name}`;
        const formatStyleDir = join(results.outputDir, formatStyleKey);

        await mkdir(formatStyleDir, { recursive: true });

        if (!results.formats[formatStyleKey]) {
          results.formats[formatStyleKey] = {
            format: format.name,
            style: style.name,
            dimensions: `${format.width}x${format.height}`,
            images: []
          };
        }

        // Gerar job para cada slide
        for (let i = 0; i < carousel.slides.length; i++) {
          const slide = carousel.slides[i];
          const slideNumber = String(i + 1).padStart(2, '0');
          const fileName = `slide-${slideNumber}.png`;
          const outputPath = join(formatStyleDir, fileName);

          // Gerar dados do template
          const templateData = generateTemplateData(slide, style, format);

          jobs.push({
            slideIndex: i,
            format: format.name,
            style: style.name,
            styleConfig: style, // Guardar config completo do estilo
            templateData,
            outputPath,
            dimensions: { width: format.width, height: format.height },
            scale: this.scale
          });

          results.formats[formatStyleKey].images.push({
            slideNumber,
            fileName,
            path: outputPath
          });

          results.totalImages++;
        }
      }
    }

    // Renderizar templates HTML
    console.log('📝 Renderizando templates HTML...');
    const htmlJobs = await Promise.all(
      jobs.map(async (job) => {
        // Usar template específico do estilo ou template padrão
        const templatePath = job.styleConfig?.template
          ? join(dirname(this.templatePath), job.styleConfig.template)
          : this.templatePath;

        const html = await renderTemplate(templatePath, job.templateData);
        return {
          html,
          outputPath: job.outputPath,
          dimensions: job.dimensions,
          scale: job.scale
        };
      })
    );

    // Gerar screenshots
    console.log(`📸 Gerando ${htmlJobs.length} screenshots (${this.concurrency} simultâneos)...\n`);
    const startTime = Date.now();

    const batchResult = await batchHtmlToImage(htmlJobs, this.concurrency);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Geração concluída em ${duration}s`);
    console.log(`   ✓ Sucesso: ${batchResult.successCount}`);
    if (batchResult.errorCount > 0) {
      console.log(`   ✗ Erros: ${batchResult.errorCount}`);
    }

    results.generation = {
      duration,
      successful: batchResult.successCount,
      failed: batchResult.errorCount,
      errors: batchResult.failed
    };

    // Salvar manifest
    const manifestPath = join(results.outputDir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(results, null, 2));

    console.log(`\n📦 Arquivos salvos em: ${results.outputDir}`);
    console.log(`📄 Manifest: ${manifestPath}`);

    // Criar ZIPs se solicitado
    if (createZip) {
      console.log('\n📦 Criando arquivos ZIP...');

      // ZIP completo (todas as imagens organizadas)
      const zipCompletePath = join(results.outputDir, `${carousel.id}-completo.zip`);
      const zipCompleto = await createCarouselZip(results.outputDir, zipCompletePath, {
        organized: true,
        includeManifest: true
      });

      console.log(`✅ ZIP Completo: ${zipCompletePath} (${zipCompleto.sizeFormatted})`);

      // ZIPs individuais (um por formato/estilo)
      const zipsDir = join(results.outputDir, 'downloads');
      await mkdir(zipsDir, { recursive: true });

      const individualZips = await createIndividualZips(results.outputDir, zipsDir);

      console.log(`✅ ZIPs Individuais (${individualZips.length}):`);
      individualZips.forEach(zip => {
        console.log(`   • ${zip.format}.zip (${zip.sizeFormatted})`);
      });

      results.downloads = {
        completo: {
          path: zipCompletePath,
          size: zipCompleto.sizeFormatted,
          files: zipCompleto.totalFiles
        },
        individuais: individualZips.map(zip => ({
          format: zip.format,
          path: zip.path,
          size: zip.sizeFormatted,
          files: zip.totalFiles
        }))
      };
    }

    console.log('');

    return results;
  }

  /**
   * Gera uma única imagem
   * @param {Object} slide - Dados do slide
   * @param {Object} options - Opções {format, style, outputPath}
   * @returns {Promise<Object>} Resultado
   */
  async generateSingle(slide, options = {}) {
    const {
      format = FORMATS.POST,
      style = STYLES.FIGMA,
      outputPath = join(this.outputDir, 'single.png')
    } = options;

    const templateData = generateTemplateData(slide, style, format);
    const html = await renderTemplate(this.templatePath, templateData);

    const result = await htmlToImage(
      html,
      outputPath,
      { width: format.width, height: format.height },
      this.scale
    );

    return result;
  }
}

// Export para uso como módulo
export { FORMATS, STYLES, OUTPUT };

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎨 Croko Labs - Image Generator Engine\n');
  console.log('Use: import { ImageGenerator } from "./index.js"\n');
  console.log('Ou veja: demo.js para exemplos de uso\n');
}
