# 🗄️ Setup Supabase - Passo a Passo

Guia para aplicar o schema SQL no Supabase.

---

## 📋 Pré-requisitos

- Conta no Supabase
- Projeto criado no Supabase
- Acesso ao SQL Editor

---

## 🚀 Aplicar Schema (3 passos)

### Passo 1: Acessar SQL Editor

1. Acesse: https://app.supabase.com
2. Selecione seu projeto: **kxhtoxxprobdjzzxtywb**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Copiar SQL

O arquivo está em: **`database/optimized-schema.sql`** (25KB)

Você pode:

**Opção A: Copiar do terminal**
```bash
cat database/optimized-schema.sql | pbcopy
# O SQL está na área de transferência
```

**Opção B: Abrir no editor**
```bash
code database/optimized-schema.sql
# Ou outro editor de sua preferência
```

**Opção C: Usar o arquivo diretamente**
- Caminho completo: `/Users/macbook-karla/postexpress2/database/optimized-schema.sql`

### Passo 3: Executar no Supabase

1. No **SQL Editor**, clique em **New query**
2. Cole o conteúdo de `database/optimized-schema.sql`
3. Clique em **Run** (ou Ctrl+Enter)
4. Aguarde ~5-10 segundos

Você verá:
```
Success. No rows returned
```

✅ **Schema aplicado com sucesso!**

---

## 📊 O que foi criado?

### Tabelas (6)

1. **profiles** - Perfis do Instagram
2. **audits** - Auditorias completas com scores
3. **posts** - Posts individuais com OCR
4. **comments** - Comentários categorizados
5. **comparisons** - Comparações temporais
6. **analysis_queue** - Fila de análises

### Índices (42)

- Otimizados para queries rápidas
- Performance 5-200x melhor

### Views (2)

- `latest_audits` - Últimas auditorias
- `profile_evolution` - Evolução temporal

### Triggers (4)

- Auto-update de `updated_at`
- Auto-criação de comparações

### ENUMs (5)

- `post_type_enum`
- `audit_type_enum`
- `comment_category_enum`
- `queue_status_enum`
- `classification_enum`

---

## ✅ Verificar se foi aplicado

Execute no SQL Editor:

```sql
-- Verificar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
```
analysis_queue
audits
comments
comparisons
posts
profiles
```

---

## 🧪 Teste rápido

Inserir um perfil de teste:

```sql
INSERT INTO profiles (username, full_name, followers_count)
VALUES ('rodrigogunter_', 'Rodrigo Gunter', 56327)
RETURNING id, username, created_at;
```

Se funcionar, está tudo pronto! ✅

---

## 🚨 Troubleshooting

### Erro: "permission denied for schema public"

**Solução:** Você precisa ter permissões de admin no projeto Supabase.

### Erro: "relation already exists"

**Solução:** Schema já foi aplicado antes. Pode prosseguir.

### Erro: "syntax error"

**Solução:**
1. Verifique se copiou o SQL completo
2. Certifique-se de não ter caracteres extras
3. Use o arquivo original em `database/optimized-schema.sql`

---

## 📚 Próximo Passo

Após aplicar o schema:

```bash
# Volte para o teste do worker
npm run worker
```

E siga as instruções em [WORKER-QUICKSTART.md](WORKER-QUICKSTART.md).

---

**Dúvidas?** Veja a [documentação completa](docs/architecture/system-architecture.md).
