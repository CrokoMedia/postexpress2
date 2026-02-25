# Multi-Tenancy - Guia de Uso

Sistema de controle de acesso por usuário implementado no Croko Lab.

---

## Visão Geral

O sistema implementa **multi-tenancy** usando RLS (Row Level Security) do PostgreSQL/Supabase:

- **Admins**: veem todos os perfis e auditorias
- **Clientes**: veem apenas perfis vinculados a eles

### Estrutura

```
auth.users (Supabase Auth)
    ↓
user_roles (role: admin | client)
    ↓
user_profiles (many-to-many: users ↔ instagram_profiles)
    ↓
instagram_profiles
    ↓
audits → posts → comments
```

---

## 1. Aplicar Schema + RLS

Execute no SQL Editor do Supabase:

```bash
# Copiar arquivo para clipboard
cat database/schema-updates-user-profiles.sql | pbcopy

# Ou executar diretamente via CLI
psql $DATABASE_URL < database/schema-updates-user-profiles.sql
```

O script faz:
1. Adiciona `user_id` nas tabelas `profiles` e `instagram_profiles`
2. Cria RLS policies para todas as tabelas
3. Configura acesso:
   - **Admins**: SELECT em tudo
   - **Clientes**: SELECT apenas em perfis vinculados

---

## 2. Criar Usuários

### Via API (recomendado)

Use a interface em `/dashboard/admin/users`:

1. Acesse http://localhost:3000/dashboard/admin/users
2. Clique em "Novo Usuário"
3. Preencha:
   - Email
   - Senha (mínimo 6 caracteres)
   - Role: `admin` ou `client`
   - Perfis vinculados (para clientes)

### Via cURL

```bash
# Criar admin
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crokolab.com",
    "password": "senha123",
    "role": "admin"
  }'

# Criar cliente com perfis vinculados
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@crokolab.com",
    "password": "senha123",
    "role": "client",
    "profile_ids": ["uuid-profile-1", "uuid-profile-2"]
  }'
```

---

## 3. Gerenciar Perfis Vinculados

### Via Interface

Acesse `/dashboard/admin/users/[user_id]/profiles`:

- Ver perfis vinculados
- Adicionar novos vínculos
- Remover vínculos existentes

### Via API

#### Listar perfis de um usuário

```bash
GET /api/users/[user_id]/profiles
```

Exemplo:
```bash
curl http://localhost:3000/api/users/abc-123/profiles
```

#### Vincular perfil

```bash
POST /api/users/[user_id]/profiles
Content-Type: application/json

{
  "profile_id": "uuid-do-perfil"
}
```

Exemplo:
```bash
curl -X POST http://localhost:3000/api/users/abc-123/profiles \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "uuid-do-perfil"}'
```

#### Desvincular perfil

```bash
DELETE /api/users/[user_id]/profiles?profile_id=xxx
```

Exemplo:
```bash
curl -X DELETE "http://localhost:3000/api/users/abc-123/profiles?profile_id=uuid-do-perfil"
```

---

## 4. Login e Acesso

### Login via Dashboard

1. Acesse http://localhost:3000/dashboard
2. Faça login com email e senha
3. Cliente vê apenas seus perfis
4. Admin vê todos os perfis

### Teste de Isolamento

```bash
# 1. Criar 2 clientes com perfis diferentes
# Cliente A → Perfil @creatorA
# Cliente B → Perfil @creatorB

# 2. Fazer login como Cliente A
# 3. Verificar que só vê @creatorA

# 4. Fazer login como Cliente B
# 5. Verificar que só vê @creatorB

# 6. Fazer login como Admin
# 7. Verificar que vê ambos
```

---

## 5. RLS Policies

### Como funciona

Quando um cliente faz uma query:

```sql
SELECT * FROM instagram_profiles;
```

O PostgreSQL automaticamente aplica:

```sql
SELECT * FROM instagram_profiles
WHERE EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.profile_id = instagram_profiles.id
  AND user_profiles.user_id = auth.uid()
);
```

### Tabelas com RLS

- `instagram_profiles`
- `profiles` (legado)
- `audits`
- `posts`
- `comments`
- `comparisons`
- `analysis_queue`

### Bypass RLS

Apenas `service_role` pode bypassar RLS:

```typescript
// Backend/API routes usam service_role
const supabase = getServerSupabase() // usa SUPABASE_SERVICE_ROLE_KEY

// Frontend/Client usa anon key (RLS aplicado)
const supabase = createClientSupabase() // usa SUPABASE_ANON_KEY
```

---

## 6. Fluxo de Auditoria com RLS

```
1. Cliente faz login
   ↓
2. Acessa /dashboard
   ↓
3. API busca perfis (RLS aplicado)
   ↓
4. Vê apenas perfis vinculados
   ↓
5. Clica em perfil
   ↓
6. API busca auditorias (RLS aplicado)
   ↓
7. Vê apenas auditorias daquele perfil
   ↓
8. Clica em auditoria
   ↓
9. API busca posts (RLS aplicado)
   ↓
10. Vê apenas posts daquela auditoria
```

**Resultado**: Cliente nunca vê dados de outros clientes.

---

## 7. Estrutura de APIs

### APIs Públicas (RLS aplicado)

```
GET  /api/profiles              → Lista perfis (filtrado por RLS)
GET  /api/profiles/[id]          → Detalhes de perfil (RLS verifica acesso)
GET  /api/audits/[id]            → Detalhes de auditoria (RLS)
GET  /api/posts/[id]             → Detalhes de post (RLS)
```

### APIs Admin (requireAdmin)

```
GET    /api/admin/users          → Listar usuários
POST   /api/admin/users          → Criar usuário
PATCH  /api/admin/users          → Atualizar perfis vinculados
DELETE /api/admin/users          → Deletar usuário

GET    /api/users/[id]/profiles  → Listar perfis vinculados
POST   /api/users/[id]/profiles  → Vincular perfil
DELETE /api/users/[id]/profiles  → Desvincular perfil
```

---

## 8. Troubleshooting

### Cliente não vê perfis

**Problema**: Cliente faz login mas lista de perfis está vazia.

**Soluções**:

1. Verificar se perfis foram vinculados:
```sql
SELECT * FROM user_profiles WHERE user_id = 'uuid-do-usuario';
```

2. Verificar se RLS está habilitado:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

3. Verificar policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'instagram_profiles';
```

### Admin não vê tudo

**Problema**: Admin não vê todos os perfis.

**Soluções**:

1. Verificar role:
```sql
SELECT role FROM user_roles WHERE user_id = 'uuid-do-admin';
```

2. Verificar policy de admin:
```sql
-- Deve existir policy: "Admins can read all profiles"
SELECT * FROM pg_policies
WHERE tablename = 'instagram_profiles'
AND policyname LIKE '%admin%';
```

### Erro 403 em APIs

**Problema**: API retorna "Acesso negado".

**Soluções**:

1. Verificar autenticação:
```bash
# Verificar se cookie de sessão existe
curl -v http://localhost:3000/api/profiles
```

2. Verificar role na tabela `user_roles`:
```sql
SELECT ur.role, u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'seu-email@example.com';
```

3. Verificar se `requireAuth()` ou `requireAdmin()` está sendo usado corretamente.

---

## 9. Migração de Dados Existentes

Se você já tem perfis e usuários no banco:

```sql
-- 1. Criar admin principal
INSERT INTO user_roles (user_id, role)
VALUES ('uuid-do-usuario-admin', 'admin');

-- 2. Vincular todos os perfis existentes a um cliente
INSERT INTO user_profiles (user_id, profile_id)
SELECT 'uuid-do-cliente', id FROM instagram_profiles;

-- 3. Atualizar user_id diretamente (opcional)
UPDATE instagram_profiles
SET user_id = 'uuid-do-cliente'
WHERE id IN (SELECT id FROM instagram_profiles LIMIT 10);
```

---

## 10. Desabilitar RLS (Desenvolvimento)

Para desabilitar temporariamente (NUNCA em produção):

```sql
-- Desabilitar RLS em todas as tabelas
ALTER TABLE instagram_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE audits DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queue DISABLE ROW LEVEL SECURITY;
```

Para re-habilitar:

```sql
-- Re-habilitar RLS
ALTER TABLE instagram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- etc...
```

---

## 11. Segurança

### Boas Práticas

1. **Nunca** compartilhe `SUPABASE_SERVICE_ROLE_KEY` no frontend
2. Use `SUPABASE_ANON_KEY` no frontend (RLS aplicado)
3. Sempre use `requireAuth()` ou `requireAdmin()` em APIs
4. Teste RLS policies com usuários reais (não como service_role)
5. Monitore logs para acessos não autorizados

### Teste de Segurança

```bash
# 1. Fazer login como Cliente A
# 2. Pegar token de sessão (browser cookies)
# 3. Tentar acessar perfil de Cliente B diretamente:

curl http://localhost:3000/api/profiles/uuid-profile-cliente-B \
  -H "Cookie: sb-access-token=xxx"

# Deve retornar 403 ou dados vazios (RLS bloqueia)
```

---

## 12. Performance

RLS adiciona WHERE clauses em todas as queries. Para otimizar:

### Indexes já criados

```sql
-- user_id em profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- user_id em instagram_profiles
CREATE INDEX idx_instagram_profiles_user_id ON instagram_profiles(user_id);

-- user_profiles (composite)
-- Já tem PRIMARY KEY (user_id, profile_id)
```

### Monitoramento

```sql
-- Ver queries lentas
SELECT * FROM pg_stat_statements
WHERE query LIKE '%instagram_profiles%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 13. Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Next.js Middleware Authentication](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Última atualização**: 2026-02-25
**Versão**: 1.0
**Status**: Implementado e testado
