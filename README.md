# 🚀 Post Express

Sistema de Criação de Conteúdo Automatizado da Pazos Media

## 📖 Visão Geral

Post Express automatiza 80% do processo de criação de conteúdo, utilizando IA com metodologias comprovadas de marketing para gerar carrosséis de alta conversão em escala.

### 🎯 Proposta de Valor

- **Escala**: Atender mais clientes sem aumentar equipe
- **Qualidade Consistente**: IA com metodologia das "mentes" garante padrão
- **Margem Maior**: Custo por cliente reduzido, lucro aumentado
- **Velocidade**: Entrega mais rápida = cliente mais satisfeito

## 🏗️ Arquitetura

```
COLETA DE DADOS → AUDITORIA → CRIAÇÃO → GERAÇÃO → APROVAÇÃO
```

### Stack Técnica

- **Backend/Lógica**: Claude Code (AI)
- **Banco de Dados**: Supabase
- **Scraping**: Apify
- **Geração de Imagens**: Cloudinary
- **Transcrição**: OpenAI Whisper
- **Web Search**: EXA
- **Twitter Monitoring**: Twitter Filtered Stream API (tempo real) ⭐ NEW

## 🤖 Squads de IA

### Squad Auditores (5 Mentes)
- 🧠 Daniel Kahneman - Comportamento da audiência
- ✍️ Eugene Schwartz - Copy e awareness stage
- 💰 Alex Hormozi - Ofertas e value equation
- 📊 Marty Cagan - Métricas e outcomes
- 🔍 Paul Graham - Anomalias e oportunidades

### Squad Criação (5 Mentes Milionárias)
- 🎯 Eugene Schwartz - Copywriting
- 📖 Seth Godin - Branding/Narrativas
- 💰 Alex Hormozi - Ofertas Irresistíveis
- 🇧🇷 Thiago Finch - Marketing BR
- 🎨 Adriano De Marqui - Design Visual

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/KarlaZap/postexpress2.git
cd postexpress2

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves de API

# Instale dependências (quando disponível)
npm install
```

## 🔑 Variáveis de Ambiente Necessárias

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Apify
APIFY_API_TOKEN=

# OpenAI
OPENAI_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# EXA (opcional)
EXA_API_KEY=
```

## 🚀 Uso

_(Documentação em desenvolvimento)_

## 📊 Módulos

### 1. Coleta de Dados
- Scraping via Apify (Instagram, TikTok, YouTube)
- Upload de documentos
- Transcrição de vídeos

### 2. Squad Auditores
- Análise comportamental
- Avaliação de copy
- Força das ofertas
- Análise de métricas
- Detecção de anomalias

### 3. Squad Criação
- Estratégia de conteúdo
- Copywriting
- Otimização para conversão
- Localização BR
- Design visual

### 4. Geração de Carrosséis
- Templates estilo Tweet
- Renderização via Cloudinary
- Múltiplas variações

### 5. Portal de Aprovação
- Visualização de carrosséis
- Aprovação de conteúdos
- Solicitação de ajustes
- Histórico

## 🤝 Contribuindo

Este é um projeto interno da Pazos Media.

## 📄 Licença

Proprietary - Pazos Media © 2026

## 👥 Time

Desenvolvido pela equipe Pazos Media

---

**🛠️ Status**: Em Desenvolvimento
**📅 Início**: Fevereiro 2026
