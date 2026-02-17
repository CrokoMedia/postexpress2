# 🧬 Atomic Design Structure — PostExpress

**Data:** 2026-02-16
**Designer:** Uma (UX Design Expert)
**Metodologia:** Brad Frost Atomic Design

---

## 🎯 Visão Geral

PostExpress segue a metodologia **Atomic Design** de Brad Frost para criar um design system escalável, consistente e manutenível.

### Hierarquia:

```
ATOMS → MOLECULES → ORGANISMS → TEMPLATES → PAGES
 ↓         ↓            ↓            ↓          ↓
Botão   Form-Field   Header      Layout    Homepage
Input   Nav-Item     Card        Grid      Dashboard
Icon    Avatar+Nome  Footer      Editor    Portal
```

---

## ⚛️ ATOMS (Átomos)

**Definição:** Elementos fundamentais e indivisíveis. São os blocos de construção mais básicos.

### Lista de Átomos PostExpress:

#### 1. Typography
- **Text** (parágrafos, headings, labels)
- **Link** (hiperlinks)

#### 2. Form Elements
- **Button**
- **Input**
- **Textarea**
- **Checkbox**
- **Radio**
- **Select** (dropdown)
- **Switch** (toggle)
- **Slider**

#### 3. Visual Elements
- **Icon** (SVG icons)
- **Avatar** (circular image)
- **Badge** (verificado, status)
- **Divider** (linha separadora)
- **Spinner** (loading)

#### 4. Media
- **Image**
- **Video**

---

### Especificações dos Átomos

#### BUTTON (Botão)

**Variantes:**
```
primary:    Azul (#1d9bf0) - ação principal
secondary:  Branco com borda - ação secundária
outline:    Transparente com borda - terciária
ghost:      Transparente sem borda - sutil
danger:     Vermelho (#f4212e) - ações destrutivas
success:    Verde (#00ba7c) - confirmações
```

**Tamanhos:**
```
sm:  32px altura | 14px fonte
md:  40px altura | 15px fonte (padrão)
lg:  48px altura | 16px fonte
```

**Estados:**
```
default → hover → active → disabled → loading
```

**Acessibilidade:**
- Contraste WCAG AA mínimo (4.5:1)
- Focus visible (borda azul 2px)
- Aria-label quando texto não é descritivo

---

#### INPUT (Campo de Texto)

**Variantes:**
```
text:       Texto livre
email:      Email validation
password:   Máscara de senha
number:     Apenas números
url:        URL validation
search:     Campo de busca com ícone
```

**Tamanhos:**
```
sm:  32px altura
md:  40px altura (padrão)
lg:  48px altura
```

**Estados:**
```
default → focus → filled → error → disabled → readonly
```

**Acessibilidade:**
- Label sempre presente (visível ou sr-only)
- Helper text para orientação
- Error message descritiva
- Placeholder nunca substitui label

---

#### AVATAR (Foto de Perfil)

**Tamanhos:**
```
xs:  24px - thumbnails pequenos
sm:  32px - listas compactas
md:  48px - padrão (lista normal)
lg:  72px - headers de carrosséis
xl:  80px - perfis destacados
```

**Características:**
- Border-radius: 50% (circular)
- Borda: 2px solid #e1e8ed
- Fallback: Iniciais do nome em fundo cinza
- Lazy loading para performance

---

#### BADGE (Distintivo)

**Tipos:**
```
verified:   Badge azul com checkmark (verificado)
status:     Badge de status (draft, approved, etc.)
count:      Badge numérico (notificações)
```

**Tamanhos:**
```
sm:  18px (uso compacto)
md:  22px (padrão)
lg:  24px (destaque)
```

---

#### ICON (Ícone)

**Biblioteca:** Lucide React (substituível)

**Tamanhos:**
```
xs:  12px
sm:  16px
md:  20px (padrão)
lg:  24px
xl:  32px
```

**Cores:**
- Herda cor do texto parent por padrão
- Pode ser customizado por variante

---

## 🔬 MOLECULES (Moléculas)

**Definição:** Combinações simples de átomos que formam componentes funcionais.

### Lista de Moléculas PostExpress:

#### 1. Form Components
- **FormField** (Label + Input + HelperText + ErrorMessage)
- **SearchBar** (Input + Icon + Button)
- **PasswordInput** (Input + Toggle visibility)
- **FileUpload** (Input file + Preview + Remove button)

#### 2. Navigation
- **NavItem** (Icon + Text + Badge opcional)
- **Breadcrumb** (Links com separadores)
- **Pagination** (Botões Previous/Next + números)

#### 3. User Interface
- **AvatarWithName** (Avatar + Nome + Username)
- **StatusBadge** (Icon + Text + Color)
- **Notification** (Icon + Título + Mensagem + Dismiss)
- **EmptyState** (Icon + Heading + Descrição + CTA)

#### 4. Media
- **Thumbnail** (Image + Overlay + Actions)
- **SlidePreview** (Thumbnail + Number + Metadata)

---

### Especificações das Moléculas

#### FORMFIELD (Campo de Formulário Completo)

**Estrutura:**
```
<FormField>
  <Label> Nome Completo * </Label>
  <Input type="text" />
  <HelperText> Digite seu nome como aparece no documento </HelperText>
  <ErrorMessage> Nome é obrigatório </ErrorMessage>
</FormField>
```

**Estados:**
- default: Label + Input + HelperText
- focused: Borda azul no Input
- filled: Valor preenchido
- error: Borda vermelha + ErrorMessage visível
- disabled: Opacidade 50%

**Acessibilidade:**
- Label com htmlFor matching input id
- Aria-describedby para HelperText
- Aria-invalid + aria-errormessage em caso de erro
- Required indicator (*) visível

---

#### AVATARWITHNAME (Avatar + Nome + Username)

**Estrutura:**
```
<AvatarWithName>
  <Avatar src="foto.jpg" size="lg" />
  <UserInfo>
    <Name> Carlos Silva <Badge verified /> </Name>
    <Username> @carlossilva </Username>
  </UserInfo>
</AvatarWithName>
```

**Usado em:**
- Header dos carrosséis (slides)
- Lista de clientes
- Portal do cliente (perfil)

**Variantes:**
- horizontal: Avatar à esquerda + Info à direita (padrão)
- vertical: Avatar acima + Info abaixo (mobile)

---

#### STATUSBADGE (Badge de Status)

**Estrutura:**
```
<StatusBadge status="draft">
  <Icon name="clock" />
  <Text> Rascunho </Text>
</StatusBadge>
```

**Status suportados:**
```
draft:          🟡 Amarelo
editing:        ✏️ Verde claro
pending:        ⏳ Azul claro
rendering:      🎨 Azul
approved:       🟢 Verde
published:      ✅ Verde escuro
needs-review:   🔴 Vermelho
```

---

#### SEARCHBAR (Barra de Busca)

**Estrutura:**
```
<SearchBar>
  <Icon name="search" />
  <Input placeholder="Buscar conteúdos..." />
  <Button variant="ghost"> Limpar </Button>
</SearchBar>
```

**Funcionalidades:**
- Auto-focus ao clicar na barra
- Clear button aparece quando há texto
- Debounce de 300ms para performance
- Resultados aparecem abaixo (dropdown)

---

## 🦠 ORGANISMS (Organismos)

**Definição:** Combinações complexas de moléculas e átomos que formam seções completas de UI.

### Lista de Organismos PostExpress:

#### 1. Navigation
- **Header** (Logo + Navigation + User Menu)
- **Sidebar** (Navigation + Templates + Assets)
- **Footer** (Links + Copyright)

#### 2. Content Display
- **Card** (Thumbnail + Metadata + Actions)
- **CarrosselPreview** (Header + Slides Grid + Actions)
- **Table** (Headers + Rows + Pagination)
- **Gallery** (Grid de Thumbnails + Lightbox)

#### 3. Forms
- **LoginForm** (Campos + Botões + Links)
- **SettingsForm** (Seções + Campos + Actions)

#### 4. Editor Components
- **PropertiesPanel** (Tabs + Form Fields)
- **SlidesPanel** (Thumbnails + Add Button)
- **Toolbar** (Actions + Status + Metadata)
- **Canvas** (Artboard + Zoom Controls)

---

### Especificações dos Organismos

#### HEADER (Cabeçalho da Aplicação)

**Estrutura:**
```
<Header>
  <Logo />
  <Navigation>
    <NavItem to="/dashboard"> Dashboard </NavItem>
    <NavItem to="/contents"> Meus Conteúdos </NavItem>
    <NavItem to="/metrics"> Métricas </NavItem>
  </Navigation>
  <UserMenu>
    <AvatarWithName />
    <Dropdown>
      <Item> Configurações </Item>
      <Item> Sair </Item>
    </Dropdown>
  </UserMenu>
</Header>
```

**Comportamento:**
- Sticky no topo (z-index: 1200)
- Background branco com sombra md
- Mobile: Hamburger menu

---

#### CARD (Card de Conteúdo)

**Estrutura:**
```
<Card>
  <Thumbnail>
    <Image src="slide-1.jpg" />
    <StatusBadge status="draft" />
  </Thumbnail>
  <CardContent>
    <Title> 7 erros que te impedem de vender </Title>
    <Metadata>
      <Type> Educacional </Type>
      <Date> Hoje, 10:30 </Date>
    </Metadata>
    <Description>
      Carrossel educacional sobre erros comuns em vendas.
      10 slides no formato tweet-style.
    </Description>
  </CardContent>
  <CardActions>
    <Button> Visualizar </Button>
    <Button> Editar </Button>
    <Button> Solicitar Ajustes </Button>
  </CardActions>
</Card>
```

**Variantes:**
- compact: Thumbnail pequeno + Título + 2 ações
- full: Thumbnail grande + Todos os metadados + Todas as ações

---

#### PROPERTIESPANEL (Painel de Propriedades do Editor)

**Estrutura:**
```
<PropertiesPanel>
  <Header> Propriedades </Header>

  {/* Quando TEXTO está selecionado */}
  <Section>
    <SectionTitle> 📝 Texto </SectionTitle>

    <FormField label="Conteúdo">
      <Textarea />
    </FormField>

    <FormField label="Fonte">
      <Select options={fonts} />
    </FormField>

    <FormField label="Tamanho">
      <Select options={sizes} />
    </FormField>

    <FormField label="Cor">
      <ColorPicker />
      <ColorPalette colors={brandColors} />
    </FormField>

    <FormField label="Alinhamento">
      <ButtonGroup>
        <Button icon="align-left" />
        <Button icon="align-center" />
        <Button icon="align-right" />
      </ButtonGroup>
    </FormField>

    <FormField label="Camadas">
      <ButtonGroup>
        <Button icon="arrow-up"> Trazer frente </Button>
        <Button icon="arrow-down"> Enviar trás </Button>
        <Button icon="trash"> Deletar </Button>
      </ButtonGroup>
    </FormField>
  </Section>

  <Button primary fullWidth> Aplicar Mudanças </Button>
</PropertiesPanel>
```

**Comportamento:**
- Muda conteúdo baseado no elemento selecionado
- Auto-save ao aplicar mudanças
- Validação em tempo real

---

#### SLIDESPANEL (Painel de Slides)

**Estrutura:**
```
<SlidesPanel>
  <Header> Slides </Header>

  <SlidesList>
    <SlidePreview
      number={1}
      title="Capa"
      thumbnail="slide-1.jpg"
      active={true}
    />
    <SlidePreview
      number={2}
      title="Intro"
      thumbnail="slide-2.jpg"
    />
    ...
  </SlidesList>

  <Button fullWidth> + Adicionar Slide </Button>

  <Divider />

  <TemplatesSection>
    <SectionTitle> 📚 Templates </SectionTitle>
    <TemplateCard name="Tweet Style" />
    <TemplateCard name="Minimalista" />
    ...
  </TemplatesSection>

  <Divider />

  <AssetsSection>
    <SectionTitle> 🎨 Assets </SectionTitle>
    <FileUpload />
    <AssetsGrid>
      <AssetThumbnail />
      <AssetThumbnail />
      ...
    </AssetsGrid>
  </AssetsSection>
</SlidesPanel>
```

**Funcionalidades:**
- Drag & drop para reordenar slides
- Click em slide navega para ele
- Hover mostra ações (duplicar, deletar)

---

## 📄 TEMPLATES (Templates)

**Definição:** Layouts de página que combinam organismos em estruturas completas.

### Lista de Templates PostExpress:

#### 1. Layout Padrão
```
<DefaultLayout>
  <Header />
  <Main> {children} </Main>
  <Footer />
</DefaultLayout>
```

#### 2. Editor Layout
```
<EditorLayout>
  <Toolbar />
  <SlidesPanel /> {/* Sidebar esquerda */}
  <Canvas />       {/* Centro */}
  <PropertiesPanel /> {/* Sidebar direita */}
</EditorLayout>
```

#### 3. Dashboard Layout
```
<DashboardLayout>
  <Header />
  <SideNav />
  <Main> {children} </Main>
</DashboardLayout>
```

#### 4. Auth Layout
```
<AuthLayout>
  <Logo />
  <Card> {children} </Card>
  <Footer />
</AuthLayout>
```

---

## 📱 PAGES (Páginas)

**Definição:** Instâncias específicas de templates com conteúdo real.

### Lista de Páginas PostExpress:

#### Portal do Cliente
1. **Homepage** (Dashboard)
2. **Meus Conteúdos** (Lista de carrosséis)
3. **Visualização de Carrossel** (Preview + Actions)
4. **Métricas** (Analytics)
5. **Configurações** (Settings form)

#### Editor Visual
6. **Editor** (Canvas + Sidebars + Toolbar)
7. **Preview Modal** (Fullscreen carrossel preview)

#### Autenticação
8. **Login**
9. **Cadastro**
10. **Esqueci Senha**

---

## 🏗️ Estrutura de Diretórios (Sugerida)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── Button.module.css
│   │   ├── Input/
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   └── Icon/
│   │
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── AvatarWithName/
│   │   ├── StatusBadge/
│   │   ├── SearchBar/
│   │   └── Notification/
│   │
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Card/
│   │   ├── PropertiesPanel/
│   │   ├── SlidesPanel/
│   │   └── Toolbar/
│   │
│   └── templates/
│       ├── DefaultLayout/
│       ├── EditorLayout/
│       └── DashboardLayout/
│
├── pages/
│   ├── Dashboard/
│   ├── Contents/
│   ├── Editor/
│   └── Settings/
│
├── design-tokens/
│   ├── tokens.yaml
│   ├── tokens.css
│   ├── tokens.scss
│   └── tokens.js
│
└── styles/
    ├── globals.css
    └── theme.css
```

---

## ✅ Checklist de Qualidade de Componentes

### Para cada componente (Atom, Molecule, Organism):

- [ ] **Documentação:** README com props, exemplos, variantes
- [ ] **TypeScript:** Tipos completos e bem definidos
- [ ] **Testes:** Testes unitários cobrindo casos principais
- [ ] **Storybook:** Stories para cada variante
- [ ] **Acessibilidade:** WCAG AA mínimo, testado com screen reader
- [ ] **Responsivo:** Funciona em mobile, tablet, desktop
- [ ] **Tokens:** Usa design tokens (sem hardcoded values)
- [ ] **Performance:** Lazy loading, memoization quando relevante
- [ ] **Dark Mode:** Suporta modo escuro (futuro)

---

## 📐 Princípios de Design (Brad Frost)

### 1. **Design System != Website**
> "Um design system não é um site. É uma coleção de componentes reutilizáveis que podem ser combinados para construir sites."

### 2. **Componentes Atômicos = Reuso Máximo**
> "Pequenos componentes bem definidos são mais reutilizáveis do que grandes blocos monolíticos."

### 3. **Consistência > Perfeição**
> "É melhor ter um botão consistente em toda aplicação do que 5 variações ligeiramente diferentes."

### 4. **Tokens > Hardcoded Values**
> "Zero valores hardcoded. Tudo vem de tokens. Sempre."

### 5. **Documentação Viva**
> "Storybook não é luxo. É o coração do design system."

---

## 🎨 Workflow de Desenvolvimento

### 1. Designer cria componente no Figma
- Usa design tokens
- Documenta variantes e estados
- Export para dev handoff

### 2. Dev implementa componente
- Cria estrutura Atomic Design
- Usa tokens do design-tokens/
- Escreve testes e stories

### 3. QA valida
- Testa acessibilidade
- Testa responsividade
- Valida contra design

### 4. Deploy para Storybook
- Componente disponível para toda equipe
- Documentação atualizada
- Pronto para uso em produção

---

## 🚀 Próximos Passos

1. ✅ Audit templates (FEITO)
2. ✅ UX Research (FEITO)
3. ✅ Wireframes (FEITO)
4. ✅ Design Tokens (FEITO)
5. ✅ Atomic Design Structure (FEITO)
6. ⏳ Criar biblioteca de componentes em React
7. ⏳ Setup Storybook
8. ⏳ Implementar componentes prioritários:
   - Atoms: Button, Input, Avatar, Badge
   - Molecules: FormField, AvatarWithName
   - Organisms: Header, Card, PropertiesPanel
9. ⏳ Testes de acessibilidade
10. ⏳ Documentação no Storybook

---

**Assinado:** Uma, arquitetando sistemas escaláveis 💝
