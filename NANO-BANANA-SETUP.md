# Como Configurar o Nano Banana (API de Imagens Reais)

> **Objetivo:** Usar Nano Banana para buscar imagens REAIS da internet (logos, screenshots, etc.)

---

## 🔍 Problemas Identificados (e Corrigidos)

### ✅ 1. TYPO no Código - CORRIGIDO
```diff
- type: 'TEXTTOIAMGE'  // ❌ estava faltando um "M"
+ type: 'TEXTTOIMAGE'  // ✅ corrigido
```

### ⚠️ 2. API Key Errada - PRECISA CORRIGIR

**Problema:** A API key atual (`AIzaSyC...`) é uma **Google AI key**, não do Nano Banana.

**Solução:** Obter uma API key específica do Nano Banana em:

👉 **https://nanobananaapi.ai/**

---

## 📋 Passo a Passo: Como Obter a API Key Correta

### 1. Acessar o Site do Nano Banana
```
https://nanobananaapi.ai/
```

### 2. Criar Conta (Signup)
- Clique em **"Sign Up"** ou **"Get Started"**
- Preencha seus dados (email, senha)
- **Você receberá créditos grátis** para testar!

### 3. Acessar o Dashboard
Após criar a conta, acesse:
```
https://nanobananaapi.ai/api-key
```

### 4. Gerar/Copiar sua API Key
- Você verá uma API key no formato: `nb_xxxxxxxxxxxxxxxxxx` ou similar
- **COPIE** essa key completa

### 5. Adicionar no `.env`
```bash
# .env
NANO_BANANA_API_KEY=sua-key-aqui-do-nanobananaapi
```

### 6. Reiniciar o Servidor Next.js
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🧪 Testar se Funciona

Depois de configurar a API key correta, rode:

```bash
node scripts/test-nano-banana.js
```

**Resultado esperado:**
```
✅ Imagem gerada com sucesso!
URL: https://api.nanobananaapi.ai/storage/...
```

---

## 💰 Pricing do Nano Banana

| Versão | Custo por Imagem | Qualidade |
|--------|------------------|-----------|
| **Standard** (Flash) | ~$0.02 | Rápido, boa qualidade |
| **Pro** (Gemini 3) | ~$0.12 | Alta qualidade, 4K |

**Vantagem:** Mais de **50% mais barato** que Google AI oficial, fal.ai e Replicate!

---

## 🔐 Segurança da API Key

⚠️ **IMPORTANTE:**
- **NUNCA** commite a API key no Git
- **NUNCA** compartilhe publicamente
- Se a key for exposta, **revogue imediatamente** no dashboard
- Use `.env` (que está no `.gitignore`)

---

## 🎯 O Que Está Faltando Agora

### ✅ Já Corrigido:
- [x] Typo `TEXTTOIAMGE` → `TEXTTOIMAGE`
- [x] Interface TypeScript atualizada
- [x] Sistema de fallback funcionando

### ⏳ Você Precisa Fazer:
1. **Criar conta** em https://nanobananaapi.ai/
2. **Obter API key** no dashboard
3. **Adicionar no `.env`**
4. **Reiniciar servidor**
5. **Testar** com `node scripts/test-nano-banana.js`

---

## 🚀 Depois de Configurar

Com o Nano Banana funcionando, você terá:

### ✨ Imagens REAIS da Internet
- **"Google Analytics"** → Screenshot real do dashboard
- **"Nike"** → Logo real da Nike + branding
- **"Instagram Stories"** → Interface real do app
- **"Canva"** → Interface da ferramenta

### 🎨 vs fal.ai (atual fallback)
| Aspecto | fal.ai | Nano Banana |
|---------|--------|-------------|
| Tipo | Sintético (AI-generated) | Real (da internet) |
| Logos | ❌ Similares | ✅ Reais |
| Screenshots | ❌ Ilustrações | ✅ Reais |
| Custo | ~$0.02 | ~$0.02 |

---

## ❓ Troubleshooting

### Erro: "You do not have access permissions"
**Causas possíveis:**
1. API key inválida (não é do nanobananaapi.ai)
2. API key expirada
3. Sem créditos na conta
4. Typo no código (já corrigido)

**Solução:**
- Verificar que a key é do **nanobananaapi.ai**
- Gerar nova key no dashboard
- Verificar saldo de créditos

### Erro: "Invalid API key format"
**Causa:** API key copiada incorretamente

**Solução:** Copiar novamente, sem espaços extras

### Erro: "Rate limit exceeded"
**Causa:** Muitas requisições em pouco tempo

**Solução:** Esperar 1 minuto, ou usar conta Pro

---

## 📚 Links Úteis

- **Site oficial:** https://nanobananaapi.ai/
- **Dashboard/API Keys:** https://nanobananaapi.ai/api-key
- **Documentação:** https://docs.nanobananaapi.ai/quickstart
- **Pricing:** https://nanobananaapi.ai/ (seção pricing)

---

## ✅ Checklist Final

Antes de testar, confirme:

- [ ] Criou conta em nanobananaapi.ai
- [ ] Obteve API key no dashboard
- [ ] Adicionou `NANO_BANANA_API_KEY` no `.env`
- [ ] API key NÃO começa com `AIzaSy...` (essa é do Google)
- [ ] Reiniciou o servidor Next.js (`npm run dev`)
- [ ] Rodou teste: `node scripts/test-nano-banana.js`

---

*Última atualização: 2026-02-22*
*Versão: 1.1 - Typo corrigido*
