# Sistema de Permissões Granulares - Documentação

## 📋 Visão Geral

Sistema de controle de acesso granular que permite gerenciar permissões específicas por usuário, independente de sua role (admin/client).

**Diferença entre Roles e Permissions:**
- **Role** (`user_roles.role`): Define o tipo de usuário (`admin` ou `client`)
- **Permission** (`user_permissions.permission`): Define ações específicas que o usuário pode executar

Um usuário pode ter role `client` mas ter permissões diferentes de outro `client`.

---

## 🚀 Como Rodar a Migration

### 1. Acesse o Supabase SQL Editor
```
https://supabase.com/dashboard/project/YOUR_PROJECT/sql
```

### 2. Cole e Execute o SQL
```sql
-- Cole todo o conteúdo de migration-user-permissions.sql
-- Clique em "Run" ou CMD/CTRL + Enter
```

### 3. Verifique se Rodou Corretamente
```sql
-- Deve retornar a estrutura da tabela
SELECT * FROM user_permissions LIMIT 5;

-- Deve retornar a view consolidada
SELECT * FROM user_access_matrix LIMIT 5;

-- Deve retornar as funções criadas
\df user_has_permission
\df current_user_has_permission
\df seed_default_permissions
```

---

## 🔐 Permissões Disponíveis

| Permissão | Descrição | Padrão Client | Padrão Admin |
|-----------|-----------|---------------|--------------|
| `view_audits` | Ver auditorias completas | ✅ | ✅ |
| `create_content` | Criar novos conteúdos/carrosséis | ✅ | ✅ |
| `edit_content` | Editar conteúdos existentes | ✅ | ✅ |
| `delete_content` | Deletar conteúdos | ❌ | ✅ |
| `export_drive` | Exportar para Google Drive | ✅ | ✅ |
| `export_zip` | Baixar ZIP | ✅ | ✅ |
| `view_comparisons` | Ver comparações temporais | ✅ | ✅ |
| `manage_profiles` | Gerenciar perfis (add/remove) | ✅ | ✅ |

---

## 📊 Estrutura da Tabela

```sql
CREATE TABLE user_permissions (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, permission)
);
```

**Características:**
- Chave primária composta: `(user_id, permission)` (não pode duplicar)
- Cascade delete: Se usuário for deletado, permissões também são deletadas
- Check constraint: Apenas permissões válidas (enum fixo)
- Trigger automático: `updated_at` é atualizado automaticamente

---

## 🔒 Row Level Security (RLS)

### Políticas Implementadas

**SELECT (leitura):**
```sql
-- Usuário pode ler suas próprias permissões
CREATE POLICY "Users can read own permissions" ON user_permissions
  FOR SELECT
  USING (auth.uid() = user_id);
```

**INSERT/UPDATE/DELETE (escrita):**
- **Nenhuma policy** = apenas `service_role` key pode escrever
- Admins devem usar `service_role` key para gerenciar permissões
- Clientes não podem alterar suas próprias permissões

### Como Funciona

| Operação | Anon Key (Cliente) | Service Role (Admin) |
|----------|-------------------|---------------------|
| SELECT próprias permissões | ✅ Permitido | ✅ Permitido |
| SELECT outras permissões | ❌ Bloqueado | ✅ Permitido |
| INSERT | ❌ Bloqueado | ✅ Permitido |
| UPDATE | ❌ Bloqueado | ✅ Permitido |
| DELETE | ❌ Bloqueado | ✅ Permitido |

---

## 🛠️ Funções Helper

### 1. `seed_default_permissions(user_id, role)`
Cria permissões padrão para um usuário.

```sql
-- Criar permissões padrão para um client
SELECT seed_default_permissions('uuid-do-usuario', 'client');

-- Criar permissões padrão para um admin
SELECT seed_default_permissions('uuid-do-usuario', 'admin');
```

**Quando usar:**
- Ao criar um novo usuário manualmente
- Ao migrar usuários existentes
- **Não precisa chamar manualmente** se usar o trigger automático

### 2. `user_has_permission(user_id, permission)`
Verifica se um usuário específico tem uma permissão.

```sql
-- Retorna true/false
SELECT user_has_permission('uuid-do-usuario', 'delete_content');
```

**Quando usar:**
- No backend (API routes) para verificar permissões
- Em views para filtrar dados baseado em permissão
- Em triggers para aplicar lógica condicional

### 3. `current_user_has_permission(permission)`
Verifica se o usuário AUTENTICADO (auth.uid()) tem uma permissão.

```sql
-- Retorna true/false para o usuário logado
SELECT current_user_has_permission('export_drive');
```

**Quando usar:**
- Em RLS policies de outras tabelas
- Em views que filtram dados do usuário atual
- Para simplificar queries (não precisa passar user_id)

---

## 🤖 Triggers Automáticos

### 1. Auto-create Permissions on User Creation
Quando um registro é inserido em `user_roles`, permissões padrão são criadas automaticamente.

```sql
-- Este INSERT vai automaticamente criar permissões
INSERT INTO user_roles (user_id, role) VALUES ('new-uuid', 'client');

-- Resultado: 8 registros criados em user_permissions automaticamente
```

### 2. Auto-update `updated_at`
Quando uma permissão é atualizada, `updated_at` é automaticamente atualizado.

```sql
-- Este UPDATE vai atualizar updated_at automaticamente
UPDATE user_permissions
SET enabled = false
WHERE user_id = 'uuid' AND permission = 'delete_content';
```

---

## 📈 View Helper: `user_access_matrix`

View consolidada que junta roles + permissões.

```sql
SELECT * FROM user_access_matrix WHERE user_id = 'uuid-do-usuario';
```

**Retorna:**
| user_id | role | permission | has_permission | permission_granted_at |
|---------|------|------------|----------------|----------------------|
| uuid | client | view_audits | true | 2026-02-26 |
| uuid | client | delete_content | false | 2026-02-26 |

**Quando usar:**
- Dashboard de admin (mostrar matriz completa de permissões)
- Relatórios de auditoria
- Debugging de permissões

---

## 💻 Como Usar no Código (Next.js + Supabase)

### No Backend (API Route)

```typescript
// app/api/content/[id]/delete/route.ts
import { getServerSupabase } from '@/lib/supabase-server';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase();

  // 1. Pegar user_id do usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Verificar se tem permissão
  const { data: hasPermission } = await supabase
    .rpc('user_has_permission', {
      target_user_id: user.id,
      required_permission: 'delete_content'
    });

  if (!hasPermission) {
    return Response.json({ error: 'Forbidden: você não tem permissão para deletar conteúdo' }, { status: 403 });
  }

  // 3. Se chegou aqui, pode deletar
  const { error } = await supabase
    .from('content_suggestions')
    .delete()
    .eq('id', params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
```

### No Frontend (React Component)

```typescript
// components/ContentActions.tsx
import { useSupabase } from '@/hooks/useSupabase';
import { useEffect, useState } from 'react';

export function ContentActions({ contentId }: { contentId: string }) {
  const supabase = useSupabase();
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const { data } = await supabase.rpc('current_user_has_permission', {
        required_permission: 'delete_content'
      });
      setCanDelete(!!data);
    }
    checkPermission();
  }, []);

  return (
    <div>
      {canDelete && (
        <button onClick={() => handleDelete(contentId)}>
          Deletar Conteúdo
        </button>
      )}
    </div>
  );
}
```

### Aplicar RLS em Outras Tabelas (Exemplo)

```sql
-- Exemplo: apenas usuários com 'delete_content' podem deletar de content_suggestions
DROP POLICY IF EXISTS "Users with delete_content can delete" ON content_suggestions;
CREATE POLICY "Users with delete_content can delete" ON content_suggestions
  FOR DELETE
  USING (current_user_has_permission('delete_content'));
```

---

## 🔄 Casos de Uso Comuns

### 1. Criar Novo Usuário com Permissões Padrão
```sql
-- 1. Criar usuário (via Supabase Auth UI ou API)
-- 2. Inserir role (trigger vai criar permissões automaticamente)
INSERT INTO user_roles (user_id, role) VALUES ('new-uuid', 'client');

-- Resultado: 8 permissões criadas automaticamente
```

### 2. Desabilitar Permissão de um Usuário
```sql
-- Usar service_role key
UPDATE user_permissions
SET enabled = false
WHERE user_id = 'uuid-do-usuario' AND permission = 'export_drive';
```

### 3. Habilitar Permissão que Estava Desabilitada
```sql
-- Usar service_role key
UPDATE user_permissions
SET enabled = true
WHERE user_id = 'uuid-do-usuario' AND permission = 'delete_content';
```

### 4. Listar Todas as Permissões de um Usuário
```sql
SELECT permission, enabled
FROM user_permissions
WHERE user_id = 'uuid-do-usuario'
ORDER BY permission;
```

### 5. Listar Usuários com Permissão Específica Habilitada
```sql
SELECT u.email, ur.role
FROM user_permissions up
JOIN auth.users u ON u.id = up.user_id
JOIN user_roles ur ON ur.user_id = up.user_id
WHERE up.permission = 'delete_content' AND up.enabled = true;
```

---

## ⚠️ Notas Importantes

### Permissões vs Roles
- **Roles são amplas:** `admin` ou `client`
- **Permissions são específicas:** `delete_content`, `export_drive`
- Um `client` pode ter permissão `delete_content` se você habilitar manualmente
- Um `admin` pode ter `delete_content` desabilitado se necessário

### Service Role Key
Para gerenciar permissões (INSERT/UPDATE/DELETE), você DEVE usar a `service_role` key:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NÃO use anon key
  { auth: { persistSession: false } }
);

// Agora pode alterar permissões
await supabaseAdmin
  .from('user_permissions')
  .update({ enabled: false })
  .eq('user_id', userId)
  .eq('permission', 'delete_content');
```

### Migração de Usuários Existentes
Se você já tem usuários em `user_roles` e quer aplicar permissões:

```sql
-- Descomentar e rodar esta query (está no final do migration file)
INSERT INTO user_permissions (user_id, permission, enabled)
SELECT
  ur.user_id,
  perm.permission,
  CASE
    WHEN ur.role = 'admin' THEN true
    WHEN ur.role = 'client' AND perm.permission != 'delete_content' THEN true
    ELSE false
  END as enabled
FROM user_roles ur
CROSS JOIN (
  SELECT unnest(ARRAY[
    'view_audits', 'create_content', 'edit_content', 'delete_content',
    'export_drive', 'export_zip', 'view_comparisons', 'manage_profiles'
  ]) as permission
) perm
ON CONFLICT (user_id, permission) DO NOTHING;
```

---

## 🧪 Testes Recomendados

### 1. Testar Criação Automática
```sql
-- Criar um usuário de teste
INSERT INTO user_roles (user_id, role) VALUES (gen_random_uuid(), 'client');

-- Verificar se permissões foram criadas
SELECT * FROM user_permissions WHERE user_id = (SELECT user_id FROM user_roles ORDER BY created_at DESC LIMIT 1);
-- Deve retornar 8 linhas
```

### 2. Testar Verificação de Permissão
```sql
-- Substituir 'uuid-real' por um user_id válido
SELECT user_has_permission('uuid-real', 'delete_content');
-- Deve retornar false para clients, true para admins
```

### 3. Testar RLS (leitura)
```sql
-- Conectar com anon key (como um cliente)
SELECT * FROM user_permissions;
-- Deve retornar apenas suas próprias permissões
```

### 4. Testar RLS (escrita)
```sql
-- Tentar atualizar com anon key
UPDATE user_permissions SET enabled = false WHERE user_id = auth.uid() AND permission = 'view_audits';
-- Deve FALHAR (new row violates row-level security policy)
```

---

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Service Role Key](https://supabase.com/docs/guides/api/api-keys)

---

**Criado em:** 2026-02-26
**Versão:** 1.0
**Autor:** @data-engineer
