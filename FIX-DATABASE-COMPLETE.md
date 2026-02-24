# 🆘 CORREÇÃO COMPLETA DO BANCO DE DADOS

## 🔴 PROBLEMA IDENTIFICADO

A tabela `audits` **NÃO tem a coluna `id`**!

Isso significa que o schema do banco de dados está incompleto ou foi criado incorretamente.

## ✅ SOLUÇÃO (5 minutos)

### Passo 1: Verificar o estado atual

Acesse o SQL Editor do Supabase e execute:

```sql
-- Ver estrutura da tabela audits
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'audits'
ORDER BY ordinal_position;
```

**Resultado esperado:**
- Se `id` NÃO aparecer na lista → **PROBLEMA CONFIRMADO**
- Se `id` aparecer → Outro problema (pule para Passo 4)

---

### Passo 2: DELETAR tabela audits atual (se necessário)

⚠️ **ATENÇÃO:** Isso vai apagar todos os dados de auditorias existentes!

Se você tem auditorias importantes, faça backup primeiro:

```sql
-- Backup (opcional)
CREATE TABLE audits_backup AS SELECT * FROM audits;
```

Agora delete a tabela:

```sql
-- Remover tabela audits (incompleta)
DROP TABLE IF EXISTS audits CASCADE;
```

---

### Passo 3: Recriar tabela audits CORRETAMENTE

Execute este SQL completo:

```sql
-- ============================================
-- TABELA AUDITS - Versão Corrigida
-- ============================================

CREATE TABLE audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES instagram_profiles(id) ON DELETE CASCADE,

  -- Data da auditoria
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audit_type VARCHAR(20) DEFAULT 'express',
  posts_analyzed INTEGER CHECK (posts_analyzed >= 0),

  -- Performance da auditoria
  audit_duration_seconds INTEGER,
  gemini_cost_usd NUMERIC(10,4),
  total_api_calls INTEGER,
  total_tokens_used INTEGER,

  -- Scores gerais
  score_overall INTEGER CHECK (score_overall BETWEEN 0 AND 100),
  classification VARCHAR(50),

  -- Scores por dimensão (5 auditores)
  score_behavior INTEGER CHECK (score_behavior BETWEEN 0 AND 100),
  score_copy INTEGER CHECK (score_copy BETWEEN 0 AND 100),
  score_offers INTEGER CHECK (score_offers BETWEEN 0 AND 100),
  score_metrics INTEGER CHECK (score_metrics BETWEEN 0 AND 100),
  score_anomalies INTEGER CHECK (score_anomalies BETWEEN 0 AND 100),

  -- Métricas de engajamento
  engagement_rate NUMERIC(6,3) CHECK (engagement_rate >= 0),
  total_likes INTEGER CHECK (total_likes >= 0),
  total_comments INTEGER CHECK (total_comments >= 0),
  avg_likes_per_post INTEGER CHECK (avg_likes_per_post >= 0),
  avg_comments_per_post INTEGER CHECK (avg_comments_per_post >= 0),

  -- Métricas do perfil (snapshot)
  snapshot_followers INTEGER,
  snapshot_following INTEGER,
  snapshot_posts_count INTEGER,

  -- Dados completos (JSONB)
  raw_json JSONB,
  top_strengths JSONB,
  critical_problems JSONB,
  quick_wins JSONB,
  strategic_moves JSONB,
  hypotheses JSONB,

  -- Análise de texto
  audit_summary TEXT,
  search_vector tsvector,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audits_profile_id ON audits(profile_id, audit_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_audits_date ON audits(audit_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_audits_score ON audits(score_overall DESC NULLS LAST);
CREATE INDEX idx_audits_classification ON audits(classification);

-- JSONB indexes
CREATE INDEX idx_audits_raw_json_gin ON audits USING GIN (raw_json);
CREATE INDEX idx_audits_strengths_gin ON audits USING GIN (top_strengths);
CREATE INDEX idx_audits_problems_gin ON audits USING GIN (critical_problems);

-- Comentários
COMMENT ON TABLE audits IS 'Auditorias completas com scores dos 5 auditores';
COMMENT ON COLUMN audits.raw_json IS 'JSON completo da auditoria (backup)';
```

---

### Passo 4: Verificar sucesso

Execute novamente:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audits'
ORDER BY ordinal_position;
```

**Agora deve mostrar `id` como primeira coluna!** ✅

---

### Passo 5: Testar no sistema

Execute o script de teste:

```bash
node scripts/fix-audits-fk-automated.js
```

Deve mostrar:
```
✅ TUDO FUNCIONANDO CORRETAMENTE!
```

---

## 🔍 VERIFICAÇÃO ADICIONAL

Se ainda houver problemas, execute:

```sql
-- Ver todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Tabelas necessárias:**
- ✅ `instagram_profiles`
- ✅ `audits`
- ✅ `posts` (opcional)
- ✅ `comments` (opcional)
- ✅ `comparisons` (opcional)
- ✅ `analysis_queue` (opcional)
- ❌ `profiles` (NÃO deve existir - foi migrada para instagram_profiles)

---

## 📋 Checklist Final

- [ ] Executei query de verificação (Passo 1)
- [ ] Coluna `id` não existia na tabela `audits`
- [ ] Deletei tabela `audits` antiga (Passo 2)
- [ ] Recriei tabela `audits` com SQL corrigido (Passo 3)
- [ ] Verifiquei que coluna `id` agora existe (Passo 4)
- [ ] Testei com script `fix-audits-fk-automated.js` (Passo 5)
- [ ] Teste passou com sucesso ✅
- [ ] Criei uma auditoria no dashboard
- [ ] Auditoria foi criada SEM ERRO ✅

---

## 🚨 SE AINDA NÃO FUNCIONAR

1. Verifique se a tabela `instagram_profiles` existe
2. Verifique se há dados em `instagram_profiles`:
   ```sql
   SELECT COUNT(*) FROM instagram_profiles;
   ```
3. Se não houver dados, crie um perfil de teste:
   ```sql
   INSERT INTO instagram_profiles (username, full_name, followers_count)
   VALUES ('crokolabs', 'Croko Labs', 1000);
   ```

---

**Tempo total:** ~5 minutos
**Risco:** Médio (perde auditorias antigas, mas são regeneráveis)
**Benefício:** Sistema volta a funcionar 100%
