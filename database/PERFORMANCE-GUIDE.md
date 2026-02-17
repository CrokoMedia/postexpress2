# GUIA DE PERFORMANCE - Instagram Audit System

## ESTIMATIVAS DE VOLUME

### Cenário Base: 100 Perfis/Mês

| Tabela | Registros/Mês | Tamanho/Registro | Total/Mês | Total/Ano |
|--------|---------------|------------------|-----------|-----------|
| **profiles** | 100 | 2 KB | 200 KB | 2.4 MB |
| **audits** | 100 | 50 KB (JSONB) | 5 MB | 60 MB |
| **posts** | 1,000 | 10 KB | 10 MB | 120 MB |
| **comments** | 10,000 | 500 bytes | 5 MB | 60 MB |
| **comparisons** | 50 | 5 KB | 250 KB | 3 MB |
| **analysis_queue** | 100 | 2 KB | 200 KB | 2.4 MB |
| **TOTAL** | - | - | **~20 MB/mês** | **~242 MB/ano** |

### Cenário Escalado: 1000 Perfis/Mês

| Tabela | Registros/Mês | Total/Mês | Total/Ano |
|--------|---------------|-----------|-----------|
| **profiles** | 1,000 | 2 MB | 24 MB |
| **audits** | 1,000 | 50 MB | 600 MB |
| **posts** | 10,000 | 100 MB | 1.2 GB |
| **comments** | 100,000 | 50 MB | 600 MB |
| **TOTAL** | - | **~200 MB/mês** | **~2.4 GB/ano** |

## BENCHMARKS DE PERFORMANCE

### Queries Críticas (EXPLAIN ANALYZE)

#### 1. Dashboard Home (listagem de perfis)

```sql
-- Query: Listar 20 perfis com última auditoria
-- Performance esperada: 8-12ms
-- Index usado: idx_profiles_last_scraped, idx_audits_profile_id

EXPLAIN ANALYZE
SELECT p.*, last_audit.*
FROM profiles p
LEFT JOIN LATERAL (
  SELECT * FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date DESC LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
ORDER BY p.last_scraped_at DESC
LIMIT 20;

-- Resultado esperado:
-- Planning Time: 0.5-1ms
-- Execution Time: 8-12ms
-- Rows: 20
```

#### 2. Buscar Perfil Completo

```sql
-- Query: Buscar perfil + última auditoria
-- Performance esperada: 3-5ms
-- Index usado: profiles_pkey, idx_audits_profile_id

EXPLAIN ANALYZE
SELECT p.*, a.*
FROM profiles p
LEFT JOIN LATERAL (
  SELECT * FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date DESC LIMIT 1
) a ON TRUE
WHERE p.id = '...' AND p.deleted_at IS NULL;

-- Resultado esperado:
-- Planning Time: 0.3-0.5ms
-- Execution Time: 2-4ms
-- Rows: 1
```

#### 3. Dashboard Stats (materialized view)

```sql
-- Query: Estatísticas do dashboard
-- Performance esperada: 0.5-1ms (instant)
-- Materialized view: mv_dashboard_stats

EXPLAIN ANALYZE
SELECT * FROM mv_dashboard_stats;

-- Resultado esperado:
-- Planning Time: 0.1ms
-- Execution Time: 0.3-0.8ms
-- Rows: 1
```

#### 4. Comparação Temporal

```sql
-- Query: Buscar comparação entre 2 auditorias
-- Performance esperada: 4-6ms
-- Index usado: idx_comparisons_profile_id

EXPLAIN ANALYZE
SELECT c.*, a_before.*, a_after.*, p.*
FROM comparisons c
JOIN profiles p ON c.profile_id = p.id
JOIN audits a_before ON c.audit_before_id = a_before.id
JOIN audits a_after ON c.audit_after_id = a_after.id
WHERE c.profile_id = '...'
ORDER BY c.date_after DESC LIMIT 10;

-- Resultado esperado:
-- Planning Time: 0.5ms
-- Execution Time: 3-5ms
-- Rows: 1-10
```

#### 5. Filtros Avançados

```sql
-- Query: Filtrar perfis por score + engajamento
-- Performance esperada: 15-25ms
-- Index usado: idx_audits_profile_score_date

EXPLAIN ANALYZE
SELECT p.*, last_audit.*
FROM profiles p
JOIN LATERAL (
  SELECT * FROM audits
  WHERE profile_id = p.id
    AND score_overall >= 70
    AND engagement_rate >= 5.0
  ORDER BY audit_date DESC LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
ORDER BY last_audit.score_overall DESC
LIMIT 20;

-- Resultado esperado:
-- Planning Time: 0.8-1.2ms
-- Execution Time: 12-20ms
-- Rows: 0-20
```

## ÍNDICES CRÍTICOS

### Indexes que NÃO podem faltar

```sql
-- PROFILES
idx_profiles_username           -- Busca por username (UNIQUE)
idx_profiles_last_scraped       -- Ordenação dashboard
idx_profiles_followers          -- Filtro por seguidores

-- AUDITS
idx_audits_profile_id           -- JOIN com profiles
idx_audits_profile_score_date   -- COMPOSTO (filtros combinados)
idx_audits_search_vector        -- Full-text search
idx_audits_raw_json_gin         -- Queries JSONB

-- POSTS
idx_posts_audit_id              -- JOIN com audits
idx_posts_instagram_id          -- UNIQUE (evitar duplicatas)
idx_posts_audit_likes_ts        -- COMPOSTO (ordenação)

-- COMMENTS
idx_comments_post_id            -- JOIN com posts
idx_comments_post_category_relevant -- COMPOSTO (filtros)
idx_comments_instagram_id       -- UNIQUE (evitar duplicatas)

-- COMPARISONS
idx_comparisons_profile_id      -- JOIN com profiles
idx_comparisons_unique          -- UNIQUE (evitar duplicatas)
```

## ESTRATÉGIAS DE OTIMIZAÇÃO

### 1. Materialized Views

#### Refresh Strategy

```sql
-- Refresh automático (pg_cron)
SELECT cron.schedule(
  'refresh-dashboard-stats',
  '0 * * * *',  -- A cada hora
  'SELECT refresh_all_materialized_views()'
);

-- Refresh manual (API/backend)
-- Chamar após cada nova auditoria
SELECT refresh_dashboard_stats();
```

#### Quando usar MV vs View normal?

| Tipo | Quando usar | Performance |
|------|-------------|-------------|
| **Materialized View** | Agregações pesadas, Dashboard, Stats | 0.5-1ms (instant) |
| **View normal** | Dados em tempo real, Detalhes de perfil | 5-20ms |
| **Query direta** | Filtros dinâmicos, Busca complexa | 10-50ms |

### 2. Particionamento (para escalabilidade futura)

#### Quando particionar?

- **Posts**: Quando > 1 milhão de registros (por trimestre)
- **Comments**: Quando > 10 milhões de registros (por trimestre)
- **Audits**: Quando > 100k registros (por ano)

#### Exemplo de particionamento (Posts)

```sql
-- Criar tabela particionada
CREATE TABLE posts_partitioned (
  LIKE posts INCLUDING ALL
) PARTITION BY RANGE (post_timestamp);

-- Criar partições por trimestre
CREATE TABLE posts_2025_q1 PARTITION OF posts_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE posts_2025_q2 PARTITION OF posts_partitioned
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

-- Migrar dados (se necessário)
INSERT INTO posts_partitioned SELECT * FROM posts;
```

### 3. JSONB vs Colunas Normalizadas

#### Quando usar JSONB?

- **Dados flexíveis** (raw_json, ocr_data, comments_categorized)
- **Arrays dinâmicos** (top_strengths, quick_wins)
- **Backup completo** (raw_json da auditoria)

#### Quando normalizar?

- **Filtros frequentes** (score_overall, engagement_rate)
- **Ordenação** (audit_date, likes_count)
- **JOINs** (profile_id, audit_id)

### 4. Limpeza de Dados Antigos

#### Soft Delete (recomendado)

```sql
-- Marcar como deletado (mantém histórico)
UPDATE profiles
SET deleted_at = NOW()
WHERE last_scraped_at < NOW() - INTERVAL '1 year';

-- Queries ignoram deleted_at automaticamente
SELECT * FROM profiles WHERE deleted_at IS NULL;
```

#### Hard Delete (apenas se necessário)

```sql
-- Deletar análises antigas (mais de 2 anos)
DELETE FROM audits
WHERE audit_date < NOW() - INTERVAL '2 years'
  AND profile_id NOT IN (
    SELECT id FROM profiles WHERE is_verified = TRUE
  );

-- Vacuum para liberar espaço
VACUUM FULL audits;
```

#### Política de Retenção Recomendada

| Tipo de Dado | Retenção | Estratégia |
|--------------|----------|------------|
| **Perfis verificados** | Ilimitado | Manter sempre |
| **Perfis normais** | 1 ano sem scraping | Soft delete |
| **Auditorias** | 2 anos | Hard delete |
| **Posts/Comments** | 1 ano | Hard delete (ou archive) |
| **Fila de análises** | 30 dias (completed/failed) | Soft delete |

### 5. Backup e Restore

#### Backup Diário (pg_dump)

```bash
# Backup completo (schema + dados)
pg_dump -h HOST -U postgres -d DATABASE \
  --format=custom \
  --file=backup_$(date +%Y%m%d).dump

# Backup apenas dados (sem schema)
pg_dump -h HOST -U postgres -d DATABASE \
  --data-only \
  --format=custom \
  --file=backup_data_$(date +%Y%m%d).dump

# Backup de tabela específica
pg_dump -h HOST -U postgres -d DATABASE \
  --table=audits \
  --format=custom \
  --file=backup_audits_$(date +%Y%m%d).dump
```

#### Restore

```bash
# Restore completo
pg_restore -h HOST -U postgres -d DATABASE \
  --clean --if-exists \
  backup_20260216.dump

# Restore de tabela específica
pg_restore -h HOST -U postgres -d DATABASE \
  --table=audits \
  backup_audits_20260216.dump
```

#### Point-in-Time Recovery (PITR)

Configurar WAL archiving no Supabase Pro:
- Retention: 7 dias (mínimo)
- Automatic snapshots: Diário

### 6. Monitoramento

#### Métricas Críticas

```sql
-- Slow queries (> 100ms)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Table bloat (tabelas inchadas)
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_live_tup,
  n_dead_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Index usage (indexes não usados)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Cache hit ratio (deve ser > 95%)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  ROUND(sum(heap_blks_hit) * 100.0 / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) as cache_hit_ratio
FROM pg_statio_user_tables;
```

#### Alertas Recomendados

- **Slow query** > 500ms → Investigar
- **Dead tuples** > 20% → Executar VACUUM
- **Cache hit ratio** < 90% → Aumentar shared_buffers
- **Index não usado** → Remover se confirmar
- **Table bloat** > 50% → Executar VACUUM FULL

## CONFIGURAÇÕES RECOMENDADAS

### PostgreSQL (Supabase)

```sql
-- Shared buffers (25% da RAM)
shared_buffers = 2GB

-- Effective cache size (50-75% da RAM)
effective_cache_size = 6GB

-- Work mem (para sorts e aggregations)
work_mem = 64MB

-- Maintenance work mem (para VACUUM, CREATE INDEX)
maintenance_work_mem = 512MB

-- Random page cost (para SSD)
random_page_cost = 1.1

-- Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
```

### Connection Pooling (Supabase Pooler)

```
Mode: Transaction (recomendado)
Pool size: 15-25 (para API)
Max client conn: 100
```

## CHECKLIST DE PERFORMANCE

### Antes de ir para produção

- [ ] Todas as migrations aplicadas (001, 002, 003)
- [ ] Indexes criados e verificados
- [ ] Materialized views criadas
- [ ] Refresh automático configurado (cron)
- [ ] Backup diário configurado
- [ ] Política de retenção definida
- [ ] Monitoramento configurado (pg_stat_statements)
- [ ] Connection pooling configurado
- [ ] RLS policies ajustadas (se usar auth)
- [ ] Testes de carga realizados

### Manutenção Regular

- [ ] Refresh de materialized views (a cada 1h)
- [ ] VACUUM ANALYZE (semanal)
- [ ] Revisar slow queries (semanal)
- [ ] Verificar table bloat (mensal)
- [ ] Revisar indexes não usados (mensal)
- [ ] Limpeza de dados antigos (mensal)
- [ ] Teste de restore de backup (mensal)

## TROUBLESHOOTING

### Problema: Queries lentas

**Diagnóstico:**
```sql
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 seconds';
```

**Solução:**
1. Adicionar index faltando
2. Reescrever query (usar LATERAL JOIN)
3. Criar materialized view

### Problema: Table bloat

**Diagnóstico:**
```sql
SELECT pg_size_pretty(pg_total_relation_size('audits'));
```

**Solução:**
```sql
VACUUM FULL audits;
REINDEX TABLE CONCURRENTLY audits;
```

### Problema: Out of memory

**Diagnóstico:**
```sql
SELECT * FROM pg_stat_activity WHERE wait_event_type = 'LWLock';
```

**Solução:**
1. Aumentar work_mem
2. Limitar LIMIT nas queries
3. Usar paginação

## CONCLUSÃO

Com o schema otimizado e seguindo as recomendações deste guia:

- **Performance**: < 20ms para 95% das queries
- **Escalabilidade**: Suporta 1000+ perfis sem particionamento
- **Confiabilidade**: Backup diário + PITR
- **Manutenabilidade**: Migrations versionadas + monitoramento

O sistema está pronto para produção com **alta performance** e **escalabilidade**.
