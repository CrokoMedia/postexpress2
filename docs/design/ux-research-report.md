# 🧠 UX Research Report — PostExpress

**Data:** 2026-02-16
**Pesquisadora:** Uma (UX Design Expert) - Modo Sally
**Metodologia:** Jobs-to-be-Done + Pesquisa Empática

---

## 🎯 Objetivo da Pesquisa

Entender profundamente os usuários do PostExpress para desenhar um Editor Visual que:
1. Seja **intuitivo** para não-designers
2. Reduza **tempo de edição** para <30min
3. Aumente **taxa de aprovação** de 40% para 90%+
4. Gere **autonomia** ao cliente

---

## 👥 Personas Identificadas

### PERSONA 1: Maria (Operadora Pazos Media)

**Perfil:**
- 📝 Cargo: Content Manager na Pazos Media
- 🎂 Idade: 28 anos
- 💼 Experiência: 3 anos em marketing de conteúdo
- 🎓 Formação: Marketing Digital
- 🛠️ Skills: Social media, copywriting, básico de design (Canva)

**Contexto:**
- Trabalha com 8-12 clientes simultaneamente
- Precisa gerar 40-60 carrosséis por mês
- Usa Claude Code + Squads de IA para criação
- Passa 60% do tempo ajustando layouts e cores

**Jobs-to-be-Done:**
> "Quando o Squad Criação gera um carrossel, **eu quero visualizar e fazer pequenos ajustes** de forma rápida, **para que** eu possa aprovar e entregar ao cliente sem precisar regenerar tudo."

**Pain Points:**
- 😫 "Às vezes a IA escolhe uma cor que não combina com a brand do cliente"
- 😫 "Eu preciso ajustar padding porque o texto fica muito próximo da borda"
- 😫 "Quando erro, tenho que pedir pra IA refazer tudo (custa $0.10 + 5min)"
- 😫 "Não tenho controle pixel-perfect das posições"

**Ganhos Esperados:**
- ✅ "Quero ajustar cores e fontes sem depender da IA"
- ✅ "Quero mover elementos com drag & drop"
- ✅ "Quero ver preview em tempo real (estilo Instagram)"
- ✅ "Quero que salve automaticamente (medo de perder trabalho)"

**Citação:**
> "Eu não sou designer, mas sei quando algo não está bonito. Só preciso de um jeito rápido de consertar."

---

### PERSONA 2: Carlos (Cliente Final - Infoprodutor)

**Perfil:**
- 📝 Cargo: Infoprodutor / Coach de Negócios
- 🎂 Idade: 42 anos
- 💼 Experiência: 8 anos empreendendo
- 🎓 Formação: Administração de Empresas
- 🛠️ Skills: Vendas, lançamentos, zero design

**Contexto:**
- Contratou Pazos Media para criar 16 carrosséis/mês
- Não tem tempo nem paciência para aprender ferramentas complexas
- Acessa o Portal do Cliente 2x por semana
- Quer aprovar rápido e focar em vender

**Jobs-to-be-Done:**
> "Quando recebo um carrossel pronto, **eu quero visualizar, fazer pequenos ajustes de texto ou cores**, **para que** fique alinhado com minha brand sem depender de terceiros."

**Pain Points:**
- 😫 "Às vezes a IA escreve um termo que eu não usaria"
- 😫 "A cor não combina com meu logo (laranja, não azul)"
- 😫 "Tenho que pedir ajuste → esperar 24h → aprovar (muito lento)"
- 😫 "Não quero aprender Photoshop ou Canva"

**Ganhos Esperados:**
- ✅ "Quero editar o texto inline (como no Google Docs)"
- ✅ "Quero trocar a cor do fundo com um clique"
- ✅ "Quero ver o resultado final antes de aprovar"
- ✅ "Quero que seja TÃO SIMPLES quanto Instagram Stories"

**Citação:**
> "Eu vendo. Não desenho. Mas se a cor não bater com minha brand, eu não posto."

---

### PERSONA 3: Rafael (Designer Pazos Media)

**Perfil:**
- 📝 Cargo: Designer Sênior na Pazos Media
- 🎂 Idade: 31 anos
- 💼 Experiência: 7 anos em design visual
- 🎓 Formação: Design Gráfico
- 🛠️ Skills: Figma, Photoshop, Illustrator, motion design

**Contexto:**
- Cria templates base para o sistema
- Define design system (cores, tipografia, spacing)
- Não tem tempo para ajustar cada carrossel manualmente
- Quer que operadores sigam padrões

**Jobs-to-be-Done:**
> "Quando criamos templates, **eu quero garantir consistência visual**, **para que** todos os carrosséis mantenham o padrão de qualidade da Pazos Media."

**Pain Points:**
- 😫 "Operadores às vezes usam cores fora da palette"
- 😫 "Não temos um design system documentado"
- 😫 "Cada pessoa ajusta do jeito que acha melhor"
- 😫 "Difícil manter controle de qualidade em escala"

**Ganhos Esperados:**
- ✅ "Quero um design system com tokens (cores, fontes, spacing)"
- ✅ "Quero que operadores só possam usar cores aprovadas"
- ✅ "Quero templates pré-configurados que 'funcionam'"
- ✅ "Quero que seja impossível quebrar o layout"

**Citação:**
> "Design system não é luxo. É o que permite escalar sem perder qualidade."

---

## 📊 Análise de Workflows Atuais

### Workflow Atual (SEM Editor Visual)

```
1. Squad Criação gera JSON → Cloudinary renderiza → Imagem PNG
   [10-15 min]           [$0.10]

2. Maria vê no Portal → Pede ajuste ("cor azul → laranja")
   [2 min]

3. Squad Criação re-gera → Cloudinary re-renderiza
   [10 min]             [$0.10]

4. Maria vê novamente → Pede outro ajuste ("fonte menor")
   [2 min]

5. Squad Criação re-gera → Cloudinary re-renderiza
   [10 min]             [$0.10]

6. Maria aprova → Envia para Carlos
   [2 min]

7. Carlos vê → Pede ajuste ("trocar palavra X por Y")
   [1 dia depois]

8. Squad Criação re-gera → Cloudinary re-renderiza
   [10 min]             [$0.10]

TOTAL: ~50 min + $0.40 + 1 dia de espera
```

**Taxa de aprovação na 1ª tentativa:** 40%
**Média de re-renderizações:** 3-4x
**Custo médio:** $0.30-0.40 por carrossel

---

### Workflow Ideal (COM Editor Visual)

```
1. Squad Criação gera JSON → Editor Visual carrega
   [10-15 min]           [$0 renderização]

2. Maria edita no navegador (cor, fonte, posição, texto)
   [15 min]              [$0 - tudo local]
   Auto-save contínuo

3. Maria faz preview estilo Instagram → Aprova
   [2 min]

4. Envia para Carlos no Portal

5. Carlos abre Editor → Faz pequeno ajuste de texto
   [5 min]               [$0 - tudo local]

6. Carlos faz preview → Aprova para renderização
   [1 min]

7. Cloudinary renderiza 1x (versão final aprovada)
   [5 min]               [$0.10]

TOTAL: ~40 min + $0.10 + mesmo dia
```

**Taxa de aprovação esperada:** 90%+
**Média de re-renderizações:** 1x (só a final)
**Custo médio:** $0.10 por carrossel
**ECONOMIA:** 70-75% de custo + 50% de tempo

---

## 🎯 Requisitos UX Extraídos

### Requisitos Funcionais

#### 1. Edição de Texto (CRÍTICO)
- ✅ Clique duplo para editar inline
- ✅ Rich text (negrito, itálico)
- ✅ Mudança de fonte (dropdown com 15+ fontes)
- ✅ Tamanho de texto (slider 12px-120px)
- ✅ Cor de texto (color picker)
- ✅ Alinhamento (esquerda, centro, direita)

**Por quê?** Maria e Carlos precisam ajustar copy sem regenerar tudo.

---

#### 2. Edição de Cores (CRÍTICO)
- ✅ Color picker para fundo
- ✅ Color picker para elementos
- ✅ Palette pré-definida (brand colors)
- ✅ Eyedropper (pegar cor de logo)

**Por quê?** Carlos precisa alinhar com sua brand (laranja, não azul).

---

#### 3. Drag & Drop (IMPORTANTE)
- ✅ Mover textos e imagens
- ✅ Resize com proporções mantidas
- ✅ Snap to grid (alinhamento automático)
- ✅ Guias de alinhamento

**Por quê?** Maria precisa ajustar posições pixel-perfect.

---

#### 4. Preview em Tempo Real (CRÍTICO)
- ✅ Modal full-screen simulando Instagram
- ✅ Modo carrossel (swipe entre slides)
- ✅ Preview enquanto edita (live)

**Por quê?** Maria e Carlos precisam ver resultado final antes de aprovar.

---

#### 5. Auto-Save (CRÍTICO)
- ✅ Salvar a cada 2 segundos (debounced)
- ✅ Indicador visual de salvamento
- ✅ Histórico de versões (undo/redo)

**Por quê?** Maria tem medo de perder trabalho se browser crashar.

---

#### 6. Templates Pré-configurados (IMPORTANTE)
- ✅ Biblioteca de 5+ templates
- ✅ Preview de cada template
- ✅ Aplicar template com 1 clique
- ✅ Templates respeitam safe area

**Por quê?** Rafael quer garantir qualidade e consistência.

---

#### 7. Simplicidade (CRÍTICO)
- ✅ Interface intuitiva (0 treinamento)
- ✅ Tooltips contextuais
- ✅ Atalhos de teclado documentados
- ✅ Onboarding tour (primeira vez)

**Por quê?** Carlos não quer aprender ferramentas complexas.

---

### Requisitos Não-Funcionais

#### Performance
- ⚡ Carregamento inicial: <1s
- ⚡ Troca de slide: <100ms
- ⚡ Renderização canvas: 60fps
- ⚡ Auto-save sem travar UI

#### Acessibilidade
- ♿ WCAG AA mínimo
- ♿ Atalhos de teclado
- ♿ Navegação por tab
- ♿ Screen reader friendly

#### Mobile
- 📱 Layout responsivo
- 📱 Touch gestures (pinch, swipe)
- 📱 Teclado virtual otimizado

---

## 🧭 Princípios de Design (UX)

### 1. SIMPLICIDADE ACIMA DE TUDO
> "Fazer o complexo parecer simples."

- Interface limpa, sem distrações
- Funções avançadas escondidas (progressive disclosure)
- Defaults inteligentes (80% dos usuários não precisam mexer)

### 2. FEEDBACK IMEDIATO
> "O que você vê é o que você terá."

- Preview em tempo real
- Hover states claros
- Confirmações visuais de ações

### 3. ZERO MEDO DE ERRAR
> "Undo é seu melhor amigo."

- Undo/Redo (até 50 estados)
- Auto-save contínuo
- Confirmação antes de ações destrutivas

### 4. GUIAR, NÃO CONTROLAR
> "Constraints libertam."

- Snap to grid (mas desligável)
- Safe area visível
- Palette sugerida (mas customizável)

### 5. AUTONOMIA COM GUARDRAILS
> "Cliente pode editar, mas não quebrar."

- Templates com estrutura sólida
- Limites de tamanho (min/max font size)
- Validação antes de aprovar

---

## 📈 Métricas de Sucesso (UX)

| Métrica | Baseline Atual | Meta v2.0 | Como Medir |
|---------|---------------|-----------|------------|
| Taxa de aprovação 1ª tentativa | 40% | 90%+ | Portal analytics |
| Tempo médio de edição | N/A (não existe) | <30 min | editor_sessions |
| Número de re-renderizações | 3-4x | 1x | render_queue |
| NPS do Editor | N/A | 50+ | Survey in-app |
| % que usa Editor vs "aprovar direto" | N/A | 85%+ | Portal analytics |
| Erros/crashes por sessão | N/A | <0.1 | Error tracking |

---

## 💡 Insights para o Design

### Insight 1: "Não é Photoshop, é Google Docs de Design"
Usuários não querem ferramenta profissional. Querem simplicidade de editar um documento.

**Implicação:** Interface deve parecer com Google Docs (inline editing), não Figma.

---

### Insight 2: "Preview é Mais Importante que Edição"
Usuários precisam ver resultado final ANTES de aprovar. Preview é a feature killer.

**Implicação:** Botão "Preview" deve ser gigante e óbvio. Modal preview full-screen simulando Instagram.

---

### Insight 3: "Auto-save Remove Ansiedade"
Medo de perder trabalho é real. Auto-save contínuo gera confiança.

**Implicação:** Indicador de "Salvo" sempre visível. Nunca perguntar "Salvar antes de sair?".

---

### Insight 4: "Templates São Constraints Libertadoras"
Página em branco paralisa. Templates com estrutura sólida liberam criatividade.

**Implicação:** Sempre começar de um template. Nunca canvas vazio.

---

### Insight 5: "Cores da Brand São Sagradas"
Cliente não posta se cor não bater com brand. Palette customizável é essencial.

**Implicação:** Permitir cliente definir palette de 3-5 cores (brand colors).

---

## 🎯 Próximos Passos

1. ✅ Pesquisa UX (FEITO)
2. ⏳ Criar wireframes baseados nesses insights
3. ⏳ Validar wireframes com stakeholders
4. ⏳ Prototipar interações críticas
5. ⏳ Testar com usuários reais (Maria + Carlos)

---

**Assinado:** Uma, pesquisando com empatia 💝
