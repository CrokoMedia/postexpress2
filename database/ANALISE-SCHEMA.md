# ANÁLISE DO SCHEMA ATUAL - Instagram Audit System

## REVISÃO CRÍTICA

### PONTOS FORTES

1. **Estrutura Relacional Bem Definida**
   - Cascade deletes configurados corretamente
   - Foreign keys apropriadas
   - Separação clara de responsabilidades

2. **Triggers e Functions**
   - `updated_at` automatizado
   - Consistência temporal garantida

3. **Views Úteis**
   - `latest_audits` para dashboard
   - `profile_evolution` para comparações temporais

4. **Uso de JSONB**
   - Flexibilidade para dados complexos
   - Permite queries com GIN indexes

5. **RLS (Row Level Security)**
   - Preparado para multi-tenant
   - Políticas públicas configuráveis

### PROBLEMAS IDENTIFICADOS

#### 1. INDEXES FALTANDO (CRÍTICO)

```sql
-- Posts: falta index para buscar por post_id do Instagram
-- Comentários: falta index composto para queries comuns
-- Audits: falta index para comparações temporais
-- JSONB: sem GIN indexes para queries JSON
```

#### 2. CONSTRAINTS FRACAS

```sql
-- Falta validação de username (formato Instagram)
-- Falta check constraint para engagement_rate
-- Falta validação de URLs
-- Falta unicidade em post_id (Instagram ID)
```

#### 3. TIPOS DE DADOS INCORRETOS

```sql
-- profiles.url deveria ser VARCHAR(255) não TEXT
-- engagement_rate deveria ser NUMERIC(6,3) para 999.999%
-- post_type deveria ser ENUM não VARCHAR
-- audit_type deveria ser ENUM
```

#### 4. CAMPOS FALTANDO

```sql
profiles:
  - external_url (website do perfil)
  - contact_phone_number
  - category_enum
  - is_private

audits:
  - audit_duration (tempo de processamento)
  - gemini_cost (custo de OCR)
  - total_tokens_used

posts:
  - is_pinned
  - location_name
  - accessibility_caption
  - video_url (para posts de vídeo)
  - video_view_count

comments:
  - owner_profile_pic_url
  - owner_is_verified
  - replied_to_comment_id (threads de comentários)
```

#### 5. PARTICIONAMENTO NECESSÁRIO

Para escalabilidade com 100k+ posts:
- Posts deveria ter particionamento por data
- Comments deveria herdar particionamento de posts
- Audits poderia ter particionamento por trimestre

#### 6. VIEWS FALTANDO

```sql
-- Dashboard stats (agregações)
-- Top performers (melhores perfis)
-- Recent activity (atividade recente)
-- Engagement trends (tendências)
```

#### 7. PERFORMANCE ISSUES

```sql
-- profile_evolution usa LATERAL JOIN que pode ser lento
-- Sem MATERIALIZED VIEWS para dashboard
-- Sem estratégia de VACUUM/ANALYZE
-- Sem pg_stat_statements habilitado
```

### ESTIMATIVAS DE VOLUME

**Cenário: 100 perfis auditados mensalmente**

| Tabela | Registros/mês | Tamanho/registro | Total/mês | Total/ano |
|--------|---------------|------------------|-----------|-----------|
| profiles | 100 | 2 KB | 200 KB | 2.4 MB |
| audits | 100 | 50 KB (JSONB) | 5 MB | 60 MB |
| posts | 1,000 | 10 KB | 10 MB | 120 MB |
| comments | 10,000 | 500 bytes | 5 MB | 60 MB |
| **TOTAL** | - | - | **20 MB** | **242 MB** |

**Conclusão:** Volume baixo, mas queries precisam de otimização.

### QUERIES MAIS CRÍTICAS (EXPLAIN ANALYZE)

1. **Dashboard Home** (listagem de perfis com última auditoria)
   - Problema: Subquery para última auditoria
   - Solução: Materialized view ou denormalização

2. **Comparação Temporal** (audit_before vs audit_after)
   - Problema: 2 JOINs + cálculos
   - Solução: Trigger para preencher tabela comparisons automaticamente

3. **Busca Full-Text em Comentários**
   - Problema: Sem tsvector
   - Solução: Adicionar coluna search_vector com GIN index

4. **Filtros Combinados** (score + engajamento + data)
   - Problema: Indexes separados não são combinados eficientemente
   - Solução: Index composto ou BRIN para campos de range

## RECOMENDAÇÕES DE OTIMIZAÇÃO

### 1. INDEXES PRIORITÁRIOS

```sql
-- JSONB (GIN indexes)
CREATE INDEX idx_audits_raw_json_gin ON audits USING GIN (raw_json);
CREATE INDEX idx_posts_ocr_data_gin ON posts USING GIN (ocr_data);

-- Compostos para queries comuns
CREATE INDEX idx_audits_profile_score ON audits(profile_id, score_overall DESC, audit_date DESC);
CREATE INDEX idx_posts_audit_likes ON posts(audit_id, likes_count DESC);
CREATE INDEX idx_comments_post_category ON comments(post_id, category) WHERE is_relevant = TRUE;

-- Unicidade
CREATE UNIQUE INDEX idx_posts_instagram_id ON posts(post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_comments_instagram_id ON comments(comment_id) WHERE comment_id IS NOT NULL;
```

### 2. MATERIALIZED VIEWS

```sql
-- Dashboard de estatísticas
CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT a.id) as total_audits,
  AVG(a.score_overall) as avg_score,
  AVG(a.engagement_rate) as avg_engagement
FROM profiles p
LEFT JOIN audits a ON a.profile_id = p.id
WHERE a.audit_date >= NOW() - INTERVAL '30 days';

-- Refresh automático via cron ou trigger
```

### 3. PARTICIONAMENTO

```sql
-- Posts por trimestre
CREATE TABLE posts_2025_q1 PARTITION OF posts
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

-- Comments herda particionamento
-- (via foreign key para posts)
```

### 4. LIMPEZA DE DADOS ANTIGOS

```sql
-- Soft delete: adicionar deleted_at em todas as tabelas
-- Hard delete: política de retenção (365 dias)
-- Archive: mover auditorias antigas para tabela de arquivo
```

### 5. BACKUP/RESTORE

```sql
-- Backup diário (pg_dump)
-- Point-in-time recovery (WAL archiving)
-- Replicação para read replica (Supabase Pro)
```

### 6. MONITORING

```sql
-- Habilitar pg_stat_statements
-- Monitorar slow queries (> 100ms)
-- Alertas para table bloat
-- Alertas para index usage
```

## PRÓXIMOS PASSOS

1. Criar migration versionada com todas as correções
2. Implementar indexes prioritários
3. Criar materialized views para dashboard
4. Adicionar campos faltantes
5. Implementar ENUMs para post_type e audit_type
6. Criar queries otimizadas com EXPLAIN ANALYZE
7. Configurar monitoring e alertas
8. Documentar API de acesso ao banco

## CONCLUSÃO

O schema atual é **sólido** mas precisa de:
- **Otimizações de performance** (indexes, materialized views)
- **Validações mais fortes** (constraints, ENUMs)
- **Campos adicionais** (metadados, custos, timings)
- **Estratégia de particionamento** (escalabilidade futura)

Com essas melhorias, o sistema estará pronto para **1000+ perfis** com **alta performance**.
