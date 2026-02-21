# Integração: Twitter Experts na Página de Perfil

## 🎯 Objetivo

Adicionar seção de Twitter Monitoring dentro da página de cada perfil (`/dashboard/profiles/[id]`).

---

## 📝 Passo a Passo

### 1. Rodar Migration no Supabase

```bash
# Abrir Supabase Dashboard SQL Editor:
# https://supabase.com/dashboard/project/[PROJECT_ID]/sql

# Copiar todo conteúdo de:
database/migrations/005_twitter_add_profile_id.sql

# Colar e executar no SQL Editor
```

**Validação:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'twitter_experts' AND column_name = 'profile_id';
-- Deve retornar: profile_id
```

---

### 2. Adicionar Componente na Página de Perfil

Abrir: `/app/dashboard/profiles/[id]/page.tsx`

**Importar o componente:**
```typescript
import { TwitterExpertsSection } from '@/components/twitter/twitter-experts-section';
```

**Adicionar na renderização** (após a seção de auditorias ou onde preferir):
```tsx
{/* Twitter Monitoring */}
<div className="mt-8">
  <TwitterExpertsSection
    profileId={profile.id}
    profileUsername={profile.username}
  />
</div>
```

---

### 3. Exemplo de Integração Completa

```tsx
// app/dashboard/profiles/[id]/page.tsx

export default function ProfilePage({ params }: { params: { id: string } }) {
  // ... código existente ...

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header do Perfil */}
      <PageHeader
        title={`@${profile.username}`}
        description={profile.bio}
      />

      {/* Seção de Auditorias (existente) */}
      <section className="mb-8">
        {/* ... auditorias ... */}
      </section>

      {/* NOVO: Twitter Monitoring */}
      <section className="mb-8">
        <TwitterExpertsSection
          profileId={profile.id}
          profileUsername={profile.username}
        />
      </section>

      {/* Outras seções... */}
    </div>
  );
}
```

---

## 🎨 O que o componente faz

### Visual

```
┌────────────────────────────────────────────────────┐
│ 🐦 Twitter Monitoring (3 experts)                  │
│ Monitore experts do Twitter em tempo real...       │
│                                    [+ Adicionar]   │
├────────────────────────────────────────────────────┤
│                                                    │
│ [Experts: 3] [Ativos: 2] [Tweets: 47]            │
│                                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │@garyvee  │ │@hormozi  │ │ @naval   │           │
│ │Gary Vee  │ │Alex H.   │ │ Naval    │           │
│ │      [⚪]│ │      [⚪]│ │      [⚪]│           │
│ │          │ │          │ │          │           │
│ │marketing │ │sales     │ │startups  │           │
│ │sales     │ │offers    │ │investing │           │
│ │          │ │          │ │          │           │
│ │📊 20     │ │📊 15     │ │📊 12     │           │
│ │🟢 Ativo  │ │🟢 Ativo  │ │🔴 Pausado│           │
│ │          │ │          │ │          │           │
│ │[Editar]  │ │[Editar]  │ │[Editar]  │           │
│ └──────────┘ └──────────┘ └──────────┘           │
└────────────────────────────────────────────────────┘
```

### Funcionalidades

✅ **Adicionar Expert** - Modal para adicionar novo expert (associado a esse perfil)
✅ **Editar Temas** - Modal para editar temas de interesse
✅ **Ativar/Desativar** - Toggle para ligar/desligar monitoramento
✅ **Contador de Tweets** - Mostra quantos tweets foram capturados
✅ **Stats Rápidas** - Total experts, ativos, tweets
✅ **Empty State** - Mensagem amigável quando sem experts

---

## 🔗 Fluxo Completo

### Cenário: Cliente "Pazos Media" quer monitorar Gary Vee

1. **Admin acessa:** `/dashboard/profiles/[pazos-id]`
2. **Vê seção:** "🐦 Twitter Monitoring"
3. **Clica:** "+ Adicionar Expert"
4. **Preenche:**
   - Username: `garyvee`
   - Display Name: `Gary Vaynerchuk`
   - Temas: `marketing`, `sales`, `frameworks`
5. **Salva:**
   - ✅ Expert criado no Supabase (com `profile_id = pazos-id`)
   - ✅ Regra criada no Twitter API
   - ✅ Worker começa a capturar tweets
6. **Resultado:**
   - Card do Gary aparece na seção
   - Tweets dele aparecem na timeline
   - Notificações Slack para tweets relevantes

---

## 🎯 Vantagens

✅ **Contextualizado** - Cada cliente vê apenas seus experts
✅ **Isolado** - Experts de um cliente não aparecem para outros
✅ **Organizado** - Tudo relacionado ao perfil em um só lugar
✅ **Flexível** - Mesmo expert pode ser monitorado por vários clientes

---

## 🧪 Testar

1. Rodar migration 005
2. Adicionar componente na página de perfil
3. Acessar `/dashboard/profiles/[algum-id]`
4. Adicionar um expert
5. Verificar que aparece apenas naquele perfil

---

✅ **Integração pronta!**

Se tiver dúvidas, pergunte! 🚀
