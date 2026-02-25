# Exemplo de Aplicação de Permission Guards

## Cenário: Proteger rota de export para Google Drive

### ❌ ANTES (apenas autenticação)

```typescript
// app/api/content/[id]/export-drive/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { getGoogleDriveClient, findOrCreateFolder, uploadFile } from '@/lib/google-drive'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ❌ Apenas verifica autenticação
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { id } = await params
    // ... resto do código
  } catch (error) {
    // ...
  }
}
```

### ✅ DEPOIS (autenticação + permissão)

```typescript
// app/api/content/[id]/export-drive/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requirePermission, Permission } from '@/lib/permissions'
import { getGoogleDriveClient, findOrCreateFolder, uploadFile } from '@/lib/google-drive'

// ✅ Usa middleware de permissão
export const POST = requirePermission(Permission.EXPORT_DRIVE)(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    // Usuário já está autenticado E tem permissão EXPORT_DRIVE
    // Não precisa chamar requireAuth() manualmente

    try {
      const { id } = await params
      const supabase = getServerSupabase()

      // ... resto do código
    } catch (error) {
      // ...
    }
  }
)
```

## Comparação das Abordagens

| Aspecto | requireAuth (antes) | requirePermission (depois) |
|---------|---------------------|----------------------------|
| Autenticação | ✅ Verifica | ✅ Verifica |
| Permissão específica | ❌ Não verifica | ✅ Verifica `export_drive` |
| Admins | ✅ Sempre aceita | ✅ Sempre aceita |
| Resposta 403 | ❌ Manual | ✅ Automático |
| Cache | N/A | ✅ 5 min cache |

## Rotas que Devem Receber Guards (Task #6)

### Alta Prioridade

```typescript
// 1. Export para Google Drive
// app/api/content/[id]/export-drive/route.ts
export const POST = requirePermission(Permission.EXPORT_DRIVE)(...)

// 2. Download ZIP
// app/api/content/[id]/export-zip/route.ts
export const POST = requirePermission(Permission.EXPORT_ZIP)(...)

// 3. Criar conteúdo
// app/api/content/generate/route.ts
export const POST = requirePermission(Permission.CREATE_CONTENT)(...)

// 4. Aprovar conteúdo
// app/api/content/[id]/approve/route.ts
export const POST = requirePermission(Permission.EDIT_CONTENT)(...)

// 5. Deletar conteúdo (quando existir)
// app/api/content/[id]/route.ts
export const DELETE = requirePermissions(
  [Permission.EDIT_CONTENT, Permission.DELETE_CONTENT],
  true // requer AMBAS as permissões
)(...)
```

### Média Prioridade

```typescript
// 6. Ver auditorias
// app/api/audits/[id]/route.ts
export const GET = requirePermission(Permission.VIEW_AUDITS)(...)

// 7. Ver comparações
// app/api/comparisons/[id]/route.ts
export const GET = requirePermission(Permission.VIEW_COMPARISONS)(...)

// 8. Gerenciar perfis
// app/api/profiles/route.ts
export const POST = requirePermission(Permission.MANAGE_PROFILES)(...)
export const DELETE = requirePermission(Permission.MANAGE_PROFILES)(...)
```

## Padrão de Migração

### Passo 1: Importar Permission

```typescript
// Trocar:
import { requireAuth } from '@/lib/auth'

// Por:
import { requirePermission, Permission } from '@/lib/permissions'
```

### Passo 2: Envolver função com middleware

```typescript
// Trocar:
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  // ...
}

// Por:
export const POST = requirePermission(Permission.EXPORT_DRIVE)(
  async (req: NextRequest) => {
    // ...
  }
)
```

### Passo 3: Remover verificação manual de auth

```typescript
// REMOVER estas linhas (middleware já faz):
const authResult = await requireAuth(request)
if (authResult instanceof NextResponse) return authResult
```

## UI Condicional (Frontend)

### Server Component

```typescript
// app/dashboard/content/[id]/page.tsx
import { getUserPermissions, Permission } from '@/lib/permissions'
import { getCurrentUser } from '@/lib/auth'

export default async function ContentDetailPage() {
  const user = await getCurrentUser()
  const permissions = await getUserPermissions(user.id)

  const canExportDrive = permissions.includes(Permission.EXPORT_DRIVE)
  const canExportZip = permissions.includes(Permission.EXPORT_ZIP)
  const canEdit = permissions.includes(Permission.EDIT_CONTENT)

  return (
    <div>
      <h1>Detalhes do Conteúdo</h1>

      <div className="actions">
        {canExportDrive && (
          <button>Exportar para Drive</button>
        )}

        {canExportZip && (
          <button>Baixar ZIP</button>
        )}

        {canEdit && (
          <button>Editar Conteúdo</button>
        )}
      </div>
    </div>
  )
}
```

### Client Component

```typescript
'use client'

import { useEffect, useState } from 'react'

export function ExportButtons({ contentId }: { contentId: string }) {
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/auth/permissions')
      .then(res => res.json())
      .then(data => setPermissions(data.permissions))
  }, [])

  return (
    <div>
      {permissions.includes('export_drive') && (
        <button onClick={() => handleExportDrive(contentId)}>
          Exportar para Drive
        </button>
      )}

      {permissions.includes('export_zip') && (
        <button onClick={() => handleExportZip(contentId)}>
          Baixar ZIP
        </button>
      )}
    </div>
  )
}
```

## Criando API de Permissões do Usuário

```typescript
// app/api/auth/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserPermissions } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  const permissions = await getUserPermissions(user.id)

  return NextResponse.json({
    permissions,
    user_id: user.id
  })
}
```

## Testando Permissões

### Teste Manual via API

```bash
# 1. Autenticar como usuário
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com", "password": "password"}'

# 2. Tentar exportar sem permissão (deve retornar 403)
curl -X POST http://localhost:3000/api/content/abc-123/export-drive \
  -H "Authorization: Bearer <token>"

# Resposta esperada:
# {
#   "error": "Acesso negado",
#   "message": "Você não tem permissão: export_drive",
#   "required_permission": "export_drive"
# }
```

### Teste via SQL (Supabase)

```sql
-- Dar permissão de export_drive para um usuário
INSERT INTO user_permissions (user_id, permission, enabled)
VALUES ('uuid-do-usuario', 'export_drive', true)
ON CONFLICT (user_id, permission)
DO UPDATE SET enabled = true;

-- Verificar permissões do usuário
SELECT * FROM user_permissions
WHERE user_id = 'uuid-do-usuario'
AND enabled = true;

-- Remover permissão
UPDATE user_permissions
SET enabled = false
WHERE user_id = 'uuid-do-usuario'
AND permission = 'export_drive';
```

## Resumo

✅ **Implementado**: Middleware de verificação (`lib/permissions.ts`)
⏳ **Próximo passo**: Aplicar guards nas rotas críticas (Task #6)
📋 **Prioridade**: Export Drive, Export ZIP, Create Content, Edit Content, Delete Content

### Checklist Task #6

- [ ] `app/api/content/[id]/export-drive/route.ts`
- [ ] `app/api/content/[id]/export-zip/route.ts`
- [ ] `app/api/content/generate/route.ts`
- [ ] `app/api/content/[id]/approve/route.ts`
- [ ] `app/api/audits/[id]/route.ts`
- [ ] `app/api/comparisons/[id]/route.ts`
- [ ] `app/api/profiles/route.ts`
- [ ] `app/api/auth/permissions/route.ts` (criar novo)
