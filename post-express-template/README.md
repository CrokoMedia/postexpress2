# 🎨 Croko Labs - Gerador de Carrosséis

Gera carrosséis estilo Tweet para Instagram/LinkedIn usando HTML + Puppeteer + Cloudinary.

## 📁 Estrutura

```
post-express-template/
├── template.html      # Template HTML de referência
├── generator.js       # Gerador completo (com Cloudinary)
├── test-local.js      # Teste local (sem Cloudinary)
├── package.json       # Dependências
└── README.md          # Este arquivo
```

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Testar localmente (sem Cloudinary)

```bash
npm run test
```

Isso vai gerar 5 slides de exemplo na pasta `output/`.

### 3. Configurar Cloudinary (produção)

Crie um arquivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### 4. Gerar carrossel completo

```bash
npm run generate
```

## 🎨 Variações de Template

### Temas disponíveis:

| Tema | Descrição |
|------|-----------|
| `light` | Fundo branco (padrão) |
| `dark` | Fundo escuro (#15202b) |
| `highlight` | Gradiente roxo/azul |

### Variações de layout:

| Variação | Descrição |
|----------|-----------|
| `centered` | Texto centralizado (padrão) |
| `with-image` | Texto + imagem abaixo |

## 📐 Especificações

- **Tamanho:** 1080 x 1350px (Instagram vertical)
- **Fonte:** Inter (Google Fonts)
- **Formato:** PNG

## 🔧 Integração com Croko Labs

```javascript
const { generateCarousel } = require('./generator');

// Dados do cliente (do Supabase)
const cliente = {
  id: 'cliente_123',
  nome: 'João Silva',
  username: 'joaosilva',
  fotoUrl: 'https://exemplo.com/foto.jpg'
};

// Slides (do Squad Criação)
const slides = [
  { texto: 'Primeiro slide...', tema: 'light' },
  { texto: 'Segundo slide...', tema: 'light' },
  { texto: 'CTA final!', tema: 'highlight' }
];

// Gera e retorna URLs do Cloudinary
const resultado = await generateCarousel(cliente, slides);
```

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                     POST EXPRESS FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SUPABASE                                                   │
│  ┌─────────────┐                                            │
│  │ Cliente     │──┐                                         │
│  │ - nome      │  │                                         │
│  │ - username  │  │                                         │
│  │ - foto_url  │  │                                         │
│  └─────────────┘  │                                         │
│                   ▼                                         │
│  SQUAD CRIAÇÃO    │         GERADOR                         │
│  ┌─────────────┐  │    ┌─────────────────┐                  │
│  │ Slides      │──┼───▶│ generateHTML()  │                  │
│  │ - texto     │  │    │       ▼         │                  │
│  │ - tema      │  │    │ Puppeteer       │                  │
│  │ - variacao  │  │    │ screenshot()    │                  │
│  └─────────────┘  │    │       ▼         │                  │
│                   │    │ Cloudinary      │                  │
│                   │    │ upload()        │                  │
│                   │    └────────┬────────┘                  │
│                   │             │                           │
│                   │             ▼                           │
│                   │    ┌─────────────────┐                  │
│                   │    │ URLs das        │                  │
│                   │    │ imagens finais  │──▶ Portal        │
│                   │    └─────────────────┘   Aprovação      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Qualidade

Antes de enviar pro cliente:

- [ ] Texto legível em tela de celular
- [ ] Máximo 3-4 linhas por slide
- [ ] Hook forte no slide 1
- [ ] CTA claro no último slide
- [ ] Branding consistente
- [ ] Zero erros de português
