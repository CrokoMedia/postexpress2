# Integração Mega Brain + Post Express (Croko Lab)

> **Data de integração:** 2026-03-01
> **Versão Mega Brain:** 1.2.10
> **Versão Post Express:** 2.0

---

## 🎯 Objetivo da Integração

Integrar o **Mega Brain** (sistema de clonagem cognitiva industrial) ao **Post Express** para:

1. **Transformar conhecimento dos experts** (Gary Vaynerchuk, Alex Hormozi, etc.) em **agentes operacionais**
2. **Alimentar o Content Creation Squad** com frameworks dos experts clonados
3. **Criar DNA de Conteúdo** baseado em análise de milhares de posts auditados
4. **Gerar playbooks operacionais** para criação de carrosséis de alta conversão

---

## 📁 Estrutura Integrada

```
postexpress2/
├── mega-brain/                    # Sistema completo do Mega Brain
│   ├── inbox/                     # Materiais brutos (vídeos, PDFs, transcrições)
│   ├── knowledge/                 # Base de conhecimento (DNAs, dossiers, playbooks)
│   │   ├── dna/                   # DNA schemas dos experts
│   │   ├── playbooks/             # Playbooks operacionais
│   │   └── dossiers/              # Dossiês temáticos
│   ├── agents/                    # Agentes especializados
│   │   ├── persons/               # Agentes de pessoas (clones de experts)
│   │   └── cargo/                 # Agentes de função (CRO, CMO, etc.)
│   └── .claude/                   # Configurações Claude Code
│       ├── commands/              # Comandos slash (conclave, jarvis, etc.)
│       └── skills/                # Skills especializadas
│
├── expansion-packs/               # ETL Data Collector
│   └── etl-data-collector/        # Coleta de dados de Instagram, YouTube, etc.
│
├── squad-auditores/               # Sistema de auditoria de conteúdo
├── content-creation-squad/        # Criação de carrosséis
└── content-distillery/            # Destilação de frameworks de vídeos
```

---

## 🔄 Fluxos de Integração

### Fluxo 1: Expert → DNA → Content Squad

```
1. Coletar conteúdo do expert (ETL Data Collector)
   └── Gary Vaynerchuk: 25 vídeos YouTube + 99 Instagram posts

2. Processar no Mega Brain (Pipeline)
   └── inbox/ → processing/ → knowledge/dna/

3. Extrair DNA do expert (5 camadas)
   ├── L1: FILOSOFIAS
   ├── L2: MODELOS-MENTAIS
   ├── L3: HEURÍSTICAS
   ├── L4: FRAMEWORKS
   └── L5: METODOLOGIAS

4. Criar agente do expert (Mega Brain)
   └── agents/persons/GARY-VAYNERCHUK/
       ├── AGENT.md (11 partes obrigatórias)
       ├── SOUL.md (personalidade e voz)
       └── DNA-CONFIG.yaml (conhecimento estruturado)

5. Alimentar Content Squad
   └── Content Creation Squad usa DNA + frameworks do expert
       para gerar carrosséis no estilo Gary Vaynerchuk
```

### Fluxo 2: Auditoria → Playbook → Geração

```
1. Auditar perfis do Instagram (Squad Auditores)
   └── Extrair padrões, hooks, estruturas vencedoras

2. Consolidar em playbooks (Mega Brain)
   └── knowledge/playbooks/INSTAGRAM-CAROUSELS.md

3. Content Squad usa playbook
   └── Geração de carrosséis baseada em padrões comprovados
```

### Fluxo 3: Livestream → Frameworks → Conteúdo

```
1. Processar livestream YouTube (Content Distillery)
   └── Extrair frameworks, heurísticas, modelos mentais

2. Armazenar no Mega Brain
   └── knowledge/dossiers/themes/[TEMA]/

3. Referenciar em criação de conteúdo
   └── Content Squad acessa frameworks para carrosséis educacionais
```

---

## 🤖 Agentes Disponíveis

### Agentes do Mega Brain

| Agente | Tipo | Propósito |
|--------|------|-----------|
| **JARVIS** | System | Orquestrador principal |
| **CRO** | Cargo | Chief Revenue Officer (vendas, revenue) |
| **CMO** | Cargo | Chief Marketing Officer (marketing, brand) |
| **COO** | Cargo | Chief Operating Officer (operações, processos) |
| **CLOSER** | Sales | Especialista em fechamento |
| **BDR** | Sales | Business Development Rep |
| **Gary Vaynerchuk** | Person | Clone do expert (em desenvolvimento) |
| **Alex Hormozi** | Person | Clone do expert (futuro) |

### Agentes do Post Express

| Squad | Propósito |
|-------|-----------|
| **Squad Auditores** | Auditoria de perfis Instagram |
| **Content Creation Squad** | Criação de carrosséis |
| **Content Distillery** | Destilação de frameworks de vídeos |
| **Zona Genialidade** | Assessment comportamental |

---

## 📋 Comandos Úteis (Mega Brain)

### Comandos Principais

```bash
# Status operacional + health score
/jarvis-briefing

# Pipeline completo (ingest + process + enrich)
/jarvis-full

# Sessão do Conselho (debate multi-agente)
/conclave

# Ingestão de material novo
/ingest

# Salvar sessão atual
/save

# Retomar sessão anterior
/resume
```

### Comandos via CLI (de dentro de mega-brain/)

```bash
# Instalar dependências
npm install

# Wizard de instalação
npm run install-wizard

# Validar configuração
npm run validate
```

---

## 🔧 Setup Inicial

### 1. Variáveis de Ambiente

Copiar `.env.example` para `.env` no diretório `mega-brain/`:

```bash
cd mega-brain
cp .env.example .env
```

**Variáveis necessárias:**

```env
# OBRIGATÓRIO - Transcrição de vídeos
OPENAI_API_KEY=

# RECOMENDADO - Busca semântica
VOYAGE_API_KEY=

# OPCIONAL - Standalone scripts
ANTHROPIC_API_KEY=

# OPCIONAL - Import do Google Drive
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 2. Estrutura de Pastas

Verificar se as pastas principais existem:

```bash
cd /Users/macbook-karla/postexpress2/mega-brain
ls -la inbox/ knowledge/ agents/ processing/
```

### 3. Dependências Node.js

```bash
cd mega-brain
npm install --legacy-peer-deps
```

---

## 🎯 Casos de Uso Imediatos

### Caso 1: Criar Clone de Gary Vaynerchuk

```bash
# 1. Já temos 25 vídeos + 99 posts do Gary coletados
cd expansion-packs/etl-data-collector

# 2. Sincronizar dados para o Mega Brain
# (mover de minds/gary_vaynerchuk/sources/ para mega-brain/inbox/)

# 3. Processar no Pipeline JARVIS
cd ../../mega-brain
# Via Claude Code: /jarvis-full

# 4. Extrair DNA + criar agente
# O sistema cria automaticamente:
# - knowledge/dna/GARY-VAYNERCHUK/
# - agents/persons/GARY-VAYNERCHUK/
```

### Caso 2: Gerar Playbook de Carrosséis Instagram

```bash
# 1. Auditar perfis top (Squad Auditores)
# Já temos dados de 3 perfis auditados no Supabase

# 2. Consolidar padrões no Mega Brain
# Criar: knowledge/playbooks/INSTAGRAM-CAROUSELS.md
# Com: hooks vencedores, estruturas, CTAs

# 3. Content Squad usa playbook
# Referencia playbook ao gerar novos carrosséis
```

### Caso 3: Conselho de Experts (Conclave)

```bash
# Ativar debate entre agentes sobre estratégia
/conclave "Como criar carrossel viral sobre [TEMA]?"

# Agentes participam:
# - CMO (perspectiva de marketing)
# - Gary Vaynerchuk (abordagem de conteúdo)
# - CLOSER (ângulo de conversão)
# - CRITIC (validação rigorosa)
```

---

## 🔗 Pontos de Integração Técnica

### 1. Supabase Compartilhado

Ambos os sistemas usam o mesmo Supabase:

```typescript
// Post Express
import { getServerSupabase } from '@/lib/supabase'

// Mega Brain (futuro)
// Usar mesmas credenciais SUPABASE_URL + SUPABASE_ANON_KEY
```

### 2. Cloudinary Compartilhado

```typescript
// Mesmas credenciais Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Anthropic API Compartilhada

```env
# Mesma chave para ambos
ANTHROPIC_API_KEY=
```

---

## 📊 Métricas de Sucesso

| Métrica | Objetivo |
|---------|----------|
| Experts clonados | 3 (Gary, Hormozi, Haynes) |
| DNAs extraídos | 3 (5 camadas cada) |
| Playbooks criados | 5 (carrosséis, hooks, copy, vendas, autoridade) |
| Agentes operacionais | 10 (persons + cargo + sales) |
| Conteúdos gerados com DNA | 50+ carrosséis |
| Taxa de aprovação | 80%+ (conteúdo gerado com DNA dos experts) |

---

## 🚀 Próximos Passos

### Fase 1: Setup (1-2 dias)
- [x] Copiar Mega Brain para postexpress2
- [ ] Configurar .env do Mega Brain
- [ ] Instalar dependências (`npm install`)
- [ ] Testar comandos básicos (/jarvis-briefing)

### Fase 2: Pipeline Gary Vaynerchuk (3-5 dias)
- [ ] Mover conteúdo Gary de ETL → Mega Brain inbox
- [ ] Processar via /jarvis-full
- [ ] Extrair DNA (5 camadas)
- [ ] Criar agente GARY-VAYNERCHUK
- [ ] Testar geração de conteúdo com DNA do Gary

### Fase 3: Playbooks Operacionais (5-7 dias)
- [ ] Consolidar padrões de 3 perfis auditados
- [ ] Criar playbook INSTAGRAM-CAROUSELS.md
- [ ] Criar playbook HOOKS-VENCEDORES.md
- [ ] Integrar playbooks ao Content Squad

### Fase 4: Conselho de Experts (3-5 dias)
- [ ] Configurar /conclave
- [ ] Testar deliberação multi-agente
- [ ] Documentar workflows de decisão

---

## 📚 Documentação Complementar

| Arquivo | Propósito |
|---------|-----------|
| `mega-brain/README.md` | Documentação completa do Mega Brain |
| `mega-brain/.claude/CLAUDE.md` | Instruções Claude Code |
| `mega-brain/system/02-JARVIS-SOUL.md` | Personalidade JARVIS |
| `mega-brain/system/03-JARVIS-DNA.yaml` | Framework cognitivo JARVIS |
| `CLAUDE.md` (raiz postexpress2) | Instruções Post Express |
| `README-APP.md` | Documentação técnica do app |

---

## ⚠️ Regras de Ouro

1. **JARVIS é parceiro operacional** - Não assistente genérico
2. **Fases são sequenciais e bloqueantes** - Não pular etapas
3. **Logging obrigatório** - Todo batch gera log dual-location
4. **Rastreabilidade 100%** - Toda afirmação tem citação ^[FONTE]
5. **Templates são lei** - Não criar estrutura customizada
6. **Agentes em /agents/ só via /conclave** - Sub-agents para dia-a-dia

---

**Última atualização:** 2026-03-01
**Versão:** 1.0
**Autor:** Claude Code (integração)
