# 🎨 Templates de Carrosséis — PostExpress

**Data:** 2026-02-16
**Designer:** Uma (UX Design Expert)
**Total de Templates:** 5

---

## 📚 Biblioteca de Templates

### 1. **Tweet Style** (`tweet-style.json`)
- **Uso:** Educacional, autoridade, viral
- **Características:**
  - Inspirado no Twitter/X
  - Avatar circular + nome verificado
  - Fundo branco clean
  - Tipografia Chirp
  - Safe area respeitada
- **Ideal para:** Posts que imitam tweets de sucesso

---

### 2. **Minimalista Clean** (`minimalista-clean.json`)
- **Uso:** Conteúdo corporativo, profissional
- **Características:**
  - Design ultra clean
  - Muito espaço em branco
  - Tipografia Inter
  - Cores neutras
  - Foco no conteúdo
- **Ideal para:** Empresas B2B, consultores, coaches

---

### 3. **Bold & Colorido** (`bold-colorido.json`)
- **Uso:** Conteúdo criativo, marketing, vendas
- **Características:**
  - Fundos coloridos gradientes
  - Tipografia bold e impactante
  - Elementos geométricos
  - Alta energia visual
- **Ideal para:** Infoprodutores, agências, marcas jovens

---

### 4. **Corporativo Elegante** (`corporativo-elegante.json`)
- **Uso:** Empresas, relatórios, dados
- **Características:**
  - Paleta sóbria (azul marinho + cinza)
  - Tipografia Poppins
  - Gráficos e ícones profissionais
  - Hierarquia clara
- **Ideal para:** Empresas tradicionais, bancos, consultorias

---

### 5. **Storytelling Visual** (`storytelling-visual.json`)
- **Uso:** Histórias, cases, jornada
- **Características:**
  - Imagens grandes
  - Texto como overlay
  - Narrativa visual forte
  - Transições suaves entre slides
- **Ideal para:** Cases de sucesso, histórias inspiradoras, jornadas

---

## 📐 Especificações Técnicas

### Dimensões (Instagram 4:5)
```
Largura: 1080px
Altura: 1350px
Safe Area:
  - Top: 150px
  - Bottom: 200px
  - Horizontal: 120px
Área útil: 840x1000px
```

### Formato JSON

Todos os templates seguem o formato:

```json
{
  "template_id": "tweet-style",
  "template_name": "Tweet Style",
  "template_version": "1.0.0",
  "dimensions": {
    "width": 1080,
    "height": 1350
  },
  "safe_area": {
    "top": 150,
    "bottom": 200,
    "left": 120,
    "right": 120
  },
  "slides": [
    {
      "slide_number": 1,
      "slide_type": "capa",
      "elements": [...]
    }
  ]
}
```

### Estrutura de Elementos

Cada elemento no slide tem:

```json
{
  "type": "text" | "image" | "shape" | "group",
  "id": "unique-id",
  "content": "...",
  "position": { "x": 0, "y": 0 },
  "size": { "width": 0, "height": 0 },
  "style": {
    "fontFamily": "Inter",
    "fontSize": 36,
    "color": "#000000",
    "alignment": "left"
  }
}
```

---

## 🎯 Como Usar

### 1. Escolher Template
Cliente escolhe template na biblioteca do Editor Visual.

### 2. Carregar no Canvas
JSON é parseado e renderizado no Fabric.js canvas.

### 3. Customizar
Cliente edita textos, cores, imagens usando PropertiesPanel.

### 4. Aprovar
Cliente aprova para renderização final (Cloudinary).

---

## 🔄 Exportação

Cada template pode ser exportado para:
- ✅ **Fabric.js JSON** (Editor Visual)
- ✅ **Cloudinary Transformations** (Renderização final)
- ✅ **Figma** (Design handoff)
- ✅ **HTML/CSS** (Preview estático)

---

## 📝 Nomenclatura de Arquivos

```
{template-name}.json           → Estrutura do template
{template-name}-preview.png    → Preview thumbnail
{template-name}-specs.md       → Especificações detalhadas
```

---

**Próximo:** Implementação dos 5 templates em JSON

---

**Assinado:** Uma, criando templates incríveis 💝
