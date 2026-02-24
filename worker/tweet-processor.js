#!/usr/bin/env node

/**
 * Tweet Processor - Otimizado
 * Processamento eficiente de tweets com cache, deduplicação e classificação IA
 *
 * @epic EPIC-001 - Twitter Stream API Integration
 * @story Story 2.2 - Tweet Processing Optimization
 */

import { createClient } from '@supabase/supabase-js';
import { notifySlack, isRelevantForNotification } from '../lib/notifications.js';

// ============================================
// CONFIGURATION
// ============================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cache de tweets processados (em memória)
const processedTweetsCache = new Set();
const CACHE_MAX_SIZE = 10000;

// Cache de experts (username -> expert_id)
const expertCache = new Map();

// Stats
const processingStats = {
  totalProcessed: 0,
  duplicatesAvoided: 0,
  cacheHits: 0,
  averageTime: 0
};

// ============================================
// DEDUPLICAÇÃO
// ============================================

/**
 * Verifica se tweet já foi processado
 * Usa cache em memória + fallback Supabase
 * @param {string} tweetId
 * @returns {Promise<boolean>}
 */
async function isDuplicate(tweetId) {
  // 1. Check cache (rápido - O(1))
  if (processedTweetsCache.has(tweetId)) {
    processingStats.cacheHits++;
    processingStats.duplicatesAvoided++;
    return true;
  }

  // 2. Check Supabase (fallback)
  const { data, error } = await supabase
    .from('twitter_content_updates')
    .select('id')
    .eq('tweet_id', tweetId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[DEDUP] Error checking Supabase:', error);
    return false;
  }

  if (data) {
    // Adicionar ao cache para próximas verificações
    if (processedTweetsCache.size < CACHE_MAX_SIZE) {
      processedTweetsCache.add(tweetId);
    } else {
      // Cache cheio - remover item mais antigo (FIFO)
      const firstItem = processedTweetsCache.values().next().value;
      processedTweetsCache.delete(firstItem);
      processedTweetsCache.add(tweetId);
    }
    processingStats.duplicatesAvoided++;
    return true;
  }

  return false;
}

// ============================================
// EXTRAÇÃO DE METADADOS
// ============================================

/**
 * @typedef {Object} TweetMetadata
 * @property {string} tweetId
 * @property {string} text
 * @property {string} url
 * @property {Object} author
 * @property {Object} metrics
 * @property {Object} timestamps
 * @property {Array} entities
 */

/**
 * Extrai todos os metadados relevantes do tweet
 * @param {Object} tweetData
 * @param {Object} authorData
 * @returns {TweetMetadata}
 */
function extractMetadata(tweetData, authorData) {
  const tweet = tweetData;
  const author = authorData;

  return {
    tweetId: tweet.id,
    text: tweet.text || '',
    url: `https://twitter.com/${author.username}/status/${tweet.id}`,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.name,
      followersCount: author.public_metrics?.followers_count || 0,
      verified: author.verified || false
    },
    metrics: {
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      replies: tweet.public_metrics?.reply_count || 0,
      quotes: tweet.public_metrics?.quote_count || 0,
      impressions: tweet.public_metrics?.impression_count || 0
    },
    timestamps: {
      published: tweet.created_at,
      detected: new Date().toISOString()
    },
    entities: {
      hashtags: tweet.entities?.hashtags?.map(h => h.tag) || [],
      mentions: tweet.entities?.mentions?.map(m => m.username) || [],
      urls: tweet.entities?.urls?.map(u => u.expanded_url) || []
    }
  };
}

// ============================================
// ASSOCIAÇÃO COM EXPERT
// ============================================

/**
 * Busca expert por username com cache
 * @param {string} username
 * @returns {Promise<string|null>}
 */
async function getExpertIdByUsername(username) {
  // 1. Check cache
  if (expertCache.has(username)) {
    processingStats.cacheHits++;
    return expertCache.get(username);
  }

  // 2. Query Supabase
  const { data, error } = await supabase
    .from('twitter_experts')
    .select('id')
    .eq('twitter_username', username)
    .eq('is_active', true)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error(`[EXPERT] Error fetching @${username}:`, error);
    return null;
  }

  if (!data) {
    // Expert não encontrado - cachear null para evitar queries repetidas
    expertCache.set(username, null);
    return null;
  }

  // 3. Cache result
  expertCache.set(username, data.id);
  return data.id;
}

// ============================================
// CLASSIFICAÇÃO DE TEMAS (IA - OPCIONAL)
// ============================================

/**
 * Classifica tweet em temas usando Claude API (opcional)
 * Só roda se ANTHROPIC_API_KEY estiver configurado
 * @param {string} tweetText
 * @returns {Promise<string[]>}
 */
async function classifyThemes(tweetText) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return []; // Skip se não tiver API key
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Mais barato (~$0.25/1M tokens)
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Classifique este tweet em até 3 temas (marketing, sales, frameworks, real estate, AI, entrepreneurship, social media, content creation, etc). Retorne apenas os temas separados por vírgula, em minúsculas.

Tweet: "${tweetText}"

Temas:`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const themesText = result.content[0].text.trim();
    const themes = themesText.split(',').map(t => t.trim().toLowerCase());

    return themes.filter(t => t.length > 0);

  } catch (error) {
    console.error('[CLASSIFY] Error:', error.message);
    return [];
  }
}

// ============================================
// PROCESSAMENTO COMPLETO
// ============================================

/**
 * Processa tweet completo: dedup, metadata, expert, temas, save
 * @param {Object} tweetData
 * @param {Object} authorData
 * @returns {Promise<void>}
 */
export async function processTweet(tweetData, authorData) {
  const startTime = Date.now();

  try {
    // 1. Deduplicação
    if (await isDuplicate(tweetData.id)) {
      console.log(`[TWEET] Duplicate, skipping: ${tweetData.id}`);
      return;
    }

    // 2. Extração de metadados
    const metadata = extractMetadata(tweetData, authorData);

    // 3. Associação com expert
    const expertId = await getExpertIdByUsername(authorData.username);

    // 4. Classificação de temas (opcional - só se ANTHROPIC_API_KEY configurado)
    const themes = await classifyThemes(metadata.text);

    // 5. Salvar no Supabase
    const { error: insertError } = await supabase
      .from('twitter_content_updates')
      .insert({
        tweet_id: metadata.tweetId,
        tweet_text: metadata.text,
        tweet_url: metadata.url,
        expert_id: expertId,
        author_username: metadata.author.username,
        author_display_name: metadata.author.displayName,
        likes_count: metadata.metrics.likes,
        retweets_count: metadata.metrics.retweets,
        replies_count: metadata.metrics.replies,
        published_at: metadata.timestamps.published,
        detected_at: metadata.timestamps.detected,
        themes: themes.length > 0 ? themes : null,
        notified: false,
        raw_data: { tweet: tweetData, author: authorData }
      });

    if (insertError) {
      // Duplicata na constraint do Supabase (23505) - já tratado
      if (insertError.code === '23505') {
        console.log(`[TWEET] Duplicate (DB constraint), skipping: ${metadata.tweetId}`);
        processedTweetsCache.add(metadata.tweetId);
        processingStats.duplicatesAvoided++;
        return;
      }
      throw insertError;
    }

    // 6. Enviar notificação Slack (se relevante)
    let notified = false;
    if (isRelevantForNotification(metadata)) {
      notified = await notifySlack({
        tweetId: metadata.tweetId,
        author: {
          username: metadata.author.username,
          displayName: metadata.author.displayName,
          verified: metadata.author.verified
        },
        text: metadata.text,
        url: metadata.url,
        metrics: {
          likes: metadata.metrics.likes,
          retweets: metadata.metrics.retweets
        },
        themes: themes.length > 0 ? themes : undefined,
        publishedAt: metadata.timestamps.published
      });

      // Atualizar campo notified no Supabase
      if (notified) {
        await supabase
          .from('twitter_content_updates')
          .update({
            notified: true,
            notified_at: new Date().toISOString()
          })
          .eq('tweet_id', metadata.tweetId);
      }
    }

    // 7. Adicionar ao cache
    if (processedTweetsCache.size < CACHE_MAX_SIZE) {
      processedTweetsCache.add(metadata.tweetId);
    }

    // 7. Update stats
    const processingTime = Date.now() - startTime;
    processingStats.totalProcessed++;
    processingStats.averageTime =
      (processingStats.averageTime * (processingStats.totalProcessed - 1) + processingTime) /
      processingStats.totalProcessed;

    console.log(`[TWEET] ✅ Processed in ${processingTime}ms: @${metadata.author.username} - "${metadata.text.substring(0, 50)}..." ${expertId ? `[Expert: ${expertId}]` : '[No expert]'} ${themes.length > 0 ? `[Themes: ${themes.join(', ')}]` : ''} ${notified ? '[Notified ✓]' : ''}`);

    // 8. Log de sucesso
    await logEvent('tweet_processed', true, {
      tweet_id: metadata.tweetId,
      expert_id: expertId,
      processing_time_ms: processingTime,
      themes,
      notified,
      cache_hit: false
    });

  } catch (error) {
    console.error('[TWEET] ❌ Processing error:', error.message);
    await logEvent('tweet_processing_error', false, {
      tweet_id: tweetData.id,
      error: error.message
    });
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Loga evento no Supabase
 * @param {string} eventType
 * @param {boolean} success
 * @param {Object} metadata
 */
async function logEvent(eventType, success, metadata) {
  try {
    await supabase.from('twitter_monitoring_log').insert({
      event_type: eventType,
      success,
      metadata
    });
  } catch (error) {
    console.error('[LOG] Failed to log event:', error.message);
  }
}

/**
 * Retorna estatísticas de processamento
 * @returns {Object}
 */
export function getProcessingStats() {
  const cacheHitRate = processingStats.totalProcessed > 0
    ? (processingStats.cacheHits / processingStats.totalProcessed * 100).toFixed(1)
    : 0;

  const duplicateRate = processingStats.totalProcessed > 0
    ? (processingStats.duplicatesAvoided / processingStats.totalProcessed * 100).toFixed(1)
    : 0;

  return {
    totalProcessed: processingStats.totalProcessed,
    duplicatesAvoided: processingStats.duplicatesAvoided,
    cacheHits: processingStats.cacheHits,
    averageTime: Math.round(processingStats.averageTime),
    cacheHitRate: `${cacheHitRate}%`,
    duplicateRate: `${duplicateRate}%`,
    cacheSize: {
      tweets: processedTweetsCache.size,
      experts: expertCache.size
    }
  };
}

/**
 * Limpa caches (útil para testes)
 */
export function clearCaches() {
  processedTweetsCache.clear();
  expertCache.clear();
  processingStats.totalProcessed = 0;
  processingStats.duplicatesAvoided = 0;
  processingStats.cacheHits = 0;
  processingStats.averageTime = 0;
  console.log('[CACHE] Caches cleared');
}
