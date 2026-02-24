# Verificar Schema WhatsApp no Supabase

## ✅ Funcionalidades Implementadas

### 1. Interface no Perfil
- ✅ Campo para vincular WhatsApp na página de perfil
- ✅ Modal com formulário completo (nome + telefone)
- ✅ Botão para editar WhatsApp vinculado
- ✅ Botão para desvincular WhatsApp
- ✅ Validação de formato de telefone

### 2. API Routes Criadas
- ✅ `POST /api/profiles/[id]/whatsapp` - Vincular/atualizar WhatsApp
- ✅ `DELETE /api/profiles/[id]/whatsapp` - Desvincular WhatsApp
- ✅ Validações completas (formato, duplicação, etc.)

### 3. Componentes
- ✅ `LinkWhatsAppModal` - Modal de vinculação
- ✅ Integrado na página de perfil

---

## 🔍 Verificar Schema no Supabase

### Passo 1: Verificar se as tabelas existem

Abra o **SQL Editor** do Supabase e rode:

```sql
-- Verificar se a tabela whatsapp_users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'whatsapp_users'
);

-- Verificar se a coluna whatsapp_phone existe em profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'whatsapp_phone';
```

### Passo 2: Se não existir, aplicar o schema

Rode o arquivo completo no SQL Editor:

```bash
/Users/macbook-karla/postexpress2/database/whatsapp-users-schema.sql
```

### Passo 3: Verificar RLS (Row Level Security)

```sql
-- Verificar políticas de segurança
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'whatsapp_users';
```

---

## 🧪 Testar a Funcionalidade

### 1. Via Interface (recomendado)

1. Abra um perfil: `http://localhost:3000/dashboard/profiles/[id]`
2. Clique em **"Vincular WhatsApp"**
3. Preencha:
   - Nome: "Seu Nome"
   - WhatsApp: "66632607531" (apenas números)
4. Clique em **"Vincular"**
5. Verifique se aparece: **"WhatsApp: 66632607531"** abaixo do botão Instagram

### 2. Via API (opcional)

```bash
# Vincular WhatsApp
curl -X POST http://localhost:3000/api/profiles/[profile-id]/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "66632607531", "name": "Felipe Ricardo"}'

# Desvincular WhatsApp
curl -X DELETE http://localhost:3000/api/profiles/[profile-id]/whatsapp
```

### 3. Verificar no Supabase

```sql
-- Ver todos os usuários WhatsApp
SELECT * FROM whatsapp_users;

-- Ver perfis com WhatsApp vinculado
SELECT id, username, whatsapp_phone
FROM profiles
WHERE whatsapp_phone IS NOT NULL;
```

---

## 📋 Estrutura de Dados

### Tabela `whatsapp_users`
```sql
CREATE TABLE whatsapp_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,              -- Telefone (apenas números)
  name TEXT NOT NULL,                      -- Nome do usuário
  active_profile_id UUID,                  -- FK para profiles.id
  authorized BOOLEAN DEFAULT true,         -- Se pode usar o bot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Coluna adicionada em `profiles`
```sql
ALTER TABLE profiles
ADD COLUMN whatsapp_phone TEXT;

-- FK para whatsapp_users.phone
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_whatsapp_phone
FOREIGN KEY (whatsapp_phone)
REFERENCES whatsapp_users(phone)
ON DELETE SET NULL;
```

---

## ✅ Checklist de Verificação

- [ ] Schema aplicado no Supabase (tabelas e colunas existem)
- [ ] RLS configurado (políticas de segurança)
- [ ] Interface aparece na página de perfil
- [ ] Modal de vinculação funciona
- [ ] Validação de telefone funciona
- [ ] WhatsApp aparece vinculado após salvar
- [ ] Botão de editar funciona
- [ ] Botão de desvincular funciona
- [ ] Dados persistem no Supabase

---

## 🚀 Próximos Passos (após verificação)

1. ✅ Testar fluxo completo via WhatsApp
2. ✅ Criar mensagem de boas-vindas quando vincular
3. ✅ Notificar usuário via WhatsApp após vincular
4. ✅ Dashboard de usuários WhatsApp (admin)

---

## 🐛 Troubleshooting

### Erro: "whatsapp_users table does not exist"
→ Rode o schema: `database/whatsapp-users-schema.sql`

### Erro: "column whatsapp_phone does not exist"
→ Rode o ALTER TABLE do schema

### Erro: "Telefone já vinculado"
→ Use outro número ou desvincule o perfil anterior

### WhatsApp não aparece na interface
→ Recarregue a página (Ctrl+R)
→ Verifique se `whatsapp_phone` está no banco

---

**Criado em:** 2026-02-24
**Status:** Implementação completa ✅
