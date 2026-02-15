# 🎨 Post Express - Image Generator

**Sistema 100% Integrado de Geração Automática de Imagens para Redes Sociais**

---

## ✨ O que é?

Um sistema completo que converte conteúdo estruturado em **imagens PNG prontas para download**, sem precisar do Figma, Canva ou qualquer ferramenta externa.

### 🎯 Problema Resolvido

**ANTES:**
- ❌ Criar conteúdo no Content Creation Squad
- ❌ Abrir Figma Desktop
- ❌ Executar plugin manualmente
- ❌ Exportar imagens uma por uma
- ❌ Transferir para celular

**AGORA:**
- ✅ Criar conteúdo
- ✅ Executar 1 comando
- ✅ **Baixar ZIP com TODAS as imagens prontas**

---

## 📦 O que o Sistema Gera?

Para cada carrossel de 7 slides, você recebe:

### **4 Variações Completas:**

1. **Post (1080x1350) - Estilo Figma**
   - Fundo branco, texto preto
   - Clean e minimalista
   - Ideal para: LinkedIn, Instagram Feed

2. **Post (1080x1350) - Estilo Gradiente**
   - Fundos coloridos com gradientes
   - Vibrante e impactante
   - Ideal para: Instagram Feed, engagement

3. **Stories (1080x1920) - Estilo Figma**
   - Formato vertical
   - Fundo branco, minimalista
   - Ideal para: LinkedIn Stories, Instagram Stories

4. **Stories (1080x1920) - Estilo Gradiente**
   - Formato vertical
   - Fundos coloridos
   - Ideal para: Instagram/LinkedIn Stories

### **Total por Carrossel:**
- 📊 **28 imagens PNG** (7 slides × 4 variações)
- 📦 **1 ZIP completo** com tudo organizado
- 📦 **4 ZIPs individuais** (um por variação)

### **Qualidade:**
- ✅ PNG de alta qualidade (2x retina)
- ✅ Tamanho ideal para redes sociais
- ✅ ~400-800KB por imagem

---

## 🚀 Como Usar

### **Instalação (só a primeira vez)**

```bash
cd content-creation-squad
npm install
```

### **Gerar Todas as Variações (28 imagens)**

```bash
npm run generate
```

**Resultado:**
- ✅ 28 imagens geradas
- ✅ 1 ZIP completo (~8-10 MB)
- ✅ 4 ZIPs por formato (~2 MB cada)

### **Gerar Apenas Posts Minimalistas (7 imagens)**

```bash
npm run generate:posts
```

### **Gerar Apenas Stories Coloridos (7 imagens)**

```bash
npm run generate:stories
```

### **Ver Ajuda**

```bash
npm run help
```

---

## 📂 Onde Encontrar as Imagens?

Após executar `npm run generate`, as imagens ficam em:

```
content-creation-squad/output/inveja-prosperidade/
├── inveja-prosperidade-completo.zip   ← ZIP com TUDO (baixe este!)
├── downloads/                         ← ZIPs individuais
│   ├── post-figma.zip                 ← 7 posts minimalistas
│   ├── post-gradient.zip              ← 7 posts coloridos
│   ├── stories-figma.zip              ← 7 stories minimalistas
│   └── stories-gradient.zip           ← 7 stories coloridos
├── post-figma/                        ← Imagens soltas
│   ├── slide-01.png
│   ├── slide-02.png
│   └── ...
├── post-gradient/
├── stories-figma/
└── stories-gradient/
```

**Dica:** Baixe o `inveja-prosperidade-completo.zip` para ter acesso a todas as variações organizadas!

---

## 🎨 Estilos Disponíveis

### **Estilo Figma (Minimalista)**

Baseado no template do Figma fornecido:

- **Background:** Branco (#FFFFFF)
- **Texto:** Preto (#000000)
- **Fonte:** Inter Medium, 39px
- **Estilo:** Clean, profissional, corporativo
- **Melhor para:** LinkedIn, conteúdo B2B, autoridade

### **Estilo Gradiente (Colorido)**

Baseado no Content Creation Squad original:

- **Backgrounds:** Gradientes dinâmicos
  - Escuro: #1A1A1A → #2C3E50
  - Transição: #34495E → #27AE60
  - Prosperidade: #27AE60 → #2ECC71
- **Texto:** Branco (#FFFFFF)
- **Fonte:** Inter (pesos variados)
- **Estilo:** Vibrante, impactante, moderno
- **Melhor para:** Instagram, engagement, viral

---

## ⚙️ Estrutura do Conteúdo

Para criar novos carrosséis, use esta estrutura:

```javascript
const meuCarrossel = {
  id: 'nome-do-carrossel',
  title: 'Título do Carrossel',
  slides: [
    {
      // Conteúdo
      title: 'TÍTULO PRINCIPAL',      // Obrigatório
      subtitle: 'Subtítulo opcional', // Opcional
      text: 'Texto do slide',         // Opcional (use \n para quebrar linha)
      cta: 'CALL TO ACTION',          // Opcional

      // Estilo (apenas para Gradiente)
      background: 'gradient-escuro',  // gradient-escuro | gradient-transicao | gradient-prosperidade
      accentColor: '#FFD23F',         // Cor de destaque (hex)
      underline: true,                // Sublinhar texto (opcional)
    },
    // ... mais slides
  ]
};
```

---

## 📊 Formatos e Dimensões

| Formato | Dimensões | Proporção | Uso |
|---------|-----------|-----------|-----|
| **Post** | 1080 x 1350 | 4:5 | Instagram/LinkedIn Feed, Carrosséis |
| **Stories** | 1080 x 1920 | 9:16 | Instagram/LinkedIn Stories, Reels |

Ambos gerados em **PNG 2x** (retina) para máxima qualidade.

---

## 🎯 Casos de Uso

### 1. Criar Carrossel Completo para Cliente

```bash
npm run generate
```

→ Envie o ZIP completo para o cliente escolher qual formato/estilo usar

### 2. Post Rápido para Instagram Feed (Minimalista)

```bash
npm run generate:posts
```

→ Baixe as 7 imagens de `post-figma/`

### 3. Stories para Instagram (Colorido e Impactante)

```bash
npm run generate:stories
```

→ Baixe as 7 imagens de `stories-gradient/`

### 4. Testar Diferentes Estilos

```bash
npm run generate  # Gera tudo
```

→ Compare os 4 estilos e escolha o que melhor converte

---

## ⚡ Performance

- **Geração paralela:** 6 imagens simultâneas
- **Velocidade:** ~1-2 segundos por imagem
- **Carrossel completo (28 imgs):** ~30-40 segundos
- **Apenas 1 formato (7 imgs):** ~7-10 segundos

---

## 🛠️ Arquitetura do Sistema

```
content-creation-squad/
├── generate-images.js          ← CLI principal (integração)
├── package.json                ← Scripts npm
│
└── engines/
    └── image-generator/        ← Engine de geração
        ├── index.js            ← Core do generator
        ├── config.js           ← Configurações (estilos, formatos)
        ├── demo.js             ← Demonstração
        ├── test-zip.js         ← Teste de ZIPs
        │
        ├── lib/
        │   ├── template-renderer.js   ← Renderiza HTML
        │   ├── screenshot-engine.js   ← Playwright (HTML → PNG)
        │   └── zip-creator.js         ← Cria arquivos ZIP
        │
        ├── templates/
        │   └── base-template.html     ← Template HTML/CSS
        │
        └── output/                    ← Imagens geradas
```

---

## 🔧 Customização

### Adicionar Novo Carrossel

Edite `generate-images.js` e adicione:

```javascript
const MEU_CAROUSEL = {
  id: 'meu-novo-carrossel',
  title: 'Meu Novo Tema',
  slides: [
    { title: 'SLIDE 1', text: 'Conteúdo...' },
    // ... mais slides
  ]
};
```

### Modificar Estilos

Edite `engines/image-generator/config.js`:

```javascript
export const STYLES = {
  FIGMA: {
    fontSize: {
      title: 72,  // Mudar tamanho do título
      text: 39
    },
    padding: {
      horizontal: 65,  // Mudar padding lateral
    }
    // ...
  }
};
```

### Criar Novo Estilo

Adicione em `config.js`:

```javascript
OUTRO_ESTILO: {
  name: 'outro-estilo',
  background: '#F5F5F5',
  textColor: '#333333',
  fontFamily: 'Roboto',
  // ...
}
```

E use:

```javascript
await generator.generateCarousel(carousel, {
  styles: [STYLES.OUTRO_ESTILO]
});
```

---

## 🐛 Troubleshooting

### Fontes não carregam

As fontes (Inter) são carregadas automaticamente do Google Fonts. Certifique-se de ter internet durante a geração.

### Erro no Playwright

```bash
# Reinstalar browsers
npx playwright install chromium
```

### Imagens cortadas/mal formatadas

Verifique o conteúdo dos slides:
- Textos muito longos podem ser cortados
- Ajuste `fontSize` e `padding` no `config.js`

### ZIPs vazios

Isso pode acontecer com a pasta `downloads`. Os ZIPs válidos são:
- `post-figma.zip`
- `post-gradient.zip`
- `stories-figma.zip`
- `stories-gradient.zip`

---

## 📈 Roadmap Futuro

- [ ] Interface web para preview antes de gerar
- [ ] Suporte a imagens nos slides
- [ ] Mais templates (LinkedIn, Twitter, etc)
- [ ] Geração de GIFs animados
- [ ] Editor visual de estilos
- [ ] Integração com API do Instagram (post direto)
- [ ] Analytics de performance dos posts

---

## 💡 Dicas de Uso

### Para Instagram Feed (Engajamento)
```bash
npm run generate:posts
```
→ Use **post-gradient** (colorido) para chamar atenção

### Para LinkedIn (Autoridade)
```bash
npm run generate:posts
```
→ Use **post-figma** (minimalista) para profissionalismo

### Para Instagram Stories (Viral)
```bash
npm run generate:stories
```
→ Use **stories-gradient** (colorido) com CTAs fortes

### Para Testar A/B
```bash
npm run generate  # Gera tudo
```
→ Poste as 4 variações em horários diferentes e compare métricas

---

## 🎉 Resultado Final

### **ANTES (Sistema Antigo - Figma Manual):**
1. Criar conteúdo ✍️
2. Abrir Figma Desktop 🖥️
3. Executar plugin manualmente 🔧
4. Aguardar criação (~30s) ⏳
5. Exportar cada imagem 📤
6. Transferir para celular 📱
7. **Total: ~15-20 minutos**

### **AGORA (Image Generator Engine):**
1. Criar conteúdo ✍️
2. Executar `npm run generate` ⚡
3. **Baixar ZIP (~30s)**
4. **Total: ~1-2 minutos**

---

## 📚 Mais Recursos

- **README Principal:** `engines/image-generator/README.md`
- **Demos:** `npm run demo` ou `npm run test`
- **Config:** `engines/image-generator/config.js`
- **Templates:** `engines/image-generator/templates/`

---

## ✅ Checklist de Uso

**Primeira vez:**
- [ ] `npm install` executado
- [ ] Playwright instalado
- [ ] Internet disponível (para fontes)

**Para cada carrossel:**
- [ ] Conteúdo estruturado em `generate-images.js`
- [ ] `npm run generate` executado
- [ ] Imagens verificadas
- [ ] ZIP baixado
- [ ] Postado nas redes sociais

---

**Criado por Post Express Team**
*Sistema 100% automatizado. Zero dependências externas. Máxima qualidade.*

🚀 **Crie. Gere. Baixe. Poste.**
