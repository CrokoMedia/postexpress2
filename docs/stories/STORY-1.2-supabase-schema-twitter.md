# Story 1.2: Schema Supabase para Twitter Monitoring

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** 📋 To Do
**Priority:** P0 (Blocker)
**Estimate:** 2h
**Owner:** Data Engineer / Dev
**Sprint:** Sprint 1 - Semana 1

---

## 📋 Descrição

Criar schema de banco de dados no Supabase para armazenar tweets capturados, subscrições ativas, regras de filtragem e logs de monitoramento do Twitter Stream API.

---

## 🎯 Acceptance Criteria

- [ ] Tabelas criadas no Supabase via SQL Editor
- [ ] Índices otimizados para queries frequentes
- [ ] RLS (Row Level Security) configurado
- [ ] Relacionamentos (Foreign Keys) corretos
- [ ] Migration SQL documentado em `/database/migrations/`
- [ ] Tipos TypeScript gerados (`npx supabase gen types`)
- [ ] Seeds de teste criados (opcional)

---

## 🗄️ Schema Proposto

### 1. `twitter_experts` (Experts monitorados)

```sql
CREATE TABLE twitter_experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do Expert
  twitter_username TEXT NOT NULL UNIQUE,
  twitter_user_id TEXT,
  display_name TEXT,

  -- Monitoramento
  is_active BOOLEAN DEFAULT TRUE,
  themes TEXT[] DEFAULT '{}', -- Ex: ['marketing', 'sales', 'frameworks']

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- FK para auth.users (futuro)

  -- Constraints
  CONSTRAINT twitter_username_format CHECK (twitter_username ~ '^[A-Za-z0-9_]{1,15}$')
);

-- Índices
CREATE INDEX idx_twitter_experts_username ON twitter_experts(twitter_username);
CREATE INDEX idx_twitter_experts_active ON twitter_experts(is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
CREATE TRIGGER update_twitter_experts_updated_at
  BEFORE UPDATE ON twitter_experts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. `twitter_stream_rules` (Regras ativas no Twitter API)

```sql
CREATE TABLE twitter_stream_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Regra do Twitter
  twitter_rule_id TEXT UNIQUE, -- ID retornado pela API
  rule_value TEXT NOT NULL, -- Ex: "from:garyvee (marketing OR sales)"
  rule_tag TEXT NOT NULL, -- Ex: "garyvee-marketing"

  -- Associação
  expert_id UUID REFERENCES twitter_experts(id) ON DELETE CASCADE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ, -- Última vez que sincronizou com API

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_twitter_rules_expert ON twitter_stream_rules(expert_id);
CREATE INDEX idx_twitter_rules_active ON twitter_stream_rules(is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX idx_twitter_rules_tag ON twitter_stream_rules(rule_tag);
```

---

### 3. `twitter_content_updates` (Tweets capturados)

```sql
CREATE TABLE twitter_content_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do Tweet
  tweet_id TEXT NOT NULL UNIQUE,
  tweet_text TEXT NOT NULL,
  tweet_url TEXT NOT NULL,

  -- Autor
  expert_id UUID REFERENCES twitter_experts(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  author_display_name TEXT,

  -- Métricas (snapshot no momento da captura)
  likes_count INTEGER DEFAULT 0,
  retweets_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,

  -- Metadados
  published_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(), -- Quando o stream detectou

  -- Classificação (futuro - IA)
  themes TEXT[], -- Ex: ['marketing', 'frameworks']
  sentiment TEXT, -- 'positive' | 'neutral' | 'negative'

  -- Notificação
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,

  -- JSON completo (backup)
  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_twitter_updates_expert ON twitter_content_updates(expert_id);
CREATE INDEX idx_twitter_updates_detected ON twitter_content_updates(detected_at DESC);
CREATE INDEX idx_twitter_updates_published ON twitter_content_updates(published_at DESC);
CREATE INDEX idx_twitter_updates_notified ON twitter_content_updates(notified) WHERE notified = FALSE;
CREATE INDEX idx_twitter_updates_themes ON twitter_content_updates USING GIN(themes);

-- Full-text search (opcional)
CREATE INDEX idx_twitter_updates_text_search ON twitter_content_updates USING GIN(to_tsvector('portuguese', tweet_text));
```

---

### 4. `twitter_monitoring_log` (Log de atividades)

```sql
CREATE TABLE twitter_monitoring_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tipo de evento
  event_type TEXT NOT NULL, -- 'stream_connect' | 'stream_disconnect' | 'rule_added' | 'rule_removed' | 'tweet_detected' | 'error'

  -- Contexto
  expert_id UUID REFERENCES twitter_experts(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES twitter_stream_rules(id) ON DELETE SET NULL,
  tweet_id TEXT,

  -- Detalhes
  success BOOLEAN,
  error_message TEXT,
  metadata JSONB, -- Dados adicionais

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_twitter_log_event_type ON twitter_monitoring_log(event_type);
CREATE INDEX idx_twitter_log_created ON twitter_monitoring_log(created_at DESC);
CREATE INDEX idx_twitter_log_errors ON twitter_monitoring_log(success) WHERE success = FALSE;

-- Particionamento (opcional - para escala)
-- Particionar por mês se volume > 1M logs/mês
```

---

### 5. Função Helper: `update_updated_at_column()`

```sql
-- Já deve existir no schema atual, mas se não:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔧 Tarefas Técnicas

### 1. Criar Migration File
- [ ] Criar arquivo `/database/migrations/004_twitter_monitoring.sql`
- [ ] Copiar SQL acima
- [ ] Adicionar comments inline para documentação

### 2. Executar no Supabase
- [ ] Acessar SQL Editor: https://supabase.com/dashboard/project/{project}/sql
- [ ] Copiar conteúdo de `004_twitter_monitoring.sql`
- [ ] Executar (Run)
- [ ] Verificar sucesso (4 tabelas + índices criados)

### 3. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE twitter_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_stream_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_content_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_monitoring_log ENABLE ROW LEVEL SECURITY;

-- Políticas (temporárias - ajustar quando tiver auth)
-- LEITURA: Público (anon key)
CREATE POLICY "Public read twitter_experts" ON twitter_experts FOR SELECT USING (TRUE);
CREATE POLICY "Public read twitter_updates" ON twitter_content_updates FOR SELECT USING (TRUE);

-- ESCRITA: Só service_role
CREATE POLICY "Service role write twitter_experts" ON twitter_experts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write twitter_rules" ON twitter_stream_rules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write twitter_updates" ON twitter_content_updates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write twitter_log" ON twitter_monitoring_log FOR ALL USING (auth.role() = 'service_role');
```

### 4. Gerar Tipos TypeScript
```bash
npx supabase gen types typescript --project-id {project-id} > types/supabase-twitter.ts
```

### 5. Seeds de Teste (Opcional)
```sql
-- Inserir expert de teste
INSERT INTO twitter_experts (twitter_username, display_name, themes, is_active)
VALUES ('garyvee', 'Gary Vaynerchuk', ARRAY['marketing', 'social media', 'entrepreneurship'], TRUE);

-- Inserir regra de teste
INSERT INTO twitter_stream_rules (rule_value, rule_tag, expert_id)
VALUES (
  'from:garyvee (marketing OR content)',
  'garyvee-marketing',
  (SELECT id FROM twitter_experts WHERE twitter_username = 'garyvee')
);
```

---

## 📁 Arquivos Afetados

```
📁 postexpress2/
├── database/
│   └── migrations/
│       └── 004_twitter_monitoring.sql   # CRIADO (migration completa)
└── types/
    └── supabase-twitter.ts              # CRIADO (types gerados)
```

---

## 🧪 Como Testar

### Teste 1: Tabelas Criadas
```sql
-- Verificar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'twitter_%';

-- Deve retornar:
-- twitter_experts
-- twitter_stream_rules
-- twitter_content_updates
-- twitter_monitoring_log
```

### Teste 2: Inserção e Leitura
```sql
-- Inserir expert
INSERT INTO twitter_experts (twitter_username, display_name)
VALUES ('test_user', 'Test User');

-- Ler
SELECT * FROM twitter_experts WHERE twitter_username = 'test_user';

-- Deletar
DELETE FROM twitter_experts WHERE twitter_username = 'test_user';
```

### Teste 3: Foreign Keys
```sql
-- Tentar inserir regra com expert_id inválido (deve falhar)
INSERT INTO twitter_stream_rules (rule_value, rule_tag, expert_id)
VALUES ('test', 'test-tag', '00000000-0000-0000-0000-000000000000');

-- Deve retornar erro: violates foreign key constraint
```

### Teste 4: RLS
```bash
# Testar leitura com anon key (deve funcionar)
curl "https://{project}.supabase.co/rest/v1/twitter_experts?select=*" \
  -H "apikey: {anon-key}" \
  -H "Authorization: Bearer {anon-key}"

# Testar escrita com anon key (deve falhar)
curl -X POST "https://{project}.supabase.co/rest/v1/twitter_experts" \
  -H "apikey: {anon-key}" \
  -H "Content-Type: application/json" \
  -d '{"twitter_username": "test"}'

# Deve retornar 403 Forbidden
```

---

## 📊 Estimativa de Storage

### Cenário: 10 experts, 500 tweets/mês
```
twitter_experts:         10 rows × 500 bytes  = 5 KB
twitter_stream_rules:    20 rows × 300 bytes  = 6 KB
twitter_content_updates: 500 rows × 2 KB      = 1 MB/mês
twitter_monitoring_log:  2000 rows × 500 bytes = 1 MB/mês

TOTAL: ~2 MB/mês (desprezível - free tier Supabase = 500 MB)
```

---

## 🔐 Segurança

- ✅ RLS habilitado em todas as tabelas
- ✅ Leitura pública, escrita só com service_role
- ✅ Foreign keys previnem dados órfãos
- ✅ Constraints previnem dados inválidos (username format)
- ⚠️ **TODO:** Quando tiver auth, restringir leitura por tenant

---

## 📚 Referências

- Supabase SQL Editor: https://supabase.com/docs/guides/database/overview
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- Post Express Schema: `/database/optimized-schema.sql`

---

## ✅ Definition of Done

- [ ] Migration SQL criado e documentado
- [ ] Tabelas criadas no Supabase (4 tabelas)
- [ ] Índices criados (otimização de queries)
- [ ] RLS configurado
- [ ] Tipos TypeScript gerados
- [ ] Seeds de teste funcionando (opcional)
- [ ] Documentação inline no SQL
- [ ] Testes de integridade passando

---

**Próxima Story:** Story 1.3 - Biblioteca de Gerenciamento de Regras
