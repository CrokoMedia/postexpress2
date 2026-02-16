# 🚀 Resumo Rápido - Scraper Instagram + Slides

## ⚡ Uso Rápido

```bash
# 1. Extrair dados
node scripts/test-instagram-scraper.js [username]

# 2. Gerar slide
node scripts/gerar-slide-perfil.js [username]

# 3. Visualizar
open slide-[username].html
```

---

## 📊 Dados Extraídos

### Perfil:
- ✅ Nome completo
- ✅ Username
- ✅ **Foto HD (320x320)**
- ✅ Biografia
- ✅ Seguidores / Seguindo
- ✅ Total de posts
- ✅ Badge verificado
- ✅ Link na bio
- ✅ 15 perfis relacionados

### Posts (até 12):
- ✅ Legenda completa
- ✅ Likes / Comentários
- ✅ Imagens / Vídeos
- ✅ Hashtags / Menções
- ✅ Data de publicação

---

## 📁 Arquivos

```
📂 squad-auditores/data/        → JSON com dados
📂 assets/fotos-perfil/         → Fotos baixadas
📄 slide-{username}.html        → Slide gerado
```

---

## 🎯 Campos Principais

| JSON | Slide |
|------|-------|
| `profilePicUrlHD` | Avatar 80x80px |
| `fullName` | Nome em negrito |
| `username` | @username |
| `biography` | Texto principal |
| `verified` | Badge azul ✓ |
| `followersCount` | Audiência |

---

## 🔧 Configuração

**Arquivo `.env`:**
```
APIFY_API_TOKEN=seu_token_aqui
```

**Dependências:**
```bash
npm install apify-client dotenv
```

---

## ✅ Status

- ✅ Scraper funcionando
- ✅ Fotos baixadas localmente (não expiram)
- ✅ Slides gerando perfeitamente
- ✅ Template 1080x1350px (Instagram)

---

## 📚 Documentação Completa

Ver: `GUIA-SCRAPER-INSTAGRAM.md`
