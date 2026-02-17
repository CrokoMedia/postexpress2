# CHECKLIST DE IMPLEMENTAÇÃO

Use este checklist para garantir que todas as etapas foram seguidas corretamente.

## FASE 1: PRÉ-REQUISITOS

### Ambiente

- [ ] Supabase project criado
- [ ] Conexão com banco de dados testada
- [ ] Backup do banco atual (se existir)
- [ ] SQL Editor do Supabase acessível

### Arquivos

- [ ] `migrations/001_initial_schema.sql` disponível
- [ ] `migrations/002_add_indexes.sql` disponível
- [ ] `migrations/003_add_materialized_views.sql` disponível
- [ ] `migrations/seeds/001_example_profile.sql` disponível (opcional)

## FASE 2: APLICAR MIGRATIONS

### Migration 001: Initial Schema

- [ ] Abrir SQL Editor no Supabase
- [ ] Copiar conteúdo de `001_initial_schema.sql`
- [ ] Executar SQL
- [ ] Verificar mensagem de sucesso
- [ ] Confirmar que 6 tabelas foram criadas:
  - [ ] profiles
  - [ ] audits
  - [ ] posts
  - [ ] comments
  - [ ] comparisons
  - [ ] analysis_queue

**Verificação:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Deve retornar 6 tabelas
```

### Migration 002: Add Indexes

- [ ] Copiar conteúdo de `002_add_indexes.sql`
- [ ] Executar SQL
- [ ] Verificar mensagem de sucesso
- [ ] Confirmar que 30+ indexes foram criados

**Verificação:**
```sql
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'audits', 'posts', 'comments', 'comparisons', 'analysis_queue');
-- Deve retornar 42+ indexes
```

### Migration 003: Add Materialized Views

- [ ] Copiar conteúdo de `003_add_materialized_views.sql`
- [ ] Executar SQL
- [ ] Verificar mensagem de sucesso
- [ ] Confirmar que 7 views foram criadas:
  - [ ] latest_audits (view)
  - [ ] profile_evolution (view)
  - [ ] top_performers (view)
  - [ ] recent_activity (view)
  - [ ] mv_dashboard_stats (materialized)
  - [ ] mv_score_distribution (materialized)
  - [ ] mv_engagement_trends (materialized)

**Verificação:**
```sql
-- Views normais
SELECT table_name FROM information_schema.views WHERE table_schema = 'public';
-- Deve retornar 4 views

-- Materialized views
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
-- Deve retornar 3 MV
```

### Seed (Opcional)

- [ ] Copiar conteúdo de `seeds/001_example_profile.sql`
- [ ] Executar SQL
- [ ] Verificar mensagem de sucesso
- [ ] Confirmar que perfil rodrigogunter_ foi inserido

**Verificação:**
```sql
SELECT username, full_name, total_audits
FROM profiles
WHERE username = 'rodrigogunter_';
-- Deve retornar 1 registro
```

## FASE 3: TESTES DE PERFORMANCE

### Queries Básicas

- [ ] Dashboard stats (deve retornar em < 1ms)
```sql
SELECT * FROM mv_dashboard_stats;
```

- [ ] Últimas auditorias (deve retornar em < 15ms)
```sql
SELECT * FROM latest_audits LIMIT 20;
```

- [ ] Top performers (deve retornar em < 15ms)
```sql
SELECT * FROM top_performers LIMIT 10;
```

- [ ] Recent activity (deve retornar em < 12ms)
```sql
SELECT * FROM recent_activity LIMIT 50;
```

### EXPLAIN ANALYZE

- [ ] Executar EXPLAIN ANALYZE em query de dashboard
```sql
EXPLAIN ANALYZE
SELECT * FROM latest_audits LIMIT 20;
-- Verificar: Execution Time < 20ms
```

- [ ] Executar EXPLAIN ANALYZE em query de stats
```sql
EXPLAIN ANALYZE
SELECT * FROM mv_dashboard_stats;
-- Verificar: Execution Time < 2ms
```

### Verificar Uso de Indexes

- [ ] Confirmar que indexes estão sendo usados
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan > 0
ORDER BY idx_scan DESC;
-- Deve mostrar indexes com idx_scan > 0 após executar queries
```

## FASE 4: CONFIGURAÇÕES AVANÇADAS

### Monitoramento

- [ ] Habilitar pg_stat_statements
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

- [ ] Verificar slow queries
```sql
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
-- Deve retornar vazio ou poucas queries
```

### Refresh Automático de Materialized Views

#### Opção 1: pg_cron (Supabase Pro)

- [ ] Habilitar pg_cron extension
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

- [ ] Configurar refresh a cada hora
```sql
SELECT cron.schedule(
  'refresh-dashboard-stats',
  '0 * * * *',
  'SELECT refresh_all_materialized_views()'
);
```

- [ ] Verificar schedule criado
```sql
SELECT * FROM cron.job;
```

#### Opção 2: Edge Function + Cron (Supabase Starter)

- [ ] Criar Edge Function com código:
```javascript
Deno.serve(async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { error } = await supabase.rpc('refresh_all_materialized_views');

  return new Response(
    JSON.stringify({ success: !error, error }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

- [ ] Configurar cron trigger (1 hora)
- [ ] Testar Edge Function

### Backup

- [ ] Configurar daily snapshots (Supabase Dashboard → Database → Backups)
- [ ] Verificar que backups estão funcionando
- [ ] (Opcional) Configurar backup manual via pg_dump

```bash
pg_dump -h HOST -U postgres -d DATABASE \
  --format=custom \
  --file=backup_$(date +%Y%m%d).dump
```

### Row Level Security (RLS)

- [ ] Revisar políticas RLS atuais (atualmente públicas)
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

- [ ] (Opcional) Implementar auth policies
```sql
-- Exemplo: Apenas autenticados podem ler
DROP POLICY "Public read access" ON profiles;

CREATE POLICY "Authenticated read access" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

## FASE 5: INTEGRAÇÃO COM BACKEND

### Node.js / TypeScript

- [ ] Instalar Supabase client
```bash
npm install @supabase/supabase-js
```

- [ ] Configurar client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

- [ ] Testar insert de profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    username: 'test_user',
    full_name: 'Test User',
    followers_count: 1000
  }, { onConflict: 'username' })
  .select()
  .single();
```

- [ ] Testar insert de audit (comparação será criada automaticamente!)
```typescript
const { data, error } = await supabase
  .from('audits')
  .insert({
    profile_id: profileId,
    score_overall: 75,
    classification: 'BOM',
    engagement_rate: 5.5,
    // ...
  })
  .select()
  .single();
```

- [ ] Verificar que comparação foi criada automaticamente
```typescript
const { data: comparisons } = await supabase
  .from('comparisons')
  .select('*')
  .eq('profile_id', profileId)
  .order('date_after', { ascending: false });
```

### Queries Otimizadas

- [ ] Implementar query de dashboard
```typescript
const { data: profiles } = await supabase
  .from('latest_audits')
  .select('*')
  .eq('audit_rank', 1)
  .order('audit_date', { ascending: false })
  .limit(20);
```

- [ ] Implementar query de stats
```typescript
const { data: stats } = await supabase
  .from('mv_dashboard_stats')
  .select('*')
  .single();
```

- [ ] Implementar filtros avançados
```typescript
const { data } = await supabase
  .rpc('get_filtered_profiles', {
    score_min: 70,
    score_max: 100,
    engagement_min: 5.0,
    verified_only: true
  });
```

## FASE 6: TESTES DE INTEGRAÇÃO

### Cenário 1: Nova Análise Completa

- [ ] Inserir profile (upsert)
- [ ] Inserir audit
- [ ] Inserir 10 posts (batch)
- [ ] Inserir 100 comments (batch)
- [ ] Verificar que comparação foi criada automaticamente (se 2+ audits)
- [ ] Verificar que total_audits foi incrementado em profile
- [ ] Verificar que search_vector foi populado em audit

### Cenário 2: Dashboard

- [ ] Buscar stats gerais (mv_dashboard_stats)
- [ ] Listar 20 perfis (latest_audits)
- [ ] Buscar top performers (top_performers)
- [ ] Buscar recent activity (recent_activity)
- [ ] Verificar que todas as queries retornam em < 20ms

### Cenário 3: Comparação Temporal

- [ ] Inserir 2 auditorias para o mesmo perfil
- [ ] Verificar que comparação foi criada automaticamente
- [ ] Buscar comparação
- [ ] Validar cálculos (growth_followers_pct, improvement_overall)

### Cenário 4: Filtros

- [ ] Filtrar perfis por score > 70
- [ ] Filtrar perfis por engajamento > 5%
- [ ] Filtrar perfis verificados
- [ ] Combinar múltiplos filtros
- [ ] Verificar performance (< 30ms)

### Cenário 5: Full-Text Search

- [ ] Buscar perfis por nome
- [ ] Buscar auditorias por texto
- [ ] Buscar comentários por palavra-chave
- [ ] Verificar relevância dos resultados

## FASE 7: MONITORAMENTO PÓS-DEPLOY

### Primeira Semana

- [ ] Monitorar slow queries diariamente
```sql
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

- [ ] Verificar table bloat
```sql
SELECT
  tablename,
  n_dead_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

- [ ] Verificar cache hit ratio
```sql
SELECT
  ROUND(sum(heap_blks_hit) * 100.0 / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) as cache_hit_ratio
FROM pg_statio_user_tables;
-- Deve ser > 95%
```

- [ ] Verificar uso de indexes
```sql
SELECT
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey';
-- Indexes com idx_scan = 0 podem ser removidos
```

### Primeira Mensalmente

- [ ] VACUUM ANALYZE em todas as tabelas
```sql
VACUUM ANALYZE profiles;
VACUUM ANALYZE audits;
VACUUM ANALYZE posts;
VACUUM ANALYZE comments;
```

- [ ] Revisar e limpar dados antigos (política de retenção)
```sql
-- Soft delete de perfis inativos
UPDATE profiles
SET deleted_at = NOW()
WHERE last_scraped_at < NOW() - INTERVAL '1 year';
```

- [ ] Testar restore de backup
```bash
pg_restore --list backup_latest.dump
```

## FASE 8: OTIMIZAÇÕES FUTURAS

### Quando Escalar (> 1000 perfis)

- [ ] Considerar particionamento de posts/comments
- [ ] Implementar Redis cache para dashboard stats
- [ ] Configurar read replica (Supabase Pro)
- [ ] Revisar e ajustar indexes baseado em uso real

### Quando Implementar Auth

- [ ] Atualizar RLS policies
- [ ] Criar roles (admin, user, service)
- [ ] Implementar multi-tenant (se aplicável)

## TROUBLESHOOTING

### Problema: Migration falhou

**Solução:**
1. Executar rollback correspondente
2. Verificar logs de erro
3. Corrigir problema
4. Executar migration novamente

### Problema: Query lenta

**Solução:**
1. Executar EXPLAIN ANALYZE
2. Verificar se index está sendo usado
3. Criar index composto se necessário
4. Considerar materialized view

### Problema: Table bloat

**Solução:**
```sql
VACUUM FULL audits;
REINDEX TABLE CONCURRENTLY audits;
```

### Problema: Refresh de MV não funciona

**Solução:**
1. Verificar se cron schedule existe
2. Testar refresh manual
3. Verificar logs de erro
4. Recriar schedule se necessário

## CONCLUSÃO

Ao completar este checklist:

- ✅ Schema otimizado aplicado
- ✅ 30+ indexes criados
- ✅ 7 views funcionando
- ✅ Performance < 20ms
- ✅ Backup configurado
- ✅ Monitoramento habilitado
- ✅ Integração com backend testada

**Status:** 🎉 SISTEMA PRONTO PARA PRODUÇÃO!

---

**Dúvidas?** Consulte:
- README.md (overview geral)
- ANALISE-SCHEMA.md (detalhes do schema)
- PERFORMANCE-GUIDE.md (otimizações)
- queries.sql (exemplos de queries)
