# 🤖 AI Prompts para v0.dev e Lovable — PostExpress Editor Visual

**Data:** 2026-02-16
**Designer:** Uma (UX Design Expert)
**Objetivo:** Prompts otimizados para gerar protótipos interativos do Editor Visual

---

## 🎯 Visão Geral

Estes prompts são otimizados para ferramentas de AI que geram UI (v0.dev, Lovable, Cursor, etc.).

**Ordem recomendada:**
1. Componentes atômicos (Button, Input, etc.)
2. Editor Visual (canvas + sidebars)
3. Portal do Cliente (dashboard + visualização)

---

## ⚛️ PROMPT 1: Design System Atoms (Componentes Base)

```
Crie um design system em React + TypeScript + Tailwind CSS com os seguintes componentes atômicos:

### Button Component
Variantes: primary (azul #1d9bf0), secondary (branco com borda), outline, ghost, danger (#f4212e), success (#00ba7c)
Tamanhos: sm (32px), md (40px), lg (48px)
Estados: default, hover, active, disabled, loading
Props: variant, size, disabled, loading, onClick, children
Totalmente arredondado (border-radius: 9999px)
Acessibilidade: WCAG AA, focus visible, aria-label suportado

### Input Component
Tipos: text, email, password, number, url, search
Tamanhos: sm (32px), md (40px), lg (48px)
Estados: default, focus, filled, error, disabled, readonly
Props: type, size, error, disabled, placeholder, value, onChange
Border-radius: 4px
Helper text e error message suportados

### Avatar Component
Tamanhos: xs (24px), sm (32px), md (48px), lg (72px), xl (80px)
Circular (border-radius: 50%)
Borda: 2px solid #e1e8ed
Fallback: Iniciais do nome em fundo cinza
Props: src, alt, size, fallbackInitials

### Badge Component
Tipos: verified (azul #1d9bf0 com checkmark SVG), status (cores variadas), count (numérico)
Tamanhos: sm (18px), md (22px), lg (24px)
Props: type, size, count, verified

### FormField Component (Molecule)
Composição: Label + Input + HelperText + ErrorMessage
Estados: default, focused, filled, error, disabled
Props: label, helperText, errorMessage, required, ...inputProps
Acessibilidade completa: aria-describedby, aria-invalid

DESIGN TOKENS:
Cores da palette:
- brand-blue: #1d9bf0
- text-primary: #0f1419 (preto Twitter)
- text-secondary: #536471 (cinza)
- border-light: #e1e8ed
- success: #00ba7c
- error: #f4212e
- background-primary: #ffffff
- background-secondary: #f7f9fa

Tipografia:
- Font: Inter para UI, Chirp para carrosséis
- Tamanhos: xs (11px), sm (12px), base (14px), md (16px), lg (18px), xl (20px), 2xl (24px), 3xl (28px), 4xl (32px)

Espaçamento: Base 8px grid (0, 4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, 40px, 48px, 64px)

Sombras:
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.1)

Crie esses componentes com Storybook stories e testes básicos.
```

---

## 🎨 PROMPT 2: Editor Visual - Canvas Central

```
Crie um Editor Visual de Carrosséis para Instagram usando React + TypeScript + Fabric.js 5.x + Zustand.

### Layout Principal
Estrutura em 3 colunas:
- Sidebar Esquerda (20%): Slides Panel
- Canvas Central (60%): Área de edição
- Sidebar Direita (20%): Properties Panel

### Canvas Central
Dimensões: 1080x1350px (Instagram 4:5)
Background: Grid sutil #f7f9fa com linhas #e1e8ed
Zoom: 25% a 400% (controles [-] [100%] [+] [Fit] [Fill])
Safe Area: Borda tracejada mostrando área segura (150px top, 200px bottom, 120px sides)

### Funcionalidades do Canvas
1. Elementos editáveis:
   - Texto (double-click para editar inline)
   - Imagens (drag to move, handles para resize)
   - Shapes (círculos, retângulos)
   - Grupos (header com avatar + nome + username)

2. Interações:
   - Click: Seleciona elemento (mostra handles)
   - Double-click em texto: Modo edição inline
   - Drag: Move elemento
   - Handles: Resize (mantém proporção com Shift)
   - Delete key: Deleta elemento selecionado
   - Ctrl/Cmd+Z: Undo
   - Ctrl/Cmd+Y: Redo

3. Guias de alinhamento:
   - Aparecem ao mover elementos (linhas vermelhas)
   - Snap to grid (8px increments)
   - Snap to outros elementos

4. Toolbar flutuante (ao selecionar texto):
   - [B] Bold
   - [I] Italic
   - [U] Underline
   - [Font Size ▼]
   - [Color 🎨]

### Estado Global (Zustand)
```typescript
interface EditorState {
  canvas: fabric.Canvas | null;
  selectedElement: fabric.Object | null;
  currentSlide: number;
  slides: Slide[];
  history: HistoryState[];
  historyIndex: number;

  // Actions
  selectElement: (element: fabric.Object) => void;
  updateElement: (id: string, props: any) => void;
  deleteElement: (id: string) => void;
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  goToSlide: (index: number) => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
}
```

### Controles de Zoom
Posição: Abaixo do canvas
Botões: [-] [100%] [+] [Fit] [Fill]
Funciona com mouse wheel também (Ctrl + scroll)

IMPORTANTE:
- Use Fabric.js 5.x para manipulação de canvas
- Auto-save a cada 2 segundos (debounced)
- Histórico de undo/redo até 50 estados
- Performance: 60fps sempre, lazy loading de assets

Crie este componente com preview funcional.
```

---

## 📂 PROMPT 3: Editor Visual - Slides Panel (Sidebar Esquerda)

```
Crie o Slides Panel para o Editor Visual PostExpress usando React + TypeScript + Tailwind.

### Estrutura
Sidebar fixa na esquerda (20% da largura, min 250px, max 350px)
Background: #ffffff
Border direita: 1px solid #e1e8ed

### Seções

#### 1. Slides List
Scrollable vertical
Thumbnails dos slides (150x188px - proporção 4:5)
Cada slide mostra:
- Preview renderizado do slide
- Número (ex: "Slide 1/10")
- Primeiras palavras do conteúdo
- Indicador de slide ativo (borda azul #1d9bf0 + seta)

Interações:
- Click: Navega para o slide
- Drag & drop: Reordena slides (react-beautiful-dnd)
- Hover: Mostra botões (duplicar, deletar)
- Right-click: Menu contextual (duplicar, deletar, inserir antes/depois)

#### 2. Botão Adicionar Slide
Botão largo: [+ Adicionar Slide]
Click abre modal com templates disponíveis

#### 3. Templates Section
Título: 📚 TEMPLATES
Lista de templates (thumbnails 150x150px):
- Tweet Style
- Minimalista
- Bold & Colorido
- Corporativo
- Storytelling

Click: Abre modal de confirmação "Aplicar template ao slide atual?"

#### 4. Assets Section
Título: 🎨 ASSETS
Upload button: [Upload +] (drag & drop suportado)
Grid de thumbnails (3 colunas, 60x60px cada)

Click em asset: Adiciona ao canvas no centro
Drag asset para canvas: Posiciona onde soltar

### Estado
```typescript
interface SlidesPanelState {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideClick: (index: number) => void;
  onSlideReorder: (from: number, to: number) => void;
  onSlideDelete: (index: number) => void;
  onSlideDuplicate: (index: number) => void;
  onAddSlide: () => void;
  onTemplateApply: (templateId: string) => void;
  onAssetUpload: (file: File) => void;
  onAssetAdd: (assetUrl: string) => void;
}
```

DESIGN:
- Espaçamento entre slides: 16px
- Padding do painel: 16px
- Thumbnails com sombra md ao hover
- Drag indicator: Linha azul grossa mostrando posição de drop

Crie este componente responsivo e performático.
```

---

## ⚙️ PROMPT 4: Editor Visual - Properties Panel (Sidebar Direita)

```
Crie o Properties Panel para o Editor Visual PostExpress usando React + TypeScript + Tailwind.

### Estrutura
Sidebar fixa na direita (20% da largura, min 250px, max 350px)
Background: #ffffff
Border esquerda: 1px solid #e1e8ed
Scrollable vertical

### Conteúdo Dinâmico Baseado em Seleção

#### QUANDO NENHUM ELEMENTO SELECIONADO:
```
<EmptyState>
  <Icon name="mouse-pointer" size={48} color="#aab8c2" />
  <Text>Selecione um elemento para editar</Text>
</EmptyState>
```

#### QUANDO TEXTO ESTÁ SELECIONADO:
```
<PropertiesPanel>
  <Header>📝 TEXTO</Header>

  <FormField label="Conteúdo">
    <Textarea value={content} onChange={...} rows={4} />
  </FormField>

  <FormField label="Fonte">
    <Select value={fontFamily} onChange={...}>
      <Option>Chirp</Option>
      <Option>Inter</Option>
      <Option>Poppins</Option>
      <Option>Roboto</Option>
      <Option>Montserrat</Option>
      {/* +10 fontes */}
    </Select>
  </FormField>

  <FormField label="Tamanho">
    <Select value={fontSize} onChange={...}>
      {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 56, 72, 96, 120].map(size =>
        <Option key={size}>{size}px</Option>
      )}
    </Select>
  </FormField>

  <FormField label="Peso">
    <ButtonGroup>
      <Button active={fontWeight === 400}>Normal</Button>
      <Button active={fontWeight === 700}>Bold</Button>
    </ButtonGroup>
  </FormField>

  <FormField label="Cor">
    <ColorPicker value={color} onChange={...} />
    <ColorPalette colors={brandColors} onColorSelect={...} />
  </FormField>

  <FormField label="Alinhamento">
    <ButtonGroup>
      <IconButton icon="align-left" active={align === 'left'} />
      <IconButton icon="align-center" active={align === 'center'} />
      <IconButton icon="align-right" active={align === 'right'} />
    </ButtonGroup>
  </FormField>

  <FormField label="Espaçamento de Linha">
    <Slider min={1} max={2.5} step={0.1} value={lineHeight} />
  </FormField>

  <FormField label="Camadas">
    <ButtonGroup>
      <Button icon="arrow-up" onClick={bringForward}>Trazer frente</Button>
      <Button icon="arrow-down" onClick={sendBackward}>Enviar trás</Button>
      <Button icon="trash" onClick={deleteElement} variant="danger">Deletar</Button>
    </ButtonGroup>
  </FormField>

  <Button variant="primary" fullWidth onClick={applyChanges}>
    Aplicar Mudanças
  </Button>
</PropertiesPanel>
```

#### QUANDO IMAGEM ESTÁ SELECIONADA:
```
<PropertiesPanel>
  <Header>🖼️ IMAGEM</Header>

  <ImagePreview src={imageSrc} />

  <FormField label="Fonte">
    <Text>{fileName}</Text>
    <Text secondary>{width}x{height}px</Text>
  </FormField>

  <Button onClick={replaceImage}>Trocar Imagem</Button>

  <FormField label="Ajuste">
    <Select value={objectFit}>
      <Option value="cover">Cover (preencher)</Option>
      <Option value="contain">Contain (caber)</Option>
      <Option value="fill">Fill (esticar)</Option>
    </Select>
  </FormField>

  <FormField label="Opacidade">
    <Slider min={0} max={100} value={opacity} suffix="%" />
  </FormField>

  <FormField label="Filtros">
    <Checkbox label="Grayscale" checked={grayscale} />
    <Checkbox label="Sepia" checked={sepia} />
    <Slider label="Blur" min={0} max={10} value={blur} />
  </FormField>

  <FormField label="Camadas">
    {/* Mesma estrutura de camadas */}
  </FormField>
</PropertiesPanel>
```

#### QUANDO FUNDO ESTÁ SELECIONADO:
```
<PropertiesPanel>
  <Header>🎨 FUNDO</Header>

  <FormField label="Tipo">
    <Select value={backgroundType}>
      <Option value="solid">Cor Sólida</Option>
      <Option value="gradient">Gradiente</Option>
      <Option value="image">Imagem</Option>
    </Select>
  </FormField>

  {backgroundType === 'solid' && (
    <FormField label="Cor">
      <ColorPicker value={backgroundColor} />
      <ColorPalette colors={brandColors} />
    </FormField>
  )}

  {backgroundType === 'gradient' && (
    <>
      <FormField label="Cor 1">
        <ColorPicker value={gradientColor1} />
      </FormField>
      <FormField label="Cor 2">
        <ColorPicker value={gradientColor2} />
      </FormField>
      <FormField label="Ângulo">
        <Slider min={0} max={360} value={gradientAngle} suffix="°" />
      </FormField>
    </>
  )}
</PropertiesPanel>
```

### Componentes Auxiliares Necessários
- ColorPicker: Input de cor + Picker visual
- ColorPalette: Grid de cores pré-definidas (brand colors)
- Slider: Input range customizado
- ButtonGroup: Grupo de botões toggle
- IconButton: Botão só com ícone

COMPORTAMENTO:
- Mudanças aplicam em real-time no canvas
- Debounce de 300ms para evitar lag
- Validação de valores (min/max)
- Reset button para voltar valores originais

Crie este painel adaptativo e performático.
```

---

## 🛠️ PROMPT 5: Editor Visual - Toolbar (Bottom)

```
Crie o Toolbar do Editor Visual PostExpress usando React + TypeScript + Tailwind.

### Posição
Fixo na parte inferior da tela
Largura: 100%
Height: 80px
Background: #ffffff
Border top: 1px solid #e1e8ed
Box-shadow: 0 -4px 6px rgba(0,0,0,0.05)

### Layout
Dividido em 3 seções:

#### ESQUERDA: Ações Principais
```
<ButtonGroup>
  <Button icon="save" onClick={save}>Salvar</Button>
  <Button icon="eye" onClick={preview}>Preview</Button>
  <Button icon="undo" onClick={undo} disabled={!canUndo}>Desfazer</Button>
  <Button icon="redo" onClick={redo} disabled={!canRedo}>Refazer</Button>
  <Button icon="copy" onClick={duplicate}>Duplicar</Button>
</ButtonGroup>
```

#### CENTRO: Status e Informações
```
<StatusBar>
  <StatusItem>
    <Icon name={autoSaveStatus === 'saving' ? 'clock' : 'check'} />
    <Text>
      {autoSaveStatus === 'saving' ? 'Salvando...' : `✓ Salvo às ${lastSaveTime}`}
    </Text>
  </StatusItem>

  <Divider />

  <StatusItem>
    <Text>Slide {currentSlide} de {totalSlides}</Text>
  </StatusItem>

  <Divider />

  <StatusItem>
    <Text secondary>Carrossel: "{carrosselTitle}"</Text>
  </StatusItem>
</StatusBar>
```

#### DIREITA: Ações Secundárias
```
<ButtonGroup>
  <Button
    variant="success"
    icon="check"
    onClick={approve}
  >
    ✅ Aprovar para Renderização
  </Button>

  <Button
    variant="danger"
    icon="alert-circle"
    onClick={requestAdjustments}
  >
    🔴 Solicitar Ajustes IA
  </Button>

  <Button
    variant="outline"
    icon="message-circle"
    onClick={openComments}
  >
    💬 Comentários
    {commentsCount > 0 && <Badge count={commentsCount} />}
  </Button>
</ButtonGroup>
```

### Estado
```typescript
interface ToolbarState {
  autoSaveStatus: 'idle' | 'saving' | 'saved';
  lastSaveTime: string;
  currentSlide: number;
  totalSlides: number;
  carrosselTitle: string;
  canUndo: boolean;
  canRedo: boolean;
  commentsCount: number;

  onSave: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onApprove: () => void;
  onRequestAdjustments: () => void;
  onOpenComments: () => void;
}
```

DESIGN:
- Botões com padding generoso (12px horizontal, 8px vertical)
- Ícones Lucide React (20px)
- Botão "Aprovar" destaca-se (verde, maior)
- Auto-save indicator pisca durante salvamento
- Responsivo: Em mobile, ícones sem texto

ATALHOS DE TECLADO:
- Ctrl/Cmd+S: Salvar
- Spacebar: Preview
- Ctrl/Cmd+Z: Undo
- Ctrl/Cmd+Y: Redo
- Ctrl/Cmd+D: Duplicate

Crie este toolbar responsivo e acessível.
```

---

## 🏠 PROMPT 6: Portal do Cliente - Dashboard

```
Crie o Dashboard do Portal do Cliente PostExpress usando React + TypeScript + Next.js + Tailwind + shadcn/ui.

### Layout
```
<DashboardLayout>
  <Header>
    <Logo />
    <Navigation />
    <UserMenu />
  </Header>

  <Main>
    <Hero>
      <Heading>Olá, {userName}! 👋</Heading>
      <Text>Você tem {pendingCount} carrosséis aguardando aprovação.</Text>
    </Hero>

    <SummaryCards>
      <Card status="draft" count={3} action="Ver Todos" />
      <Card status="editing" count={1} action="Continuar" />
      <Card status="rendering" count={0} disabled />
      <Card status="approved" count={5} action="Baixar" />
      <Card status="published" count={48} action="Ver Histórico" />
    </SummaryCards>

    <Divider />

    <Section title="🟡 RASCUNHOS (3)">
      <CarrosselCard
        title="7 erros que te impedem de vender"
        type="Educacional"
        createdAt="Hoje, 10:30"
        status="draft"
        actions={['Visualizar', 'Editar no Canvas', 'Solicitar Ajustes IA']}
      />
      {/* Mais cards... */}
    </Section>

    <Section title="✏️ EM EDIÇÃO (1)">
      <CarrosselCard
        title="Segredos da negociação B2B"
        type="Educacional"
        editingDuration="15 minutos"
        status="editing"
        autoSaveStatus="Salvo às 11:03"
        actions={['Continuar Editando', 'Aprovar Agora']}
      />
    </Section>

    <Section title="🟢 APROVADOS - PRONTOS PARA PUBLICAR (5)">
      <ThumbnailGrid>
        <Thumbnail src="..." onClick={viewCarrossel} />
        {/* 5 thumbnails */}
      </ThumbnailGrid>
    </Section>
  </Main>
</DashboardLayout>
```

### Componentes

#### SummaryCard
Props: status, count, action, disabled
Cores por status:
- draft: #ffd93d (amarelo)
- editing: #6bcf7f (verde claro)
- rendering: #457b9d (azul)
- approved: #00ba7c (verde)
- published: #2a9d8f (verde escuro)

#### CarrosselCard
Props: title, type, thumbnail, createdAt, status, description, actions
Layout:
- Thumbnail esquerda (150x188px)
- Conteúdo direita (título, tipo, data, descrição)
- Botões de ação abaixo

#### Filtros e Ordenação
```
<Filters>
  <Select label="Status" options={statusOptions} />
  <Select label="Tipo" options={typeOptions} />
  <Select label="Período" options={periodOptions} />
  <Input type="search" placeholder="Buscar..." />
  <Select label="Ordenar" options={sortOptions} />
</Filters>
```

DESIGN:
- Cards com hover: sombra md, transição 200ms
- Status badges coloridos
- Responsivo: Grid adapta de 3 colunas → 2 → 1
- Loading states para dados assíncronos
- Empty states quando não há conteúdo

Crie este dashboard responsivo e performático.
```

---

## 📊 PROMPT 7: Modal de Preview (Estilo Instagram)

```
Crie um Modal de Preview fullscreen simulando Instagram usando React + TypeScript + Tailwind.

### Trigger
Botão "Preview" no toolbar ou card

### Modal Fullscreen
```
<Modal fullscreen onClose={onClose}>
  <InstagramFrame>
    <InstagramHeader>
      <Logo>Instagram</Logo>
      <Icons>
        <Icon name="menu" />
        <Icon name="settings" />
      </Icons>
    </InstagramHeader>

    <PostHeader>
      <Avatar src={userAvatar} size="sm" />
      <UserInfo>
        <Name>{userName}</Name>
        <Location>São Paulo, Brazil</Location>
      </UserInfo>
      <MoreIcon />
    </PostHeader>

    <SlideViewer>
      <Slide
        src={slides[currentSlideIndex]}
        onSwipeLeft={nextSlide}
        onSwipeRight={prevSlide}
      />

      <SlideIndicators>
        {slides.map((_, index) =>
          <Indicator
            key={index}
            active={index === currentSlideIndex}
          />
        )}
      </SlideIndicators>
    </SlideViewer>

    <PostActions>
      <LeftActions>
        <IconButton icon="heart" />
        <IconButton icon="message-circle" />
        <IconButton icon="send" />
      </LeftActions>
      <RightActions>
        <IconButton icon="bookmark" />
      </RightActions>
    </PostActions>

    <PostStats>
      <Text bold>{likesCount} curtidas</Text>
      <Caption>
        <Name bold>{userName}</Name> {caption}
      </Caption>
      <CommentsLink>Ver todos os {commentsCount} comentários</CommentsLink>
      <Time>{timeAgo}</Time>
    </PostStats>
  </InstagramFrame>

  <Navigation>
    <Button onClick={prevSlide} disabled={isFirstSlide}>
      ◄ Anterior
    </Button>
    <SlideCounter>Slide {currentSlide}/{totalSlides}</SlideCounter>
    <Button onClick={nextSlide} disabled={isLastSlide}>
      Próximo ►
    </Button>
  </Navigation>

  <Actions>
    <Button onClick={onClose}>Voltar ao Editor</Button>
    <Button variant="success" onClick={onApprove}>Aprovar ✅</Button>
  </Actions>
</Modal>
```

### Funcionalidades
- Navegação por setas, teclado (←/→), swipe (mobile)
- Indicadores de progresso (bolinhas)
- Simula exatamente como ficará no Instagram
- Escape key para fechar
- Fullscreen

DESIGN:
- InstagramFrame: 414x736px (iPhone SE) centralizado
- Fundo modal: rgba(0,0,0,0.9)
- Slides: 414x518px (Instagram 4:5 crop)
- Transições suaves entre slides (300ms)

Crie este preview imersivo e realista.
```

---

## 🚀 Ordem de Implementação Sugerida

### Sprint 1 (Semana 1)
1. Design System Atoms (PROMPT 1)
2. Editor Layout + Canvas (PROMPT 2)

### Sprint 2 (Semana 2)
3. Slides Panel (PROMPT 3)
4. Properties Panel (PROMPT 4)

### Sprint 3 (Semana 3)
5. Toolbar (PROMPT 5)
6. Modal Preview (PROMPT 7)

### Sprint 4 (Semana 4)
7. Portal Dashboard (PROMPT 6)
8. Integração e Polish

---

## 📝 Notas para Ferramentas de AI

### v0.dev
- Funciona melhor com prompts curtos e focados
- Especifique sempre: "React + TypeScript + Tailwind CSS"
- Peça componentes individuais, não páginas inteiras

### Lovable (GPT Engineer)
- Aceita prompts mais longos
- Bom para fluxos completos
- Especifique estrutura de pastas

### Cursor / Windsurf
- Use prompts para refatoração
- Bom para adicionar features em componentes existentes

---

**Próximo:** Frontend Spec completo para @dev

---

**Assinado:** Uma, prompting para o futuro 💝
