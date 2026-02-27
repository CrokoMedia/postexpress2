# Fix: Cloudinary Setup for Slide Generation

## ❌ Problema Identificado

**Error:** `Must supply api_key`

**Causa:** As credenciais do Cloudinary não estavam configuradas no arquivo `.env`, fazendo com que a geração de slides falhasse ao tentar fazer upload para o CDN.

## ✅ Solução Implementada

### 1. Adicionado ao `.env`:

```env
# Cloudinary (image upload and CDN)
# Get your credentials at: https://console.cloudinary.com/settings
# Settings → Product Environment Credentials
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 2. Como obter suas credenciais do Cloudinary

1. Acesse: https://console.cloudinary.com/
2. Faça login na sua conta
3. Vá para **Settings** → **Product Environment Credentials**
4. Copie os 3 valores:
   - **Cloud Name** (ex: `dxyz123abc`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (ex: `abcdefghijklmnopqrstuvwxyz`)

### 3. Preencher o arquivo `.env`

Abra `/Users/macbook-karla/postexpress2/.env` e preencha as 3 variáveis:

```env
CLOUDINARY_CLOUD_NAME=seu-cloud-name-aqui
CLOUDINARY_API_KEY=sua-api-key-aqui
CLOUDINARY_API_SECRET=seu-api-secret-aqui
```

**IMPORTANTE:** Não compartilhe essas credenciais. O arquivo `.env` já está no `.gitignore`.

### 4. Reiniciar o servidor Next.js

Após preencher as credenciais:

```bash
# Parar o servidor (Ctrl+C se estiver rodando)
# Iniciar novamente
npm run dev
```

O Next.js vai detectar as novas variáveis de ambiente automaticamente.

## 🧪 Testar a Geração de Slides

1. Acesse a página de slides de qualquer auditoria
2. Clique em "Gerar Slides"
3. Aguarde o processamento (pode levar 2-3 minutos)
4. Verifique se os slides aparecem sem erro

### Comandos de Debug (opcional)

```bash
# Verificar se as variáveis estão carregadas
node -e "require('dotenv').config(); console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ Faltando')"
node -e "require('dotenv').config(); console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ Faltando')"
node -e "require('dotenv').config(); console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Faltando')"
```

## 📊 Sobre a Qualidade do Preview

### Preview vs Slides Finais

**Preview (rápido):**
- Usa Puppeteer com deviceScaleFactor 2x (2160x2700 pixels reais)
- **NÃO gera imagens de conteúdo** (por isso aparece placeholder)
- Renderiza em ~1-2 segundos por slide
- Serve apenas para ver layout e texto

**Slides Finais (completo):**
- Usa Puppeteer com deviceScaleFactor 2x (mesma qualidade)
- **GERA imagens com IA** (via OpenAI DALL-E ou similar)
- Upload para Cloudinary (CDN + otimização)
- Renderiza em ~30-60 segundos por slide
- Qualidade final idêntica ao Remotion anterior

### Se o preview parecer de baixa qualidade:

**Possíveis causas:**
1. **Fontes não carregadas** - Verifique se as Google Fonts estão carregando (Inter, JetBrains Mono)
2. **Chromium local vs serverless** - Diferenças entre versões do Chromium
3. **Compressão do browser** - O browser pode comprimir a imagem ao exibir

**Solução:** Sempre gerar os slides finais para verificar a qualidade real.

## 🎯 Checklist Final

- [ ] Cloudinary Cloud Name adicionado ao `.env`
- [ ] Cloudinary API Key adicionado ao `.env`
- [ ] Cloudinary API Secret adicionado ao `.env`
- [ ] Servidor Next.js reiniciado (`npm run dev`)
- [ ] Teste de geração de slides executado com sucesso
- [ ] Slides aparecem no Cloudinary Dashboard

## 📝 Arquivos Modificados

- `.env` - Adicionadas credenciais do Cloudinary
- `.env.example` - Atualizado para incluir Cloudinary
- `docs/FIX-CLOUDINARY-SETUP.md` - Este documento

---

**Documentação criada em:** 2026-02-28
**Migração Puppeteer:** Completa (substituiu Remotion com sucesso)
