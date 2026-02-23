# 📅 Guia do Sistema de Agendamento de Conteúdo

## 🎯 Visão Geral

O Post Express possui um sistema completo de agendamento automático de geração de conteúdo. Você agenda quando quer que os carrosséis sejam gerados, e o sistema processa automaticamente no horário programado.

---

## 🔄 Como Funciona

### 1️⃣ Criar Agendamento

Acesse qualquer auditoria e clique em **"Agendar Geração"**. Configure:

- **Data/Hora**: Quando gerar o conteúdo
- **Quantidade**: Quantos carrosséis criar (1-20)
- **Tema** (opcional): Tema personalizado para o conteúdo

**Exemplo:**
```
Agendamento criado:
- Data: 23/02/2026, 15:30
- Quantidade: 10 carrosséis
- Tema: "Dicas de produtividade"
```

### 2️⃣ Processamento Automático

O sistema possui um **cron job no Vercel** que roda **a cada 5 minutos**:

```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-schedules",
      "schedule": "*/5 * * * *"  // A cada 5 minutos
    }
  ]
}
```

**O que acontece:**
1. Cron verifica se há agendamentos pendentes que já passaram da hora
2. Para cada agendamento pendente:
   - Marca como "processando"
   - Gera conteúdo via Claude API
   - Salva em `content_suggestions`
   - Marca como "concluído" e vincula ao conteúdo gerado

### 3️⃣ Status Possíveis

| Status | Cor | Descrição |
|--------|-----|-----------|
| 🟡 **Pendente** | Amarelo | Aguardando horário programado |
| 🔵 **Processando** | Azul | Gerando conteúdo agora |
| 🟢 **Concluído** | Verde | Conteúdo gerado com sucesso |
| 🔴 **Falhou** | Vermelho | Erro na geração (máx 3 tentativas) |
| ⚫ **Cancelado** | Cinza | Cancelado pelo usuário |

---

## 🖥️ Visualizar Agendamentos

### Calendário de Conteúdo

Acesse: **`/dashboard/calendar`**

**Interface:**
- 📅 **Calendário Visual**: Veja todos os agendamentos do mês
- 🎯 **Filtros**: Pendentes, Processando, Concluídos, Falhados
- 🔍 **Detalhes**: Clique em qualquer dia para ver agendamentos

**Recursos:**
- ⏱️ **Atualização Automática**: Refresh a cada 30s
- 🎨 **Indicadores Visuais**: Cores por status
- 📊 **Contador**: Quantidade de agendamentos por dia

### Ver Conteúdo Gerado

Quando um agendamento é **concluído** (🟢):

1. Clique no agendamento no calendário
2. Verá a mensagem:
   ```
   ✅ Conteúdo Gerado
   10 carrosséis foram criados com sucesso
   [Ver Conteúdo →]
   ```
3. Clique em **"Ver Conteúdo"** para ir direto para os carrosséis

---

## ⚡ Processar Manualmente (Desenvolvimento)

Em **desenvolvimento local**, o cron do Vercel **não roda automaticamente**.

### Solução: Botão Manual

No **Calendário**, clique em:

```
[▶ Processar Agendamentos]
```

Isso executa manualmente o processamento de todos os agendamentos pendentes.

**Resultado:**
```
✅ Processamento concluído!

Processados: 1
Sucesso: 1
Falhas: 0
```

---

## 🔧 Configuração Técnica

### Variáveis de Ambiente

Adicione ao `.env`:

```bash
# Cron Secret (autenticação)
CRON_SECRET=dev-secret-change-in-production
NEXT_PUBLIC_CRON_SECRET=dev-secret-change-in-production
```

⚠️ **IMPORTANTE:** Em produção, use um valor aleatório forte!

### Rotas API

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/schedules` | GET | Listar agendamentos |
| `/api/schedules` | POST | Criar agendamento |
| `/api/schedules/[id]` | GET | Detalhes do agendamento |
| `/api/schedules/[id]` | PATCH | Editar agendamento |
| `/api/schedules/[id]` | DELETE | Cancelar agendamento |
| `/api/cron/process-schedules` | POST | Processar agendamentos (cron) |

### Banco de Dados

**Tabela:** `content_generation_schedules`

```sql
CREATE TABLE content_generation_schedules (
  id UUID PRIMARY KEY,
  audit_id UUID REFERENCES audits(id),
  profile_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  quantity INTEGER CHECK (quantity >= 1 AND quantity <= 20),
  custom_theme TEXT,
  status schedule_status_enum DEFAULT 'pending',
  content_suggestion_id UUID REFERENCES content_suggestions(id),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Fluxo Completo

```mermaid
graph TD
    A[Usuário cria agendamento] --> B[Salvo com status: pending]
    B --> C{Chegou a hora?}
    C -->|Sim| D[Cron pega o agendamento]
    C -->|Não| B
    D --> E[Marca como: processing]
    E --> F[Gera conteúdo via Claude]
    F -->|Sucesso| G[Salva em content_suggestions]
    F -->|Erro| H{Tentativa < 3?}
    G --> I[Marca como: completed]
    H -->|Sim| B
    H -->|Não| J[Marca como: failed]
    I --> K[Usuário vê no calendário]
    K --> L[Clica em Ver Conteúdo]
    L --> M[Vai para /dashboard/audits/ID/create-content]
```

---

## 📝 Exemplos de Uso

### Caso 1: Agendamento Simples

```javascript
// Criar agendamento
POST /api/schedules
{
  "auditId": "uuid-da-auditoria",
  "profileId": "uuid-do-perfil",
  "scheduledAt": "2026-02-24T09:00:00Z",
  "quantity": 5
}

// Resposta
{
  "schedule": {
    "id": "uuid-gerado",
    "status": "pending",
    "scheduled_at": "2026-02-24T09:00:00Z",
    "quantity": 5
  }
}
```

### Caso 2: Agendamento com Tema

```javascript
POST /api/schedules
{
  "auditId": "uuid",
  "profileId": "uuid",
  "scheduledAt": "2026-02-24T14:00:00Z",
  "quantity": 10,
  "customTheme": "Estratégias de marketing para Black Friday"
}
```

### Caso 3: Cancelar Agendamento

```javascript
DELETE /api/schedules/uuid-do-agendamento

// Resposta
{
  "message": "Agendamento cancelado com sucesso"
}
```

---

## ❓ FAQ

### P: O agendamento não foi processado automaticamente. Por quê?

**R:** Em desenvolvimento local, o cron não roda automaticamente. Use o botão **"Processar Agendamentos"** no calendário.

### P: Posso agendar para o passado?

**R:** Não! O sistema valida que `scheduled_at > created_at`. Se tentar, receberá erro:
```
"A data agendada deve ser no futuro"
```

### P: Quantos carrosséis posso gerar de uma vez?

**R:** Mínimo 1, máximo 20. Essa validação está no banco e na API.

### P: O que acontece se a geração falhar?

**R:** O sistema tenta **até 3 vezes**. Depois disso, marca como `failed` e salva o `error_message`.

### P: Posso editar um agendamento já criado?

**R:** Sim, desde que ainda esteja `pending` ou `failed`. Use:
```javascript
PATCH /api/schedules/uuid
{
  "scheduledAt": "2026-02-25T10:00:00Z",
  "quantity": 15
}
```

### P: Onde ficam os conteúdos gerados?

**R:** Em `content_suggestions`, com flag `created_by_schedule: true`. O agendamento tem o campo `content_suggestion_id` apontando para ele.

---

## 🔍 Debug

### Ver logs do cron (Vercel)

```bash
# Logs em produção
vercel logs --follow

# Buscar logs de cron
vercel logs | grep "process-schedules"
```

### Executar cron manualmente (desenvolvimento)

```bash
# Via curl
curl -X POST http://localhost:3000/api/cron/process-schedules \
  -H "Authorization: Bearer dev-secret-change-in-production"

# Ou use o botão no calendário (/dashboard/calendar)
```

### Verificar agendamentos pendentes

```bash
# SQL direto no Supabase
SELECT * FROM content_generation_schedules
WHERE status = 'pending'
  AND scheduled_at <= NOW()
ORDER BY scheduled_at ASC;
```

---

**Versão:** 1.0
**Data:** 23/02/2026
**Desenvolvido por:** Pazos Media | Post Express
