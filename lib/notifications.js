/**
 * Slack Notifications System
 * Notificações em tempo real para tweets relevantes com rate limiting
 *
 * @epic EPIC-001 - Twitter Stream API Integration
 * @story Story 2.3 - Sistema de Notificações
 */

// ============================================
// CONFIGURATION
// ============================================

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora em ms

// Rate limiting em memória (por expert username)
const notificationCounts = new Map();

// ============================================
// RATE LIMITING
// ============================================

/**
 * Verifica se pode notificar (rate limit)
 * @param {string} expertUsername
 * @returns {boolean}
 */
function canNotify(expertUsername) {
  const limit = parseInt(process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '10');
  const now = Date.now();

  const record = notificationCounts.get(expertUsername);

  if (!record || now > record.resetAt) {
    // Novo período ou expirou - resetar contador
    notificationCounts.set(expertUsername, {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (record.count >= limit) {
    console.log(`[NOTIFY] ⚠️  Rate limit reached for @${expertUsername} (${record.count}/${limit})`);
    return false;
  }

  return true;
}

/**
 * Incrementa contador de notificações
 * @param {string} expertUsername
 */
function incrementNotificationCount(expertUsername) {
  const record = notificationCounts.get(expertUsername);
  if (record) {
    record.count++;
  }
}

/**
 * Retorna estatísticas de rate limiting
 * @returns {Object}
 */
export function getNotificationStats() {
  const stats = {};
  notificationCounts.forEach((record, username) => {
    const remaining = Math.max(0, parseInt(process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '10') - record.count);
    const resetIn = Math.max(0, Math.floor((record.resetAt - Date.now()) / 60000)); // minutos
    stats[username] = {
      sent: record.count,
      remaining,
      resetInMinutes: resetIn
    };
  });
  return stats;
}

// ============================================
// RELEVÂNCIA
// ============================================

/**
 * Verifica se tweet é relevante o suficiente para notificar
 * @param {Object} metadata - TweetMetadata
 * @returns {boolean}
 */
export function isRelevantForNotification(metadata) {
  // 1. Mínimo de caracteres (evitar tweets muito curtos)
  if (metadata.text.length < 50) {
    return false;
  }

  // 2. Não é reply (replies geralmente menos importantes)
  // Nota: precisaria adicionar in_reply_to_user_id no metadata
  // Por enquanto, vamos considerar todos relevantes se > 50 chars

  // 3. Se tem temas classificados, considerar mais relevante
  // (mas não obrigatório ter temas)

  return true;
}

// ============================================
// FORMATAÇÃO
// ============================================

/**
 * Formata data para exibição relativa
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Constrói mensagem formatada para Slack
 * @param {Object} payload
 * @returns {Object}
 */
function buildSlackMessage(payload) {
  const verifiedBadge = payload.author.verified ? ' ✓' : '';
  const themesText = payload.themes && payload.themes.length > 0
    ? `🏷️ *Temas:* ${payload.themes.join(', ')}`
    : '';

  // Truncar texto se muito longo
  const tweetText = payload.text.length > 280
    ? payload.text.substring(0, 277) + '...'
    : payload.text;

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🐦 Novo Tweet Detectado',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*@${payload.author.username}*${verifiedBadge} (${payload.author.displayName})\n\n"${tweetText}"`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*❤️ Likes:*\n${payload.metrics.likes}`
          },
          {
            type: 'mrkdwn',
            text: `*🔁 Retweets:*\n${payload.metrics.retweets}`
          },
          {
            type: 'mrkdwn',
            text: `*🕒 Publicado:*\n${formatDate(payload.publishedAt)}`
          },
          {
            type: 'mrkdwn',
            text: `*🔗 Link:*\n<${payload.url}|Ver no Twitter>`
          }
        ]
      },
      ...(themesText ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: themesText
        }
      }] : [])
    ],
    // Fallback text para notificações mobile
    text: `Novo tweet de @${payload.author.username}: "${tweetText}"`
  };
}

// ============================================
// ENVIO DE NOTIFICAÇÃO
// ============================================

/**
 * @typedef {Object} NotificationPayload
 * @property {string} tweetId
 * @property {Object} author
 * @property {string} author.username
 * @property {string} author.displayName
 * @property {boolean} [author.verified]
 * @property {string} text
 * @property {string} url
 * @property {Object} metrics
 * @property {number} metrics.likes
 * @property {number} metrics.retweets
 * @property {string[]} [themes]
 * @property {string} publishedAt
 */

/**
 * Envia notificação para Slack
 * @param {NotificationPayload} payload
 * @returns {Promise<boolean>}
 */
export async function notifySlack(payload) {
  // 1. Verificar se notificações estão habilitadas
  if (process.env.SLACK_NOTIFICATIONS_ENABLED !== 'true') {
    console.log('[NOTIFY] Slack notifications disabled (SLACK_NOTIFICATIONS_ENABLED !== true)');
    return false;
  }

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn('[NOTIFY] ⚠️  SLACK_WEBHOOK_URL not configured');
    return false;
  }

  // 2. Rate limiting
  if (!canNotify(payload.author.username)) {
    return false;
  }

  // 3. Construir mensagem Slack
  const message = buildSlackMessage(payload);

  // 4. Enviar webhook
  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API error: ${response.status} - ${errorText}`);
    }

    // 5. Incrementar contador
    incrementNotificationCount(payload.author.username);

    console.log(`[NOTIFY] ✅ Slack notification sent for @${payload.author.username} (tweet ${payload.tweetId})`);
    return true;

  } catch (error) {
    console.error('[NOTIFY] ❌ Failed to send Slack notification:', error.message);
    // Graceful fallback - não quebrar o processamento
    return false;
  }
}

/**
 * Limpa contadores (útil para testes)
 */
export function clearNotificationCounts() {
  notificationCounts.clear();
  console.log('[NOTIFY] Notification counts cleared');
}
