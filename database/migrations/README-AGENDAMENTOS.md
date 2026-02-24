# Sistema de Agendamentos - Instruções de Instalação

## 📋 O que é?

O sistema de agendamentos permite criar agendamentos futuros para geração automática de conteúdo, sem bloquear a geração manual.

**IMPORTANTE:** A geração manual de conteúdo funciona **independentemente** do sistema de agendamentos estar ativado ou não.

---

## ✅ Status Atual

- ✅ Geração manual de conteúdo: **FUNCIONANDO** (botão "Gerar Novas Sugestões")
- ⚠️ Sistema de agendamentos: **OPCIONAL** (requer migration)

---

## 🚀 Como Ativar o Sistema de Agendamentos

### Passo 1: Rodar a Migration no Supabase

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `003-add-content-schedules.sql`
4. Cole no SQL Editor e clique em **Run**

Ou execute via CLI:

```bash
# No terminal, na raiz do projeto
cat database/migrations/003-add-content-schedules.sql | pbcopy
# Cole no SQL Editor do Supabase e execute
```

### Passo 2: Verificar Instalação

Após rodar a migration, recarregue a página de "Criar Conteúdo". Você deverá ver:

- ✅ Botão "Agendar Geração" aparece
- ✅ Lista de agendamentos futuros (se houver)
- ✅ Sem erros no console

---

## 📦 O que a Migration Cria

- **Tabela:** `content_generation_schedules` - Armazena agendamentos
- **Enum:** `schedule_status_enum` - Status dos agendamentos (pending, processing, completed, etc.)
- **View:** `active_schedules` - Agendamentos ativos
- **Indexes:** Para performance
- **RLS Policies:** Para segurança (configurar autenticação depois)

---

## 🔧 Configuração do Worker (CRON)

Para processar os agendamentos automaticamente, configure o Vercel CRON:

1. No arquivo `vercel.json` (raiz do projeto), adicione:

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

2. Faça deploy no Vercel
3. O worker vai rodar a cada 5 minutos

---

## 🧪 Como Testar

1. Vá em **Criar Conteúdo** de qualquer auditoria
2. Clique em **"Agendar Geração"**
3. Escolha data/hora futura
4. Defina quantidade de carrosséis
5. Salve
6. Aguarde o horário agendado (ou rode manualmente o CRON)

---

## ❓ FAQ

### A geração manual ainda funciona sem a migration?

**SIM!** O botão "Gerar Novas Sugestões" funciona normalmente. O sistema de agendamentos é **totalmente opcional**.

### O que acontece se eu não rodar a migration?

Nada! A geração manual continua funcionando. Você simplesmente não terá a opção de agendar gerações futuras.

### Preciso configurar o CRON worker?

Só se você quiser que os agendamentos sejam processados **automaticamente**. Você também pode processar manualmente via:

```bash
curl -X GET https://seu-dominio.vercel.app/api/cron/process-schedules
```

---

## 🐛 Solução de Problemas

### Erro: "Could not find the table 'content_generation_schedules'"

**Causa:** Migration não foi executada no banco.

**Solução:** Rode a migration `003-add-content-schedules.sql` no SQL Editor do Supabase.

### Agendamentos não processam automaticamente

**Causa:** Worker CRON não está configurado.

**Solução:** Adicione a configuração CRON no `vercel.json` e faça deploy.

---

## 📝 Arquivos Relacionados

- **Migration:** `database/migrations/003-add-content-schedules.sql`
- **API Routes:**
  - `app/api/schedules/route.ts` - CRUD de agendamentos
  - `app/api/cron/process-schedules/route.ts` - Worker
- **Componentes:**
  - `components/molecules/schedule-content-modal.tsx` - Modal de agendamento
  - `components/molecules/scheduled-content-list.tsx` - Lista de agendamentos

---

**Última atualização:** 2026-02-22
