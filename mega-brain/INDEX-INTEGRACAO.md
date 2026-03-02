# 📍 Índice de Integração - Mega Brain + Post Express

> **Início rápido:** Documentos principais para integração com Post Express

---

## 🚀 Início Rápido (escolha seu nível)

### 1. **Iniciante** - Nunca usei o Mega Brain
👉 Comece aqui: [`../MEGA-BRAIN-QUICKSTART.md`](../MEGA-BRAIN-QUICKSTART.md)
- Setup inicial em 5 minutos
- Comandos básicos
- Primeiros passos

### 2. **Intermediário** - Quero entender a integração
👉 Leia isso: [`INTEGRACAO-POSTEXPRESS.md`](./INTEGRACAO-POSTEXPRESS.md)
- Como ETL Data Collector → Mega Brain → Content Squad
- Fluxos de integração completos
- Casos de uso detalhados

### 3. **Avançado** - Quero ver o status atual
👉 Verifique: [`../STATUS-INTEGRACAO-MEGABRAIN.md`](../STATUS-INTEGRACAO-MEGABRAIN.md)
- O que está pronto
- O que falta fazer
- Métricas de progresso

---

## 📚 Documentação Principal

### Documentos de Integração (criados hoje)
```
📄 MEGA-BRAIN-QUICKSTART.md          # Guia rápido (raiz do projeto)
📄 INTEGRACAO-POSTEXPRESS.md         # Guia completo (dentro de mega-brain/)
📄 STATUS-INTEGRACAO-MEGABRAIN.md    # Status atual (raiz do projeto)
📄 INDEX-INTEGRACAO.md               # Este arquivo (dentro de mega-brain/)
```

### Documentos Originais do Mega Brain
```
📘 README.md                         # Documentação completa do Mega Brain
📘 .claude/CLAUDE.md                 # Instruções para Claude Code
📘 system/02-JARVIS-SOUL.md          # Personalidade JARVIS
📘 system/03-JARVIS-DNA.yaml         # Framework cognitivo JARVIS
```

### Documentos do Post Express
```
📗 CLAUDE.md                         # Instruções principais (com seção Mega Brain)
📗 README-APP.md                     # Documentação técnica do app
📗 FLUXO-COMPLETO-SISTEMA.md         # Fluxo de análise Instagram
```

---

## 🎯 Comandos Disponíveis

### Via Claude Code (terminal)
```bash
/jarvis-briefing        # Status operacional + health score
/jarvis-full            # Pipeline completo (ingest + process + enrich)
/conclave               # Sessão do Conselho (debate multi-agente)
/ingest                 # Ingestão de material novo
/save                   # Salvar sessão atual
/resume                 # Retomar sessão anterior
```

### Via CLI (dentro de mega-brain/)
```bash
npm run install-wizard  # Wizard de instalação
npm run validate        # Validar configuração
```

---

## 📁 Navegação Rápida

### Estrutura Principal
```
mega-brain/
├── 📄 INDEX-INTEGRACAO.md           ← Você está aqui
├── 📄 INTEGRACAO-POSTEXPRESS.md     ← Guia completo
├── 📘 README.md                     ← Docs originais
├── 📋 .env.example                  ← Template de credenciais
├── 📦 package.json                  ← Dependências
│
├── 📂 inbox/                        ← Materiais brutos
├── 📂 knowledge/                    ← Base de conhecimento
│   ├── dna/                        ← DNA schemas
│   ├── playbooks/                  ← Playbooks operacionais
│   └── dossiers/                   ← Dossiês temáticos
│
├── 📂 agents/                       ← Agentes especializados
│   ├── council/                    ← Conselho (CRITIC, ADVOCATE, SYNTHESIZER)
│   ├── cargo/                      ← Funções (CRO, CMO, SDS, CLOSER)
│   └── persons/                    ← Clones de experts
│
└── 📂 .claude/                      ← Configurações Claude Code
    ├── commands/                   ← Comandos slash
    ├── skills/                     ← Skills especializadas
    └── rules/                      ← Regras do sistema
```

### Agentes Prontos
```
Council (Deliberação):
├── CRITIC                          ← Crítico metodológico
├── DEVILS-ADVOCATE                 ← Advogado do diabo
└── SYNTHESIZER                     ← Sintetizador

Cargo/Sales:
├── SDS                             ← Sales Development Specialist
├── LNS                             ← Lead Nurturing Specialist
├── BDR                             ← Business Development Rep
└── CLOSER                          ← Especialista em fechamento
```

---

## ⚡ Setup de 12 Minutos

```bash
# 1. Configurar credenciais (5 min)
cp .env.example .env
# Editar .env com OPENAI_API_KEY, VOYAGE_API_KEY

# 2. Instalar dependências (5 min)
npm install --legacy-peer-deps

# 3. Testar comando inicial (2 min)
# Via Claude Code: /jarvis-briefing
```

---

## 🎯 Casos de Uso Imediatos

### 1. Conselho de Deliberação
```bash
/conclave "Como criar carrossel viral sobre autoridade?"
# Agentes: CRITIC, DEVILS-ADVOCATE, SYNTHESIZER
```

### 2. Clone de Expert (Gary Vaynerchuk)
```bash
# Conteúdo já coletado: 25 vídeos + 99 posts
# Processar: /jarvis-full
# Resultado: DNA Gary + Agente operacional
```

### 3. Playbook Operacional
```bash
# Consolidar padrões de auditorias em:
# knowledge/playbooks/INSTAGRAM-CAROUSELS.md
```

---

## 🆘 Ajuda Rápida

| Preciso de... | Vá para... |
|---------------|------------|
| Setup inicial | [`../MEGA-BRAIN-QUICKSTART.md`](../MEGA-BRAIN-QUICKSTART.md) |
| Entender integração | [`INTEGRACAO-POSTEXPRESS.md`](./INTEGRACAO-POSTEXPRESS.md) |
| Ver status atual | [`../STATUS-INTEGRACAO-MEGABRAIN.md`](../STATUS-INTEGRACAO-MEGABRAIN.md) |
| Documentação completa | [`README.md`](./README.md) |
| Instruções Claude | [`.claude/CLAUDE.md`](./.claude/CLAUDE.md) |

---

**Última atualização:** 2026-03-01
**Versão:** 1.0
