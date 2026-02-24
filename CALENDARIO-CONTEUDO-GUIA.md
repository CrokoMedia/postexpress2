# 📅 Calendário de Conteúdo - Guia de Uso

## 🎯 O que é?

O **Calendário de Conteúdo** é uma interface visual que permite visualizar e gerenciar todos os seus agendamentos de geração de conteúdo em formato de calendário mensal.

---

## 🚀 Como Acessar

1. **Via Menu Lateral:**
   - Clique em **"Calendário"** na barra lateral esquerda
   - Ou acesse diretamente: `/dashboard/calendar`

2. **Via URL:**
   ```
   https://seu-dominio.com/dashboard/calendar
   ```

---

## 📖 Funcionalidades

### 1️⃣ **Visualizar Agendamentos**

- **Vista Mensal:** Veja todos os agendamentos do mês atual
- **Navegação:** Use as setas `←` `→` para navegar entre meses
- **Voltar para Hoje:** Clique em "Hoje" para retornar ao mês atual

### 2️⃣ **Filtrar por Status**

No topo do calendário, clique nos botões de filtro:

- **Todos** - Mostra todos os agendamentos
- **Pendentes** - Apenas agendamentos aguardando processamento
- **Processando** - Agendamentos em geração no momento
- **Concluídos** - Agendamentos que foram processados com sucesso
- **Falhados** - Agendamentos que falharam após 3 tentativas

### 3️⃣ **Ver Detalhes de um Agendamento**

**Clique em qualquer badge colorido** no calendário para abrir o popover de detalhes.

O popover mostra:
- ✅ Data e horário agendado
- ✅ Perfil (@username)
- ✅ Quantidade de carrosséis
- ✅ Tema personalizado (se houver)
- ✅ Status atual
- ✅ Mensagem de erro (se falhou)

### 4️⃣ **Cancelar um Agendamento**

1. Clique no agendamento para abrir o popover
2. Clique em **"Cancelar Agendamento"** (botão vermelho)
3. Confirme a ação
4. ✅ O agendamento será marcado como **Cancelado** e não será mais processado

---

## 🎨 Legendas de Cores

Cada agendamento tem uma cor diferente baseada no status:

| Cor | Status | Significado |
|-----|--------|-------------|
| 🟡 **Amarelo** | Pendente | Aguardando horário agendado |
| 🔵 **Azul** | Processando | Gerando conteúdo agora (Claude API) |
| 🟢 **Verde** | Concluído | Conteúdo gerado com sucesso |
| 🔴 **Vermelho** | Falhou | Erro após 3 tentativas |
| ⚪ **Cinza** | Cancelado | Cancelado pelo usuário |

---

## 🔄 Auto-Refresh

O calendário **atualiza automaticamente a cada 30 segundos** para mostrar o status mais recente dos agendamentos.

Você não precisa recarregar a página manualmente!

---

## 📱 Responsivo

O calendário é **100% responsivo** e funciona perfeitamente em:
- 🖥️ Desktop
- 💻 Laptop
- 📱 Tablet
- 📱 Mobile

---

## 🔗 Integração com Agendamento

O calendário mostra **todos os agendamentos criados** via:

1. **Modal de Agendamento** (em "Criar Conteúdo")
2. **API** `/api/schedules` (integração externa)
3. **Qualquer fonte** que crie registros na tabela `content_generation_schedules`

---

## 💡 Dicas de Uso

### ✅ **Planeje seu conteúdo**
- Use o calendário para visualizar quando cada conteúdo será gerado
- Evite sobrecarga: não agende muitos conteúdos no mesmo dia

### ✅ **Monitore falhas**
- Agendamentos vermelhos (falhou) precisam de atenção
- Clique para ver a mensagem de erro e entender o problema

### ✅ **Cancele quando necessário**
- Se mudou de estratégia, cancele agendamentos desnecessários
- Isso evita desperdício de créditos da API Claude

### ✅ **Use filtros para foco**
- Filtre por "Pendentes" para ver o que está por vir
- Filtre por "Falhados" para resolver problemas rapidamente

---

## 🛠️ Componentes Técnicos

Para desenvolvedores:

### Estrutura de Arquivos
```
app/dashboard/calendar/
└── page.tsx                           # Página principal

components/
├── organisms/
│   └── content-calendar.tsx           # Calendário completo (lógica + grid)
├── molecules/
│   ├── calendar-header.tsx            # Navegação (mês, filtros)
│   ├── calendar-day-cell.tsx          # Célula de dia (com eventos)
│   ├── calendar-event-badge.tsx       # Badge de evento (cor + info)
│   └── event-detail-popover.tsx       # Popover de detalhes
```

### APIs Utilizadas
- `GET /api/schedules` - Busca todos os agendamentos
- `DELETE /api/schedules/[id]` - Cancela agendamento

### Biblioteca de Data Fetching
- **SWR** - Com auto-refresh a cada 30s

### Estilo
- **100% Tailwind CSS** - Zero deps de bibliotecas de calendário
- **Atomic Design** - Componentes reutilizáveis

---

## 🐛 Troubleshooting

### Calendário não carrega

**Causa:** Erro na API ou banco de dados sem migration

**Solução:**
1. Verifique se a migration `003-add-content-schedules.sql` foi executada
2. Abra o console do navegador (F12) e veja erros
3. Verifique logs do Supabase

### Agendamentos não aparecem

**Causa:** Filtro ativo ou range de data errado

**Solução:**
1. Clique em "Todos" no filtro
2. Clique em "Hoje" para voltar ao mês atual
3. Navegue pelos meses com as setas

### Cores não aparecem

**Causa:** Status do agendamento inválido

**Solução:**
- Verifique no banco se o campo `status` está correto
- Valores válidos: `pending`, `processing`, `completed`, `failed`, `cancelled`

---

## 📊 Métricas e Analytics (Futuro)

Em breve, o calendário terá:
- 📈 **Dashboard de métricas** (taxa de sucesso, média de tempo)
- 📧 **Notificações** quando agendamentos forem concluídos
- 🔁 **Recorrência** (agendar semanal/mensal)
- 🎯 **Drag & drop** para reagendar

---

**Desenvolvido por:** Pazos Media
**Versão:** 1.0
**Data:** 2026-02-22
