#!/usr/bin/env node

/**
 * Twitter Stream Worker (24/7)
 * Conecta ao Twitter Filtered Stream API e processa tweets em tempo real
 *
 * @epic EPIC-001 - Twitter Stream API Integration
 * @story Story 2.1 - Worker de Stream 24/7
 */

import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { processTweet, getProcessingStats } from './tweet-processor.js';

// ============================================
// CONFIGURATION
// ============================================

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_STREAM_URL = 'https://api.twitter.com/2/tweets/search/stream';
const PORT = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// STATE
// ============================================

let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BACKOFF_BASE = 5000; // 5 segundos

// Stats
const stats = {
  startTime: Date.now(),
  tweetsProcessed: 0,
  errors: 0,
  reconnects: 0,
  lastTweetAt: null
};

// ============================================
// STREAM CONNECTION
// ============================================

async function connectToStream() {
  console.log('[STREAM] Connecting to Twitter Filtered Stream...');

  try {
    const response = await fetch(
      `${TWITTER_STREAM_URL}?tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=username,name,verified`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
        },
        signal: AbortSignal.timeout(0) // No timeout - stream infinito
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body from Twitter API');
    }

    isConnected = true;
    reconnectAttempts = 0;
    console.log('[STREAM] ✅ Connected successfully');

    await logEvent('stream_connect', true, {
      timestamp: new Date().toISOString()
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Stream loop (roda infinitamente até desconexão)
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log('[STREAM] Connection closed by Twitter');
        isConnected = false;
        await logEvent('stream_disconnect', true, {
          timestamp: new Date().toISOString(),
          reason: 'closed_by_twitter'
        });
        handleDisconnect();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      await processChunk(chunk);
    }

  } catch (error) {
    console.error('[STREAM] ❌ Connection error:', error.message);
    isConnected = false;
    stats.errors++;

    await logEvent('stream_error', false, {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    handleDisconnect();
  }
}

// ============================================
// CHUNK PROCESSING
// ============================================

async function processChunk(chunk) {
  const lines = chunk.split('\r\n').filter(line => line.trim());

  for (const line of lines) {
    try {
      const data = JSON.parse(line);

      // Ignorar heartbeats (linhas vazias ou sem data)
      if (!data.data) continue;

      const tweet = data.data;
      const author = data.includes?.users?.[0];

      if (!tweet || !author) {
        console.warn('[STREAM] Invalid tweet format:', line.substring(0, 100));
        continue;
      }

      // Processar tweet (otimizado com cache e deduplicação)
      await handleTweetProcessing(tweet, author);

    } catch (error) {
      // Linha não é JSON válido (provavelmente heartbeat vazio)
      if (line.trim() !== '') {
        console.warn('[STREAM] Non-JSON line:', line.substring(0, 50));
      }
    }
  }
}

// ============================================
// TWEET PROCESSING
// ============================================
// Processamento delegado para tweet-processor.js
// (com cache, deduplicação inteligente e classificação IA)

async function handleTweetProcessing(tweet, author) {
  console.log(`[TWEET] New from @${author.username}: "${tweet.text.substring(0, 50)}..."`);

  try {
    await processTweet(tweet, author);

    // Atualizar stats locais
    stats.tweetsProcessed++;
    stats.lastTweetAt = new Date().toISOString();

  } catch (error) {
    console.error('[TWEET] ❌ Error in processing:', error.message);
    stats.errors++;
  }
}

// ============================================
// RECONNECTION LOGIC
// ============================================

function handleDisconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`[STREAM] ❌ Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Exiting.`);
    process.exit(1);
  }

  reconnectAttempts++;
  stats.reconnects++;

  const backoffTime = Math.min(
    BACKOFF_BASE * Math.pow(2, reconnectAttempts - 1),
    60000 // Max 1 minuto
  );

  console.log(`[STREAM] Reconnecting in ${backoffTime}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  setTimeout(() => {
    connectToStream();
  }, backoffTime);
}

// ============================================
// HEALTH CHECK (Express)
// ============================================

const app = express();

app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);

  res.json({
    status: isConnected ? 'healthy' : 'disconnected',
    connected: isConnected,
    uptime: uptime,
    stats: {
      tweetsProcessed: stats.tweetsProcessed,
      errors: stats.errors,
      reconnects: stats.reconnects,
      lastTweetAt: stats.lastTweetAt,
      reconnectAttempts: reconnectAttempts
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/stats', (req, res) => {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);

  res.json({
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime)
    },
    tweets: {
      total: stats.tweetsProcessed,
      perHour: stats.tweetsProcessed / (uptime / 3600) || 0,
      lastAt: stats.lastTweetAt
    },
    connection: {
      connected: isConnected,
      reconnects: stats.reconnects,
      currentAttempt: reconnectAttempts,
      maxAttempts: MAX_RECONNECT_ATTEMPTS
    },
    errors: stats.errors
  });
});

app.get('/processing-stats', (req, res) => {
  res.json({
    processor: getProcessingStats(),
    worker: {
      tweetsProcessed: stats.tweetsProcessed,
      errors: stats.errors,
      reconnects: stats.reconnects,
      lastTweetAt: stats.lastTweetAt
    },
    timestamp: new Date().toISOString()
  });
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

app.listen(PORT, () => {
  console.log(`[HEALTH] Health check server running on port ${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/health`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/stats`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/processing-stats`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] SIGTERM received, shutting down gracefully...');
  isConnected = false;

  await logEvent('worker_shutdown', true, {
    reason: 'SIGTERM',
    stats
  });

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[SHUTDOWN] SIGINT received, shutting down gracefully...');
  isConnected = false;

  await logEvent('worker_shutdown', true, {
    reason: 'SIGINT',
    stats
  });

  process.exit(0);
});

// ============================================
// HELPERS
// ============================================

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

// ============================================
// START
// ============================================

console.log('═'.repeat(60));
console.log('🐦 Twitter Stream Worker Starting...');
console.log('═'.repeat(60));
console.log(`[CONFIG] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[CONFIG] Health Check Port: ${PORT}`);
console.log(`[CONFIG] Max Reconnect Attempts: ${MAX_RECONNECT_ATTEMPTS}`);

// Validar env vars
if (!TWITTER_BEARER_TOKEN) {
  console.error('❌ TWITTER_BEARER_TOKEN not set');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials not set');
  process.exit(1);
}

console.log('✅ Configuration valid');
console.log('═'.repeat(60));

// Conectar ao stream
connectToStream();
