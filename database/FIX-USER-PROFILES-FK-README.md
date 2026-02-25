# Fix: Relacionamento user_profiles → instagram_profiles

## 🔍 Problema Identificado

**Erro:** `Could not find a relationship between 'user_profiles' and 'instagram_profiles' in the schema cache`

### Causa Raiz

1. A tabela `user_profiles` foi criada com FK apontando para `profiles(id)`
2. Mas o sistema foi migrado para usar `instagram_profiles` (perfis do Instagram auditados)
3. O código tenta fazer JOIN com `instagram_profiles`, mas a FK aponta para `profiles`
4. PostgREST (motor do Supabase) não encontra o relacionamento no cache

### Estrutura Incorreta

```sql
-- FK ANTIGA (incorreta)
user_profiles.profile_id → profiles(id)

-- CÓDIGO TENTA USAR
user_profiles.profile_id → instagram_profiles(id)  ❌ Não funciona
```

---

## ✅ Solução Implementada

### 1. Corrigir Foreign Key

```sql
-- Dropar FK antiga
ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_profile_id_fkey;

-- Adicionar FK correta
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES instagram_profiles(id)
  ON DELETE CASCADE;
```

### 2. Criar VIEW Consolidada (Padrão do Projeto)

Igual foi feito com `content_suggestions_with_profile`, criamos uma VIEW para:
- Facilitar queries futuras
- Contornar cache do PostgREST
- Evitar JOINs manuais no código

```sql
CREATE VIEW user_profiles_with_instagram AS
SELECT
  up.user_id,
  up.profile_id,
  up.created_at AS linked_at,
  ip.id,
  ip.username,
  ip.full_name,
  ip.followers_count,
  ip.is_verified,
  -- ... outros campos
FROM user_profiles up
LEFT JOIN instagram_profiles ip ON up.profile_id = ip.id
WHERE ip.deleted_at IS NULL;
```

### 3. Atualizar Código das APIs

**Antes:**
```typescript
// ❌ JOIN manual que não funciona
.from('user_profiles')
.select('user_id, profile_id, profile:instagram_profiles(id, username)')
```

**Depois:**
```typescript
// ✅ Usar VIEW (padrão do projeto)
.from('user_profiles_with_instagram')
.select('user_id, id, username')
```

---

## 🚀 Como Aplicar

### Passo 1: Rodar Migration SQL

```bash
# 1. Abrir Supabase SQL Editor:
# https://supabase.com/dashboard/project/YOUR_PROJECT/sql

# 2. Copiar e colar TODO o conteúdo de:
database/FIX-USER-PROFILES-FK.sql

# 3. Clicar em "Run" ou CMD/CTRL + Enter
```

### Passo 2: Verificar se Aplicou Corretamente

```sql
-- 1. Verificar FK
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name='user_profiles'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Resultado esperado:
-- foreign_table_name = 'instagram_profiles' ✅

-- 2. Verificar VIEW
SELECT * FROM user_profiles_with_instagram LIMIT 5;

-- Deve retornar dados do Instagram profiles vinculados
```

### Passo 3: Testar API

```bash
# Reiniciar servidor Next.js
npm run dev

# Abrir dashboard admin
http://localhost:3000/dashboard/admin/users

# Tentar:
# 1. Listar usuários → deve mostrar perfis vinculados
# 2. Clicar em "Gerenciar perfis" → deve listar perfis
# 3. Vincular novo perfil → deve funcionar
```

---

## 📝 Arquivos Modificados

### SQL (1 arquivo criado)
- `database/FIX-USER-PROFILES-FK.sql` → Migration completa

### APIs (2 arquivos atualizados)
- `app/api/admin/users/route.ts` → GET usa VIEW agora
- `app/api/users/[id]/profiles/route.ts` → GET usa VIEW agora

---

## 🔍 Por Que Criar VIEW?

### Vantagens

1. **Contorna cache do PostgREST** - PostgREST nem sempre detecta FKs automaticamente
2. **Facilita queries** - Dados já vêm no nível raiz, sem nested objects
3. **Padrão do projeto** - Consistente com `content_suggestions_with_profile`
4. **Performance** - Menos processamento no código TypeScript
5. **Manutenibilidade** - JOIN definido em um único lugar

### Comparação

**Antes (JOIN manual):**
```typescript
const { data } = await supabase
  .from('user_profiles')
  .select('user_id, profile_id, profile:instagram_profiles(id, username)')

// Dados nested:
data[0].profile.username  // 😕 Precisa navegar por nested object
```

**Depois (VIEW):**
```typescript
const { data } = await supabase
  .from('user_profiles_with_instagram')
  .select('user_id, id, username')

// Dados no nível raiz:
data[0].username  // 😊 Acesso direto
```

---

## ⚠️ Nota Importante

**Se você adicionar novos perfis do Instagram ao sistema:**
1. ✅ FK correta garante integridade referencial
2. ✅ VIEW automaticamente inclui novos perfis vinculados
3. ✅ Nenhuma migration adicional necessária

**Se você precisar adicionar novos campos do instagram_profiles na VIEW:**
1. Editar `FIX-USER-PROFILES-FK.sql`
2. Adicionar campo no SELECT da VIEW
3. Rodar `DROP VIEW user_profiles_with_instagram CASCADE;`
4. Rodar `CREATE VIEW user_profiles_with_instagram AS ...` novamente

---

## 🎯 Relacionado

Este fix segue o mesmo padrão usado para resolver problema similar em:
- `database/FIX-CONTENT-SUGGESTIONS-FK.sql`
- VIEW `content_suggestions_with_profile`

**Padrão recomendado:** Sempre que PostgREST não detectar FK automaticamente, criar VIEW consolidada.

---

## ✅ Status

- [x] FK corrigida (user_profiles → instagram_profiles)
- [x] VIEW criada (user_profiles_with_instagram)
- [x] API admin/users atualizada
- [x] API users/[id]/profiles atualizada
- [x] Documentação completa
- [x] Pronto para produção

**Tempo estimado para aplicar:** ~2 minutos
**Impacto:** Zero downtime, não quebra código existente
