# PermissionsManager Component

Componente React para gerenciamento granular de permissões de usuários na plataforma Croko Labs.

## Localização

```
components/organisms/PermissionsManager.tsx
```

## Funcionalidades

- Exibição organizada de permissões por categoria (Visualização, Conteúdo, Exportação, Administração)
- Toggle switches interativos para cada permissão
- Estados de loading e erro tratados
- Indicador visual de alterações não salvas
- Botões de Salvar/Cancelar aparecem apenas quando há mudanças
- Contador de permissões habilitadas
- Design integrado com o Design System do projeto (Tailwind + Atomic Design)

## Props

```typescript
interface PermissionsManagerProps {
  userId: string                                    // ID do usuário
  currentPermissions: string[]                      // Array de permissões atuais
  onSave: (permissions: string[]) => Promise<void>  // Callback async para salvar
  disabled?: boolean                                // Desabilita interação (opcional)
}
```

## Permissões Disponíveis

| ID | Label | Descrição | Categoria |
|----|-------|-----------|-----------|
| `view_audits` | Ver Auditorias | Permite visualizar auditorias completas dos perfis | Visualização |
| `create_content` | Criar Conteúdo | Permite criar novos carrosséis e posts | Conteúdo |
| `edit_content` | Editar Conteúdo | Permite editar conteúdos existentes | Conteúdo |
| `delete_content` | Deletar Conteúdo | Permite deletar conteúdos permanentemente | Conteúdo |
| `export_drive` | Exportar Google Drive | Permite exportar conteúdos para o Google Drive | Exportação |
| `export_zip` | Exportar ZIP | Permite baixar conteúdos em formato ZIP | Exportação |
| `view_comparisons` | Ver Comparações | Permite visualizar comparações temporais de auditorias | Visualização |
| `manage_profiles` | Gerenciar Perfis | Permite adicionar e remover perfis do Instagram | Administração |

## Uso Básico

```tsx
import { PermissionsManager } from '@/components/organisms/PermissionsManager'

function UserPermissionsPage() {
  const [permissions, setPermissions] = useState<string[]>([
    'view_audits',
    'create_content',
  ])

  async function handleSave(newPermissions: string[]) {
    const res = await fetch(`/api/admin/users/123/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: newPermissions }),
    })

    if (!res.ok) {
      throw new Error('Erro ao salvar permissões')
    }

    setPermissions(newPermissions)
  }

  return (
    <PermissionsManager
      userId="123"
      currentPermissions={permissions}
      onSave={handleSave}
    />
  )
}
```

## Integração com API

O componente espera que a API retorne as permissões do usuário no seguinte formato:

### GET `/api/admin/users/[id]/permissions`

```json
{
  "permissions": [
    "view_audits",
    "create_content",
    "export_zip"
  ]
}
```

### PATCH `/api/admin/users/[id]/permissions`

Request:
```json
{
  "permissions": [
    "view_audits",
    "create_content",
    "edit_content",
    "export_zip"
  ]
}
```

Response:
```json
{
  "success": true,
  "permissions": [
    "view_audits",
    "create_content",
    "edit_content",
    "export_zip"
  ]
}
```

## Estados Visuais

### Normal
- Lista organizada por categoria
- Switches desabilitados em cinza
- Switches habilitados em roxo (primary)

### Com Alterações Não Salvas
- Botões "Cancelar" e "Salvar Alterações" aparecem no header
- Visual feedback das mudanças

### Loading (Salvando)
- Botões desabilitados
- Spinner no botão "Salvar"
- Opacity reduzida nas permissões

### Error
- Banner vermelho com mensagem de erro
- Ícone de alerta
- Descrição do erro

### Disabled
- Toda a interface desabilitada
- Opacity reduzida
- Cursor "not-allowed"

## Design System

### Cores
- Primary: Purple (`primary-500`, `primary-600`)
- Success: Green (para confirmações)
- Error: Red (`red-500`, `red-400`)
- Neutral: Grays (`neutral-50` a `neutral-900`)

### Componentes Utilizados
- `Switch` - `/components/atoms/switch.tsx`
- `Button` - `/components/atoms/button.tsx`
- Icons: `lucide-react` (Shield, Lock, Unlock, Check, X, AlertCircle)

### Espaçamento
- Container: `space-y-6`
- Categorias: `space-y-6`
- Permissões: `space-y-2`
- Padding interno: `p-4`

## Acessibilidade

- Todos os switches têm `role="switch"` e `aria-checked`
- Labels clicáveis para facilitar interação
- Estados de focus visíveis (ring)
- Cores com contraste adequado
- Mensagens de erro descritivas

## Exemplo Completo

Veja `PermissionsManager.example.tsx` para um exemplo completo de integração.

## Testes

Para testar o componente:

1. TypeCheck: `npm run typecheck`
2. Lint: `npm run lint`
3. Build: `npm run build`

## Changelog

### v1.0.0 (2026-02-26)
- Criação inicial do componente
- 8 permissões implementadas
- Agrupamento por categoria
- Estados de loading e erro
- Integração com Design System
