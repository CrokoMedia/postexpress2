/**
 * Flatten Comments Utility
 *
 * Transforma a estrutura aninhada de comentários do Apify (replies[])
 * em uma lista flat com referências parent_comment_id.
 *
 * Estrutura de entrada (Apify):
 * {
 *   id: "123",
 *   text: "Comentário raiz",
 *   replies: [
 *     {
 *       id: "456",
 *       text: "Resposta",
 *       replies: []
 *     }
 *   ]
 * }
 *
 * Estrutura de saída (flat):
 * [
 *   { id: "123", text: "Comentário raiz", parent_comment_id: null, reply_level: 0 },
 *   { id: "456", text: "Resposta", parent_comment_id: "123", reply_level: 1 }
 * ]
 */

/**
 * Remove comentários inválidos (erros do Apify, comentários deletados, etc)
 *
 * @param {Array} comments - Array de comentários (aninhado ou flat)
 * @returns {Array} Comentários válidos
 */
export function filterInvalidComments(comments) {
  return comments.filter(comment => {
    // Remover objetos de erro do Apify
    if (comment.error || comment.requestErrorMessages) {
      return false;
    }

    // Remover comentários sem ID
    if (!comment.id) {
      return false;
    }

    // Remover comentários sem texto
    if (!comment.text || comment.text.trim() === '') {
      return false;
    }

    return true;
  });
}

/**
 * Flatten comments recursively
 *
 * @param {Array} comments - Array de comentários do Apify (com replies aninhadas)
 * @param {String|null} parentId - ID do Instagram do comentário pai (não UUID!)
 * @param {Number} level - Profundidade da thread (0 = raiz, 1+ = resposta)
 * @param {Set} seenIds - Set de IDs já processados (para deduplicar)
 * @returns {Array} Lista flat de comentários com parent_comment_id e reply_level
 */
export function flattenComments(comments, parentId = null, level = 0, seenIds = new Set()) {
  const flattened = [];

  // Filtrar comentários inválidos antes de processar
  const validComments = filterInvalidComments(comments);

  for (const comment of validComments) {
    const { replies, ...commentData } = comment;

    // Skip se comentário já foi processado (evita duplicatas nos dados do Apify)
    if (comment.id && seenIds.has(comment.id)) {
      continue;
    }

    // Marcar como processado
    if (comment.id) {
      seenIds.add(comment.id);
    }

    // Adicionar comentário atual com referência ao pai
    flattened.push({
      ...commentData,
      parent_comment_id: parentId,  // ID do Instagram (será resolvido para UUID na inserção)
      reply_level: level
    });

    // Processar replies recursivamente
    if (replies && replies.length > 0) {
      flattened.push(
        ...flattenComments(replies, comment.id, level + 1, seenIds)
      );
    }
  }

  return flattened;
}

/**
 * Agrupa comentários por nível (para análise/debugging)
 *
 * @param {Array} flatComments - Lista flat de comentários
 * @returns {Object} Comentários agrupados por reply_level
 */
export function groupByLevel(flatComments) {
  return flatComments.reduce((acc, comment) => {
    const level = comment.reply_level || 0;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(comment);
    return acc;
  }, {});
}

/**
 * Calcula estatísticas de threading
 *
 * @param {Array} flatComments - Lista flat de comentários
 * @returns {Object} Estatísticas de threads
 */
export function getThreadStats(flatComments) {
  const byLevel = groupByLevel(flatComments);
  const maxLevel = Math.max(...Object.keys(byLevel).map(Number));

  const rootComments = flatComments.filter(c => c.reply_level === 0);
  const replies = flatComments.filter(c => c.reply_level > 0);

  // Comentários raiz que têm respostas
  const rootsWithReplies = rootComments.filter(root => {
    return replies.some(reply => reply.parent_comment_id === root.id);
  });

  return {
    total: flatComments.length,
    rootComments: rootComments.length,
    totalReplies: replies.length,
    rootsWithReplies: rootsWithReplies.length,
    maxDepth: maxLevel,
    byLevel: Object.keys(byLevel).reduce((acc, level) => {
      acc[level] = byLevel[level].length;
      return acc;
    }, {}),
  };
}

/**
 * Valida estrutura de comentários flat
 *
 * @param {Array} flatComments - Lista flat de comentários
 * @returns {Object} Resultado da validação { valid: boolean, errors: [] }
 */
export function validateFlatComments(flatComments) {
  const errors = [];
  const commentIds = new Set();

  for (const comment of flatComments) {
    // 1. Verificar campos obrigatórios
    if (!comment.id) {
      errors.push(`Comment sem ID: ${JSON.stringify(comment)}`);
    }

    if (!comment.text || comment.text.trim() === '') {
      errors.push(`Comment ${comment.id} sem texto`);
    }

    // 2. Verificar se reply_level é consistente
    if (comment.reply_level === undefined || comment.reply_level === null) {
      errors.push(`Comment ${comment.id} sem reply_level`);
    }

    if (comment.reply_level < 0) {
      errors.push(`Comment ${comment.id} com reply_level negativo: ${comment.reply_level}`);
    }

    // 3. Verificar parent_comment_id
    if (comment.reply_level === 0 && comment.parent_comment_id !== null) {
      errors.push(`Comment raiz ${comment.id} tem parent_comment_id: ${comment.parent_comment_id}`);
    }

    if (comment.reply_level > 0 && !comment.parent_comment_id) {
      errors.push(`Reply ${comment.id} (level ${comment.reply_level}) sem parent_comment_id`);
    }

    // 4. Verificar IDs únicos
    if (commentIds.has(comment.id)) {
      errors.push(`ID duplicado: ${comment.id}`);
    }
    commentIds.add(comment.id);

    // 5. Verificar referência circular (parent não pode ser o próprio comentário)
    if (comment.parent_comment_id === comment.id) {
      errors.push(`Comment ${comment.id} aponta para si mesmo`);
    }
  }

  // 6. Verificar referências órfãs (parent_comment_id que não existe)
  for (const comment of flatComments) {
    if (comment.parent_comment_id && !commentIds.has(comment.parent_comment_id)) {
      errors.push(`Comment ${comment.id} aponta para parent inexistente: ${comment.parent_comment_id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export default para usar como módulo
export default {
  filterInvalidComments,
  flattenComments,
  groupByLevel,
  getThreadStats,
  validateFlatComments,
};
