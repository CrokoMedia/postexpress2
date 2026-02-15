# 📋 Épicos do Post Express

**Projeto**: Post Express - Sistema de Criação de Conteúdo Automatizado
**Product Manager**: @pm (Morgan)
**Data de Criação**: 2026-02-16
**Timeline Total**: 10 semanas (2.5 meses)

---

## 🎯 VISÃO GERAL

Este documento lista todos os épicos do projeto Post Express em ordem de execução.

**Total de Épicos**: 8
**Status Geral**: ⏳ Pendente (aguardando início)

---

## 📊 ÉPICOS EM ORDEM DE EXECUÇÃO

### **EPIC-001: Fundação & Setup** ✅
- **Arquivo**: `EPIC-001-fundacao-setup.md`
- **Duração**: 1 semana (Semana 1)
- **Responsáveis**: @devops + @architect
- **Status**: ⏳ Pendente
- **Prioridade**: 🔴 Crítica
- **Objetivo**: Configurar ambiente AIOS-Core, estrutura de pastas, schema Supabase

**Dependências**:
- Nenhuma (épico inicial)

**Bloqueia**:
- EPIC-002, EPIC-003, EPIC-006

---

### **EPIC-002: Pipeline de Dados (Apify → Supabase)** 🔄
- **Arquivo**: `EPIC-002-pipeline-dados.md`
- **Duração**: 1 semana (Semana 2)
- **Responsáveis**: @data-engineer + @analyst
- **Status**: ⏳ Pendente
- **Prioridade**: 🔴 Crítica
- **Objetivo**: ETL completo de Instagram, TikTok, YouTube via Apify

**Dependências**:
- ✅ EPIC-001 (Schema Supabase + Apify MCP)

**Bloqueia**:
- EPIC-003 (precisa de dados para auditar)

---

### **EPIC-003: Squad Auditores** 🧠
- **Arquivo**: `EPIC-003-squad-auditores.md`
- **Duração**: 1 semana (Semana 3)
- **Responsáveis**: @dev + Mind Mapper
- **Status**: ⏳ Pendente
- **Prioridade**: 🔴 Alta
- **Objetivo**: 5 mentes auditoras + Score Card automatizado

**Dependências**:
- ✅ EPIC-002 (dados disponíveis)

**Bloqueia**:
- EPIC-004 (criação usa insights)

**Gate de Qualidade 1**: Após este épico

---

### **EPIC-004: Squad Criação** 🎨
- **Arquivo**: `EPIC-004-squad-criacao.md`
- **Duração**: 1 semana (Semana 4)
- **Responsáveis**: @dev + Mind Mapper
- **Status**: ⏳ Pendente
- **Prioridade**: 🔴 Alta
- **Objetivo**: 5 mentes criadoras + workflow de 7 fases

**Dependências**:
- ✅ EPIC-003 (insights da auditoria)

**Bloqueia**:
- EPIC-005 (Cloudinary precisa do copy)

**Gate de Qualidade 2**: Após este épico

---

### **EPIC-005: Geração Visual (Cloudinary)** 🖼️
- **Arquivo**: `EPIC-005-geracao-visual.md`
- **Duração**: 1 semana (Semana 5)
- **Responsáveis**: @ux-design-expert + @dev
- **Status**: ⏳ Pendente
- **Prioridade**: 🟡 Média
- **Objetivo**: Templates tweet-style + integração Cloudinary

**Dependências**:
- ✅ EPIC-004 (copy dos carrosséis)

**Bloqueia**:
- EPIC-007 (integração end-to-end)

---

### **EPIC-006: Portal do Cliente** 🌐
- **Arquivo**: `EPIC-006-portal-cliente.md`
- **Duração**: 2 semanas (Semanas 6-7)
- **Responsáveis**: @ux-design + @architect + @dev
- **Status**: ⏳ Pendente
- **Prioridade**: 🔴 Alta
- **Objetivo**: Portal Next.js com aprovação de carrosséis

**Dependências**:
- ✅ EPIC-002 (Supabase)
- ✅ EPIC-005 (imagens geradas)

**Bloqueia**:
- EPIC-007 (integração)

---

### **EPIC-007: Integração & Deploy** 🚀
- **Arquivo**: `EPIC-007-integracao-deploy.md`
- **Duração**: 1 semana (Semana 8)
- **Responsáveis**: @dev + @devops
- **Status**: ⏳ Pendente
- **Prioridade**: 🔴 Crítica
- **Objetivo**: Fluxo end-to-end + deploy produção

**Dependências**:
- ✅ EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006

**Bloqueia**:
- EPIC-008 (Beta)

**Gate de Qualidade 3**: Após este épico

---

### **EPIC-008: Beta & Validação** 🧪
- **Arquivo**: `EPIC-008-beta-validacao.md`
- **Duração**: 2 semanas (Semanas 9-10)
- **Responsáveis**: @pm + @qa
- **Status**: ⏳ Pendente
- **Prioridade**: 🟡 Média
- **Objetivo**: 5 clientes beta + 50 carrosséis + feedback

**Dependências**:
- ✅ EPIC-007 (sistema completo)

---

## 📊 CRONOGRAMA VISUAL

```
Semana 1:  [EPIC-001] Fundação
Semana 2:  [EPIC-002] Pipeline Dados
Semana 3:  [EPIC-003] Squad Auditores (Gate 1)
Semana 4:  [EPIC-004] Squad Criação (Gate 2)
Semana 5:  [EPIC-005] Geração Visual
Semana 6:  [EPIC-006] Portal Cliente ──┐
Semana 7:  [EPIC-006] Portal Cliente ──┘
Semana 8:  [EPIC-007] Integração & Deploy (Gate 3)
Semana 9:  [EPIC-008] Beta ──┐
Semana 10: [EPIC-008] Beta ──┘
```

---

## 🚦 GATES DE QUALIDADE

### **Gate 1**: Após EPIC-003 (Squad Auditores)
- Responsável: @qa
- Critérios: Score Card validado, 10 auditorias sem erro

### **Gate 2**: Após EPIC-004 (Squad Criação)
- Responsável: @qa + @pm
- Critérios: 20 carrosséis, >80% aprovação, <15min tempo

### **Gate 3**: Após EPIC-007 (Integração)
- Responsável: @qa
- Critérios: Fluxo end-to-end, 0 erros críticos, 3 clientes fake

---

## 📈 MÉTRICAS DE SUCESSO DO PROJETO

| Métrica | Meta | Épico Relacionado |
|---------|------|-------------------|
| Tempo de setup ambiente | < 2 horas | EPIC-001 |
| Taxa de sucesso scraping | > 95% | EPIC-002 |
| Score Card accuracy | > 90% | EPIC-003 |
| Qualidade de copy | > 80% aprovação | EPIC-004 |
| Performance rendering | < 5s/slide | EPIC-005 |
| Mobile responsiveness | 100% | EPIC-006 |
| Uptime produção | > 99% | EPIC-007 |
| NPS Beta | > 8 | EPIC-008 |

---

## 🎯 PRÓXIMOS PASSOS

### **Agora**:
1. ✅ Épicos criados
2. ⏳ Aguardando aprovação do cliente
3. ⏳ Próximo: Delegar para @sm (criar stories detalhadas)

### **Comandos para Começar**:

```bash
# Opção 1: Delegar stories para @sm
@sm *draft --epic=EPIC-001

# Opção 2: Executar épico direto (se houver execution plan)
@pm *execute-epic docs/epics/EPIC-001-fundacao-setup.md

# Opção 3: Começar diretamente com @devops
@devops *setup-mcp-docker
```

---

## 📝 NOTAS IMPORTANTES

- **Épicos são bloqueantes**: Respeitar ordem de dependências
- **Gates são obrigatórios**: Não pular para próximo épico sem passar no gate
- **Documentação contínua**: Atualizar status conforme progresso
- **Comunicação entre agentes**: Usar handoff protocol definido no roadmap

---

## 🔗 REFERÊNCIAS

- **Roadmap Completo**: `../ROADMAP_AIOS_ORCHESTRATED.md`
- **PRD Original**: `../PostExpress_PRD.txt`
- **Análise do Analista**: `../MAPEAMENTO_MENTES_DISPONIVEIS.md`

---

**Última Atualização**: 2026-02-16
**Por**: @pm (Morgan)
**Status**: Épicos criados, aguardando início
