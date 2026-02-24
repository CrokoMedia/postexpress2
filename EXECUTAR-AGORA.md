# 🚨 EXECUTAR AGORA - Corrigir Foreign Key

## ⚡ PASSO A PASSO

### 1️⃣ Abra o Supabase SQL Editor

### 2️⃣ Execute este SQL:

```sql
-- Remover constraint antiga (tenta todos os nomes possíveis)
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS fk_audits_profile;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;

-- Adicionar nova constraint apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;
```

### 3️⃣ Deve aparecer:

✅ **Success. No rows returned**

### 4️⃣ Teste a API:

```bash
curl -s http://localhost:3001/api/profiles | jq '.'
```

**Deve retornar:**
```json
{
  "profiles": [],
  "total": 0
}
```

### 5️⃣ Acesse o dashboard:

```
http://localhost:3001/dashboard
```

**Deve mostrar:**
> "Nenhum perfil encontrado. Crie sua primeira análise!"

---

## ✅ Pronto!

Agora você pode criar uma nova análise e o perfil aparecerá no dashboard! 🎉

**Arquivo SQL completo:**
`database/migration-fix-audits-foreign-key.sql`
