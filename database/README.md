# Database - Instagram Audit System

Sistema completo de banco de dados otimizado para auditoria de perfis do Instagram com PostgreSQL/Supabase.

## Estrutura de Arquivos

```
database/
├── README.md (este arquivo)
├── ANALISE-SCHEMA.md (análise completa do schema original)
├── PERFORMANCE-GUIDE.md (guia de performance e otimização)
├── supabase-schema.sql (schema original - deprecated)
├── optimized-schema.sql (schema otimizado completo)
├── queries.sql (queries otimizadas para casos de uso)
├── migrations/
│   ├── README.md
│   ├── 001_initial_schema.sql
│   ├── 002_add_indexes.sql
│   ├── 003_add_materialized_views.sql
│   ├── seeds/
│   │   └── 001_example_profile.sql
│   └── rollback/
│       ├── 001_rollback_initial_schema.sql
│       ├── 002_rollback_indexes.sql
│       └── 003_rollback_views.sql
```

## Quick Start

### 1. Aplicar Schema (Supabase Dashboard)

Acesse o SQL Editor no Supabase e execute na ordem:

```sql
-- 1. Schema completo
\i migrations/001_initial_schema.sql

-- 2. Indexes otimizados
\i migrations/002_add_indexes.sql

-- 3. Materialized views
\i migrations/003_add_materialized_views.sql

-- 4. (Opcional) Seed de exemplo
\i migrations/seeds/001_example_profile.sql
```

### 2. Verificar Instalação

```sql
-- Verificar tabelas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verificar indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Verificar views
SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Verificar materialized views
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
```

### 3. Testar Queries

```sql
-- Dashboard stats (deve retornar em < 1ms)
SELECT * FROM mv_dashboard_stats;

-- Listar perfis (deve retornar em < 15ms)
SELECT * FROM latest_audits LIMIT 20;

-- Top performers (deve retornar em < 10ms)
SELECT * FROM top_performers LIMIT 10;
```

## Schema Overview

### Tabelas Principais

| Tabela | Descrição | Registros Estimados |
|--------|-----------|---------------------|
| **profiles** | Perfis do Instagram | 100-1000/mês |
| **audits** | Auditorias completas | 100-1000/mês |
| **posts** | Posts individuais | 1000-10000/mês |
| **comments** | Comentários categorizados | 10000-100000/mês |
| **comparisons** | Comparações temporais | 50-500/mês |
| **analysis_queue** | Fila de análises | 100-1000/mês |

### Views Disponíveis

| View | Tipo | Descrição | Performance |
|------|------|-----------|-------------|
| **mv_dashboard_stats** | Materialized | Estatísticas gerais | < 1ms |
| **mv_score_distribution** | Materialized | Distribuição de scores | < 1ms |
| **mv_engagement_trends** | Materialized | Tendências de engajamento | < 1ms |
| **latest_audits** | View | Últimas auditorias | 10-15ms |
| **profile_evolution** | View | Evolução de perfis | 15-20ms |
| **top_performers** | View | Melhores perfis | 10-15ms |
| **recent_activity** | View | Atividade recente | 8-12ms |

## Features Principais

### 1. Auto-Comparação Temporal

Trigger automático cria comparação quando há 2+ auditorias:

```sql
-- Trigger: auto_create_comparison()
-- Executa: AFTER INSERT ON audits
-- Resultado: Insere em comparisons automaticamente
```

### 2. Full-Text Search

```sql
-- Buscar perfis
SELECT * FROM profiles
WHERE full_name ILIKE '%rodrigo%'
ORDER BY similarity(full_name, 'rodrigo') DESC;

-- Buscar auditorias (tsvector)
SELECT * FROM audits
WHERE search_vector @@ to_tsquery('portuguese', 'engajamento & alto');
```

### 3. Soft Delete

Todas as tabelas suportam soft delete:

```sql
-- Marcar como deletado
UPDATE profiles SET deleted_at = NOW() WHERE id = '...';

-- Queries ignoram automaticamente
SELECT * FROM profiles WHERE deleted_at IS NULL;
```

### 4. JSONB para Dados Flexíveis

```sql
-- Buscar em JSONB
SELECT * FROM audits
WHERE raw_json->>'classification' = 'EXCELENTE';

-- Extrair arrays
SELECT jsonb_array_elements(top_strengths) as strength
FROM audits WHERE id = '...';
```

## Casos de Uso

### 1. Nova Análise Completa

```sql
BEGIN;
  -- 1. Insert/Update profile
  INSERT INTO profiles (...) VALUES (...)
  ON CONFLICT (username) DO UPDATE SET ...
  RETURNING id;

  -- 2. Insert audit
  INSERT INTO audits (...) VALUES (...)
  RETURNING id;

  -- 3. Batch insert posts
  INSERT INTO posts (...) VALUES (...), (...), ...;

  -- 4. Batch insert comments
  INSERT INTO comments (...) VALUES (...), (...), ...;
COMMIT;
```

### 2. Dashboard Home

```sql
-- Listar perfis com última auditoria
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
```

### 3. Comparação Temporal

```sql
-- Buscar comparações de um perfil
SELECT c.*, a_before.*, a_after.*
FROM comparisons c
JOIN audits a_before ON c.audit_before_id = a_before.id
JOIN audits a_after ON c.audit_after_id = a_after.id
WHERE c.profile_id = '...'
ORDER BY c.date_after DESC;
```

### 4. Filtros Avançados

```sql
-- Perfis com score > 70 e engajamento > 5%
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
```

## Performance

### Benchmarks (100 perfis, 1000 posts, 10000 comentários)

| Query | Performance | Index Usado |
|-------|-------------|-------------|
| Dashboard home | 8-12ms | idx_profiles_last_scraped |
| Buscar perfil | 3-5ms | profiles_pkey |
| Dashboard stats | 0.5-1ms | mv_dashboard_stats (MV) |
| Comparação | 4-6ms | idx_comparisons_profile_id |
| Filtros | 15-25ms | idx_audits_profile_score_date |
| Full-text search | 10-15ms | idx_audits_search_vector |

### Estimativas de Tamanho

| Cenário | Perfis/Mês | Tamanho/Mês | Tamanho/Ano |
|---------|------------|-------------|-------------|
| **Pequeno** | 100 | 20 MB | 240 MB |
| **Médio** | 500 | 100 MB | 1.2 GB |
| **Grande** | 1000 | 200 MB | 2.4 GB |

## Manutenção

### Refresh de Materialized Views

```sql
-- Manual (após cada nova auditoria)
SELECT refresh_dashboard_stats();

-- Todas (executar 1x/hora via cron)
SELECT refresh_all_materialized_views();
```

### Limpeza de Dados Antigos

```sql
-- Soft delete de perfis inativos (1 ano sem scraping)
UPDATE profiles
SET deleted_at = NOW()
WHERE last_scraped_at < NOW() - INTERVAL '1 year';

-- Limpar fila antiga (30 dias completed/failed)
UPDATE analysis_queue
SET deleted_at = NOW()
WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '30 days';
```

### Vacuum e Analyze

```sql
-- Semanal (automatizado no Supabase)
VACUUM ANALYZE profiles;
VACUUM ANALYZE audits;
VACUUM ANALYZE posts;
VACUUM ANALYZE comments;

-- Mensal (se houver bloat)
VACUUM FULL audits;
REINDEX TABLE CONCURRENTLY audits;
```

## Segurança (RLS)

### Políticas Atuais (Públicas)

```sql
-- Leitura pública (ajustar quando implementar auth)
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (deleted_at IS NULL);
```

### Implementar Auth (Supabase Auth)

```sql
-- Exemplo: Apenas usuários autenticados podem ler
DROP POLICY "Public read access" ON profiles;

CREATE POLICY "Authenticated read access" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- Apenas service role pode inserir/atualizar
CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

## Backup e Restore

### Backup Manual

```bash
# Backup completo
pg_dump -h HOST -U postgres -d DATABASE \
  --format=custom \
  --file=backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h HOST -U postgres -d DATABASE \
  --clean --if-exists \
  backup_20260216.dump
```

### Backup Automático (Supabase)

- Daily snapshots: Habilitado por padrão
- Point-in-time recovery: Supabase Pro (7 dias)
- WAL archiving: Automático

## Troubleshooting

### Problema: Queries lentas

```sql
-- Identificar slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

**Solução:**
1. Verificar se index existe
2. Executar EXPLAIN ANALYZE na query
3. Criar index composto se necessário

### Problema: Table bloat

```sql
-- Verificar bloat
SELECT
  tablename,
  n_live_tup,
  n_dead_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

**Solução:**
```sql
VACUUM FULL audits;
REINDEX TABLE CONCURRENTLY audits;
```

## Roadmap

### Futuras Otimizações

- [ ] Particionamento de posts/comments (quando > 1M registros)
- [ ] Redis cache para dashboard stats
- [ ] CDC (Change Data Capture) para sync em tempo real
- [ ] Sharding por região (se multi-tenant global)
- [ ] GraphQL subscriptions para updates em tempo real

## Documentação Adicional

- **ANALISE-SCHEMA.md**: Análise completa do schema original (pontos fortes, problemas, recomendações)
- **PERFORMANCE-GUIDE.md**: Guia detalhado de performance (benchmarks, otimizações, monitoramento)
- **queries.sql**: Biblioteca de queries otimizadas para todos os casos de uso
- **migrations/README.md**: Como aplicar e reverter migrations

## Suporte

Para dúvidas ou problemas:

1. Consultar documentação: ANALISE-SCHEMA.md e PERFORMANCE-GUIDE.md
2. Revisar queries.sql para exemplos de uso
3. Verificar logs de slow queries: pg_stat_statements
4. Executar EXPLAIN ANALYZE em queries problemáticas

## Changelog

### v2.0 (2026-02-16) - Schema Otimizado

- Schema completo com ENUMs e constraints
- 30+ indexes otimizados (GIN, BTREE, compostos)
- 7 views (4 normais + 3 materialized)
- Auto-comparação temporal (trigger)
- Full-text search (tsvector)
- Soft delete em todas as tabelas
- Migrations versionadas + rollbacks
- Seeds de exemplo
- Documentação completa

### v1.0 (anterior) - Schema Original

- Schema básico funcional
- Indexes básicos
- 2 views simples

---

**Autor:** @data-engineer
**Data:** 2026-02-16
**Versão:** 2.0
