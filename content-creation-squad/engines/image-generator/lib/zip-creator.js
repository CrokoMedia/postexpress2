/**
 * ZIP Creator
 * Cria arquivos ZIP organizados com as imagens geradas
 */

import archiver from 'archiver';
import { createWriteStream, createReadStream } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, basename } from 'path';

/**
 * Cria um arquivo ZIP com todas as imagens de um carrossel
 * @param {string} sourceDir - Diretório com as imagens
 * @param {string} outputPath - Caminho do arquivo ZIP
 * @param {Object} options - Opções de compressão
 * @returns {Promise<Object>} Informações do ZIP criado
 */
export async function createCarouselZip(sourceDir, outputPath, options = {}) {
  const {
    compressionLevel = 9,
    includeManifest = true,
    organized = true // Manter organização em pastas
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: compressionLevel }
      });

      let totalFiles = 0;
      let totalBytes = 0;

      // Event handlers
      output.on('close', () => {
        resolve({
          success: true,
          path: outputPath,
          totalFiles,
          totalBytes: archive.pointer(),
          sizeFormatted: formatBytes(archive.pointer())
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.on('entry', (entry) => {
        totalFiles++;
      });

      // Pipe archive to file
      archive.pipe(output);

      // Adicionar arquivos
      if (organized) {
        // Manter estrutura de pastas (post-figma, stories-gradient, etc)
        const subdirs = await readdir(sourceDir);

        for (const subdir of subdirs) {
          const subdirPath = join(sourceDir, subdir);
          const subdirStat = await stat(subdirPath);

          if (subdirStat.isDirectory()) {
            // Adicionar pasta inteira
            archive.directory(subdirPath, subdir);
          } else if (includeManifest || !subdir.endsWith('.json')) {
            // Adicionar arquivo na raiz
            archive.file(subdirPath, { name: subdir });
          }
        }
      } else {
        // Adicionar tudo flat (sem subpastas)
        await addFilesFlat(archive, sourceDir, includeManifest);
      }

      await archive.finalize();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Adiciona arquivos sem manter estrutura de pastas
 */
async function addFilesFlat(archive, dir, includeManifest) {
  const items = await readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = join(dir, item.name);

    if (item.isDirectory()) {
      await addFilesFlat(archive, itemPath, includeManifest);
    } else if (includeManifest || !item.name.endsWith('.json')) {
      // Usar nome do formato no arquivo: post-figma-slide-01.png
      const parentDir = basename(dir);
      const newName = parentDir !== 'output'
        ? `${parentDir}-${item.name}`
        : item.name;

      archive.file(itemPath, { name: newName });
    }
  }
}

/**
 * Cria múltiplos ZIPs - um para cada formato/estilo
 * @param {string} carouselDir - Diretório do carrossel
 * @param {string} outputDir - Diretório de saída dos ZIPs
 * @returns {Promise<Array>} Lista de ZIPs criados
 */
export async function createIndividualZips(carouselDir, outputDir) {
  const subdirs = await readdir(carouselDir);
  const zips = [];

  for (const subdir of subdirs) {
    const subdirPath = join(carouselDir, subdir);
    const subdirStat = await stat(subdirPath);

    if (subdirStat.isDirectory()) {
      const zipPath = join(outputDir, `${subdir}.zip`);

      const result = await createCarouselZip(
        subdirPath,
        zipPath,
        { organized: false } // Flat para ZIPs individuais
      );

      zips.push({
        format: subdir,
        ...result
      });
    }
  }

  return zips;
}

/**
 * Formata bytes em formato legível
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
