# Company Brand Analyzer - Documentação Completa

> **Funcionalidade:** Análise automática de identidade visual de empresas para Templates Pro
> **Status:** ✅ Implementado
> **Data:** 2026-02-22

---

## 🎯 O que faz?

Permite que o usuário gere slides com a **identidade visual automática de qualquer empresa** apenas inserindo a URL do site (ex: `nike.com`, `cocacola.com`).

### Fluxo:
1. **Usuário insere URL** da empresa (ex: `nike.com`)
2. **Sistema verifica cache** (tabela `company_brands`)
3. **Se não existir:**
   - Captura do site
   - Análise com **Gemini Flash 2.0** (rápido + barato)
   - Extrai: paleta de cores, logo, estilo visual
   - Salva no banco (cache)
4. **Gera slide** com Nano Banana usando a identidade visual

### Resultado:
✅ Slide automaticamente com cores, estilo e identidade da empresa
✅ Cache inteligente (não repete análise)
✅ Economia de tokens (reutiliza dados salvos)

---

## 📂 Arquivos Criados/Modificados

### 1. **Schema SQL** (Novo)
📄 `database/company-brands-schema.sql`

```sql
CREATE TABLE company_brands (
  id UUID PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,        -- "nike.com"
  name TEXT,                           -- "Nike"
  logo_url TEXT,                       -- URL Cloudinary (futuro)
  screenshot_url TEXT,                 -- Screenshot do site
  color_palette JSONB,                 -- ["#111", "#FFF", "#F50"]
  primary_color TEXT,                  -- "#111111"
  secondary_color TEXT,                -- "#FF5700"
  accent_color TEXT,                   -- Cor de destaque
  visual_style TEXT,                   -- "esportivo moderno"
  industry TEXT,                       -- "esportes"
  description TEXT,                    -- Descrição da marca
  is_manual BOOLEAN DEFAULT FALSE,     -- Manual vs auto-análise
  analyzed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Como rodar:**
1. Abrir **Supabase SQL Editor**
2. Colar o conteúdo de `company-brands-schema.sql`
3. Executar

---

### 2. **Lib de Análise** (Novo)
📄 `lib/company-analyzer.ts`

**Funções principais:**

```typescript
// Analisa empresa (com cache automático)
analyzeCompanyBrand(url: string): Promise<CompanyBrand>

// Busca no cache
getCompanyBrandFromCache(url: string): Promise<CompanyBrand | null>

// Cadastro manual
saveCompanyBrandManually(brandData: {...}): Promise<CompanyBrand>
```

**Stack de análise:**
1. **Gemini Flash 2.0** (primary)
   - Rápido, barato ($0.075/1M tokens)
   - Excelente em análise visual
2. **Mistral Vision** (fallback)
   - Se Gemini falhar

**Extrai:**
- Nome da empresa
- Paleta de cores (até 5 cores principais em HEX)
- Cor primária, secundária, accent
- Estilo visual ("esportivo moderno", "minimalista", etc.)
- Indústria/setor
- Descrição

---

### 3. **Templates Pro UI** (Modificado)
📄 `app/dashboard/templatesPro/page.tsx`

**Mudanças:**
- ✅ Novo modo de imagem: **"URL da Empresa"** (ícone Building2)
- ✅ Campo de input para URL da empresa
- ✅ Info box explicando o funcionamento
- ✅ Estado `companyUrl` adicionado

**Interface:**
```tsx
type ImageMode = 'compose' | 'search' | 'url' | 'upload' | 'auto' | 'custom_prompt' | 'company_url'
```

**Novos botões:**
```
📐 Descrição Visual
🏢 URL da Empresa  ← NOVO!
🔍 Busca Foto
🔗 URL da Imagem
📤 Upload
✨ Gerar com IA
```

---

### 4. **API Route** (Modificado)
📄 `app/api/templates-pro/generate/route.ts`

**Mudanças:**
- ✅ Import de `analyzeCompanyBrand`
- ✅ Novo campo `companyUrl` na interface `GenerateRequest`
- ✅ Modo `company_url` adicionado
- ✅ Lógica em `resolveBackgroundImage()`:

```typescript
if (imageMode === 'company_url' && opts.companyUrl) {
  // 1. Analisa empresa (usa cache se disponível)
  const brandData = await analyzeCompanyBrand(opts.companyUrl)

  // 2. Monta prompt para Nano Banana
  const brandPrompt = `Professional editorial image in the style of ${brandData.name}.
  Style: ${brandData.visual_style}.
  Colors: ${brandData.color_palette.join(', ')}.
  ...`

  // 3. Gera imagem
  const url = await generateEditorialBackground(brandPrompt)

  return { url, source: 'company-brand-ai', brandData }
}
```

---

### 5. **API de Gerenciamento** (Novo - Bonus)
📄 `app/api/company-brands/route.ts`

**Endpoints:**

```bash
# Listar todas as marcas
GET /api/company-brands

# Buscar marca específica
GET /api/company-brands?domain=nike.com

# Cadastrar marca manualmente
POST /api/company-brands
{
  "domain": "nike.com",
  "name": "Nike",
  "colors": ["#111111", "#FFFFFF", "#FF5700"],
  "primary_color": "#111111",
  "secondary_color": "#FF5700",
  "visual_style": "esportivo moderno",
  "industry": "esportes"
}

# Remover marca do cache
DELETE /api/company-brands?domain=nike.com
```

---

## 🚀 Como Usar

### 1️⃣ Setup (primeira vez)

**Executar SQL no Supabase:**
```bash
# Abrir Supabase SQL Editor
# Copiar e colar: database/company-brands-schema.sql
# Executar
```

**Verificar env vars:**
```env
GOOGLE_AI_API_KEY=xxx          # Gemini (primary)
MISTRAL_API_KEY=xxx            # Fallback
NANO_BANANA_API_KEY=xxx        # Geração de imagem
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

### 2️⃣ Usar no Templates Pro

1. Ir em `/dashboard/templatesPro`
2. Escolher template (Capa, Conteúdo, CTA)
3. Na seção **Imagem**, clicar em **"🏢 URL da Empresa"**
4. Digitar URL: `nike.com` (ou `cocacola.com`, `apple.com`, etc.)
5. Preencher título, subtítulo, etc.
6. Clicar **"Gerar Slide"**

**O que acontece:**
- 1ª vez: Analisa site (15-30s) + salva no cache
- 2ª vez em diante: Instantâneo! (usa cache)

---

### 3️⃣ Cadastrar Marca Manualmente (Opcional)

Se quiser **pular a análise automática** e cadastrar cores manualmente:

```bash
POST /api/company-brands
{
  "domain": "minhaconsultoria.com",
  "name": "Minha Consultoria",
  "colors": ["#1a1a1a", "#f0f0f0", "#ff6b35"],
  "primary_color": "#1a1a1a",
  "secondary_color": "#ff6b35",
  "visual_style": "minimalista profissional",
  "industry": "consultoria",
  "description": "Consultoria estratégica para startups",
  "logo_url": "https://res.cloudinary.com/.../logo.png"
}
```

**Vantagem:** Controle total sobre a identidade visual

---

## 💡 Casos de Uso

### 1. **Agência criando slides para cliente**
- Cliente é patrocinado pela Nike
- Designer insere `nike.com`
- Slide sai com cores Nike (#111, #FF5700)
- Identidade visual consistente!

### 2. **Creator fazendo parceria**
- Parceria com Coca-Cola
- Insere `cocacola.com`
- Slide automático com vermelho Coca-Cola
- Post profissional sem designer!

### 3. **Consultoria B2B**
- Apresentação para empresa de tecnologia
- Insere URL do cliente
- Slides com identidade visual do cliente
- Impressiona na apresentação!

---

## 🔧 Troubleshooting

### Erro: "GOOGLE_AI_API_KEY não configurada"
**Solução:** Adicionar API key do Gemini no `.env`

### Erro: "Falha ao analisar identidade visual"
**Possíveis causas:**
1. Site offline ou inacessível
2. Rate limit do Gemini/Mistral
3. Site sem cores definidas (muito branco)

**Solução:** Cadastrar manualmente via API

### Cache desatualizado (marca mudou de identidade)
**Solução:** Deletar do cache
```bash
DELETE /api/company-brands?domain=nike.com
```
Na próxima análise, será refeita.

---

## 📊 Custos Estimados

### Por análise (primeira vez):
- **Gemini Flash 2.0:** ~$0.001 (1 milhão tokens = $0.075)
- **Nano Banana:** ~$0.05 por imagem
- **Total:** ~$0.051 por primeira análise

### Com cache:
- **2ª análise em diante:** $0.05 (só Nano Banana)
- **Economia:** 98% em análises repetidas!

---

## 🎯 Próximos Passos (Futuro)

### Fase 2 (opcional):
- [ ] Extrair logo automaticamente (além de cores)
- [ ] Screenshot do site (Playwright MCP)
- [ ] UI para gerenciar marcas salvas
- [ ] Análise de concorrentes (comparar paletas)
- [ ] Sugestão de combinações de cores

---

## 📝 Notas Técnicas

### Por que Gemini e não Mistral?
- **Gemini Flash 2.0:** Mais rápido, mais barato, excelente em análise visual
- **Mistral Vision:** Fallback (rate limit mais agressivo)

### Por que cache em banco e não em memória?
- Persistência entre sessões
- Reutilização entre usuários (se multitenancy)
- Editável via UI (futuro)

### Normalização de domínio:
```typescript
"https://www.nike.com/br/" → "nike.com"
"Nike.COM" → "nike.com"
"www.apple.com" → "apple.com"
```

---

**Desenvolvido por:** Pazos Media
**Versão:** 1.0
**Data:** 2026-02-22
**Status:** ✅ Implementado e testável
