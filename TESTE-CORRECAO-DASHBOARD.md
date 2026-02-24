# ✅ Teste da Correção - Dashboard de Perfis

## 🎯 O que foi corrigido

### Arquivos Atualizados:
1. ✅ `lib/supabase-saver.ts` - Agora salva em `instagram_profiles`
2. ✅ `app/api/profiles/route.ts` - Busca de `instagram_profiles`
3. ✅ `app/api/profiles/[id]/route.ts` - GET/PATCH em `instagram_profiles`

### SQL para executar no Supabase:
📄 `database/migration-create-instagram-profiles.sql`

---

## 📋 PASSO A PASSO DO TESTE

### 1️⃣ Executar SQL no Supabase (SE AINDA NÃO FEZ)

```
1. Abrir Supabase SQL Editor
2. Copiar conteúdo de: database/migration-create-instagram-profiles.sql
3. Colar e clicar RUN
4. Deve aparecer: ✅ Success. No rows returned
```

### 2️⃣ Verificar se a tabela foi criada

Execute no SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'instagram_profiles';
```

**Resultado esperado:** 1 linha com `instagram_profiles`

### 3️⃣ Reiniciar servidor Next.js

```bash
# Parar servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### 4️⃣ Testar API diretamente

```bash
# Deve retornar array vazio (sem erro)
curl -s http://localhost:3001/api/profiles | jq '.'

# Resposta esperada:
{
  "profiles": [],
  "total": 0
}
```

### 5️⃣ Acessar Dashboard

```
http://localhost:3001/dashboard
```

**Deve mostrar:**
> "Nenhum perfil encontrado. Crie sua primeira análise!"

✅ **Isso é CORRETO!** Significa que está funcionando.

### 6️⃣ Criar Nova Análise (TESTE COMPLETO)

```
1. Clicar em "Nova Análise"
2. Digite um username do Instagram (ex: @nike)
3. Configurar posts (10 posts, sem OCR para ser rápido)
4. Clicar "Iniciar Análise"
5. Aguardar processamento (1-2 minutos)
```

**O que deve acontecer:**
- ✅ Worker processa análise
- ✅ Cria perfil em `instagram_profiles` (não mais em `profiles`)
- ✅ Cria auditoria em `audits`
- ✅ Perfil aparece no dashboard `/dashboard`

### 7️⃣ Verificar perfil foi salvo corretamente

Execute no SQL Editor:

```sql
SELECT
  username,
  full_name,
  followers_count,
  created_at
FROM instagram_profiles
ORDER BY created_at DESC
LIMIT 1;
```

**Deve retornar:** O perfil que você acabou de analisar.

---

## ✅ Checklist de Sucesso

- [ ] SQL executado no Supabase sem erros
- [ ] Tabela `instagram_profiles` criada
- [ ] API `/api/profiles` retorna `{"profiles": [], "total": 0}` (sem erro)
- [ ] Dashboard mostra "Nenhum perfil encontrado..."
- [ ] Nova análise criada com sucesso
- [ ] Perfil aparece no dashboard
- [ ] Perfil salvo em `instagram_profiles` (verificar no SQL)

---

## 🐛 Problemas Comuns

### "Could not find a relationship between..."
**Causa:** SQL não foi executado ainda
**Solução:** Execute o SQL no Supabase

### "Column username does not exist"
**Causa:** Código ainda usando tabela `profiles` antiga
**Solução:** Verificar se arquivos foram salvos corretamente

### API retorna erro 500
**Causa:** Servidor não foi reiniciado
**Solução:** `Ctrl+C` e `npm run dev` novamente

---

## 📊 Verificação Final

Execute para ver perfis criados:

```sql
SELECT
  ip.username,
  ip.full_name,
  ip.followers_count,
  COUNT(a.id) as total_audits
FROM instagram_profiles ip
LEFT JOIN audits a ON a.profile_id = ip.id
GROUP BY ip.id, ip.username, ip.full_name, ip.followers_count
ORDER BY ip.created_at DESC;
```

**Deve listar:** Todos os perfis do Instagram auditados.

---

## 🎉 Sucesso!

Se todos os checks acima passaram, o sistema está 100% funcional!

Agora você pode:
- ✅ Criar análises de perfis do Instagram
- ✅ Ver perfis no dashboard
- ✅ Sistema de creators continua funcionando (tabela `profiles` intacta)
