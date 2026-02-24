# 📅 Sistema de Agendamento de Geração de Conteúdo

Sistema completo para agendar a geração automática de carrosséis de Instagram em horários específicos.

---

## 🎯 Funcionalidades

✅ **Agendar geração de conteúdo** para data/hora específica
✅ **Definir quantidade** de carrosséis (1-20)
✅ **Tema personalizado opcional**
✅ **Processamento automático** via Vercel Cron
✅ **Retry automático** (até 3 tentativas)
✅ **Interface visual** para gerenciar agendamentos
✅ **Status em tempo real** (pending, processing, completed, failed)

---

## 🛠️ Setup

### 1. Executar Migration no Supabase

No **SQL Editor** do Supabase, execute:

```sql
-- Copie e cole todo o conteúdo de:
database/migrations/003-add-content-schedules.sql
```

Isso criará:
- Tabela `content_generation_schedules`
- Enum `schedule_status_enum`
- Indexes otimizados
- Triggers de `updated_at`
- View `active_schedules`
- Policies de RLS

### 2. Adicionar Variável de Ambiente

Adicione ao `.env.local` e no **Vercel Dashboard**:

```bash
# Secret para autenticar chamadas do Cron (trocar em produção)
CRON_SECRET=seu-secret-super-secreto-aqui-produção-2026
```

### 3. Deploy no Vercel

O arquivo `vercel.json` já está configurado para rodar o Cron **a cada 5 minutos**.

```json
{
  "crons": [
    {
      "path": "/api/cron/process-schedules",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Após o deploy, o Vercel Cron será ativado automaticamente.

---

## 📖 Como Usar

### 1. Criar Agendamento (Interface)

1. Vá para **Dashboard → Auditorias → [Auditoria] → Criar Conteúdo**
2. Clique em **"Agendar Geração"**
3. Configure:
   - **Quantidade** de carrosséis (1-20)
   - **Data e Horário** futuro
   - **Tema Personalizado** (opcional)
4. Clique em **"Confirmar Agendamento"**

### 2. Visualizar Agendamentos

Na mesma página, você verá a lista de **Agendamentos** com:
- Status atual (Agendado, Processando, Concluído, Falhou)
- Data/hora agendada
- Quantidade de carrosséis
- Tema (se definido)
- Botão para cancelar (se pendente)

### 3. Processamento Automático

O Cron roda **a cada 5 minutos** e:
1. Busca agendamentos com `status = 'pending'` e `scheduled_at <= NOW()`
2. Marca como `processing`
3. Gera conteúdo via Claude API
4. Salva em `content_suggestions`
5. Marca como `completed` (ou `failed` se houver erro)
6. Retry até 3 tentativas se falhar

---

## 🔧 APIs Criadas

### `POST /api/schedules`
Criar novo agendamento

**Body:**
```json
{
  "auditId": "uuid",
  "profileId": "uuid",
  "scheduledAt": "2026-02-23T15:00:00.000Z",
  "quantity": 5,
  "customTheme": "Carrosséis sobre vendas no Instagram"
}
```

**Response:**
```json
{
  "schedule": {
    "id": "uuid",
    "status": "pending",
    "scheduled_at": "2026-02-23T15:00:00.000Z",
    "quantity": 5,
    ...
  }
}
```

### `GET /api/schedules?auditId=xxx&status=pending`
Listar agendamentos (com filtros opcionais)

**Response:**
```json
{
  "schedules": [
    {
      "id": "uuid",
      "status": "pending",
      "scheduled_at": "2026-02-23T15:00:00.000Z",
      "quantity": 5,
      "profiles": { "username": "exemplo" },
      ...
    }
  ]
}
```

### `GET /api/schedules/[id]`
Buscar agendamento específico

### `PATCH /api/schedules/[id]`
Atualizar agendamento (data, quantidade, tema, status)

**Body:**
```json
{
  "scheduledAt": "2026-02-24T10:00:00.000Z",
  "quantity": 10
}
```

### `DELETE /api/schedules/[id]`
Cancelar agendamento (marca como `cancelled`)

---

## 🤖 Cron Worker

### Endpoint
`POST /api/cron/process-schedules`

### Autenticação
- **Vercel Cron:** Header `x-vercel-cron` (automático)
- **Manual:** `Authorization: Bearer SEU_CRON_SECRET`

### Teste Manual (Development)

```bash
# Local
curl -X POST http://localhost:3000/api/cron/process-schedules \
  -H "Authorization: Bearer dev-secret-change-in-production"

# Produção
curl -X POST https://seu-dominio.vercel.app/api/cron/process-schedules \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

### Logs do Cron (Vercel)

Dashboard → Deployments → Logs → Filter: `process-schedules`

---

## 📊 Schema do Banco

### Tabela: `content_generation_schedules`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `audit_id` | UUID | FK → audits |
| `profile_id` | UUID | FK → profiles |
| `scheduled_at` | TIMESTAMPTZ | Quando gerar |
| `quantity` | INTEGER | Quantos carrosséis (1-20) |
| `custom_theme` | TEXT | Tema opcional |
| `status` | ENUM | pending, processing, completed, failed, cancelled |
| `attempts` | INTEGER | Tentativas de processamento (max 3) |
| `content_suggestion_id` | UUID | FK → content_suggestions (resultado) |
| `error_message` | TEXT | Mensagem de erro (se falhou) |
| `processing_started_at` | TIMESTAMPTZ | Início do processamento |
| `processing_completed_at` | TIMESTAMPTZ | Fim do processamento |
| `created_at` | TIMESTAMPTZ | Criado em |
| `updated_at` | TIMESTAMPTZ | Atualizado em |

### Status Possíveis

- `pending` → Aguardando horário agendado
- `processing` → Gerando conteúdo agora
- `completed` → Concluído com sucesso
- `failed` → Falhou após 3 tentativas
- `cancelled` → Cancelado pelo usuário

---

## 🎨 Componentes Criados

### `<ScheduleContentModal>`
Modal para criar agendamento

**Props:**
```tsx
{
  auditId: string
  profileId: string
  onClose: () => void
  onSuccess?: () => void
}
```

**Features:**
- Slider para quantidade (1-20)
- Date/time picker (valida futuro)
- Campo de tema personalizado
- Preview da data formatada
- Validações e feedback de erro

### `<ScheduledContentList>`
Lista de agendamentos com status

**Props:**
```tsx
{
  auditId: string
  onRefresh?: () => void
}
```

**Features:**
- Badges de status coloridos
- Auto-refresh a cada 30s
- Botão de cancelar (se pendente)
- Mensagem de erro (se falhou)
- Formatação de datas pt-BR

---

## 🔐 Segurança

### RLS (Row Level Security)

As policies criadas permitem:
- ✅ **SELECT**: Usuários podem ver seus próprios agendamentos
- ✅ **INSERT**: Usuários podem criar agendamentos
- ✅ **UPDATE**: Usuários podem atualizar seus agendamentos
- ✅ **DELETE**: Usuários podem cancelar seus agendamentos

**⚠️ IMPORTANTE:** Ajustar policies quando adicionar autenticação real.

### Cron Secret

- **NUNCA** commitar `CRON_SECRET` no código
- Usar valores diferentes em dev/produção
- Adicionar no Vercel Dashboard → Settings → Environment Variables

---

## 📈 Monitoramento

### Vercel Dashboard

1. **Cron Logs:**
   - Dashboard → Deployments → Logs
   - Filtrar por `process-schedules`

2. **Métricas:**
   - Quantos agendamentos processados
   - Taxa de sucesso/falha
   - Tempo de execução

### Supabase Dashboard

1. **Table Editor:**
   - Ver status dos agendamentos
   - Checar tentativas e erros

2. **SQL Editor (Query útil):**
```sql
SELECT
  status,
  COUNT(*) as total,
  AVG(attempts) as avg_attempts
FROM content_generation_schedules
GROUP BY status;
```

---

## 🐛 Troubleshooting

### Agendamento não processou

1. **Verificar Cron ativo:**
   - Vercel Dashboard → Settings → Crons
   - Deve aparecer `/api/cron/process-schedules`

2. **Verificar logs:**
   ```bash
   vercel logs --follow
   ```

3. **Testar manualmente:**
   ```bash
   curl -X POST https://seu-dominio.vercel.app/api/cron/process-schedules \
     -H "Authorization: Bearer SEU_CRON_SECRET"
   ```

### Erro "Unauthorized" no Cron

- Verificar `CRON_SECRET` nas Environment Variables do Vercel
- Verificar se header `x-vercel-cron` está presente (Vercel adiciona automaticamente)

### Agendamento travou em "processing"

Execute no SQL Editor:
```sql
UPDATE content_generation_schedules
SET status = 'pending', attempts = 0
WHERE id = 'uuid-do-agendamento';
```

---

## 📅 Calendário de Conteúdo

**NOVO!** Interface visual completa para gerenciar agendamentos.

### Acesso
- **URL:** `/dashboard/calendar`
- **Menu:** Sidebar → Calendário

### Funcionalidades
✅ **Visualização mensal** com navegação (anterior/próximo/hoje)
✅ **Badges coloridos** por status (pendente, processando, concluído, falhou, cancelado)
✅ **Filtros** por status (todos, pendentes, concluídos, etc.)
✅ **Popover com detalhes** ao clicar em evento
✅ **Cancelar agendamento** direto no popover
✅ **Auto-refresh** a cada 30 segundos
✅ **Indicador de dia atual** (anel azul)
✅ **Responsivo** (mobile-first)
✅ **Zero deps** - 100% custom com Tailwind CSS

### Componentes
- **Página:** `app/dashboard/calendar/page.tsx`
- **Organism:** `components/organisms/content-calendar.tsx`
- **Molecules:**
  - `calendar-header.tsx` - Navegação e filtros
  - `calendar-day-cell.tsx` - Célula de dia com eventos
  - `calendar-event-badge.tsx` - Badge de evento
  - `event-detail-popover.tsx` - Detalhes do agendamento

### Legendas de Cores
- 🟡 **Amarelo** - Pendente
- 🔵 **Azul** - Processando
- 🟢 **Verde** - Concluído
- 🔴 **Vermelho** - Falhou
- ⚪ **Cinza** - Cancelado

---

## 🚀 Próximos Passos (Futuro)

- [ ] **Notificações:** Email/Push quando conteúdo for gerado
- [ ] **Recorrência:** Agendar geração semanal/mensal
- [ ] **Prioridade:** Fila com prioridades (express vs normal)
- [ ] **Dashboard Analytics:** Métricas de agendamentos
- [ ] **Webhook:** Chamar webhook externo quando concluir
- [ ] **Cancelamento em massa:** Cancelar vários de uma vez
- [ ] **Drag & drop:** Reagendar eventos arrastando no calendário
- [ ] **Criar agendamento:** Direto no calendário clicando em dia

---

**Desenvolvido por:** Pazos Media
**Versão:** 1.0
**Data:** 2026-02-22
