# ✅ Status: SQL de Vinculação de Conteúdos

## 📊 O Que Está Implementado

### ✅ Arquivos SQL Criados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `database/migrations/007_content_profile_links.sql` | ✅ Pronto | Migration completa (143 linhas) |
| `database/test-content-linking.sql` | ✅ Pronto | Script de teste e exemplos práticos |

### ✅ Componentes da Migration 007

1. **Tabela `content_profile_links`** ✅
   - Relacionamento many-to-many
   - Soft delete
   - Constraints de unicidade

2. **Índices** ✅
   - `idx_content_links_content` (busca por conteúdo)
   - `idx_content_links_profile` (busca por perfil)
   - `idx_content_links_deleted` (filtro soft delete)

3. **View `content_with_profiles`** ✅
   - Consolida conteúdos + perfis vinculados
   - JSON agregado
   - Contadores automáticos

4. **Functions SQL** ✅
   - `link_content_to_profile()` - Vincular/atualizar
   - `unlink_content_from_profile()` - Desvincular (soft)

5. **RLS Policies** ✅
   - Public read access (WHERE deleted_at IS NULL)

6. **População Inicial** ✅
   - Auto-cria vínculos 'original' para conteúdos existentes

## 🚀 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

```bash
# 1. Acesse
https://supabase.com/dashboard

# 2. Vá em SQL Editor

# 3. Cole o conteúdo de:
database/migrations/007_content_profile_links.sql

# 4. Execute (Run)
```

### Opção 2: Via Supabase CLI

```bash
# Se tiver Supabase CLI instalado
supabase migration new content_profile_links
# Cole conteúdo da migration
supabase db push
```

### Opção 3: Copiar e Colar Manual

```bash
# Abrir arquivo
cat database/migrations/007_content_profile_links.sql

# Copiar tudo (143 linhas)
# Colar no SQL Editor do Supabase
# Executar
```

## 🧪 Como Testar

### 1. Teste Básico (SQL)

```sql
-- Cole no SQL Editor:
-- database/test-content-linking.sql

-- Verifica se tudo está funcionando
```

### 2. Teste Avançado (Node.js)

```bash
npm run test:linking
```

### 3. Teste Visual (Dashboard)

```bash
# 1. Acesse
http://localhost:3000/dashboard/profiles/{id}/content

# 2. Clique em "Vincular"
# 3. Selecione outro perfil
# 4. Verifique badge "De @username"
```

## 📋 Queries Úteis

### Ver Todos os Vínculos

```sql
SELECT
  p.username,
  cpl.link_type,
  cpl.linked_at
FROM content_profile_links cpl
JOIN profiles p ON cpl.profile_id = p.id
WHERE cpl.deleted_at IS NULL
ORDER BY cpl.linked_at DESC;
```

### Ver Conteúdos Compartilhados

```sql
SELECT
  cs.id,
  COUNT(DISTINCT cpl.profile_id) as total_perfis
FROM content_suggestions cs
JOIN content_profile_links cpl ON cs.id = cpl.content_id
WHERE cpl.deleted_at IS NULL
GROUP BY cs.id
HAVING COUNT(DISTINCT cpl.profile_id) > 1;
```

### Estatísticas Por Perfil

```sql
SELECT
  p.username,
  COUNT(*) FILTER (WHERE cpl.link_type = 'original') as criados,
  COUNT(*) FILTER (WHERE cpl.link_type = 'shared') as recebidos
FROM profiles p
JOIN content_profile_links cpl ON p.id = cpl.profile_id
WHERE cpl.deleted_at IS NULL
GROUP BY p.username;
```

## 🎯 Exemplo Prático

### Vincular Conteúdo Entre 2 Perfis

```sql
-- 1. Ver IDs disponíveis
SELECT
  cs.id as content_id,
  p1.username as criador,
  p2.id as outro_perfil_id,
  p2.username as outro_perfil
FROM content_suggestions cs
JOIN profiles p1 ON cs.profile_id = p1.id
CROSS JOIN profiles p2
WHERE p2.id != cs.profile_id
LIMIT 1;

-- 2. Vincular (substitua os UUIDs)
SELECT link_content_to_profile(
  'uuid-do-conteudo',
  'uuid-do-outro-perfil',
  'shared'
);

-- 3. Verificar
SELECT * FROM content_profile_links
WHERE content_id = 'uuid-do-conteudo';
```

## 🔧 Troubleshooting SQL

### Erro: "relation does not exist"
**Causa:** Migration não foi aplicada
**Solução:** Execute a migration 007

### Erro: "duplicate key value"
**Causa:** Tentando vincular novamente o mesmo conteúdo+perfil
**Solução:** Normal, constraint impede duplicatas

### Erro: "function does not exist"
**Causa:** Functions SQL não foram criadas
**Solução:** Execute toda a migration 007 (não apenas parte)

## 📦 Dependências

### Migrations Anteriores Necessárias:

- ✅ Migration 006: `add_soft_delete_all_tables.sql` (deleted_at)
- ✅ Tabela `content_suggestions` deve existir
- ✅ Tabela `profiles` deve existir

## ✅ Checklist Final

Antes de usar em produção:

- [ ] Migration 006 aplicada (soft delete)
- [ ] Migration 007 aplicada (vinculação)
- [ ] Teste SQL executado (`test-content-linking.sql`)
- [ ] Teste Node executado (`npm run test:linking`)
- [ ] Teste visual no dashboard
- [ ] Vínculos aparecem corretamente
- [ ] Desvincular funciona
- [ ] Badges corretos ("Original" vs "De @username")

## 📊 Estatísticas Esperadas

Após aplicar a migration:

```sql
-- Deve retornar TRUE
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'content_profile_links'
);

-- Deve retornar número de conteúdos existentes
SELECT COUNT(*) FROM content_profile_links
WHERE link_type = 'original';

-- Deve retornar 0 (nenhum compartilhado ainda)
SELECT COUNT(*) FROM content_profile_links
WHERE link_type = 'shared';
```

---

**Status:** ✅ 100% Implementado
**Pronto para:** Aplicar no Supabase
**Tempo estimado:** 2 minutos para aplicar
**Arquivos:** 2 (migration + teste)
**Linhas de SQL:** 143 (migration) + 120 (teste)
