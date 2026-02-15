# 🎨 GUIA FIGMA: Stories Inveja e Prosperidade

**Projeto**: Sequência de 7 Stories Instagram
**Tema**: Inveja e Prosperidade
**Formato**: 1080x1920px (9:16)

---

## 🚀 SETUP INICIAL NO FIGMA

### Passo 1: Criar novo arquivo
1. Abrir Figma (https://figma.com)
2. Clicar em "New Design File"
3. Nomear: "Stories - Inveja e Prosperidade"

### Passo 2: Criar frames base
1. Pressionar `F` (Frame tool)
2. No painel direito, escolher "Phone" → "Instagram Story"
3. Ou criar manualmente: **1080 x 1920px**
4. Criar 7 frames (um para cada story)
5. Nomear: "Story 01", "Story 02", ..., "Story 07"

### Passo 3: Organizar canvas
```
Layout no canvas:
┌────────┬────────┬────────┬────────┐
│Story 01│Story 02│Story 03│Story 04│
└────────┴────────┴────────┴────────┘
┌────────┬────────┬────────┐
│Story 05│Story 06│Story 07│
└────────┴────────┴────────┘
```

**Espaçamento**: 100px entre frames

---

## 🎨 SETUP DE CORES (Color Styles)

### Criar paleta de cores reutilizável:

1. Clicar no ícone de 4 círculos (Styles)
2. Criar "Color Styles" com estes valores:

```
📦 PALETA INVEJA E PROSPERIDADE

Primária:
• Azul Escuro: #2C3E50
• Azul Médio: #34495E

Secundária:
• Verde Prosperidade: #27AE60
• Verde Claro: #2ECC71

Alertas:
• Vermelho Inveja: #E74C3C

Acentos:
• Dourado Transformação: #FFD23F
• Azul Destaque: #3498DB

Base:
• Preto: #1A1A1A
• Branco: #FFFFFF
• Branco 80%: #FFFFFF (80% opacity)
• Branco 60%: #FFFFFF (60% opacity)
```

**Como criar Color Style**:
1. Desenhar retângulo
2. Aplicar cor
3. Clicar no círculo de cor no painel
4. Clicar em "+" → Dar nome à cor
5. Repetir para todas as cores

---

## 🔤 SETUP DE TIPOGRAFIA (Text Styles)

### Importar fontes Google Fonts:

**Fontes necessárias**:
1. **Montserrat**: Black, Bold, Medium, Regular
2. **Open Sans**: Regular, Italic
3. **Bebas Neue**: Regular

**Como importar no Figma**:
1. Ir para texto (T)
2. Clicar na fonte
3. Buscar "Montserrat" → Selecionar pesos
4. Repetir para Open Sans e Bebas Neue

### Criar Text Styles:

```
📝 TEXT STYLES

DISPLAY:
• Display XL - Montserrat Black, 96pt, Line: 110%, White
• Display L - Montserrat Black, 72pt, Line: 110%, White
• Display M - Montserrat Black, 56pt, Line: 115%, White

TITLES:
• Title XL - Montserrat Bold, 52pt, Line: 120%, White
• Title L - Montserrat Bold, 48pt, Line: 120%, White
• Title M - Montserrat Medium, 38pt, Line: 125%, White

BODY:
• Body L - Montserrat Medium, 36pt, Line: 130%, White
• Body M - Open Sans Regular, 32pt, Line: 135%, White
• Body S - Open Sans Regular, 28pt, Line: 140%, White
• Body Caption - Open Sans Regular, 24pt, Line: 140%, White 80%

ACCENT:
• Accent XL - Bebas Neue, 96pt, Line: 100%, Color variável
• Accent L - Bebas Neue, 64pt, Line: 100%, Color variável
```

**Como criar Text Style**:
1. Criar texto
2. Configurar fonte, tamanho, line-height
3. Clicar nos 4 pontinhos ao lado da fonte
4. "Create style" → Nomear

---

## 🌈 CRIAR GRADIENTES

### Gradiente 1: Escuro (Stories 1-3)
```
Tipo: Linear
Ângulo: 180° (top to bottom)
Stops:
  • 0%: #1A1A1A
  • 100%: #2C3E50
```

### Gradiente 2: Transição (Story 4)
```
Tipo: Linear
Ângulo: 180°
Stops:
  • 0%: #34495E
  • 100%: #27AE60
```

### Gradiente 3: Prosperidade (Stories 5-7)
```
Tipo: Linear
Ângulo: 180°
Stops:
  • 0%: #27AE60
  • 100%: #2ECC71
```

**Como criar**:
1. Selecionar frame
2. Fill → Linear gradient
3. Clicar nos stops e aplicar cores
4. Ajustar ângulo

---

## 📱 STORY 01 - HOOK

### Setup do Frame
1. Selecionar "Story 01" frame
2. Fill: Gradiente 1 (Escuro)

### Elementos (de cima para baixo):

#### Emoji (posição: y=500px)
```
Texto: 😒
Fonte: Emoji padrão do sistema
Tamanho: 120pt
Alinhamento: Centro horizontal
```

#### Texto Principal Linha 1 (y=680px)
```
Texto: "VOCÊ SENTE"
Text Style: Title L (Montserrat Bold, 48pt)
Cor: White
Alinhamento: Centro
```

#### Texto Principal Linha 2 (y=760px)
```
Texto: "INVEJA?"
Text Style: Display L (Montserrat Black, 72pt)
Cor: #E74C3C (Vermelho Inveja)
Alinhamento: Centro
```

#### Subtexto (y=880px)
```
Texto: "(seja honesto)"
Text Style: Body S (Open Sans, 28pt)
Cor: White 60%
Alinhamento: Centro
```

### Margem de segurança
- Top: 250px (área de UI do Instagram)
- Bottom: 250px (área de interação)
- Sides: 60px

---

## 📱 STORY 02 - NORMALIZAÇÃO

### Setup do Frame
1. Fill: Gradiente 1 modificado (#2C3E50 → #34495E)

### Elementos:

#### Emoji + Número (y=600px)
```
Grupo:
  • Emoji: 👥 (80pt)
  • Texto: "90%" (Bebas Neue, 96pt, #3498DB)
Alinhamento: Centro, inline
```

#### Texto Linha 1 (y=780px)
```
"das pessoas"
Body L (Montserrat Medium, 36pt)
White
Centro
```

#### Texto Linha 2 (y=840px)
```
"sentem inveja"
Body L (Montserrat Medium, 36pt)
White
Centro
```

#### Texto Linha 3 (y=980px)
```
"Você não está"
Body M (Open Sans, 32pt)
White
Centro
```

#### Texto Linha 4 (y=1030px)
```
"sozinho"
Body M (Open Sans, 32pt)
White
Centro
```

---

## 📱 STORY 03 - PROBLEMA

### Setup do Frame
1. Fill: Sólido #2C3E50

### Elementos:

#### Header (y=550px)
```
"MAS..."
Display M (Montserrat Black, 56pt)
#E74C3C (Vermelho)
Esquerda (com margin 80px)
```

#### Lista - Item 1 (y=720px)
```
"❌ Te paralisa"
Body L (Montserrat Medium, 36pt)
White
Esquerda (margin 80px)
```

#### Lista - Item 2 (y=800px)
```
"❌ Te frustra"
Body L (Montserrat Medium, 36pt)
White
Esquerda (margin 80px)
```

#### Lista - Item 3 (y=880px)
```
"❌ Te consome"
Body L (Montserrat Medium, 36pt)
White
Esquerda (margin 80px)
```

#### Footer (y=1050px)
```
"Inveja mal"
Body M (Open Sans, 32pt)
White 70%
Centro
Italic
```

#### Footer Linha 2 (y=1100px)
```
"direcionada"
Body M (Open Sans, 32pt)
White 70%
Centro
Italic
```

---

## 📱 STORY 04 - REFRAME (Mais Importante!)

### Setup do Frame
1. Fill: Gradiente 2 (Transição #34495E → #27AE60)

### Elementos:

#### Texto Linha 1 (y=580px)
```
"INVEJA"
Title XL (Montserrat Bold, 52pt)
#E74C3C (ainda vermelho, transição)
Centro
```

#### Seta (y=680px)
```
"↓"
Display XL (96pt)
#FFD23F (Dourado)
Centro
```

**Dica**: Usar Auto Layout para centralizar seta

#### Texto Destaque (y=780px)
```
"É UM MAPA"
Display M (Montserrat Black, 56pt)
#FFD23F (Dourado Transformação)
Centro
```

**Este é o MOMENTO CHAVE do story!**

#### Subtexto Linha 1 (y=920px)
```
"Do que você"
Body M (Open Sans, 32pt)
White
Centro
```

#### Subtexto Linha 2 (y=970px)
```
"realmente quer"
Body M (Open Sans, 32pt)
White
Centro
```

---

## 📱 STORY 05 - MÉTODO

### Setup do Frame
1. Fill: Gradiente 3 (Verde #27AE60 → #2ECC71)

### Elementos:

#### Header (y=500px)
```
"MÉTODO:"
Title L (Montserrat Bold, 48pt)
White
Esquerda (margin 100px)
```

#### Passo 1 - Emoji + Título (y=680px)
```
Auto Layout (horizontal):
  • "1️⃣" (emoji, 48pt)
  • "Identifica" (Montserrat Bold, 38pt, White)
Esquerda (margin 100px)
Gap: 20px
```

#### Passo 1 - Descrição (y=740px)
```
"(quem te causa inveja?)"
Body Caption (Open Sans, 24pt)
White 80%
Esquerda (margin 160px) - indent
```

#### Passo 2 - Emoji + Título (y=840px)
```
Auto Layout:
  • "2️⃣"
  • "Decifra"
Mesma estrutura do Passo 1
```

#### Passo 2 - Descrição (y=900px)
```
"(o que eles têm?)"
Mesma estrutura do Passo 1
```

#### Passo 3 - Emoji + Título (y=1000px)
```
Auto Layout:
  • "3️⃣"
  • "Age"
```

#### Passo 3 - Descrição (y=1060px)
```
"(construa sua versão)"
```

#### Footer (y=1200px)
```
"Inveja → Ação"
Title M (Montserrat Medium, 32pt)
#FFD23F (Dourado)
Centro
```

---

## 📱 STORY 06 - EXEMPLO (Split)

### Setup do Frame - TÉCNICA ESPECIAL

#### Criar divisão vertical:
1. Criar retângulo 540x1920px (metade)
2. Fill: #E74C3C (vermelho)
3. Posição: x=0, y=0
4. Nomear: "Lado ANTES"

5. Criar retângulo 540x1920px
6. Fill: #27AE60 (verde)
7. Posição: x=540, y=0
8. Nomear: "Lado DEPOIS"

### Elementos:

#### Headers (y=400px)
```
Esquerda (x=120px):
  "ANTES"
  Bebas Neue, 40pt
  White

Direita (x=660px):
  "DEPOIS"
  Bebas Neue, 40pt
  White
```

#### Linha divisória (y=480px)
```
Line (W=1000px, posição horizontal centrada)
Stroke: White 50%
Weight: 2px
```

#### Frase ANTES (y=650px)
```
Texto em 2 linhas:
  "Fulano"
  "tem tudo"
Montserrat Medium, 32pt
White
Alinhamento: Centro no lado esquerdo
X: 270px (centro de 540px)
```

#### Frase DEPOIS (y=650px)
```
Texto em 2 linhas:
  "Vou criar"
  "o meu"
Montserrat Medium, 32pt
White
Alinhamento: Centro no lado direito
X: 810px (540 + centro de 540)
```

#### Linha divisória 2 (y=850px)
```
Mesma linha, repetir
```

#### Palavras finais (y=1000px)
```
Esquerda (x=270px):
  "Inveja"
  Montserrat Black, 36pt
  White

Direita (x=810px):
  "Prosperi"
  "dade"
  Montserrat Black, 36pt
  White
```

---

## 📱 STORY 07 - CTA

### Setup do Frame
1. Fill: Gradiente 3 (Verde prosperidade)

### Elementos:

#### Texto Principal (y=500px)
```
Auto Layout vertical:
  • "DE INVEJA" (Montserrat Black, 48pt, White)
  • "PARA" (Montserrat Black, 48pt, White)
  • "PROSPERIDADE" (Montserrat Black, 48pt, White)
Gap: 10px
Alinhamento: Centro
```

#### CTA (y=750px)
```
"▶ Começa HOJE"
Bebas Neue, 64pt
#FFD23F (Dourado)
Centro
```

#### Simulação de Enquete (y=950px)

**Opção 1**: Criar caixa de enquete visual
```
Frame (800x120px):
  Fill: White 20%
  Border radius: 20px
  Padding: 30px

Texto:
  "Você vai transformar"
  "sua inveja em ação?"
  Open Sans, 28pt, White
```

**Opção 2**: Deixar espaço para enquete do Instagram
```
Apenas texto:
  "[Enquete Interativa]"
  Body Caption
  White 60%
  Centro
```

---

## 🎨 COMPONENTES REUTILIZÁVEIS

### Criar componentes para consistência:

#### Safe Zone Guide (criar e reusar)
1. Criar retângulo 1080x1420px
2. Fill: None
3. Stroke: Red 50%, dashed
4. Posição: y=250px
5. Converter em Component (Ctrl/Cmd + Alt + K)
6. Nomear: "Safe Zone"
7. Adicionar em todos os stories

#### Gradient Backgrounds
1. Criar retângulos com gradientes
2. Converter em components
3. Nomear: "BG - Escuro", "BG - Transição", "BG - Verde"

---

## 📐 GRID E ALINHAMENTO

### Configurar Grid Layout:
1. Selecionar frame
2. Layout Grid → "+"
3. Configurar:

```
Columns: 12
Margin: 60px
Gutter: 20px
Color: Magenta 10%

Rows: 16
Margin: 250px (top/bottom safe zone)
Gutter: 40px
```

### Snap to grid:
- Usar sempre Shift ao mover objetos
- Garantir alinhamento perfeito

---

## 🎬 EXPORTAR PARA INSTAGRAM

### Opção 1: Exportar como Imagens

1. Selecionar todos os 7 frames
2. Clicar direito → "Export"
3. Configurações:
   ```
   Format: PNG
   Scale: 2x (para alta qualidade)
   Suffix: @2x
   ```
4. Exportar para pasta

### Opção 2: Exportar como Vídeo (com Figmotion plugin)

**Requer plugin Figmotion**:
1. Instalar Figmotion (Plugins → Browse)
2. Animar textos (fade in, slide up)
3. Exportar como MP4

### Opção 3: Usar Figma to Instagram (plugin)

1. Plugins → "Story for Instagram"
2. Selecionar frames
3. Export direto

---

## ⚡ ATALHOS ÚTEIS DO FIGMA

```
F - Frame tool
T - Text tool
R - Rectangle
O - Ellipse
Cmd/Ctrl + D - Duplicate
Cmd/Ctrl + G - Group
Cmd/Ctrl + / - Search
Shift + A - Auto Layout
Cmd/Ctrl + Alt + K - Create Component
```

---

## 🔧 PLUGINS RECOMENDADOS

### Essenciais:
1. **Unsplash** - Imagens gratuitas
2. **IconScout** - Ícones
3. **Remove BG** - Remover fundo de imagens
4. **Figmotion** - Animações
5. **Content Reel** - Texto placeholder

### Para Stories:
1. **Story for Instagram** - Export otimizado
2. **Instagram Templates** - Templates prontos
3. **Color Palettes** - Paletas de cores

### Como instalar:
1. Menu → Plugins → Browse plugins
2. Buscar nome
3. "Run" ou "Save"

---

## 📋 CHECKLIST FINAL

**Antes de exportar**:
- [ ] Todas as fontes carregadas?
- [ ] Cores aplicadas corretamente?
- [ ] Textos alinhados ao grid?
- [ ] Safe zone respeitada (250px top/bottom)?
- [ ] Gradientes suaves?
- [ ] Tamanhos de fonte consistentes?
- [ ] Espaçamento uniforme?
- [ ] 7 frames com 1080x1920px?
- [ ] Nomes dos frames corretos?
- [ ] Elementos agrupados logicamente?

---

## 💡 DICAS PRO

### Performance:
- Usar Components para elementos repetidos
- Agrupar layers relacionadas
- Nomear tudo claramente

### Colaboração:
- Compartilhar link do Figma
- Permitir comentários
- Versionar (Save version)

### Iteração rápida:
- Duplicar frame inteiro (Cmd/Ctrl + D)
- Testar variações de cor
- Comparar lado a lado

---

## 🎨 VARIAÇÕES OPCIONAIS

### Versão Light Mode:
- Fundo: Branco/Cinza claro
- Texto: Preto
- Acentos: Mesmas cores

### Versão Animada:
- Texto fade in (0.3s)
- Emoji bounce (0.5s)
- Números count up

### Versão Minimalista:
- Apenas texto, sem emojis
- Fundo sólido
- Tipografia maior

---

## 📱 PREVIEW NO CELULAR

### Figma Mirror (App):
1. Baixar app Figma Mirror (iOS/Android)
2. Abrir projeto
3. Ver preview em tempo real

### Export e enviar:
1. Exportar story
2. AirDrop/enviar para celular
3. Preview no Instagram Stories
4. Ajustar se necessário

---

## 🆘 TROUBLESHOOTING

**Fontes não aparecem?**
- Instalar localmente do Google Fonts
- Restart Figma

**Gradiente estranho?**
- Verificar ângulo (180°)
- Verificar opacity dos stops

**Texto cortado?**
- Verificar auto-width vs fixed width
- Aumentar height do text box

**Exportação com qualidade baixa?**
- Exportar em 2x ou 3x
- Usar PNG, não JPG

---

## 📚 RECURSOS ADICIONAIS

**Tutoriais Figma**:
- YouTube: "Figma Instagram Stories"
- Figma Learn: figma.com/resources/learn-design

**Inspiração**:
- Dribbble.com (tag: instagram stories)
- Behance.com (tag: social media)

**Ferramentas complementares**:
- Coolors.co (paletas)
- FontPair.co (combinações)
- Unsplash.com (fotos)

---

## ✅ PRÓXIMO PASSO

**Após criar no Figma**:
1. Exportar os 7 stories
2. Transferir para celular
3. Postar no Instagram nos horários:
   - 7-9am BRT
   - 12-1pm BRT
   - 7-9pm BRT
4. Adicionar stickers interativos:
   - Story 1: Caixa de pergunta
   - Story 2: Emoji slider
   - Story 7: Enquete
5. Acompanhar métricas

---

**ARQUIVO DE REFERÊNCIA CRIADO!**

Agora você tem um guia completo, passo a passo, para criar os 7 stories no Figma com precisão profissional.

**Tempo estimado de execução**: 30-45 minutos (primeira vez)

Qualquer dúvida durante a criação no Figma, me avise!

---

*Guia criado pelo Content Creation Squad*
*Design: Adriano De Marqui | Copy: Eugene Schwartz | Estratégia: Seth Godin*
