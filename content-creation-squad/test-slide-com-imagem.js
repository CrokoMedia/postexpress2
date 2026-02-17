#!/usr/bin/env node

/**
 * 🧪 TESTE DE SLIDE COM IMAGEM
 * Gera um slide de exemplo usando o template samuel-template.html COM IMAGEM
 */

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'fs/promises';
import cloudinary from 'cloudinary';
import 'dotenv/config';

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SAMUEL_DATA = {
  name: 'Samuel Fialho',
  handle: '@samuelfialhoo',
  profilePic: '💰',
};

const slideComImagem = {
  mainText: `O que você pode aprender com o último lançamento do Alex Hormozi?`,
  imageSrc: 'https://res.cloudinary.com/dwkothqfw/image/upload/v1771283689/instagram-conteudo/alex-hormozi-launch.jpg',
  imageAlt: 'Alex Hormozi Launch',
  finalText: '3 estratégias que você pode aplicar hoje mesmo no seu negócio',
};

async function generateSlideHTML(slide, autor) {
  // Ler template base
  const templatePath = './templates/samuel-template.html';
  let html = await readFile(templatePath, 'utf-8');

  // Substituir variáveis
  html = html.replace(/{{name}}/g, autor.name);
  html = html.replace(/{{handle}}/g, autor.handle);

  // Profile pic (emoji ou imagem)
  html = html.replace('{{profilePicClass}}', 'no-image');
  html = html.replace('{{profilePicContent}}', autor.profilePic);

  // Main text (converter quebras de linha em parágrafos)
  const paragraphs = slide.mainText.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
  html = html.replace('{{mainText}}', paragraphs);

  // Imagem (se houver)
  if (slide.imageSrc) {
    html = html.replace('{{#if hasImage}}', '');
    html = html.replace('{{/if}}', '');
    html = html.replace('{{imageSrc}}', slide.imageSrc);
    html = html.replace('{{imageAlt}}', slide.imageAlt || 'Imagem do post');
  } else {
    // Remover bloco de imagem
    html = html.replace(/{{#if hasImage}}[\s\S]*?{{\/if}}/g, '');
  }

  // Final text
  html = html.replace('{{finalText}}', slide.finalText);

  return html;
}

async function generateScreenshot(html, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html);
  await page.setViewportSize({ width: 1080, height: 1350 });

  // Esperar fontes carregarem
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: outputPath,
    type: 'png',
    scale: 'device',
  });

  await browser.close();
}

async function uploadParaCloudinary(caminhoLocal, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      caminhoLocal,
      {
        folder: 'instagram-templates',
        public_id: publicId,
        overwrite: true,
        quality: 'auto:best'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTE DE SLIDE COM IMAGEM - TEMPLATE SAMUEL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const outputDir = './temp';
  await mkdir(outputDir, { recursive: true });

  console.log('📝 Gerando HTML do slide...');
  const html = await generateSlideHTML(slideComImagem, SAMUEL_DATA);

  // Salvar HTML (para debug)
  const htmlPath = `${outputDir}/slide-com-imagem-teste.html`;
  await writeFile(htmlPath, html);
  console.log(`✅ HTML salvo: ${htmlPath}\n`);

  console.log('📸 Gerando screenshot (1080x1350)...');
  const pngPath = `${outputDir}/slide-com-imagem-teste.png`;
  await generateScreenshot(html, pngPath);
  console.log(`✅ PNG gerado: ${pngPath}\n`);

  console.log('☁️  Fazendo upload para Cloudinary...');
  const resultado = await uploadParaCloudinary(pngPath, 'slide-com-imagem-exemplo');
  console.log('✅ Upload concluído!\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESULTADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Informações:');
  console.log(`   Public ID: ${resultado.public_id}`);
  console.log(`   Formato: ${resultado.format}`);
  console.log(`   Dimensões: ${resultado.width}x${resultado.height}px`);
  console.log(`   Tamanho: ${(resultado.bytes / 1024).toFixed(2)} KB\n`);

  console.log('🔗 URL do Cloudinary:\n');
  console.log('📸 URL Segura:');
  console.log(`   ${resultado.secure_url}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('👀 Visualize a imagem aqui:');
  console.log(`   ${resultado.secure_url}\n`);
}

main().catch(console.error);
