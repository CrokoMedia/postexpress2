/**
 * Test: Flatten Comments
 *
 * Testa a função flattenComments() com dados reais do Apify
 *
 * Uso:
 *   node scripts/test-flatten-comments.js [username]
 *
 * Exemplo:
 *   node scripts/test-flatten-comments.js rodrigogunter_
 */

import fs from 'fs';
import {
  flattenComments,
  getThreadStats,
  validateFlatComments,
  groupByLevel
} from './utils/flatten-comments.js';

/**
 * Testa flatten com dados de um perfil específico
 */
function testFlatten(username) {
  const filePath = `squad-auditores/data/${username}-posts-with-comments.json`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TEST: FLATTEN COMMENTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📂 Arquivo: ${filePath}\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    console.log('\nArquivos disponíveis:');
    const files = fs.readdirSync('squad-auditores/data').filter(f => f.endsWith('-posts-with-comments.json'));
    files.forEach(f => console.log(`   - ${f.replace('-posts-with-comments.json', '')}`));
    process.exit(1);
  }

  // Ler dados
  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  // Verificar estrutura
  if (Array.isArray(data)) {
    // Formato antigo (array de posts)
    console.log('⚠️  Formato antigo detectado (array de posts sem wrapper)\n');
    testFlattenPosts(data);
  } else if (data.posts) {
    // Formato novo (objeto com profile + posts)
    console.log('✅ Formato novo detectado (objeto com profile + posts)\n');
    testFlattenPosts(data.posts);
  } else {
    console.error('❌ Estrutura de dados não reconhecida');
    process.exit(1);
  }
}

/**
 * Testa flatten em array de posts
 */
function testFlattenPosts(posts) {
  console.log(`📊 Total de posts: ${posts.length}\n`);

  let totalRaw = 0;
  let totalFlat = 0;
  let totalRootComments = 0;
  let totalReplies = 0;
  let maxDepth = 0;

  // Processar cada post
  posts.forEach((post, idx) => {
    const rawComments = post.comments?.raw || [];

    if (rawComments.length === 0) {
      console.log(`   [${idx + 1}/${posts.length}] ${post.shortCode} - sem comentários`);
      return;
    }

    // Flatten
    const flatComments = flattenComments(rawComments);

    // Validar
    const validation = validateFlatComments(flatComments);

    // Estatísticas
    const stats = getThreadStats(flatComments);

    totalRaw += rawComments.length;
    totalFlat += flatComments.length;
    totalRootComments += stats.rootComments;
    totalReplies += stats.totalReplies;
    maxDepth = Math.max(maxDepth, stats.maxDepth);

    // Log
    console.log(`   [${idx + 1}/${posts.length}] ${post.shortCode}`);
    console.log(`      Raw: ${rawComments.length} | Flat: ${flatComments.length}`);
    console.log(`      Raiz: ${stats.rootComments} | Replies: ${stats.totalReplies}`);
    console.log(`      Max depth: ${stats.maxDepth} | Threads: ${stats.rootsWithReplies}`);

    if (!validation.valid) {
      console.log(`      ❌ ERROS: ${validation.errors.length}`);
      validation.errors.forEach(err => console.log(`         - ${err}`));
    } else {
      console.log(`      ✅ Validação OK`);
    }

    console.log('');
  });

  // Resumo final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 RESUMO FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Total de comentários (raw):       ${totalRaw}`);
  console.log(`Total de comentários (flat):      ${totalFlat}`);
  console.log(`Comentários raiz:                 ${totalRootComments}`);
  console.log(`Replies totais:                   ${totalReplies}`);
  console.log(`Profundidade máxima de threads:   ${maxDepth}`);
  console.log('');

  // Exemplo de estrutura flat
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 EXEMPLO DE ESTRUTURA FLAT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Pegar primeiro post com comentários
  const postWithComments = posts.find(p => p.comments?.raw?.length > 0);
  if (postWithComments) {
    const flatExample = flattenComments(postWithComments.comments.raw);
    const byLevel = groupByLevel(flatExample);

    console.log(`Post: ${postWithComments.shortCode}\n`);

    Object.keys(byLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
      console.log(`Level ${level} (${byLevel[level].length} comentários):`);
      byLevel[level].slice(0, 2).forEach(c => {
        const parentInfo = c.parent_comment_id ? `← ${c.parent_comment_id.substring(0, 10)}...` : '(raiz)';
        console.log(`   ${c.id.substring(0, 10)}... ${parentInfo}`);
        console.log(`   "${c.text.substring(0, 60)}${c.text.length > 60 ? '...' : ''}"`);
        console.log('');
      });
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TESTE CONCLUÍDO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// CLI
const args = process.argv.slice(2);
const username = args[0] || 'rodrigogunter_';

testFlatten(username);
