# 🛡️ Guia Anti-Hallucination - Content Creation Squad

> **Problema resolvido**: O squad estava inventando números, cases e resultados que não existiam nas auditorias ou contexto dos experts.

---

## ✅ Correções Implementadas (2026-02-23)

### 1. **System Prompts das Mentes** (4 arquivos corrigidos)

**Adicionada restrição crítica em:**
- ✅ `minds/gary_vaynerchuk/system_prompts/COGNITIVE_OS.md`
- ✅ `minds/alex_hormozi/system_prompts/COGNITIVE_OS.md`
- ✅ `minds/eugene_schwartz/system_prompts/eugene-schwartz-v2.md`
- ✅ `minds/seth_godin/system_prompts/SYSTEM_PROMPT_SETH_GODIN_POSICIONAMENTO.md`

**Texto adicionado:**
```markdown
## ⚠️ RESTRIÇÃO CRÍTICA: DADOS REAIS APENAS

**NUNCA INVENTE dados, números ou cases fictícios:**
- ❌ PROIBIDO: Inventar percentuais de conversão, ROI, crescimento, faturamento
- ❌ PROIBIDO: Criar cases de clientes/resultados fictícios
- ❌ PROIBIDO: Simular métricas (engajamento, alcance, vendas)
- ✅ PERMITIDO: Usar números/casos que o usuário fornecer
- ✅ PERMITIDO: Citar dados reais documentados (seus próprios)
- ✅ PERMITIDO: Marcar claramente exemplos fictícios como "EXEMPLO:"

**Se faltar dado real:** Diga "Você precisa fornecer [X dado real]" ou deixe placeholder [INSERIR NÚMERO REAL].
```

---

### 2. **Tasks Principais** (2 arquivos corrigidos)

#### A. `tasks/create-carousel.md` (4 edições)

**Correções:**
1. **Exemplo 2 (Vendas)** - Marcado como TEMPLATE, placeholders adicionados
2. **Métricas Esperadas** - Clarificado que são benchmarks gerais, não garantias
3. **Prompt ao Eugene** - Adicionada restrição explícita sobre dados reais
4. **Checklist** - Adicionados 2 itens críticos de validação

**Antes:**
```markdown
5. Prova: Case real com números
```

**Depois:**
```markdown
5. Prova: [INSERIR CASE REAL com números VERDADEIROS do seu negócio ou clientes]

⚠️ NÃO invente números, cases ou resultados. Use APENAS dados reais.
```

#### B. `tasks/create-twitter-post.md` (2 edições)

**Correções:**
1. **Métricas Esperadas** - Marcadas como benchmarks, não dados reais
2. **Prompt ao Eugene** - Restrição sobre números reais apenas

---

### 3. **Workflows** (1 arquivo corrigido)

#### `workflows/carousel-full-flow.md` (3 edições)

**Adicionado no início:**
```markdown
## ⚠️ RESTRIÇÃO CRÍTICA PARA TODO O WORKFLOW

Durante TODAS as fases, as mentes devem:
- ❌ NUNCA inventar números, métricas, cases ou resultados fictícios
- ✅ Usar APENAS dados que o usuário fornecer explicitamente

Se uma mente precisar de um número/case que não foi fornecido:
→ Deve PARAR e pedir ao usuário
→ NÃO deve continuar inventando dados
```

---

## 🎯 Como Usar o Squad Sem Hallucination

### **Ao Solicitar Carrossel/Conteúdo:**

#### ✅ CORRETO - Forneça Dados Reais:
```
"Crie carrossel de vendas do meu infoproduto.

DADOS REAIS:
- Produto: Curso de Copywriting
- Preço: R$ 497
- Resultados de alunos: João aumentou conversão de 2% para 7% em 30 dias
- Garantia: 7 dias
- Bônus: 1h de mentoria 1:1 + Templates de Copy"
```

#### ❌ ERRADO - Sem Dados:
```
"Crie carrossel de vendas do meu infoproduto"
```
→ **Problema**: Claude pode inventar preço, resultados, bônus que não existem.

---

### **Ao Revisar Output:**

#### Checklist de Validação:

- [ ] **Todos os números citados são meus dados reais?**
  - Percentuais de conversão
  - ROI/crescimento
  - Faturamento
  - Número de clientes

- [ ] **Todos os cases/testemunhos são reais?**
  - Nomes (se fictícios, estão marcados como [EXEMPLO]?)
  - Resultados (são verdadeiros?)

- [ ] **Métricas de performance são estimativas ou garantias?**
  - "Espera-se X alcance" = estimativa (OK)
  - "Vai ter X alcance" = garantia (ERRADO)

- [ ] **Provas sociais são autênticas?**
  - Depoimentos de clientes reais?
  - Screenshots reais ou simulados?

---

## 🚨 Sinais de Hallucination (Red Flags)

### **Números Muito Específicos Sem Fonte:**
❌ "Cliente aumentou vendas em 347% em 23 dias"
✅ "Cliente aumentou vendas em [INSERIR % REAL] em [INSERIR PERÍODO]"

### **Cases Detalhados Sem Você Ter Fornecido:**
❌ "Maria tinha R$ 5k/mês e em 90 dias passou para R$ 50k/mês"
✅ "[INSERIR CASE REAL com nome e números verdadeiros]"

### **Métricas de Benchmark Apresentadas Como Garantia:**
❌ "Este carrossel vai ter 15% de engagement"
✅ "Benchmark de mercado: 5-8% engagement (varia por audiência)"

### **Bônus/Ofertas Que Você Não Oferece:**
❌ "Bônus: Masterclass exclusiva + Mentoria vitalícia"
✅ Apenas bônus que você realmente oferece

---

## 📋 Template de Briefing Completo (Anti-Hallucination)

Use este template ao solicitar conteúdo para EVITAR invenções:

```markdown
# BRIEFING COMPLETO - [Tipo de Conteúdo]

## 1. OBJETIVO
[Educar/Vender/Autoridade/Viral]

## 2. PLATAFORMA
[Instagram/LinkedIn/Ambas]

## 3. AUDIÊNCIA
[Descrição detalhada]

## 4. DADOS REAIS DO NEGÓCIO (CRÍTICO - forneça tudo que se aplica)

### Produto/Serviço:
- Nome:
- Preço:
- O que está incluído:
- Garantia (se houver):
- Bônus reais (se houver):

### Resultados Reais:
- Case 1: [Nome/inicial] - [Resultado específico] em [Tempo]
- Case 2: [Nome/inicial] - [Resultado específico] em [Tempo]
(Se não tiver: deixe em branco ou escreva "SEM CASES AINDA")

### Métricas Reais:
- Conversão atual: [%] (se souber)
- Alcance médio: [número] (se souber)
- Engajamento médio: [%] (se souber)
(Se não tiver: escreva "NÃO TENHO DADOS" - não invente)

### Provas Sociais Reais:
- Número de clientes: [número real ou "não divulgar"]
- Depoimentos: [copiar reais ou "sem depoimentos ainda"]
- Prêmios/Credenciais: [listar reais ou "nenhum"]

## 5. MENSAGEM PRINCIPAL
[1-2 frases]

## 6. CTA DESEJADO
[Ação específica]

---

**⚠️ IMPORTANTE**: Todo dado acima é REAL. Não invente nada adicional.
Se precisar de algo não listado, pergunte em vez de inventar.
```

---

## 🔍 Como Detectar Hallucination em Outputs Existentes

### Audit de Carrosséis/Posts Já Criados:

1. **Leia todo o conteúdo**
2. **Para cada número/métrica:**
   - Este número veio de mim?
   - Está em alguma auditoria/documento meu?
   - É um benchmark geral (e está marcado como tal)?
   - Foi inventado? 🚨

3. **Para cada case/testemunho:**
   - Esta pessoa existe?
   - Estes resultados são verdadeiros?
   - Tenho permissão para usar?
   - Foi fabricado? 🚨

4. **Para cada afirmação de prova:**
   - "X clientes satisfeitos" - tenho este número?
   - "Y% de sucesso" - de onde veio?
   - "Z prêmios/reconhecimentos" - são reais?

---

## 🛠️ Correções Rápidas

### **Se encontrou hallucination em output existente:**

1. **Identifique o dado falso**
2. **Substitua por:**
   - Dado real (se tiver)
   - Placeholder: [INSERIR DADO REAL]
   - Remoção completa (se não for essencial)

### **Se vai usar o output "como está":**

⚠️ **NUNCA publique conteúdo com dados inventados**
- Pode configurar propaganda enganosa
- Perde credibilidade se descoberto
- Pode violar termos de plataformas

**Sempre valide antes de publicar.**

---

## 📚 Recursos Adicionais

### Arquivos Corrigidos (Consultar):
- `tasks/create-carousel.md` - Task principal corrigida
- `workflows/carousel-full-flow.md` - Workflow com validações
- System prompts de todas as mentes - Restrições adicionadas

### Padrão para Novos Prompts:
Sempre incluir:
```markdown
⚠️ Use APENAS dados reais fornecidos pelo usuário.
Se faltar informação: pergunte ou deixe placeholder [INSERIR REAL].
NUNCA invente números, cases ou métricas.
```

---

## ✅ Checklist de Publicação Final

Antes de publicar QUALQUER conteúdo criado pelo squad:

- [ ] Li todo o conteúdo linha por linha
- [ ] Todos os números citados são meus dados reais
- [ ] Todos os cases/testemunhos são autênticos
- [ ] Todas as provas sociais são verdadeiras
- [ ] Métricas estimadas estão claramente marcadas como "estimativa"
- [ ] Nenhum dado foi inventado pelo Claude
- [ ] Tenho evidências/fontes de tudo que foi afirmado
- [ ] Removi ou substitui qualquer placeholder [INSERIR X]

**Só publique quando todos os itens acima estiverem checados.**

---

**Última atualização**: 2026-02-23
**Versão**: 1.0
**Status**: ✅ Correções implementadas em 14 arquivos
