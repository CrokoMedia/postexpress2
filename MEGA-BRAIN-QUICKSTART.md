# 🧠 Mega Brain - Guia Rápido

> **Sistema de Clonagem Cognitiva Industrial integrado ao Post Express**

---

## ⚡ Início Rápido

### 1. Setup Inicial (5 minutos)

```bash
# Entrar no diretório
cd mega-brain

# Copiar env template
cp .env.example .env

# Instalar dependências
npm install --legacy-peer-deps
```

### 2. Configurar Variáveis de Ambiente

Editar `mega-brain/.env`:

```env
# OBRIGATÓRIO - Transcrição de vídeos
OPENAI_API_KEY=sk-...

# RECOMENDADO - Busca semântica
VOYAGE_API_KEY=...

# OPCIONAL - Scripts standalone
ANTHROPIC_API_KEY=...
```

### 3. Testar Comandos

Via Claude Code (no terminal):

```bash
# Status operacional
/jarvis-briefing

# Salvar sessão
/save

# Retomar sessão
/resume
```

---

## 📁 O que é o Mega Brain?

Sistema que transforma **conteúdo de experts** em **agentes operacionais**.

```
Vídeos do Gary Vaynerchuk
        ↓
    [Mega Brain]
        ↓
DNA Gary (5 camadas) + Agente Operacional
        ↓
Content Squad usa DNA para criar carrosséis
```

---

## 🎯 Principais Casos de Uso

### 1. Clonar Expert para Content Squad

```bash
# 1. Adicionar conteúdo do expert
cp -r expansion-packs/etl-data-collector/minds/gary_vaynerchuk/sources/* mega-brain/inbox/

# 2. Processar no Pipeline JARVIS
/jarvis-full

# 3. Sistema cria automaticamente:
# - knowledge/dna/GARY-VAYNERCHUK/
# - agents/persons/GARY-VAYNERCHUK/
```

### 2. Criar Playbook Operacional

```bash
# Consolidar padrões de 3 perfis auditados em:
# mega-brain/knowledge/playbooks/INSTAGRAM-CAROUSELS.md

# Content Squad usa playbook ao gerar carrosséis
```

### 3. Conselho de Experts (Conclave)

```bash
# Ativar debate entre agentes
/conclave "Como criar carrossel viral sobre [TEMA]?"

# Agentes participam:
# - CMO (marketing)
# - Gary Vaynerchuk (conteúdo)
# - CLOSER (conversão)
# - CRITIC (validação)
```

---

## 📊 DNA Schema (5 Camadas)

| Camada | O que contém |
|--------|--------------|
| **L1: FILOSOFIAS** | Crenças fundamentais, visão de mundo |
| **L2: MODELOS-MENTAIS** | Frameworks de pensamento |
| **L3: HEURÍSTICAS** | Regras práticas, atalhos |
| **L4: FRAMEWORKS** | Metodologias estruturadas |
| **L5: METODOLOGIAS** | Implementações passo-a-passo |

---

## 🤖 Agentes Disponíveis

### Agentes de Sistema
- **JARVIS** - Orquestrador principal
- **CRO** - Chief Revenue Officer (vendas)
- **CMO** - Chief Marketing Officer (marketing)
- **COO** - Chief Operating Officer (operações)

### Agentes de Sales
- **CLOSER** - Especialista em fechamento
- **BDR** - Business Development Rep

### Agentes de Pessoa (em construção)
- **Gary Vaynerchuk** - Clone cognitivo (em processo)
- **Alex Hormozi** - Planejado
- **Jeremy Haynes** - Planejado

---

## 📚 Documentação Completa

| Arquivo | Propósito |
|---------|-----------|
| `mega-brain/INTEGRACAO-POSTEXPRESS.md` | 📖 Guia completo de integração |
| `mega-brain/README.md` | 📘 Documentação completa do Mega Brain |
| `mega-brain/.claude/CLAUDE.md` | ⚙️ Instruções Claude Code |
| `CLAUDE.md` | 🎯 Instruções Post Express (com seção Mega Brain) |

---

## ⚠️ Regras de Ouro (JARVIS)

1. **JARVIS é parceiro operacional** - Não assistente genérico
2. **Fases são sequenciais** - Não pular etapas
3. **Logging obrigatório** - Todo batch gera log
4. **Rastreabilidade 100%** - Toda afirmação tem citação
5. **Templates são lei** - Não criar estrutura customizada

---

## 🚀 Próximos Passos

### Imediato (hoje)
- [ ] Configurar .env do Mega Brain
- [ ] Testar /jarvis-briefing
- [ ] Explorar estrutura de pastas

### Curto prazo (1-2 semanas)
- [ ] Processar conteúdo Gary Vaynerchuk
- [ ] Extrair DNA (5 camadas)
- [ ] Criar agente GARY-VAYNERCHUK
- [ ] Testar geração de conteúdo com DNA

### Médio prazo (1 mês)
- [ ] Consolidar playbooks de Instagram
- [ ] Integrar playbooks ao Content Squad
- [ ] Configurar /conclave
- [ ] Processar Alex Hormozi

---

**Última atualização:** 2026-03-01
**Versão:** 1.0
