# Corrigir Dashboard - Perfis não aparecem

## ✅ Diagnóstico Completo

**Problema:** Dashboard não mostra perfis auditados

**Causa:**
1. ✅ Tabela `instagram_profiles` existe mas estava vazia
2. ✅ **7 perfis foram reconstruídos** com sucesso
3. ❌ Tabela `audits` ainda referencia tabela antiga `profiles` (que não existe)
4. ❌ Supabase não consegue fazer JOIN entre `audits` e `instagram_profiles`

**Erro da API:**
```json
{
  "error": "Could not find a relationship between 'instagram_profiles' and 'audits' in the schema cache"
}
```

---

## 🔧 Solução (3 minutos)

### Passo 1: Abrir SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/sql
2. Clique em **"New query"**

### Passo 2: Copiar e executar esta SQL

```sql
-- ============================================
-- Corrigir Foreign Key de audits
-- ============================================

-- Remover constraints antigas (se existirem)
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS fk_audits_profile;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;

-- Adicionar nova foreign key apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;
```

### Passo 3: Clicar em "Run" (ou Ctrl/Cmd + Enter)

Deve retornar: **Success. No rows returned**

---

## ✅ Verificar se funcionou

Após executar a SQL acima:

```bash
curl http://localhost:3001/api/profiles | jq '.profiles | length'
# Deve retornar: 7
```

Abra o dashboard: http://localhost:3001/dashboard

**Deve mostrar 7 perfis:**
- @ge.onepercent
- @karlapazos.ai
- @lailla.io (9.511 seguidores)
- @gabiasalves (6.748 seguidores)
- @crokomedia
- @karinameotti (3.187 seguidores)
- @rutillatayna (1.433 seguidores)

---

**Tempo total:** 3 minutos | **Risco:** Baixo
