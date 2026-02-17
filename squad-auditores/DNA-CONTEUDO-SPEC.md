# 🧬 DNA de Conteúdo - Especificação Completa

**Versão:** 2.0
**Data:** 2026-02-16
**Status:** Especificação Técnica Detalhada
**Complexidade:** 🔴 Alta (ML/Pattern Recognition)
**Prioridade:** 🥇 Muito Alta (Quick Win + Alto Impacto)

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos e Valor](#objetivos-e-valor)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Algoritmos e Lógica](#algoritmos-e-lógica)
6. [Estrutura de Dados](#estrutura-de-dados)
7. [Implementação Técnica](#implementação-técnica)
8. [Interface de Usuário](#interface-de-usuário)
9. [Casos de Uso Detalhados](#casos-de-uso-detalhados)
10. [Roadmap de Implementação](#roadmap-de-implementação)
11. [Testes e Validação](#testes-e-validação)
12. [Métricas de Sucesso](#métricas-de-sucesso)
13. [Considerações e Limitações](#considerações-e-limitações)

---

## 1. Visão Geral

### 1.1 O Que É

O **DNA de Conteúdo** é um sistema de análise avançada que identifica o "código genético" dos posts de melhor performance de uma conta, extraindo padrões reutilizáveis que podem ser aplicados em futuras criações.

### 1.2 Analogia Biológica

Assim como o DNA biológico contém instruções para construir um organismo, o DNA de Conteúdo contém as "instruções" para criar posts de alta performance:

```
DNA Biológico          →    DNA de Conteúdo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Genes (ATCG)          →    Elementos de conteúdo
Cromossomos           →    Categorias de padrões
Expressão gênica      →    Templates gerados
Mutação               →    Variações testadas
Hereditariedade       →    Replicação de sucessos
```

### 1.3 Problema Que Resolve

**Antes do DNA de Conteúdo:**
- Criadores baseiam decisões em "feeling"
- Sucesso não é replicável
- Cada post é reinventar a roda
- Não sabem POR QUE algo funcionou
- Desperdiçam 60-80% do tempo criativo
- Inconsistência de qualidade

**Depois do DNA de Conteúdo:**
- Decisões baseadas em padrões comprovados
- Sucessos são sistematicamente replicados
- Templates prontos aceleram criação
- Entendem os elementos que geram resultados
- Redução de 60-70% no tempo de criação
- Qualidade consistente e previsível

---

## 2. Objetivos e Valor

### 2.1 Objetivos Primários

1. **Extrair Padrões Vencedores**
   - Identificar características comuns em posts de alta performance
   - Quantificar a importância de cada elemento
   - Criar "receitas" reproduzíveis

2. **Reduzir Tentativa e Erro**
   - Eliminar criação baseada em achismos
   - Aumentar taxa de acerto de 30% → 70%+
   - Acelerar curva de aprendizado

3. **Escalar Produção**
   - Permitir criação em volume sem perder qualidade
   - Facilitar delegação para equipe/VAs
   - Manter consistência mesmo com turnover

4. **Otimização Contínua**
   - Sistema se atualiza com novos dados
   - Identifica quando padrões mudam
   - Sugere experimentos para evoluir DNA

### 2.2 Valor Mensurável

**Métricas de Impacto:**

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Tempo de criação/post | 3h | 1h | -67% |
| Taxa de acerto (engajamento acima da média) | 30% | 72% | +140% |
| Consistência (desvio padrão de engajamento) | ±45% | ±18% | -60% |
| Onboarding de novo membro | 4 semanas | 3 dias | -93% |
| Posts que "floppam" completamente | 25% | 7% | -72% |

**ROI Estimado:**
- **Criador solo:** Economiza 8h/semana = R$ 3.200/mês (se hora vale R$ 100)
- **Agência (10 clientes):** Padronização = R$ 32.000/mês
- **Infoprodutor:** Mais posts de qualidade = +30% vendas

---

## 3. Arquitetura do Sistema

### 3.1 Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    DNA de Conteúdo - Sistema                │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   COLETA     │   │   ANÁLISE    │   │   GERAÇÃO    │
│              │   │              │   │              │
│ • Scraping   │──▶│ • Extração   │──▶│ • Templates  │
│ • APIs       │   │ • Clustering │   │ • Scores     │
│ • Upload     │   │ • Scoring    │   │ • Relatórios │
└──────────────┘   └──────────────┘   └──────────────┘
```

### 3.2 Componentes Principais

#### 3.2.1 Módulo de Coleta de Dados

**Responsabilidades:**
- Importar histórico de posts (JSON, CSV, API)
- Extrair metadados (texto, imagens, timestamps)
- Buscar métricas de performance (Instagram API)
- Validar integridade dos dados
- Armazenar em banco de dados estruturado

**Tecnologias:**
- APIs: Instagram Graph API, Apify, Phantombuster
- Parsers: JSON, CSV, Excel
- Storage: PostgreSQL/MongoDB

#### 3.2.2 Módulo de Análise e Extração

**Responsabilidades:**
- Classificar posts por performance (percentis)
- Extrair features de cada dimensão
- Calcular pesos e importância de features
- Identificar clusters de padrões
- Gerar DNA fingerprint

**Tecnologias:**
- NLP: spaCy, NLTK, transformers
- ML: scikit-learn, TensorFlow
- Análise de imagem: OpenCV, PIL
- Estatística: pandas, numpy

#### 3.2.3 Módulo de Geração de Templates

**Responsabilidades:**
- Criar templates baseados em DNA
- Gerar variações de hooks
- Sugerir estruturas otimizadas
- Produzir checklists de qualidade
- Exportar playbooks

**Tecnologias:**
- Template Engine: Jinja2
- AI Generation: GPT-4, Claude API
- Export: Markdown, PDF, JSON

---

## 4. Fluxo de Dados

### 4.1 Pipeline Completo

```
ENTRADA
   │
   ├─ Posts históricos (mín. 50)
   ├─ Métricas de engajamento
   ├─ Timestamps de publicação
   └─ Conteúdo textual/visual
   │
   ▼
VALIDAÇÃO
   │
   ├─ Remover duplicados
   ├─ Filtrar posts sem métricas
   ├─ Normalizar datas/horários
   └─ Validar integridade
   │
   ▼
CLASSIFICAÇÃO POR PERFORMANCE
   │
   ├─ Calcular score de engajamento
   ├─ Ordenar por performance
   ├─ Selecionar TOP 20% (winners)
   └─ Identificar BOTTOM 20% (losers)
   │
   ▼
EXTRAÇÃO DE FEATURES (10 Dimensões)
   │
   ├─ 1. Formato (carrossel/reel/estático)
   ├─ 2. Estrutura (slides, parágrafos, comprimento)
   ├─ 3. Hook (tipo, tamanho, elementos)
   ├─ 4. Timing (dia, hora, frequência)
   ├─ 5. Tema/Tópico (clustering NLP)
   ├─ 6. Tom e Voz (análise semântica)
   ├─ 7. CTA (tipo, posição, formulação)
   ├─ 8. Elementos Visuais (cores, layout, tipografia)
   ├─ 9. Prova Social (casos, números, testimonials)
   └─ 10. Linguagem (vocabulário, complexidade, emojis)
   │
   ▼
ANÁLISE COMPARATIVA
   │
   ├─ Winners vs Losers (o que difere?)
   ├─ Correlações entre features
   ├─ Identificar padrões recorrentes
   └─ Calcular pesos de importância
   │
   ▼
GERAÇÃO DO DNA
   │
   ├─ Criar fórmula ponderada
   ├─ Definir ranges ideais por feature
   ├─ Gerar templates base
   └─ Criar fingerprint único da conta
   │
   ▼
VALIDAÇÃO E REFINAMENTO
   │
   ├─ Cross-validation com posts médios
   ├─ Testar poder preditivo do DNA
   ├─ Ajustar pesos se necessário
   └─ Gerar confidence score
   │
   ▼
SAÍDA
   │
   ├─ Relatório DNA completo
   ├─ Templates prontos para uso
   ├─ Checklists de qualidade
   ├─ Recomendações acionáveis
   └─ Score de confiança (0-100)
```

### 4.2 Exemplo de Transformação de Dados

**INPUT (Post Raw):**
```json
{
  "id": "post_123",
  "caption": "Você está cobrando MENOS do que deveria? 💔\n\n8 passos para precificar sem medo...",
  "media_type": "CAROUSEL_ALBUM",
  "timestamp": "2026-01-15T19:30:00+0000",
  "like_count": 420,
  "comments_count": 32,
  "saves_count": 156,
  "reach": 3200
}
```

**OUTPUT (Features Extraídas):**
```json
{
  "post_id": "post_123",
  "performance_score": 92,
  "percentile": 95,
  "features": {
    "formato": {
      "tipo": "carrossel",
      "num_slides": 8,
      "peso_importancia": 0.15
    },
    "hook": {
      "tipo": "pergunta_dor",
      "tamanho_chars": 38,
      "usa_emoji": true,
      "emoji_tipo": "emocional",
      "numero_especifico": true,
      "peso_importancia": 0.25
    },
    "timing": {
      "dia_semana": "terça",
      "hora": 19,
      "periodo": "noite",
      "peso_importancia": 0.12
    },
    "estrutura": {
      "total_chars": 1247,
      "paragrafos": 10,
      "quebras_linha": 9,
      "peso_importancia": 0.08
    },
    "tema": {
      "cluster": "precificacao",
      "sub_tema": "mindset_preco",
      "peso_importancia": 0.18
    },
    "cta": {
      "tipo": "salvar",
      "texto": "Salva para não esquecer",
      "posicao": "final",
      "peso_importancia": 0.10
    },
    "tom": {
      "formalidade": 0.3,
      "emocional": 0.7,
      "imperativo": 0.8,
      "peso_importancia": 0.07
    },
    "prova_social": {
      "presente": false,
      "peso_importancia": 0.03
    },
    "vocabulario": {
      "palavras_poder": ["MENOS", "deveria", "medo"],
      "complexidade": "simples",
      "peso_importancia": 0.02
    }
  },
  "dna_match_score": 94
}
```

---

## 5. Algoritmos e Lógica

### 5.1 Algoritmo de Classificação de Performance

```python
def calcular_performance_score(post):
    """
    Calcula score de performance normalizado (0-100)
    considerando múltiplas métricas ponderadas
    """

    # Pesos por métrica (ajustáveis por nicho)
    PESOS = {
        'engagement_rate': 0.35,    # Taxa de engajamento
        'saves_rate': 0.25,         # Taxa de salvamentos
        'comments_rate': 0.20,      # Taxa de comentários
        'shares_rate': 0.15,        # Taxa de compartilhamentos
        'reach_growth': 0.05        # Crescimento de alcance
    }

    # Normalizar métricas (0-1)
    engagement_rate = (post.likes + post.comments + post.saves) / post.reach
    saves_rate = post.saves / post.reach
    comments_rate = post.comments / post.reach
    shares_rate = post.shares / post.reach
    reach_growth = post.reach / media_historica_reach

    # Normalizar usando z-score para comparar com distribuição histórica
    def normalize_zscore(value, historico):
        mean = np.mean(historico)
        std = np.std(historico)
        z = (value - mean) / std
        # Converter z-score para escala 0-100
        normalized = 50 + (z * 15)  # 68% dos dados entre 35-65
        return max(0, min(100, normalized))

    engagement_norm = normalize_zscore(engagement_rate, historico_engagement)
    saves_norm = normalize_zscore(saves_rate, historico_saves)
    comments_norm = normalize_zscore(comments_rate, historico_comments)
    shares_norm = normalize_zscore(shares_rate, historico_shares)
    reach_norm = normalize_zscore(reach_growth, historico_reach)

    # Score final ponderado
    score = (
        engagement_norm * PESOS['engagement_rate'] +
        saves_norm * PESOS['saves_rate'] +
        comments_norm * PESOS['comments_rate'] +
        shares_norm * PESOS['shares_rate'] +
        reach_norm * PESOS['reach_growth']
    )

    return {
        'score': round(score, 2),
        'percentile': percentileofscore(todos_scores, score),
        'breakdown': {
            'engagement': engagement_norm,
            'saves': saves_norm,
            'comments': comments_norm,
            'shares': shares_norm,
            'reach': reach_norm
        }
    }
```

### 5.2 Algoritmo de Extração de Hook

```python
def extrair_features_hook(caption):
    """
    Extrai características do hook (primeiras 2 linhas)
    """

    # Extrair hook (até primeira quebra dupla ou 150 chars)
    linhas = caption.split('\n')
    hook = linhas[0] if len(linhas) > 0 else caption[:150]

    features = {
        'tamanho_chars': len(hook),
        'tamanho_palavras': len(hook.split()),
        'tem_pergunta': '?' in hook,
        'tem_numero': bool(re.search(r'\d+', hook)),
        'tem_emoji': bool(re.search(r'[^\w\s,]', hook)),
        'tem_caps_lock': any(palavra.isupper() and len(palavra) > 2 for palavra in hook.split()),
        'tipo': classificar_tipo_hook(hook),
        'primeira_palavra': hook.split()[0].lower() if hook.split() else None,
        'pontuacao_final': hook[-1] if hook else None
    }

    return features

def classificar_tipo_hook(hook):
    """
    Classifica tipo de hook usando regras e ML
    """

    # Regras heurísticas
    if '?' in hook:
        if any(palavra in hook.lower() for palavra in ['você', 'seu', 'sua']):
            return 'pergunta_pessoal'
        return 'pergunta_geral'

    if re.search(r'\d+', hook):
        if any(palavra in hook.lower() for palavra in ['erro', 'forma', 'passo', 'dica']):
            return 'listagem_numerada'
        return 'numero_especifico'

    if any(palavra in hook.lower() for palavra in ['nunca', 'sempre', 'todo']):
        return 'afirmacao_universal'

    if hook.isupper() or sum(1 for c in hook if c.isupper()) > len(hook) * 0.3:
        return 'urgencia_caps'

    palavras_dor = ['problema', 'dor', 'cansado', 'frustrado', 'difícil']
    if any(palavra in hook.lower() for palavra in palavras_dor):
        return 'dor_emocional'

    palavras_curiosidade = ['segredo', 'ninguém', 'escondido', 'revelado']
    if any(palavra in hook.lower() for palavra in palavras_curiosidade):
        return 'curiosidade_gap'

    return 'afirmacao_simples'
```

### 5.3 Algoritmo de Geração do DNA

```python
def gerar_dna_conteudo(posts_winners, posts_losers):
    """
    Gera o DNA de conteúdo comparando winners vs losers
    """

    dna = {
        'formato': {},
        'estrutura': {},
        'hook': {},
        'timing': {},
        'tema': {},
        'cta': {},
        'tom': {},
        'visual': {},
        'prova_social': {},
        'vocabulario': {}
    }

    # Para cada dimensão, comparar winners vs losers

    # 1. FORMATO
    formatos_winners = Counter([p.formato for p in posts_winners])
    formato_dominante = formatos_winners.most_common(1)[0]
    dna['formato'] = {
        'tipo_ideal': formato_dominante[0],
        'frequencia': formato_dominante[1] / len(posts_winners),
        'confianca': calcular_confianca_estatistica(
            formatos_winners,
            Counter([p.formato for p in posts_losers])
        )
    }

    # 2. HOOK
    tipos_hook_winners = [extrair_features_hook(p.caption)['tipo'] for p in posts_winners]
    tipo_hook_dominante = Counter(tipos_hook_winners).most_common(1)[0]

    tamanhos_hook_winners = [len(p.caption.split('\n')[0]) for p in posts_winners]
    tamanho_ideal = np.median(tamanhos_hook_winners)

    dna['hook'] = {
        'tipo_ideal': tipo_hook_dominante[0],
        'frequencia': tipo_hook_dominante[1] / len(posts_winners),
        'tamanho_chars_ideal': int(tamanho_ideal),
        'tamanho_range': (int(np.percentile(tamanhos_hook_winners, 25)),
                          int(np.percentile(tamanhos_hook_winners, 75))),
        'elementos_chave': {
            'pergunta': sum(1 for h in tipos_hook_winners if 'pergunta' in h) / len(tipos_hook_winners),
            'numero': sum(1 for p in posts_winners if re.search(r'\d+', p.caption[:100])) / len(posts_winners),
            'emoji': sum(1 for p in posts_winners if re.search(r'[^\w\s,]', p.caption[:100])) / len(posts_winners)
        }
    }

    # 3. TIMING
    dias_winners = [p.timestamp.strftime('%A') for p in posts_winners]
    dia_dominante = Counter(dias_winners).most_common(1)[0]

    horas_winners = [p.timestamp.hour for p in posts_winners]
    hora_ideal = int(np.median(horas_winners))

    dna['timing'] = {
        'dia_ideal': dia_dominante[0],
        'frequencia_dia': dia_dominante[1] / len(posts_winners),
        'top_3_dias': Counter(dias_winners).most_common(3),
        'hora_ideal': hora_ideal,
        'range_horario': (int(np.percentile(horas_winners, 25)),
                          int(np.percentile(horas_winners, 75))),
        'evitar_horarios': identificar_horarios_ruins(posts_losers)
    }

    # 4. ESTRUTURA
    comprimentos_winners = [len(p.caption) for p in posts_winners]
    comprimento_ideal = int(np.median(comprimentos_winners))

    dna['estrutura'] = {
        'comprimento_ideal_chars': comprimento_ideal,
        'range_chars': (int(np.percentile(comprimentos_winners, 25)),
                        int(np.percentile(comprimentos_winners, 75))),
        'paragrafos_ideal': int(np.median([p.caption.count('\n\n') + 1 for p in posts_winners])),
        'quebras_linha': int(np.median([p.caption.count('\n') for p in posts_winners]))
    }

    # 5. CTA
    ctas_winners = [extrair_cta(p.caption) for p in posts_winners]
    tipo_cta_dominante = Counter([c['tipo'] for c in ctas_winners]).most_common(1)[0]

    dna['cta'] = {
        'tipo_ideal': tipo_cta_dominante[0],
        'exemplos': [c['texto'] for c in ctas_winners if c['tipo'] == tipo_cta_dominante[0]][:5],
        'posicao': 'final' if sum(1 for c in ctas_winners if c['posicao'] == 'final') > len(ctas_winners) / 2 else 'meio'
    }

    # 6. TEMA (clustering)
    temas_winners = clusterizar_temas([p.caption for p in posts_winners])
    dna['tema'] = {
        'clusters': temas_winners,
        'distribuicao': {tema: count/len(posts_winners) for tema, count in Counter(temas_winners).items()}
    }

    # 7. TOM E VOZ
    dna['tom'] = analisar_tom_voz(posts_winners)

    # 8. VOCABULÁRIO
    palavras_winners = extrair_vocabulario([p.caption for p in posts_winners])
    palavras_losers = extrair_vocabulario([p.caption for p in posts_losers])

    # Palavras que aparecem muito mais em winners
    palavras_poder = [
        palavra for palavra in palavras_winners
        if palavras_winners[palavra] / palavras_losers.get(palavra, 1) > 2.0
    ]

    dna['vocabulario'] = {
        'palavras_poder': palavras_poder[:20],
        'palavras_evitar': [
            palavra for palavra in palavras_losers
            if palavras_losers[palavra] / palavras_winners.get(palavra, 1) > 2.0
        ][:20],
        'complexidade_ideal': calcular_complexidade_lexical(posts_winners)
    }

    # CALCULAR PESOS DE IMPORTÂNCIA (Feature Importance)
    pesos = calcular_feature_importance(posts_winners, posts_losers)

    # Adicionar pesos ao DNA
    for dimensao in dna:
        dna[dimensao]['peso_importancia'] = pesos.get(dimensao, 0.1)

    # CONFIDENCE SCORE geral do DNA
    dna['meta'] = {
        'num_posts_analisados': len(posts_winners) + len(posts_losers),
        'num_winners': len(posts_winners),
        'num_losers': len(posts_losers),
        'confidence_score': calcular_confidence_score(posts_winners, posts_losers),
        'data_geracao': datetime.now().isoformat(),
        'requer_atualizacao_em': datetime.now() + timedelta(days=90)
    }

    return dna
```

### 5.4 Algoritmo de Feature Importance

```python
def calcular_feature_importance(posts_winners, posts_losers):
    """
    Usa Random Forest para calcular importância de cada feature
    na predição de sucesso de um post
    """

    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler

    # Preparar dataset
    X = []
    y = []

    # Winners = 1
    for post in posts_winners:
        features = extrair_todas_features(post)
        X.append(features)
        y.append(1)

    # Losers = 0
    for post in posts_losers:
        features = extrair_todas_features(post)
        X.append(features)
        y.append(0)

    # Normalizar
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Treinar Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_scaled, y)

    # Extrair importâncias
    importances = rf.feature_importances_
    feature_names = [
        'formato', 'num_slides', 'hook_tipo', 'hook_tamanho',
        'dia_semana', 'hora', 'comprimento', 'paragrafos',
        'tema', 'cta_tipo', 'tom_formalidade', 'tem_emoji',
        'tem_numero', 'tem_prova_social', 'complexidade_vocab'
    ]

    # Mapear para dimensões
    dimensoes_importancia = {}
    for i, feature in enumerate(feature_names):
        dimensao = mapear_feature_para_dimensao(feature)
        if dimensao not in dimensoes_importancia:
            dimensoes_importancia[dimensao] = 0
        dimensoes_importancia[dimensao] += importances[i]

    # Normalizar para somar 1
    total = sum(dimensoes_importancia.values())
    for dimensao in dimensoes_importancia:
        dimensoes_importancia[dimensao] /= total

    return dimensoes_importancia
```

---

## 6. Estrutura de Dados

### 6.1 Schema do Banco de Dados

```sql
-- Tabela de Contas
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(50) NOT NULL, -- instagram, tiktok, etc
    followers_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),
    platform_post_id VARCHAR(255) UNIQUE NOT NULL,
    caption TEXT,
    media_type VARCHAR(50), -- CAROUSEL, VIDEO, IMAGE
    media_urls JSONB,
    timestamp TIMESTAMP NOT NULL,

    -- Métricas
    like_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,

    -- Performance calculada
    performance_score DECIMAL(5,2),
    percentile DECIMAL(5,2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Features Extraídas
CREATE TABLE post_features (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id),

    -- Formato
    formato VARCHAR(50),
    num_slides INTEGER,

    -- Hook
    hook_tipo VARCHAR(100),
    hook_tamanho_chars INTEGER,
    hook_tem_pergunta BOOLEAN,
    hook_tem_numero BOOLEAN,
    hook_tem_emoji BOOLEAN,
    hook_primeira_palavra VARCHAR(100),

    -- Timing
    dia_semana VARCHAR(20),
    hora INTEGER,
    periodo_dia VARCHAR(20), -- manha, tarde, noite

    -- Estrutura
    comprimento_chars INTEGER,
    num_paragrafos INTEGER,
    num_quebras_linha INTEGER,

    -- Tema
    tema_cluster VARCHAR(100),
    tema_sub_cluster VARCHAR(100),

    -- CTA
    cta_tipo VARCHAR(100),
    cta_texto TEXT,
    cta_posicao VARCHAR(50),

    -- Tom
    tom_formalidade DECIMAL(3,2), -- 0-1
    tom_emocional DECIMAL(3,2),
    tom_imperativo DECIMAL(3,2),

    -- Outros
    tem_prova_social BOOLEAN,
    complexidade_vocabulario DECIMAL(5,2),

    -- Features completas (JSON flexível)
    features_full JSONB,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de DNA Gerado
CREATE TABLE content_dna (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts(id),

    -- Metadados
    version INTEGER DEFAULT 1,
    num_posts_analisados INTEGER,
    num_winners INTEGER,
    num_losers INTEGER,
    confidence_score DECIMAL(5,2),

    -- DNA completo (estrutura JSON)
    dna_data JSONB NOT NULL,

    -- Validade
    valido_ate TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Índice único por conta (última versão)
    UNIQUE(account_id, version)
);

-- Tabela de Templates Gerados
CREATE TABLE content_templates (
    id UUID PRIMARY KEY,
    dna_id UUID REFERENCES content_dna(id),

    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100), -- carrossel_educacional, reel_viral, etc

    -- Template estruturado
    template_data JSONB NOT NULL,
    /*
    {
        "slides": [
            {
                "numero": 1,
                "tipo": "hook",
                "estrutura": "[Pergunta provocativa] + [Emoji]",
                "exemplo": "Você está cobrando MENOS do que deveria? 💔"
            },
            ...
        ],
        "checklist": [...],
        "variacoes_hook": [...]
    }
    */

    -- Histórico de uso
    vezes_usado INTEGER DEFAULT 0,
    performance_media DECIMAL(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_posts_account ON posts(account_id);
CREATE INDEX idx_posts_timestamp ON posts(timestamp DESC);
CREATE INDEX idx_posts_performance ON posts(performance_score DESC);
CREATE INDEX idx_features_post ON post_features(post_id);
CREATE INDEX idx_dna_account ON content_dna(account_id, version DESC);
```

### 6.2 Estrutura JSON do DNA

```json
{
  "account_id": "uuid-da-conta",
  "version": 1,
  "meta": {
    "num_posts_analisados": 120,
    "num_winners": 24,
    "num_losers": 24,
    "confidence_score": 87.5,
    "data_geracao": "2026-02-16T10:30:00Z",
    "valido_ate": "2026-05-16T10:30:00Z"
  },

  "dimensoes": {

    "formato": {
      "peso_importancia": 0.15,
      "tipo_ideal": "carrossel",
      "distribuicao": {
        "carrossel": 0.70,
        "reel": 0.25,
        "imagem": 0.05
      },
      "detalhes": {
        "num_slides_ideal": 8,
        "range_slides": [6, 10],
        "confianca": 0.92
      },
      "recomendacao": "Priorizar carrosséis de 8-10 slides"
    },

    "hook": {
      "peso_importancia": 0.25,
      "tipo_ideal": "pergunta_dor",
      "distribuicao_tipos": {
        "pergunta_dor": 0.35,
        "numero_especifico": 0.30,
        "afirmacao_ousada": 0.20,
        "curiosidade": 0.15
      },
      "tamanho_ideal_chars": 42,
      "range_tamanho": [30, 60],
      "elementos_chave": {
        "pergunta": 0.65,
        "numero_especifico": 0.70,
        "emoji_impacto": 0.85,
        "caps_lock_palavra": 0.40
      },
      "exemplos_vencedores": [
        "Você está cobrando MENOS do que deveria? 💔",
        "3 erros que me custaram R$ 10 mil 😱",
        "Se você faz isso, está perdendo clientes 🚨"
      ],
      "palavras_poder_hook": [
        "você", "MENOS", "erro", "nunca", "segredo",
        "parar", "cuidado", "descobri"
      ],
      "recomendacao": "Hook deve ter pergunta OU número, idealmente ambos. Emoji emocional aumenta retenção em 67%."
    },

    "timing": {
      "peso_importancia": 0.12,
      "dia_ideal": "terça-feira",
      "top_3_dias": [
        {"dia": "terça-feira", "frequencia": 0.35, "performance_media": 92},
        {"dia": "quinta-feira", "frequencia": 0.28, "performance_media": 88},
        {"dia": "domingo", "frequencia": 0.18, "performance_media": 81}
      ],
      "hora_ideal": 19,
      "range_horario": [18, 21],
      "heatmap_semanal": {
        "segunda": {"melhor": "18-19h", "evitar": "antes de 12h"},
        "terca": {"melhor": "19-20h", "evitar": "12-14h"},
        "quarta": {"melhor": "20-21h", "evitar": "antes de 17h"},
        "quinta": {"melhor": "18-19h", "evitar": "22h+"},
        "sexta": {"melhor": "14-16h", "evitar": "após 18h"},
        "sabado": {"melhor": "20-21h", "evitar": "manhã"},
        "domingo": {"melhor": "10-11h e 19-20h", "evitar": "tarde"}
      },
      "recomendacao": "Terças e quintas à noite (18-20h) são seus horários de ouro. Evitar segundas antes do meio-dia."
    },

    "estrutura": {
      "peso_importancia": 0.08,
      "comprimento_ideal_chars": 1247,
      "range_comprimento": [1000, 1500],
      "paragrafos_ideal": 8,
      "quebras_linha_ideal": 12,
      "densidade": "moderada",
      "recomendacao": "Posts de 1000-1500 caracteres com 8 parágrafos curtos. Use quebras de linha para respirar."
    },

    "tema": {
      "peso_importancia": 0.18,
      "clusters_identificados": [
        {
          "nome": "precificacao",
          "frequencia": 0.28,
          "performance_media": 94,
          "sub_temas": ["quanto_cobrar", "valor_percebido", "mindset_preco"]
        },
        {
          "nome": "erros_comuns",
          "frequencia": 0.25,
          "performance_media": 89,
          "sub_temas": ["iniciante", "precisa_evitar", "aprendi_errado"]
        },
        {
          "nome": "ferramentas",
          "frequencia": 0.22,
          "performance_media": 76,
          "sub_temas": ["automacao", "produtividade", "gratuitas"]
        },
        {
          "nome": "cases_resultado",
          "frequencia": 0.15,
          "performance_media": 97,
          "sub_temas": ["transformacao", "antes_depois", "cliente_real"]
        }
      ],
      "temas_evitar": ["motivacao_generica", "teoria_sem_pratica"],
      "recomendacao": "Foco em 'precificação' e 'cases de resultado' que são seus temas campeões. Reduzir conteúdo genérico de ferramentas."
    },

    "cta": {
      "peso_importancia": 0.10,
      "tipo_ideal": "salvar",
      "distribuicao_tipos": {
        "salvar": 0.55,
        "comentar": 0.25,
        "compartilhar": 0.15,
        "link_bio": 0.05
      },
      "exemplos_vencedores": [
        "Salva para não esquecer ❤️",
        "Salva esse carrossel e me marca em alguém que precisa ver",
        "Qual desses erros você mais comete? Comenta aqui 👇"
      ],
      "posicao_ideal": "final",
      "elementos_efetivos": {
        "imperativo": 0.92,
        "beneficio_claro": 0.78,
        "emoji_acao": 0.85
      },
      "recomendacao": "CTA de 'Salvar' no final do post com benefício claro. Ex: 'Salva para aplicar amanhã'"
    },

    "tom_voz": {
      "peso_importancia": 0.07,
      "perfil": "mentor_direto_acessivel",
      "metricas": {
        "formalidade": 0.25,
        "emocional": 0.65,
        "racional": 0.35,
        "autoridade": 0.70,
        "amigavel": 0.30,
        "pessoal": 0.90,
        "institucional": 0.10,
        "humoristico": 0.20,
        "serio": 0.80
      },
      "caracteristicas": {
        "usa_voce": 0.95,
        "conta_historia_pessoal": 0.60,
        "usa_humor_moderado": 0.20,
        "imperativo": 0.75,
        "usa_metaforas": 0.15
      },
      "vocabulario_caracteristico": [
        "vou ser sincero",
        "aprendi isso da pior forma",
        "o que ninguém te conta",
        "testei e funcionou",
        "fiz X e..."
      ],
      "vocabulario_evitar": [
        "você consegue!",
        "acredite em si",
        "nunca desista",
        "motivação de segunda"
      ],
      "recomendacao": "Manter tom de mentor direto que compartilha experiência pessoal, sem ser motivacional vazio"
    },

    "visual": {
      "peso_importancia": 0.04,
      "paleta_dominante": ["#2C3E87", "#F4D03F", "#FFFFFF", "#1C1C1C"],
      "saturacao_media": 0.65,
      "contraste_medio": 7.2,
      "tipografia": "sans-serif, bold para títulos",
      "layout": "margem 80px, título topo-esquerda",
      "recomendacao": "Manter identidade visual consistente com paleta azul + amarelo"
    },

    "prova_social": {
      "peso_importancia": 0.03,
      "presente_em_winners": 0.35,
      "tipos_efetivos": {
        "numero_especifico": 0.80,
        "caso_cliente": 0.65,
        "antes_depois": 0.70,
        "testimonial": 0.40
      },
      "recomendacao": "Não obrigatória, mas quando usar, preferir números específicos ou casos reais"
    },

    "vocabulario": {
      "peso_importancia": 0.02,
      "palavras_poder": [
        "MENOS", "deveria", "erro", "nunca", "segredo",
        "descobri", "testei", "funcionou", "real", "verdade"
      ],
      "palavras_evitar": [
        "talvez", "acho", "pode ser", "quem sabe",
        "motivação", "sucesso", "grind", "foco"
      ],
      "complexidade_ideal": "simples_direto",
      "flesch_reading_ease": 65,
      "recomendacao": "Vocabulário direto e assertivo. Evitar palavras vagas ou motivacionais genéricas."
    }
  },

  "formula_dna": {
    "descricao": "Fórmula ponderada para replicar sucesso",
    "equacao": "Score = 0.25*Hook + 0.18*Tema + 0.15*Formato + 0.12*Timing + 0.10*CTA + 0.08*Estrutura + 0.07*Tom + 0.04*Visual + 0.03*Prova + 0.02*Vocab",
    "score_minimo_sucesso": 75,
    "score_medio_winners": 92,
    "score_medio_losers": 42
  },

  "templates_gerados": [
    {
      "id": "template_1",
      "nome": "Carrossel Educacional - Erros Comuns",
      "score_esperado": 88,
      "estrutura": "Ver templates_gerados na seção de outputs"
    }
  ],

  "recomendacoes_acao": [
    {
      "prioridade": "alta",
      "acao": "Criar 2 posts/semana sobre 'precificação' (tema campeão)",
      "impacto_estimado": "+18% engajamento"
    },
    {
      "prioridade": "alta",
      "acao": "Todo hook deve ter pergunta OU número específico",
      "impacto_estimado": "+25% retenção"
    },
    {
      "prioridade": "media",
      "acao": "Publicar terças e quintas entre 18-20h",
      "impacto_estimado": "+15% alcance"
    },
    {
      "prioridade": "media",
      "acao": "CTA sempre: 'Salva para [benefício claro]'",
      "impacto_estimado": "+30% salvamentos"
    },
    {
      "prioridade": "baixa",
      "acao": "Reduzir posts sobre ferramentas genéricas",
      "impacto_estimado": "+5% qualidade média"
    }
  ]
}
```

---

## 7. Implementação Técnica

### 7.1 Stack Tecnológico Recomendado

**Backend:**
- **Linguagem:** Python 3.10+
- **Framework:** FastAPI (APIs REST)
- **ML/NLP:**
  - scikit-learn (clustering, classificação)
  - spaCy (NLP em português)
  - transformers (BERT para análise semântica)
  - pandas, numpy (manipulação de dados)
- **Computer Vision:** OpenCV, PIL (análise de imagens)
- **Banco de Dados:**
  - PostgreSQL (dados estruturados)
  - Redis (cache)
- **Task Queue:** Celery + Redis (processamento assíncrono)

**Frontend:**
- **Framework:** Next.js 14+ (React)
- **UI:** shadcn/ui + Tailwind CSS
- **Visualizações:** Recharts, D3.js
- **State:** Zustand ou React Query

**Infraestrutura:**
- **Deploy:** Docker + Kubernetes (ou Vercel/Railway)
- **Storage:** AWS S3 / Cloudinary (imagens)
- **Monitoring:** Sentry, Datadog

### 7.2 Arquitetura de Serviços

```
┌──────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  Upload    │  │  Dashboard │  │  Templates │     │
│  │  Posts     │  │  DNA       │  │  Generator │     │
│  └────────────┘  └────────────┘  └────────────┘     │
└─────────────────────┬────────────────────────────────┘
                      │ REST API
┌─────────────────────▼────────────────────────────────┐
│               API GATEWAY (FastAPI)                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  Auth  │  Validation  │  Rate Limiting       │   │
│  └──────────────────────────────────────────────┘   │
└─────────┬────────────┬────────────┬───────────┬─────┘
          │            │            │           │
┌─────────▼───┐  ┌────▼─────┐  ┌──▼──────┐  ┌─▼──────┐
│  Collector  │  │ Analyzer │  │Template │  │  AI    │
│  Service    │  │ Service  │  │Generator│  │ Service│
│             │  │          │  │         │  │        │
│ • Scraping  │  │• Extract │  │• Render │  │• GPT-4 │
│ • APIs      │  │• Cluster │  │• Export │  │• Claude│
│ • Validate  │  │• Score   │  │         │  │        │
└─────────┬───┘  └────┬─────┘  └──┬──────┘  └─┬──────┘
          │            │            │           │
┌─────────▼────────────▼────────────▼───────────▼─────┐
│              TASK QUEUE (Celery + Redis)            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Process    │  │ Generate   │  │ Update     │    │
│  │ Posts      │  │ DNA        │  │ Cache      │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            DATABASE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ PostgreSQL   │  │  Redis       │  │   S3     │  │
│  │ (Posts, DNA) │  │  (Cache)     │  │ (Images) │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

### 7.3 APIs Principais

#### 7.3.1 Upload de Posts

```python
@router.post("/api/v1/dna/upload-posts")
async def upload_posts(
    account_id: str,
    posts: List[PostInput],
    background_tasks: BackgroundTasks
):
    """
    Upload de posts históricos para análise

    Input:
    {
        "account_id": "uuid",
        "posts": [
            {
                "platform_post_id": "instagram_123",
                "caption": "texto...",
                "media_type": "CAROUSEL",
                "timestamp": "2026-01-15T19:30:00Z",
                "metrics": {
                    "likes": 420,
                    "comments": 32,
                    "saves": 156,
                    "reach": 3200
                }
            }
        ]
    }

    Output:
    {
        "job_id": "uuid-job",
        "status": "processing",
        "total_posts": 120,
        "estimated_time_seconds": 180
    }
    """

    # Validar posts
    valid_posts = validate_posts(posts)

    # Salvar no banco
    saved_posts = await save_posts_bulk(account_id, valid_posts)

    # Disparar processamento assíncrono
    background_tasks.add_task(
        process_posts_and_generate_dna,
        account_id=account_id,
        post_ids=[p.id for p in saved_posts]
    )

    return {
        "job_id": str(uuid4()),
        "status": "processing",
        "total_posts": len(saved_posts),
        "estimated_time_seconds": len(saved_posts) * 1.5
    }
```

#### 7.3.2 Gerar DNA

```python
@router.post("/api/v1/dna/generate")
async def generate_dna(
    account_id: str,
    options: DNAGenerationOptions = None
):
    """
    Gera DNA de conteúdo para uma conta

    Input:
    {
        "account_id": "uuid",
        "options": {
            "min_posts": 50,
            "top_percentile": 20,
            "bottom_percentile": 20,
            "force_regenerate": false
        }
    }

    Output:
    {
        "dna_id": "uuid",
        "confidence_score": 87.5,
        "num_posts_analyzed": 120,
        "summary": {
            "top_insights": [...],
            "quick_wins": [...]
        },
        "dna_url": "/api/v1/dna/uuid/full"
    }
    """

    # Buscar posts da conta
    posts = await get_posts_by_account(account_id)

    if len(posts) < options.min_posts:
        raise ValueError(f"Mínimo de {options.min_posts} posts necessários")

    # Classificar por performance
    posts_scored = score_posts_performance(posts)

    # Selecionar winners e losers
    winners = select_top_percentile(posts_scored, options.top_percentile)
    losers = select_bottom_percentile(posts_scored, options.bottom_percentile)

    # Gerar DNA
    dna = gerar_dna_conteudo(winners, losers)

    # Salvar no banco
    dna_saved = await save_dna(account_id, dna)

    # Gerar templates
    templates = gerar_templates(dna)
    await save_templates(dna_saved.id, templates)

    return {
        "dna_id": str(dna_saved.id),
        "confidence_score": dna['meta']['confidence_score'],
        "num_posts_analyzed": len(posts),
        "summary": generate_summary(dna),
        "dna_url": f"/api/v1/dna/{dna_saved.id}/full"
    }
```

#### 7.3.3 Obter DNA Completo

```python
@router.get("/api/v1/dna/{dna_id}/full")
async def get_dna_full(dna_id: str):
    """
    Retorna DNA completo com todas as dimensões

    Output: Estrutura JSON completa do DNA (ver seção 6.2)
    """

    dna = await get_dna_by_id(dna_id)

    if not dna:
        raise HTTPException(404, "DNA não encontrado")

    return dna.dna_data
```

#### 7.3.4 Gerar Template de Post

```python
@router.post("/api/v1/dna/{dna_id}/generate-post")
async def generate_post_from_dna(
    dna_id: str,
    request: PostGenerationRequest
):
    """
    Gera um novo post baseado no DNA

    Input:
    {
        "tema": "precificacao",
        "objetivo": "engajamento",
        "formato": "carrossel",
        "variacoes": 3
    }

    Output:
    {
        "variacoes": [
            {
                "hook": "Você está cobrando MENOS do que deveria? 💔",
                "corpo": "[estrutura completa]",
                "cta": "Salva para não esquecer ❤️",
                "num_slides": 8,
                "score_dna_match": 94,
                "preview_url": "url-preview"
            },
            {...},
            {...}
        ]
    }
    """

    dna = await get_dna_by_id(dna_id)

    # Usar AI (GPT-4/Claude) para gerar variações
    variacoes = await ai_generate_post_variations(
        dna=dna,
        tema=request.tema,
        objetivo=request.objetivo,
        formato=request.formato,
        num_variacoes=request.variacoes
    )

    # Validar cada variação contra o DNA
    for variacao in variacoes:
        variacao['score_dna_match'] = calcular_match_score(variacao, dna)

    return {"variacoes": variacoes}
```

### 7.4 Task Assíncrona de Processamento

```python
@celery_app.task
def process_posts_and_generate_dna(account_id: str, post_ids: List[str]):
    """
    Task assíncrona para processar posts e gerar DNA
    """

    try:
        # 1. Buscar posts
        posts = Post.objects.filter(id__in=post_ids).all()

        # 2. Extrair features de cada post
        for post in posts:
            features = extrair_todas_features(post)
            PostFeatures.objects.create(
                post_id=post.id,
                **features
            )

        # 3. Calcular performance score
        for post in posts:
            score = calcular_performance_score(post)
            post.performance_score = score['score']
            post.percentile = score['percentile']
            post.save()

        # 4. Gerar DNA
        posts_scored = list(posts.order_by('-performance_score'))
        winners = posts_scored[:int(len(posts_scored) * 0.2)]
        losers = posts_scored[-int(len(posts_scored) * 0.2):]

        dna_data = gerar_dna_conteudo(winners, losers)

        # 5. Salvar DNA
        dna = ContentDNA.objects.create(
            account_id=account_id,
            version=get_next_version(account_id),
            num_posts_analisados=len(posts),
            num_winners=len(winners),
            num_losers=len(losers),
            confidence_score=dna_data['meta']['confidence_score'],
            dna_data=dna_data,
            valido_ate=datetime.now() + timedelta(days=90)
        )

        # 6. Gerar templates
        templates = gerar_templates(dna_data)
        for template in templates:
            ContentTemplate.objects.create(
                dna_id=dna.id,
                **template
            )

        # 7. Atualizar cache
        cache.set(f"dna:{account_id}:latest", dna.id, timeout=3600*24*90)

        # 8. Notificar usuário
        notify_user(account_id, "DNA gerado com sucesso!", dna.id)

        return {
            "status": "success",
            "dna_id": str(dna.id),
            "confidence_score": dna.confidence_score
        }

    except Exception as e:
        logger.error(f"Erro ao gerar DNA: {e}")
        notify_user(account_id, "Erro ao gerar DNA", error=str(e))
        raise
```

---

## 8. Interface de Usuário

### 8.1 Fluxo de Usuário

```
1. UPLOAD DE DADOS
   │
   ├─ Opção A: Upload manual (JSON/CSV)
   ├─ Opção B: Conectar Instagram (OAuth)
   └─ Opção C: Colar dados do Apify/Phantombuster
   │
   ▼
2. PROCESSAMENTO
   │
   └─ Loading com progresso
      "Analisando 120 posts... 45% completo"
   │
   ▼
3. DASHBOARD DNA
   │
   ├─ Score de confiança (87.5/100)
   ├─ Resumo executivo (top 3 insights)
   ├─ Gráficos de distribuição
   └─ Tabs por dimensão
   │
   ▼
4. EXPLORAÇÃO DETALHADA
   │
   ├─ Formato (gráficos + recomendações)
   ├─ Hook (exemplos + tipos)
   ├─ Timing (heatmap semanal)
   ├─ Temas (clusters + performance)
   └─ [todas as 10 dimensões]
   │
   ▼
5. TEMPLATES GERADOS
   │
   ├─ Lista de templates prontos
   ├─ Preview de cada template
   └─ "Usar este template" → Gera post
   │
   ▼
6. GERADOR DE POST
   │
   ├─ Selecionar tema
   ├─ Escolher formato
   ├─ Gerar 3 variações
   └─ Editar e exportar
```

### 8.2 Telas Principais

#### 8.2.1 Dashboard Principal

```
┌────────────────────────────────────────────────────────┐
│  DNA de Conteúdo - @sua_conta              [Atualizar]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  SCORE DE CONFIANÇA                              │ │
│  │                                                  │ │
│  │         ╔════════════════════╗                  │ │
│  │         ║                    ║                  │ │
│  │         ║       87.5         ║                  │ │
│  │         ║      /100          ║                  │ │
│  │         ║                    ║                  │ │
│  │         ╚════════════════════╝                  │ │
│  │                                                  │ │
│  │  Alta confiança - DNA baseado em 120 posts      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  🏆 TOP 3 INSIGHTS                                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 1. 🧬 Carrosséis de 8-10 slides são 70% do seu  │ │
│  │      conteúdo vencedor                          │ │
│  │                                                  │ │
│  │ 2. 🎯 Posts sobre "precificação" têm +94% eng   │ │
│  │      vs média - explorar mais esse tema!       │ │
│  │                                                  │ │
│  │ 3. ⏰ Terças 19h é seu horário de ouro          │ │
│  │      (+127% alcance vs outros dias/horas)       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📊 DIMENSÕES DO DNA                                   │
│  ┌────────────┬──────────┬──────────────────────────┐ │
│  │ Dimensão   │ Score    │ Status                  ││ │
│  ├────────────┼──────────┼──────────────────────────┤ │
│  │ 🎣 Hook    │ ████████ │ 92/100 Excelente       ││ │
│  │ 📊 Formato │ ████████ │ 88/100 Muito Bom       ││ │
│  │ 📍 Tema    │ ███████░ │ 81/100 Bom             ││ │
│  │ ⏰ Timing  │ ███████░ │ 79/100 Bom             ││ │
│  │ 📢 CTA     │ ██████░░ │ 75/100 Bom             ││ │
│  │ ✍️  Tom     │ █████░░░ │ 68/100 Médio           ││ │
│  │ 🎨 Visual  │ ████░░░░ │ 62/100 Requer atenção  ││ │
│  └────────────┴──────────┴──────────────────────────┘ │
│                                                        │
│  [Ver Detalhes]  [Gerar Templates]  [Exportar PDF]    │
└────────────────────────────────────────────────────────┘
```

#### 8.2.2 Página de Dimensão (Hook)

```
┌────────────────────────────────────────────────────────┐
│  ◀ Voltar      DNA › Hook                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🎣 HOOK - A Primeira Impressão                        │
│                                                        │
│  Peso de Importância: ████████████████░░ 25%          │
│  (O hook é o elemento MAIS importante do seu DNA)     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  TIPO DE HOOK VENCEDOR                           │ │
│  │                                                  │ │
│  │  Pergunta sobre Dor (35%)                        │ │
│  │  Número Específico (30%)                         │ │
│  │  Afirmação Ousada (20%)                          │ │
│  │  Curiosidade (15%)                               │ │
│  │                                                  │ │
│  │  [Gráfico de pizza]                              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📏 TAMANHO IDEAL                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  42 caracteres                                   │ │
│  │                                                  │ │
│  │  Range: 30-60 chars                              │ │
│  │                                                  │ │
│  │  ├─────────┼─────────┼─────────┤                │ │
│  │  30       42        60                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ✨ ELEMENTOS-CHAVE                                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ✅ Pergunta: 65% dos winners                    │ │
│  │  ✅ Número específico: 70% dos winners           │ │
│  │  ✅ Emoji de impacto: 85% dos winners            │ │
│  │  ⚠️ CAPS LOCK em palavra: 40% (usar com moderação)││
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  🏆 EXEMPLOS VENCEDORES                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │  1. "Você está cobrando MENOS do que deveria? 💔"│ │
│  │     Score: 96 | Engajamento: +127%               │ │
│  │                                                  │ │
│  │  2. "3 erros que me custaram R$ 10 mil 😱"       │ │
│  │     Score: 94 | Engajamento: +118%               │ │
│  │                                                  │ │
│  │  3. "Se você faz isso, está perdendo clientes 🚨"│ │
│  │     Score: 91 | Engajamento: +102%               │ │
│  │                                                  │ │
│  │  [Ver mais 7 exemplos]                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  💪 PALAVRAS DE PODER (mais usadas em hooks winners)  │
│  ┌──────────────────────────────────────────────────┐ │
│  │  "você" "MENOS" "erro" "nunca" "segredo"         │ │
│  │  "descobri" "parar" "cuidado" "testei"           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  🎯 RECOMENDAÇÕES                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  • Todo hook deve ter pergunta OU número         │ │
│  │  • Idealmente, ter ambos aumenta sucesso em 45%  │ │
│  │  • Emoji emocional (💔😱🚨) retém +67% mais      │ │
│  │  • Evitar hooks genéricos sem especificidade     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Gerar Hook com IA]  [Ver Templates]                 │
└────────────────────────────────────────────────────────┘
```

#### 8.2.3 Gerador de Posts

```
┌────────────────────────────────────────────────────────┐
│  🤖 Gerador de Posts - Baseado no seu DNA              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  CONFIGURAÇÃO                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Tema:      [Precificação ▼]                     │ │
│  │  Formato:   [● Carrossel  ○ Reel  ○ Imagem]     │ │
│  │  Objetivo:  [Engajamento ▼]                      │ │
│  │  Variações: [█████░░░░░] 3                       │ │
│  │                                                  │ │
│  │  [Gerar Posts]                                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  VARIAÇÕES GERADAS                                     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  VARIAÇÃO 1                  Score DNA: 94/100   │ │
│  │  ────────────────────────────────────────────    │ │
│  │                                                  │ │
│  │  [Slide 1]                                       │ │
│  │  Você está cobrando MENOS                        │ │
│  │  do que deveria? 💔                              │ │
│  │                                                  │ │
│  │  8 passos para precificar sem                    │ │
│  │  medo (e ganhar o que merece)                    │ │
│  │                                                  │ │
│  │  [Slide 2]                                       │ │
│  │  1. PARE de olhar concorrente                    │ │
│  │                                                  │ │
│  │  Seu preço não depende do que                    │ │
│  │  fulano cobra. Depende do VALOR                  │ │
│  │  que você entrega.                               │ │
│  │                                                  │ │
│  │  [Ver slides 3-8]                                │ │
│  │                                                  │ │
│  │  ✅ Hook: Pergunta + Número ✅                   │ │
│  │  ✅ 8 slides (ideal) ✅                          │ │
│  │  ✅ Tema campeão ✅                              │ │
│  │  ✅ Tom consistente ✅                           │ │
│  │                                                  │ │
│  │  [Editar]  [Copiar]  [Exportar]                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  VARIAÇÃO 2                  Score DNA: 91/100   │ │
│  │  [...]                                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  VARIAÇÃO 3                  Score DNA: 88/100   │ │
│  │  [...]                                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 9. Casos de Uso Detalhados

### Caso de Uso 1: Criador Solo Quer Escalar Produção

**Persona:** Ana, 32 anos, criadora de conteúdo sobre marketing digital
**Seguidores:** 12k
**Problema:** Leva 3-4h para criar cada post, não consegue manter consistência, não sabe por que alguns posts "bombam" e outros floppam

**Jornada:**

1. **Upload de Dados** (5 min)
   - Ana exporta últimos 100 posts do Instagram via Apify
   - Faz upload do JSON no sistema
   - Sistema valida e confirma 100 posts aceitos

2. **Aguarda Processamento** (2-3 min)
   - Sistema analisa em background
   - Ana recebe notificação: "DNA pronto!"

3. **Explora DNA** (15 min)
   - Descobre que seus carrosséis sobre "precificação" são campeões
   - Vê que terças 19h é seu horário ideal
   - Percebe que hooks com pergunta + número performam 3x melhor
   - Identifica que posts motivacionais genéricos têm engajamento -45%

4. **Ajusta Estratégia** (planejamento)
   - Decide focar 40% do conteúdo em "precificação"
   - Planeja publicar sempre terças e quintas 19h
   - Cria checklist: "todo hook precisa ter pergunta OU número"

5. **Usa Gerador de Posts** (30 min por post, antes eram 3-4h)
   - Seleciona tema "precificação"
   - Gera 3 variações de carrossel
   - Escolhe a de score 94/100
   - Edita pequenos detalhes
   - Exporta para Canva

6. **Resultados (30 dias depois)**
   - Tempo de criação: -67% (de 3-4h para 1h)
   - Taxa de acerto: +120% (mais posts acima da média)
   - Consistência: publica 5x/semana vs 2-3x antes
   - Engajamento médio: +34%
   - ROI: Economiza 10-12h/semana = R$ 4.000/mês (se hora vale R$ 100)

---

### Caso de Uso 2: Agência Precisa Padronizar Produção

**Persona:** Marcos, 38 anos, dono de agência com 15 clientes
**Problema:** Cada redator tem estilo diferente, qualidade inconsistente, difícil treinar novos membros, clientes reclamam de falta de resultado

**Jornada:**

1. **Gera DNA para Cada Cliente** (1 dia de trabalho inicial)
   - Extrai histórico de posts dos 15 clientes
   - Roda análise de DNA para todos
   - Gera playbooks personalizados

2. **Distribui Playbooks** (onboarding)
   - Cada redator recebe playbook do(s) cliente(s) dele
   - Playbook contém:
     - Templates testados
     - Checklists de qualidade
     - Exemplos de hooks vencedores
     - Tom de voz específico
     - Timing ideal

3. **Produção Padronizada**
   - Redator novo: leva 3 dias para produzir no nível de alguém com 3 meses
   - Qualidade consistente entre redatores
   - Cliente reconhece "voz" dele nos posts

4. **Relatórios para Clientes**
   - Usa "White Label Reports" (funcionalidade #40)
   - Mostra DNA + evolução mensal
   - Justifica estratégia com dados

5. **Resultados (90 dias depois)**
   - Onboarding de novo redator: -93% tempo (4 semanas → 3 dias)
   - Qualidade: desvio padrão -60% (muito mais consistente)
   - Retenção de clientes: +40% (clientes veem resultados)
   - ROI: Economiza 120h/mês em retrabalho e treinamento = R$ 48k/mês

---

### Caso de Uso 3: Infoprodutor Quer Aumentar Conversão

**Persona:** Rodrigo, 45 anos, vende curso de R$ 1.997 sobre finanças
**Seguidores:** 28k
**Problema:** Muito engajamento mas poucas vendas, não sabe qual conteúdo converte

**Jornada:**

1. **Análise de DNA + Rastreamento de Conversão**
   - Além do DNA básico, usa "DM Qualifier" (funcionalidade #26)
   - Correlaciona posts com DMs qualificados e vendas

2. **Descobre Insights Contra-Intuitivos**
   - Posts virais (200k+ alcance) geram MENOS vendas
   - Posts sobre "casos de transformação" têm -60% alcance MAS +180% conversão
   - Seguidores vindos de conteúdo educacional têm LTV 3x maior (funcionalidade #27)

3. **Ajusta Estratégia**
   - Reduz tentativas de viralizar (eram 40% do conteúdo)
   - Aumenta cases de resultado para 30%
   - Foca em qualidade vs quantidade de seguidores

4. **Funil Otimizado** (usa funcionalidade #25)
   - Identifica que 77% dos visitantes da bio não clicam no link
   - Muda bio para: "Vagas abertas: transforme suas finanças em 90 dias"
   - Taxa de clique: +89%

5. **Resultados (60 dias depois)**
   - Crescimento de seguidores: -15% (menos foco em viralizar)
   - Mas vendas: +120% 🎯
   - Ticket médio: +30% (audiência mais qualificada)
   - CAC (custo de aquisição): -45%
   - ROI: De 18 vendas/mês para 42 vendas/mês = +R$ 48k/mês em receita

---

## 10. Roadmap de Implementação

### Fase 1: MVP (4 semanas)

**Semana 1-2: Core Backend**
- [ ] Setup inicial (repo, docker, CI/CD)
- [ ] Banco de dados (schema, migrations)
- [ ] API de upload de posts
- [ ] Parser de dados (JSON, CSV)
- [ ] Cálculo de performance score básico

**Semana 3: Análise Básica**
- [ ] Extração de features básicas (formato, timing, estrutura)
- [ ] Classificação winners vs losers
- [ ] Geração de DNA simplificado (top 5 dimensões)
- [ ] Cálculo de confidence score

**Semana 4: Interface MVP**
- [ ] Tela de upload
- [ ] Dashboard básico com score
- [ ] Visualização de 5 dimensões principais
- [ ] Exportação de relatório em JSON

**Entrega MVP:** DNA de Conteúdo funcional com 5 dimensões (Formato, Hook, Timing, Estrutura, Tema)

---

### Fase 2: Completar Análise (4 semanas)

**Semana 5-6: Dimensões Avançadas**
- [ ] Análise de Tom e Voz (NLP avançado)
- [ ] Análise de CTA
- [ ] Análise de Vocabulário (palavras de poder)
- [ ] Análise visual (cores, tipografia) - básico
- [ ] Análise de prova social

**Semana 7: Feature Importance & Pesos**
- [ ] Implementar Random Forest para feature importance
- [ ] Calcular pesos automáticos
- [ ] Validação cruzada do DNA
- [ ] Testes estatísticos de confiança

**Semana 8: Refinamento de Algoritmos**
- [ ] Otimizar clustering de temas (LDA)
- [ ] Melhorar classificação de hooks
- [ ] Adicionar análise de correlações
- [ ] Performance tuning

**Entrega Fase 2:** DNA completo com 10 dimensões e pesos calculados automaticamente

---

### Fase 3: Geração de Templates (3 semanas)

**Semana 9-10: Template Engine**
- [ ] Sistema de templates (Jinja2)
- [ ] Geração de templates por tipo (carrossel, reel, etc)
- [ ] Exemplos de hooks vencedores
- [ ] Checklists de qualidade

**Semana 11: Integração com AI**
- [ ] Integração com GPT-4/Claude API
- [ ] Gerador de posts baseado em DNA
- [ ] Gerador de variações de hook
- [ ] Validador de DNA match score

**Entrega Fase 3:** Gerador de posts funcionando com templates customizados

---

### Fase 4: Interface Completa (3 semanas)

**Semana 12-13: Dashboard Avançado**
- [ ] Visualizações ricas (Recharts, D3.js)
- [ ] Heatmap de timing
- [ ] Gráficos de distribuição por dimensão
- [ ] Exploração detalhada de cada dimensão

**Semana 14: Gerador de Posts UI**
- [ ] Interface de geração de posts
- [ ] Preview de templates
- [ ] Editor de variações
- [ ] Exportação (Canva, PDF, etc)

**Entrega Fase 4:** Interface completa e polida

---

### Fase 5: Otimizações & Features Avançadas (4 semanas)

**Semana 15: Atualização Automática**
- [ ] Sistema de re-análise periódica
- [ ] Detecção de mudança de padrões
- [ ] Alertas quando DNA fica desatualizado
- [ ] Versionamento de DNA

**Semana 16: Comparações**
- [ ] Comparar DNA com concorrentes
- [ ] Benchmark vs nicho
- [ ] Identificar gaps de oportunidade

**Semana 17: Exportações & Integrações**
- [ ] Export PDF profissional
- [ ] Export para Notion, Google Docs
- [ ] Integração com Canva (API)
- [ ] Webhooks para notificações

**Semana 18: Polimento Final**
- [ ] Otimização de performance
- [ ] Testes end-to-end
- [ ] Documentação completa
- [ ] Guias de uso

**Entrega Fase 5:** Produto completo, robusto e escalável

---

### Timeline Total: 18 semanas (~4.5 meses)

**Milestones:**
- **Mês 1:** MVP funcional (5 dimensões)
- **Mês 2:** DNA completo (10 dimensões)
- **Mês 3:** Gerador de templates + Interface básica
- **Mês 4:** Interface completa + Features avançadas
- **Mês 4.5:** Polimento e lançamento

---

## 11. Testes e Validação

### 11.1 Testes Unitários

```python
# test_performance_score.py
def test_calcular_performance_score():
    # Arrange
    post = Post(
        likes=420,
        comments=32,
        saves=156,
        shares=18,
        reach=3200
    )

    # Act
    score = calcular_performance_score(post)

    # Assert
    assert score['score'] >= 0 and score['score'] <= 100
    assert score['percentile'] >= 0 and score['percentile'] <= 100
    assert 'breakdown' in score
    assert len(score['breakdown']) == 5


def test_extrair_features_hook():
    # Arrange
    caption = "Você está cobrando MENOS do que deveria? 💔\n\n8 passos..."

    # Act
    features = extrair_features_hook(caption)

    # Assert
    assert features['tem_pergunta'] == True
    assert features['tem_numero'] == True
    assert features['tem_emoji'] == True
    assert features['tipo'] == 'pergunta_pessoal'
    assert features['tamanho_chars'] == 47


def test_gerar_dna_minimo_posts():
    # Arrange
    posts = [create_mock_post() for _ in range(30)]

    # Act & Assert
    with pytest.raises(ValueError):
        # Deve exigir mínimo 50 posts
        gerar_dna_conteudo(posts[:10], posts[10:20])
```

### 11.2 Testes de Integração

```python
# test_dna_generation_integration.py
@pytest.mark.integration
def test_fluxo_completo_geracao_dna(client, db):
    # 1. Upload de posts
    response = client.post("/api/v1/dna/upload-posts", json={
        "account_id": "test-account",
        "posts": [create_mock_post_data() for _ in range(100)]
    })
    assert response.status_code == 200
    job_id = response.json()['job_id']

    # 2. Aguardar processamento
    wait_for_job_completion(job_id, timeout=60)

    # 3. Gerar DNA
    response = client.post("/api/v1/dna/generate", json={
        "account_id": "test-account"
    })
    assert response.status_code == 200
    dna_id = response.json()['dna_id']

    # 4. Validar DNA gerado
    response = client.get(f"/api/v1/dna/{dna_id}/full")
    assert response.status_code == 200
    dna = response.json()

    # Validações
    assert dna['meta']['confidence_score'] > 0
    assert 'dimensoes' in dna
    assert len(dna['dimensoes']) == 10
    assert 'formula_dna' in dna
    assert 'recomendacoes_acao' in dna
```

### 11.3 Testes de Validação de DNA

```python
def test_dna_tem_poder_preditivo():
    """
    Testa se o DNA realmente consegue prever performance
    """
    # Arrange
    posts_treino = Post.objects.filter(timestamp__lt='2026-01-01')
    posts_teste = Post.objects.filter(timestamp__gte='2026-01-01')

    # Gerar DNA com posts de treino
    dna = gerar_dna_conteudo(posts_treino[:50], posts_treino[-50:])

    # Act: Calcular match score para posts de teste
    scores_preditos = []
    scores_reais = []

    for post in posts_teste:
        score_predito = calcular_match_score(post, dna)
        score_real = post.performance_score

        scores_preditos.append(score_predito)
        scores_reais.append(score_real)

    # Assert: Correlação deve ser > 0.6
    correlacao = np.corrcoef(scores_preditos, scores_reais)[0, 1]
    assert correlacao > 0.6, f"Correlação muito baixa: {correlacao}"
```

### 11.4 Testes A/B de Validação Real

**Protocolo de Teste:**

1. **Baseline (2 semanas):**
   - Criador continua postando normalmente
   - Coletar métricas baseline

2. **Intervenção (4 semanas):**
   - Criador aplica recomendações do DNA
   - Usa templates gerados
   - Segue timing e estrutura sugeridos

3. **Métricas de Sucesso:**
   - Engajamento médio aumenta ≥ 20%
   - Taxa de acerto (posts acima da média) aumenta ≥ 50%
   - Tempo de criação reduz ≥ 40%

4. **Validação Estatística:**
   - T-test para comparar médias
   - P-value < 0.05 para significância

---

## 12. Métricas de Sucesso

### 12.1 Métricas de Produto

| Métrica | Baseline | Meta Mês 1 | Meta Mês 3 | Meta Mês 6 |
|---------|----------|------------|------------|------------|
| Usuários ativos | 0 | 100 | 500 | 2.000 |
| DNAs gerados | 0 | 200 | 1.000 | 5.000 |
| Templates criados/usados | 0 | 500 | 3.000 | 15.000 |
| Posts gerados com IA | 0 | 300 | 2.000 | 12.000 |
| NPS (satisfação) | - | 40 | 60 | 75 |
| Churn mensal | - | <15% | <10% | <7% |

### 12.2 Métricas de Impacto (para usuários)

| Métrica | Antes | Depois (60 dias) | Melhoria |
|---------|-------|------------------|----------|
| Tempo de criação/post | 3h | 1h | -67% |
| Taxa de acerto (>média) | 30% | 70% | +133% |
| Engajamento médio | Baseline | +30-50% | Variável |
| Consistência (desvio padrão) | ±45% | ±18% | -60% |
| Onboarding de equipe | 4 semanas | 3 dias | -93% |

### 12.3 Métricas de Negócio

**Modelo de Monetização Sugerido:**
- **Freemium:** DNA básico grátis (1 análise/mês)
- **Pro:** R$ 97/mês (DNAs ilimitados + templates)
- **Agency:** R$ 497/mês (10 contas + white label)
- **Enterprise:** R$ 1.997/mês (ilimitado + API + suporte)

**Projeções de Receita (12 meses):**
- Mês 1-3: R$ 10k MRR (100 usuários, mix de planos)
- Mês 4-6: R$ 50k MRR (500 usuários)
- Mês 7-12: R$ 200k MRR (2.000 usuários)

**ROI para Usuário:**
- Criador solo: Economiza 10h/semana = R$ 4k/mês (se hora = R$ 100)
- Custo: R$ 97/mês
- ROI: 41x

---

## 13. Considerações e Limitações

### 13.1 Limitações Técnicas

1. **Dados Mínimos Necessários**
   - Requer mínimo 50 posts com métricas
   - Contas novas (<3 meses) terão DNA de baixa confiança
   - Solução: Oferecer templates genéricos até ter dados suficientes

2. **Acesso a Dados do Instagram**
   - Instagram Graph API tem limitações
   - Nem todas métricas são acessíveis (ex: saves só via app)
   - Solução: Permitir upload manual ou uso de ferramentas (Apify)

3. **Análise Visual Limitada**
   - Computer vision para análise de design é complexa
   - Requer muito processamento
   - Solução: Começar com análise básica (cores dominantes)

4. **Modelos de Linguagem (NLP)**
   - Modelos em português são menos precisos
   - Gírias e linguagem informal são desafios
   - Solução: Fine-tuning com dados do nicho

### 13.2 Limitações de Negócio

1. **Não Substitui Estratégia**
   - DNA otimiza execução, não define estratégia
   - Criador ainda precisa decidir posicionamento
   - Solução: Deixar claro que é ferramenta de otimização

2. **Padrões Mudam**
   - Algoritmo do Instagram muda
   - DNA pode ficar desatualizado
   - Solução: Re-análise periódica (a cada 90 dias)

3. **Não Funciona para Todos Nichos Igualmente**
   - Nichos muito específicos têm pouco benchmark
   - Conteúdo viral vs evergreen tem padrões diferentes
   - Solução: Segmentar análise por tipo de nicho

### 13.3 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Instagram bloqueia acesso a API | Média | Alto | Suportar múltiplas fontes de dados (Apify, manual) |
| Usuários não veem melhoria | Baixa | Alto | Garantir validação científica antes de lançar |
| Concorrentes copiam funcionalidade | Alta | Médio | Focar em execução superior e network effects |
| Custo de AI (GPT-4) fica inviável | Baixa | Médio | Usar modelos open-source quando possível |
| Dados sensíveis vazam | Baixa | Muito Alto | Criptografia, compliance LGPD, auditorias |

### 13.4 Considerações Éticas

1. **Privacidade**
   - Dados de posts podem conter informações sensíveis
   - Solução: Anonimizar dados, não compartilhar entre contas

2. **Autenticidade vs Otimização**
   - Risco de criar conteúdo "robótico" demais
   - Solução: DNA deve capturar voz única, não homogeneizar

3. **Dependência de Algoritmo**
   - Otimizar para algoritmo pode prejudicar valor real
   - Solução: Balancear métricas de vaidade com conversão real

---

## 14. Conclusão

O **DNA de Conteúdo** é uma funcionalidade transformadora que converte dados históricos em insights acionáveis e templates prontos para uso. Ao identificar padrões vencedores e sistematizar a criação de conteúdo, permite que criadores, agências e marcas:

✅ **Reduzam tempo de criação em 60-70%**
✅ **Aumentem taxa de acerto em 100-150%**
✅ **Escalem produção sem perder qualidade**
✅ **Tomem decisões baseadas em dados, não achismos**
✅ **Onboardem equipes em dias, não semanas**

Com uma implementação bem executada em ~4.5 meses e validação rigorosa, esta funcionalidade tem potencial de se tornar o **core diferenciador** do Squad Auditores, gerando valor mensurável e recorrente para usuários.

---

**Próximos Passos Recomendados:**

1. ✅ Validar conceito com 10-20 beta testers
2. ✅ Refinar algoritmos com dados reais
3. ✅ Desenvolver MVP (Fase 1) em 4 semanas
4. ✅ Iterar baseado em feedback
5. ✅ Escalar para produto completo

---

*Documento técnico gerado por Squad Auditores*
*Versão: 2.0*
*Autor: Squad Auditores Team*
*Data: 2026-02-16*
*Última atualização: 2026-02-16*
