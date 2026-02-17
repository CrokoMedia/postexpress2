/**
 * Inventory Updater — ETL Data Collector
 * Atualiza o COLLECTION-INVENTORY.md e sincroniza com Supabase após cada coleta
 */

const fs = require('fs');
const path = require('path');

const INVENTORY_PATH = path.join(__dirname, '../data/COLLECTION-INVENTORY.md');

// Supabase client (lazy — só inicializa se as variáveis estiverem configuradas)
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      _supabase = createClient(url, key);
    }
  } catch (_) { /* sem Supabase configurado — modo offline */ }
  return _supabase;
}

// Envia evento para Supabase de forma não-bloqueante (fire and forget)
function syncEventToSupabase(event) {
  const client = getSupabase();
  if (!client) return;
  client.from('etl_collection_log').insert(event).then(({ error }) => {
    if (error && process.env.ETL_DEBUG) {
      console.error('  [supabase] log error:', error.message);
    }
  });
}

function syncMindToSupabase(mindId, status, sourcesCount, audioMinutes) {
  const client = getSupabase();
  if (!client) return;
  const displayName = mindId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const data = {
    id: mindId,
    display_name: displayName,
    status,
    collected_sources: sourcesCount || 0,
    assemblyai_minutes_used: audioMinutes || 0,
    updated_at: new Date().toISOString(),
  };
  client.from('etl_minds').upsert(data, { onConflict: 'id' }).then(({ error }) => {
    if (error && process.env.ETL_DEBUG) {
      console.error('  [supabase] mind sync error:', error.message);
    }
  });
}

/**
 * Adiciona uma entrada ao log cronológico do inventário
 */
function logCollection({ mind, type, title, durationOrSize, apiUsed, plan, status }) {
  // Sincroniza com Supabase de forma assíncrona (não bloqueia a coleta)
  syncEventToSupabase({
    mind_id: mind,
    source_type: type,
    title,
    status: status === '✓ Coletado' ? 'success' : status,
    api_used: apiUsed || null,
    duration_or_size: durationOrSize || null,
    plan: plan || 'free',
    logged_at: new Date().toISOString(),
  });

  if (!fs.existsSync(INVENTORY_PATH)) return;

  const content = fs.readFileSync(INVENTORY_PATH, 'utf8');
  const date = new Date().toISOString().split('T')[0];

  const newRow = `| ${date} | ${mind} | ${type} | ${title} | ${durationOrSize || '—'} | ${apiUsed || '—'} | ${plan || 'free'} | ${status} |`;

  const updated = content.replace(
    /(\| Data \| Mente \| Tipo \| Título \/ Descrição \| Duração\/Tamanho \| API Usada \| Plano \| Status \|\n\|[-| ]+\|\n)\| — \| — \| — \| — \| — \| — \| — \| — \|/,
    `$1${newRow}`
  ).replace(
    /(\| Data \| Mente \| Tipo \| Título \/ Descrição \| Duração\/Tamanho \| API Usada \| Plano \| Status \|\n\|[-| ]+\|\n)((?:\|.+\|\n)*)$/m,
    (match, header, rows) => `${header}${rows}${newRow}\n`
  );

  // Fallback: append no final da seção de log
  if (updated === content) {
    const withEntry = content.replace(
      '| — | — | — | — | — | — | — | — |',
      newRow
    );
    if (withEntry !== content) {
      fs.writeFileSync(INVENTORY_PATH, withEntry, 'utf8');
      return;
    }
    // Se o placeholder já foi substituído, adiciona linha nova após o último row
    const lines = content.split('\n');
    const logHeaderIdx = lines.findIndex(l => l.includes('Log de Coletas'));
    if (logHeaderIdx > -1) {
      // Encontra última linha de tabela após o header
      let insertIdx = logHeaderIdx + 4;
      for (let i = logHeaderIdx + 4; i < lines.length; i++) {
        if (lines[i].startsWith('|')) insertIdx = i + 1;
        else if (lines[i].startsWith('---') || lines[i].startsWith('#')) break;
      }
      lines.splice(insertIdx, 0, newRow);
      fs.writeFileSync(INVENTORY_PATH, lines.join('\n'), 'utf8');
    }
    return;
  }

  fs.writeFileSync(INVENTORY_PATH, updated, 'utf8');
}

/**
 * Atualiza o consumo de horas do AssemblyAI no resumo
 */
function updateAssemblyAIUsage(additionalMinutes) {
  if (!fs.existsSync(INVENTORY_PATH)) return;

  const content = fs.readFileSync(INVENTORY_PATH, 'utf8');

  // Extrai o valor atual utilizado
  const match = content.match(/\*\*Utilizado pré-gravado:\*\* (\d+)h (\d+)min/);
  if (!match) return;

  const totalMinutesUsed = parseInt(match[1]) * 60 + parseInt(match[2]) + additionalMinutes;
  const newHours = Math.floor(totalMinutesUsed / 60);
  const newMins = totalMinutesUsed % 60;

  const remainingMinutes = 185 * 60 - totalMinutesUsed;
  const remHours = Math.floor(remainingMinutes / 60);
  const remMins = remainingMinutes % 60;

  const updated = content
    .replace(
      /\*\*Utilizado pré-gravado:\*\* \d+h \d+min/,
      `**Utilizado pré-gravado:** ${newHours}h ${newMins}min`
    )
    .replace(
      /\*\*Saldo pré-gravado:\*\* \d+h \d+min/,
      `**Saldo pré-gravado:** ${remHours}h ${remMins}min`
    );

  fs.writeFileSync(INVENTORY_PATH, updated, 'utf8');
}

/**
 * Atualiza o status de uma mente na tabela de resumo
 */
function updateMindStatus(mindName, status, sourcesCount, audioHours) {
  // Sync com Supabase (audioHours → minutes para Supabase)
  const audioMinutes = Math.round((parseFloat(audioHours) || 0) * 60);
  syncMindToSupabase(mindName, status, sourcesCount, audioMinutes);

  if (!fs.existsSync(INVENTORY_PATH)) return;

  const content = fs.readFileSync(INVENTORY_PATH, 'utf8');
  const date = new Date().toISOString().split('T')[0];

  const statusEmoji = {
    pending: '🔴 Pendente',
    in_progress: '🟡 Em andamento',
    completed: '🟢 Concluído',
    partial: '⚠️ Parcial',
  }[status] || status;

  // Tenta atualizar linha existente da mente
  const mindRegex = new RegExp(`\\| ${mindName} \\|[^\\n]+\\n`);
  const newRow = `| ${mindName} | ${statusEmoji} | ${sourcesCount || 0} | ${audioHours || '0'} | ${date} | — |\n`;

  let updated;
  if (mindRegex.test(content)) {
    updated = content.replace(mindRegex, newRow);
  } else {
    // Adiciona nova linha na tabela de mentes
    updated = content.replace(
      '| — | — | — | — | — | — |',
      newRow
    );
  }

  fs.writeFileSync(INVENTORY_PATH, updated, 'utf8');
}

module.exports = {
  logCollection,
  updateAssemblyAIUsage,
  updateMindStatus,
};
