# 🎨 Image Generator Engine

**Engine de geração automática de imagens para o Post Express**

Converte conteúdo estruturado em imagens PNG de alta qualidade prontas para Instagram, LinkedIn e outras redes sociais.

---

## ✨ Features

- ✅ **Múltiplos formatos:** Post (1080x1350) e Stories (1080x1920)
- ✅ **Múltiplos estilos:** Figma (minimalista) e Gradient (colorido)
- ✅ **Alta qualidade:** PNG 2x (retina) para redes sociais
- ✅ **100% automático:** Zero intervenção manual
- ✅ **Rápido:** Geração paralela com Playwright
- ✅ **Sem dependências externas:** Sem Figma, sem Canva

---

## 📦 Instalação

```bash
cd content-creation-squad/engines/image-generator
npm install
```

---

## 🚀 Uso Rápido

### Demo Completo

```bash
npm run demo
```

Gera 28 imagens de exemplo (7 slides × 4 variações)

### Como Módulo

```javascript
import { ImageGenerator, FORMATS, STYLES } from './index.js';

const generator = new ImageGenerator();

const carousel = {
  id: 'meu-carrossel',
  slides: [
    {
      title: 'TÍTULO',
      subtitle: 'Subtítulo opcional',
      text: 'Texto do conteúdo\nCom quebras de linha',
      cta: 'CALL TO ACTION',
      background: 'gradient-prosperidade',
      accentColor: '#FFD23F'
    },
    // ... mais slides
  ]
};

// Gerar todas as variações
const result = await generator.generateCarousel(carousel);

// Ou gerar apenas um formato/estilo específico
const result = await generator.generateCarousel(carousel, {
  formats: [FORMATS.POST],
  styles: [STYLES.FIGMA]
});
```

---

## 📐 Formatos Disponíveis

### Post (1080x1350)
- Formato: Instagram/LinkedIn Post
- Proporção: 4:5
- Ideal para: Feed, carrosséis

### Stories (1080x1920)
- Formato: Instagram/LinkedIn Stories
- Proporção: 9:16
- Ideal para: Stories, Reels verticais

---

## 🎨 Estilos Disponíveis

### Figma (Minimalista)
- **Inspirado no template Figma fornecido**
- Background: Branco (#FFFFFF)
- Texto: Preto (#000000)
- Fonte: Inter Medium
- Estilo: Clean, profissional, corporativo

### Gradient (Colorido)
- **Baseado no Content Creation Squad**
- Backgrounds: Gradientes (escuro, transição, prosperidade)
- Texto: Branco (#FFFFFF)
- Fonte: Inter (pesos variados)
- Estilo: Vibrante, impactante, moderno

---

## 📊 Estrutura de Output

```
output/
└── [carousel-id]/
    ├── manifest.json           # Metadados da geração
    ├── post-figma/             # Posts estilo Figma
    │   ├── slide-01.png
    │   ├── slide-02.png
    │   └── ...
    ├── post-gradient/          # Posts estilo Gradiente
    │   └── ...
    ├── stories-figma/          # Stories estilo Figma
    │   └── ...
    └── stories-gradient/       # Stories estilo Gradiente
        └── ...
```

---

## 🛠️ Configuração

Edite `config.js` para customizar:

```javascript
export const STYLES = {
  FIGMA: {
    fontSize: {
      title: 72,
      subtitle: 38,
      text: 39,
      cta: 48
    },
    padding: {
      horizontal: 65,
      vertical: 80
    },
    // ...
  }
};
```

---

## 📝 Estrutura de Slide

```javascript
{
  // Conteúdo
  title: 'TÍTULO PRINCIPAL',           // Obrigatório
  subtitle: 'Subtítulo opcional',      // Opcional
  text: 'Corpo do texto',              // Opcional
  cta: 'CALL TO ACTION',               // Opcional
  imageUrl: 'https://...',             // Opcional (futuro)

  // Estilo (para GRADIENT)
  background: 'gradient-escuro',       // gradient-escuro | gradient-transicao | gradient-prosperidade
  accentColor: '#FFD23F',              // Cor de destaque (hex)
  underline: true,                     // Sublinhar texto (opcional)
}
```

---

## 🎯 Casos de Uso

### 1. Carrossel Completo (28 imagens)

```javascript
// Gera Post + Stories em ambos os estilos
await generator.generateCarousel(carousel);
```

**Output:** 7 slides × 2 formatos × 2 estilos = **28 imagens**

### 2. Apenas Posts Minimalistas (7 imagens)

```javascript
await generator.generateCarousel(carousel, {
  formats: [FORMATS.POST],
  styles: [STYLES.FIGMA]
});
```

**Output:** 7 slides × 1 formato × 1 estilo = **7 imagens**

### 3. Stories Coloridos (7 imagens)

```javascript
await generator.generateCarousel(carousel, {
  formats: [FORMATS.STORIES],
  styles: [STYLES.GRADIENT]
});
```

**Output:** 7 slides × 1 formato × 1 estilo = **7 imagens**

### 4. Slide Único

```javascript
await generator.generateSingle(
  { title: 'TESTE', text: 'Conteúdo' },
  { format: FORMATS.POST, style: STYLES.FIGMA }
);
```

**Output:** 1 imagem

---

## ⚡ Performance

- **Geração paralela:** 4-6 screenshots simultâneos
- **Velocidade:** ~1-2 segundos por imagem
- **Carrossel completo (28 imgs):** ~30-60 segundos

---

## 🔧 Troubleshooting

### Fontes não carregam

As fontes são carregadas do Google Fonts automaticamente. Certifique-se de ter conexão com a internet durante a geração.

### Erros do Playwright

```bash
# Reinstalar browsers do Playwright
npx playwright install chromium
```

### Imagens cortadas

Verifique as dimensões no `config.js`. Ajuste `padding` e `fontSize` conforme necessário.

---

## 📚 API Completa

### ImageGenerator(options)

```javascript
const generator = new ImageGenerator({
  outputDir: './custom-output',  // Diretório de saída
  templatePath: './custom.html', // Template customizado
  scale: 2,                      // Escala (1=normal, 2=retina)
  concurrency: 4                 // Screenshots simultâneos
});
```

### generateCarousel(carousel, options)

```javascript
await generator.generateCarousel(
  {
    id: 'carousel-id',
    slides: [...]
  },
  {
    formats: [FORMATS.POST, FORMATS.STORIES],
    styles: [STYLES.FIGMA, STYLES.GRADIENT]
  }
);
```

**Retorna:**
```javascript
{
  carouselId: 'carousel-id',
  totalImages: 28,
  outputDir: '/path/to/output',
  formats: {
    'post-figma': { images: [...] },
    // ...
  },
  generation: {
    duration: '45.32',
    successful: 28,
    failed: 0
  }
}
```

### generateSingle(slide, options)

```javascript
await generator.generateSingle(
  { title: 'TESTE', text: 'Conteúdo' },
  {
    format: FORMATS.POST,
    style: STYLES.FIGMA,
    outputPath: './output/custom.png'
  }
);
```

---

## 🎨 Customização de Estilos

### Criar Novo Estilo

Edite `config.js`:

```javascript
export const STYLES = {
  // ... estilos existentes

  MEU_ESTILO: {
    name: 'meu-estilo',
    background: '#F5F5F5',
    textColor: '#333333',
    fontFamily: 'Roboto',
    fontSize: {
      title: 80,
      text: 42
    },
    // ...
  }
};
```

Uso:

```javascript
await generator.generateCarousel(carousel, {
  styles: [STYLES.MEU_ESTILO]
});
```

---

## 🚀 Roadmap

- [ ] Sistema de ZIP automático para download
- [ ] Suporte a imagens nos slides
- [ ] Templates customizáveis via JSON
- [ ] Mais estilos pré-configurados
- [ ] Integração com API do Post Express
- [ ] Geração de GIFs/vídeos animados
- [ ] Suporte a outros formatos (LinkedIn, Twitter, etc.)

---

## 📄 Licença

MIT

---

**Criado por Post Express Team**
