# Integração da Fonte Sofia Pro

> Documentação da integração da fonte tipográfica Sofia Pro no Post Express

---

## ✅ O que foi feito

### 1. Mapeamento das Variantes

As 16 variantes da fonte Sofia Pro foram identificadas:

| Arquivo Original | Variante | Peso CSS |
|------------------|----------|----------|
| Sofia Pro 13.otf | Regular | 400 |
| Sofia Pro 14.otf | Regular Italic | 400 italic |
| Sofia Pro 9.otf | Light | 300 |
| Sofia Pro 11.otf | Medium | 500 |
| Sofia Pro 15.otf | SemiBold | 600 |
| Sofia Pro 5.otf | Bold | 700 |
| Sofia Pro 6.otf | Bold Italic | 700 italic |
| Sofia Pro 1.otf | Black | 900 |
| Sofia Pro 7.otf | ExtraLight | 200 |
| Sofia Pro 16.otf | UltraLight | 100 |

### 2. Instalação das Fontes

**Pasta:** `/public/fonts/sofia-pro/`

Fontes copiadas e renomeadas:
- `SofiaPro-Regular.otf`
- `SofiaPro-RegularItalic.otf`
- `SofiaPro-Light.otf`
- `SofiaPro-Medium.otf`
- `SofiaPro-SemiBold.otf`
- `SofiaPro-Bold.otf`
- `SofiaPro-BoldItalic.otf`

### 3. CSS Global

**Arquivo:** `/app/sofia-pro.css`

Criado com 7 `@font-face` declarations (Light 300 → Bold 700).

### 4. Next.js Layout

**Arquivo:** `/app/layout.tsx`

✅ Importado `./sofia-pro.css`

### 5. Tailwind Config

**Arquivo:** `/tailwind.config.ts`

✅ Atualizado `fontFamily.sans` para:
```typescript
sans: ['Sofia Pro', 'var(--font-inter)', 'system-ui', 'sans-serif']
```

### 6. Geração de Slides (Puppeteer)

**Arquivos atualizados:**
- `/app/api/content/[id]/generate-slides-v2/route.ts`
- `/app/api/content/[id]/generate-slides/route.ts`

✅ `@font-face` inline com `file://` paths absolutos
✅ `font-family: 'Sofia Pro', system-ui, ...`

---

## 🎯 Onde a fonte é usada

### 1. Interface do Next.js (Frontend)
- Todos os componentes React
- Dashboard, páginas de auditoria, perfis
- Tooltips, modals, cards

### 2. Slides do Instagram (Puppeteer)
- Carrosséis gerados via `/generate-slides`
- Carrosséis V2 (com imagens fal.ai) via `/generate-slides-v2`
- Títulos, corpo do texto, nomes de usuário

### 3. Classes Tailwind disponíveis

```tsx
<h1 className="font-sans font-bold">    // Sofia Pro Bold (700)
<p className="font-sans font-medium">   // Sofia Pro Medium (500)
<span className="font-sans font-normal"> // Sofia Pro Regular (400)
<div className="font-sans font-light">  // Sofia Pro Light (300)
```

---

## 📐 Pesos de Fonte Disponíveis

| Classe Tailwind | Peso CSS | Variante Sofia Pro |
|-----------------|----------|-------------------|
| `font-light` | 300 | Light |
| `font-normal` | 400 | Regular |
| `font-medium` | 500 | Medium |
| `font-semibold` | 600 | SemiBold |
| `font-bold` | 700 | Bold |

---

## 🧪 Como testar

### 1. Testar no Frontend (Next.js)

```bash
npm run dev
# Abrir http://localhost:3000
# Inspecionar elemento → DevTools → Fonts usadas
```

### 2. Testar nos Slides (Puppeteer)

Gerar slides de um carrossel aprovado:

```bash
# Via interface: Dashboard → Auditoria → Gerar Slides
# Ou via API:
curl -X POST http://localhost:3000/api/content/[audit_id]/generate-slides-v2 \
  -H "Content-Type: application/json" \
  -d '{"carousels": [...], "profile": {...}}'
```

Verificar:
1. Screenshots PNG gerados usam Sofia Pro
2. Textos renderizados com a fonte correta
3. Acentos e caracteres especiais (ã, é, ç) aparecem corretamente

---

## ⚠️ Observações Importantes

### Puppeteer e Fontes Locais

Puppeteer precisa de **caminhos absolutos** com `file://`:

```css
@font-face {
  font-family: 'Sofia Pro';
  src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Regular.otf') format('opentype');
}
```

**Não funciona:**
```css
src: url('/fonts/sofia-pro/SofiaPro-Regular.otf') /* Caminho relativo não funciona no Puppeteer */
```

### Next.js e Fontes Web

No Next.js (navegador), caminhos relativos funcionam:

```css
@font-face {
  src: url('/fonts/sofia-pro/SofiaPro-Regular.otf') format('opentype');
}
```

### Fallback Sempre

Sempre manter `system-ui` como fallback:

```css
font-family: 'Sofia Pro', system-ui, sans-serif;
```

Caso a fonte não carregue, o sistema usa a fonte padrão.

---

## 📦 Variantes NÃO Instaladas

As seguintes variantes existem mas **não foram instaladas** (para economizar espaço):

- Black Italic (2)
- SemiBold Italic (3)
- UltraLight Italic (4)
- ExtraLight (7)
- ExtraLight Italic (8)
- Light Italic (10)
- Medium Italic (12)
- UltraLight (16)

Se precisar delas no futuro, estão em `/05. Fontes/`.

---

## 🔧 Manutenção

### Adicionar nova variante

1. Copiar arquivo OTF para `/public/fonts/sofia-pro/`
2. Adicionar `@font-face` em `/app/sofia-pro.css`
3. Adicionar `@font-face` inline nos templates de slides (se necessário)
4. Rebuild: `npm run build`

### Remover Sofia Pro

1. Remover import de `/app/layout.tsx`
2. Atualizar `/tailwind.config.ts` (voltar para `var(--font-inter)`)
3. Remover `@font-face` dos templates de slides
4. Deletar `/public/fonts/sofia-pro/`

---

**Última atualização:** 2026-02-19
**Versão:** 1.0
**Autor:** Claude Code (Sonnet 4.5)
