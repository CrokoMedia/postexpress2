# Sistema de Permissões - Guia de Uso

## Visão Geral

O arquivo `lib/permissions.ts` implementa um sistema completo de permissões granulares para o Post Express (Croko Lab).

## Permissões Disponíveis

```typescript
enum Permission {
  VIEW_AUDITS = 'view_audits',
  CREATE_CONTENT = 'create_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  EXPORT_DRIVE = 'export_drive',
  EXPORT_ZIP = 'export_zip',
  VIEW_COMPARISONS = 'view_comparisons',
  MANAGE_PROFILES = 'manage_profiles',
}
```

## Funcionalidades Implementadas

### 1. Verificação de Permissão Única

```typescript
import { checkPermission, Permission } from '@/lib/permissions'

// Em uma API route
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)

  const hasPermission = await checkPermission(user.id, Permission.VIEW_AUDITS)

  if (!hasPermission) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  // Código da rota...
}
```

### 2. Middleware de Permissão (Recomendado)

```typescript
import { requirePermission, Permission } from '@/lib/permissions'

// Protege rota com permissão específica
export const GET = requirePermission(Permission.VIEW_AUDITS)(async (req) => {
  // Usuário já está autenticado e tem permissão view_audits
  // Código da rota aqui...
})

export const POST = requirePermission(Permission.CREATE_CONTENT)(async (req) => {
  // Código da rota aqui...
})
```

### 3. Múltiplas Permissões

```typescript
import { requirePermissions, Permission } from '@/lib/permissions'

// Requer TODAS as permissões
export const DELETE = requirePermissions(
  [Permission.EDIT_CONTENT, Permission.DELETE_CONTENT],
  true
)(async (req) => {
  // Código aqui
})

// Requer PELO MENOS UMA das permissões
export const GET = requirePermissions(
  [Permission.EXPORT_DRIVE, Permission.EXPORT_ZIP],
  false
)(async (req) => {
  // Código aqui
})
```

### 4. Verificação Manual de Múltiplas Permissões

```typescript
import { checkPermissions, Permission } from '@/lib/permissions'

const hasAll = await checkPermissions(
  userId,
  [Permission.EDIT_CONTENT, Permission.DELETE_CONTENT],
  true
)

const hasAny = await checkPermissions(
  userId,
  [Permission.EXPORT_DRIVE, Permission.EXPORT_ZIP],
  false
)
```

### 5. Gerenciamento de Permissões (Admin)

```typescript
import {
  grantPermission,
  revokePermission,
  grantPermissions,
  getUserPermissions,
  Permission
} from '@/lib/permissions'

// Adicionar permissão única
await grantPermission(userId, Permission.CREATE_CONTENT)

// Remover permissão
await revokePermission(userId, Permission.DELETE_CONTENT)

// Adicionar múltiplas permissões
await grantPermissions(userId, [
  Permission.VIEW_AUDITS,
  Permission.CREATE_CONTENT,
  Permission.EDIT_CONTENT,
])

// Listar permissões do usuário
const permissions = await getUserPermissions(userId)
// ['view_audits', 'create_content', ...]
```

### 6. Cache Management

```typescript
import { clearPermissionsCache, clearAllPermissionsCache } from '@/lib/permissions'

// Limpar cache de usuário específico (após alterar permissões)
clearPermissionsCache(userId)

// Limpar todo o cache
clearAllPermissionsCache()
```

## Comportamento Especial

### Admins

- **Admins sempre têm todas as permissões** automaticamente
- Não é necessário adicionar permissões manualmente para admins
- A verificação de role acontece antes da verificação de permissão

### Cache

- Permissões são cacheadas em memória por **5 minutos**
- Cache é automaticamente limpo após TTL
- Cache é limpo ao adicionar/remover permissões via `grantPermission`/`revokePermission`
- Pode ser limpo manualmente com `clearPermissionsCache(userId)`

### RLS (Row Level Security)

- A tabela `user_permissions` deve ter RLS habilitado
- Apenas service_role pode inserir/atualizar permissões
- Usuários podem ler suas próprias permissões

## Exemplos de Uso em Rotas Existentes

### Exemplo 1: Proteger rota de criação de conteúdo

```typescript
// app/api/content/create/route.ts
import { requirePermission, Permission } from '@/lib/permissions'

export const POST = requirePermission(Permission.CREATE_CONTENT)(
  async (req: NextRequest) => {
    const body = await req.json()

    // Criar conteúdo...

    return NextResponse.json({ success: true })
  }
)
```

### Exemplo 2: Proteger export para Google Drive

```typescript
// app/api/content/[id]/export-drive/route.ts
import { requirePermission, Permission } from '@/lib/permissions'

export const POST = requirePermission(Permission.EXPORT_DRIVE)(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params

    // Exportar para Drive...

    return NextResponse.json({ success: true })
  }
)
```

### Exemplo 3: UI Condicional (Frontend)

```typescript
// app/dashboard/page.tsx
import { getUserPermissions, Permission } from '@/lib/permissions'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const permissions = await getUserPermissions(user.id)

  return (
    <div>
      {permissions.includes(Permission.CREATE_CONTENT) && (
        <button>Criar Novo Conteúdo</button>
      )}

      {permissions.includes(Permission.EXPORT_DRIVE) && (
        <button>Exportar para Drive</button>
      )}
    </div>
  )
}
```

## Estrutura do Banco de Dados

```sql
CREATE TABLE user_permissions (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, permission)
);
```

## Migração Recomendada

Ver arquivo `database/migration-user-permissions.sql` (Task #1)

## Próximos Passos

1. ✅ Task #5: Middleware de verificação implementado
2. Task #6: Aplicar guards nas rotas críticas
   - `/api/content/[id]/export-drive`
   - `/api/content/[id]/export-zip`
   - `/api/content/create`
   - `/api/audits/create`
   - etc.

## Referências

- `lib/auth.ts` - Padrão de autenticação base (usado como referência)
- `database/schema-updates-user-profiles.sql` - RLS policies existentes
- Task #1 - Schema de permissões
- Task #5 - Este middleware
