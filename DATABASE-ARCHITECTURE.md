# Arquitetura de Banco de Dados - Croko Labs

> Documentação técnica da estrutura de dados, relacionamentos e padrões descobertos durante o desenvolvimento.

---

## 📊 TABELAS PRINCIPAIS

### 1. **instagram_profiles** (Perfis Auditados)

Tabela central que armazena perfis do Instagram que foram auditados.

```sql
CREATE TABLE instagram_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  profile_pic_url TEXT,
  followers_count INTEGER,
  biography TEXT,
  external_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_business_account BOOLEAN DEFAULT false,
  category TEXT,
  posts_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Registros:** ~3 perfis atualmente
**Uso:** Base de dados de todos os perfis analisados

---

### 2. **profiles** (Perfis de Usuário do Sistema)

Tabela separada para usuários do sistema (quem usa a ferramenta).

```sql
CREATE TABLE profiles (
  profile_id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  ...outros campos de configuração do usuário...
);
```

**Registros:** ~1 perfil atualmente
**Uso:** Configurações e dados de quem usa a ferramenta (não dos perfis auditados)

---

### 3. **auth.users** (Autenticação Supabase)

Tabela gerenciada pelo Supabase Auth para login.

```sql
-- Tabela gerenciada automaticamente pelo Supabase
-- Não modificar diretamente
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  ...
)
```

**Registros:** Variável (usuários autenticados)
**Uso:** Sistema de autenticação

---

### 4. **audits** (Resultados de Auditorias)

Armazena os resultados completos das auditorias realizadas.

```sql
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES instagram_profiles(id) ON DELETE CASCADE,
  score_overall INTEGER,
  score_behavior INTEGER,
  score_copy INTEGER,
  score_offers INTEGER,
  score_metrics INTEGER,
  score_anomalies INTEGER,
  classification TEXT,
  analysis_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**FK:** `profile_id → instagram_profiles.id` ✅
**Uso:** Resultado dos 5 auditores analisando um perfil

---

### 5. **content_suggestions** (Conteúdos Gerados)

Armazena carrosséis e conteúdos gerados pelo Content Squad.

```sql
CREATE TABLE content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES instagram_profiles(id) ON DELETE CASCADE,
  content_json JSONB NOT NULL,
  slides_json JSONB,
  slides_v2_json JSONB,
  reel_videos_json JSONB,
  reels_json JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**FKs:**
- `audit_id → audits.id` ✅
- `profile_id → instagram_profiles.id` ✅

**Uso:** Armazena carrosséis aprovados e seus slides visuais

---

## 🔗 RELACIONAMENTOS

```
┌─────────────────────┐
│   auth.users        │  (Supabase Auth - login)
│   - id (PK)         │
└──────────┬──────────┘
           │
           │ user_id (FK)
           ↓
┌─────────────────────┐
│   profiles          │  (Usuários do Sistema)
│   - profile_id (PK) │
│   - user_id (FK)    │
└─────────────────────┘

┌─────────────────────┐
│instagram_profiles   │  (Perfis Auditados)
│   - id (PK)         │
│   - username        │
└──────────┬──────────┘
           │
           ├── profile_id (FK)
           │   ┌─────────────────────┐
           │   │   audits            │
           └──→│   - id (PK)         │
               │   - profile_id (FK) │
               └──────────┬──────────┘
                          │
                          ├── audit_id (FK)
                          │   ┌─────────────────────────┐
                          │   │content_suggestions      │
                          └──→│   - id (PK)             │
                              │   - audit_id (FK)       │
                              │   - profile_id (FK)     │
                              └─────────────────────────┘
```

---

## ⚠️ PROBLEMA: PostgREST Schema Cache

### Sintoma

Erro no frontend ao fazer query com JOIN:

```javascript
.from('content_suggestions')
.select(`
  ...,
  instagram_profiles!left(username, full_name),
  ...
`)
```

**Erro retornado:**
```
Could not find a relationship between 'content_suggestions'
and 'profiles' in the schema cache
```

### Causa Raiz

1. **PostgREST mantém cache do schema** para performance
2. O cache não detectava automaticamente o FK `profile_id → instagram_profiles.id`
3. Comandos como `NOTIFY pgrst, 'reload schema'` não resolviam
4. O cache buscava relacionamento com tabela `profiles`, não `instagram_profiles`

### Tentativas de Fix (que NÃO funcionaram)

```sql
-- ❌ Tentativa 1: Recriar FK
ALTER TABLE content_suggestions
  DROP CONSTRAINT IF EXISTS content_suggestions_profile_id_fkey;

ALTER TABLE content_suggestions
  ADD CONSTRAINT content_suggestions_instagram_profile_fkey
  FOREIGN KEY (profile_id)
  REFERENCES instagram_profiles(id)
  ON DELETE CASCADE;

-- ❌ Tentativa 2: Forçar reload do schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- ❌ Tentativa 3: Reiniciar serviços Supabase
-- (Via dashboard do Supabase)
```

**Resultado:** FK criada com sucesso no banco, mas erro persistia no frontend.

---

## ✅ SOLUÇÃO: Database VIEW

### Implementação

Criamos uma VIEW que faz o JOIN diretamente no SQL, contornando o cache do PostgREST.

```sql
-- Criar VIEW que já retorna dados JOINados
CREATE VIEW content_suggestions_with_profile AS
SELECT
  cs.id,
  cs.audit_id,
  cs.profile_id,
  cs.content_json,
  cs.generated_at,
  cs.created_at,
  cs.updated_at,
  cs.slides_json,
  cs.reels_json,
  cs.slides_v2_json,
  cs.reel_videos_json,
  jsonb_build_object(
    'id', ip.id,
    'username', ip.username,
    'full_name', ip.full_name,
    'profile_pic_url', ip.profile_pic_url,
    'followers_count', ip.followers_count
  ) as instagram_profiles,
  jsonb_build_object(
    'id', a.id,
    'classification', a.classification,
    'score_overall', a.score_overall
  ) as audits
FROM content_suggestions cs
LEFT JOIN instagram_profiles ip ON cs.profile_id = ip.id
LEFT JOIN audits a ON cs.audit_id = a.id;

-- Dar permissões
GRANT SELECT ON content_suggestions_with_profile TO anon, authenticated, service_role;
```

### Código Frontend (Antes)

```typescript
// ❌ ANTES: Query com JOIN (não funcionava)
const { data, error } = await supabase
  .from('content_suggestions')
  .select(`
    *,
    instagram_profiles!left(username, full_name),
    audits!left(classification)
  `)
  .order('generated_at', { ascending: false })

// Processar dados manualmente
const processedData = data?.map(item => ({
  ...item,
  instagram_profiles: item.instagram_profiles || {},
  audits: item.audits || {}
}))
```

### Código Frontend (Depois)

```typescript
// ✅ DEPOIS: Query direto na VIEW (funciona!)
const { data, error } = await supabase
  .from('content_suggestions_with_profile')
  .select('*')
  .order('generated_at', { ascending: false })

// VIEW já retorna dados no formato correto
setContents(data || [])
```

### Vantagens da Solução

1. ✅ **Contorna o cache do PostgREST** - JOIN acontece no SQL
2. ✅ **Performance melhor** - Banco faz JOIN otimizado
3. ✅ **Código mais limpo** - Não precisa processar manualmente
4. ✅ **Type-safe** - TypeScript infere o tipo correto
5. ✅ **Consistente** - Sempre retorna mesmo formato

---

## 📝 PADRÃO PARA FUTURAS PÁGINAS

### Quando criar novas páginas que precisam de dados relacionados:

**❌ NÃO FAZER ASSIM (pode dar erro de cache):**

```typescript
.from('tabela_principal')
.select(`
  *,
  tabela_relacionada!left(campo1, campo2)
`)
```

**✅ FAZER ASSIM (usar VIEW):**

```sql
-- 1. Criar VIEW no Supabase
CREATE VIEW minha_view AS
SELECT
  t.*,
  jsonb_build_object(
    'campo1', r.campo1,
    'campo2', r.campo2
  ) as tabela_relacionada
FROM tabela_principal t
LEFT JOIN tabela_relacionada r ON t.fk_id = r.id;

GRANT SELECT ON minha_view TO anon, authenticated, service_role;
```

```typescript
// 2. Usar VIEW no código
.from('minha_view')
.select('*')
```

---

## 🔍 COMANDOS ÚTEIS DE DIAGNÓSTICO

### Verificar FKs de uma tabela

```sql
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'content_suggestions'
  AND tc.constraint_type = 'FOREIGN KEY';
```

### Verificar registros órfãos

```sql
-- Verificar se existem content_suggestions sem profile válido
SELECT
  cs.id,
  cs.profile_id,
  CASE
    WHEN ip.id IS NULL THEN '❌ ÓRFÃO'
    ELSE '✅ OK'
  END as status
FROM content_suggestions cs
LEFT JOIN instagram_profiles ip ON cs.profile_id = ip.id;
```

### Deletar órfãos antes de criar FK

```sql
DELETE FROM content_suggestions
WHERE profile_id NOT IN (
  SELECT id FROM instagram_profiles
);
```

---

## 📂 ARQUIVOS RELACIONADOS

| Arquivo | Descrição |
|---------|-----------|
| `database/optimized-schema.sql` | Schema completo do banco |
| `database/FIX-CONTENT-SUGGESTIONS-FK.sql` | Script de correção de FKs |
| `database/FIX-FK-SIMPLE.sql` | Script simplificado de verificação |
| `scripts/diagnose-supabase-schema.js` | Script Node.js de diagnóstico |
| `app/dashboard/bau/page.tsx` | Página que usa a VIEW |

---

## 🚨 LIÇÕES APRENDIDAS

### 1. PostgREST tem limitações de cache

O PostgREST (usado pelo Supabase) mantém cache agressivo do schema. Mesmo com FKs corretas, pode não detectar relacionamentos automaticamente.

### 2. VIEWs são mais confiáveis que JOINs via API

Para relacionamentos complexos ou problemáticos, VIEWs resolvem definitivamente porque o JOIN acontece no banco antes do PostgREST processar.

### 3. Sempre verificar registros órfãos antes de criar FKs

```bash
# Ordem correta:
1. Verificar órfãos (SELECT com LEFT JOIN)
2. Deletar órfãos (DELETE WHERE NOT IN)
3. Criar FK (ALTER TABLE ADD CONSTRAINT)
4. Verificar sucesso (SELECT constraint_name)
```

### 4. Nomenclatura de tabelas importa

Se uma FK aponta para `instagram_profiles`, o PostgREST pode buscar `profiles` no cache. Usar VIEWs evita essa confusão.

---

## 📊 STATUS ATUAL DO BANCO

| Tabela | Registros | Status |
|--------|-----------|--------|
| `instagram_profiles` | 3 | ✅ OK |
| `profiles` | 1 | ✅ OK |
| `audits` | ~15 | ✅ OK |
| `content_suggestions` | ~10 | ✅ OK (sem órfãos) |
| `content_suggestions_with_profile` (VIEW) | ~10 | ✅ Funcionando |

### Foreign Keys Ativas

```
content_suggestions.audit_id → audits.id ✅
content_suggestions.profile_id → instagram_profiles.id ✅
audits.profile_id → instagram_profiles.id ✅
profiles.user_id → auth.users.id ✅
```

---

## 🎯 PRÓXIMOS PASSOS (Futuro)

1. **Criar VIEWs similares** para outras páginas se necessário
2. **Monitorar performance** das VIEWs em produção
3. **Adicionar índices** se queries ficarem lentas
4. **Documentar novos padrões** conforme o sistema cresce

---

*Última atualização: 2026-02-26*
*Autor: Claude Code*
*Versão: 1.0*
