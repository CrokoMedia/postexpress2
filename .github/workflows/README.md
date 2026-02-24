# 🔄 GitHub Actions - Croko Labs

## Workflows Configurados

### 1. CI (Continuous Integration)

**Arquivo**: `.github/workflows/ci.yml`

**Trigger**:
- Pull Requests para `main` ou `develop`
- Push para `main` ou `develop`

**Jobs**:
- **Lint**: ESLint + TypeScript type checking
- **Test**: Executa testes automatizados
- **Security**: Audit de dependências + scan de secrets

**Status**: ⚠️ Configurado, aguardando `package.json` com scripts

---

## 📋 Scripts Necessários no package.json

Para que o CI funcione, adicione ao `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🔐 Secrets Necessários

Configure em: **Settings** → **Secrets and variables** → **Actions**

### Para Deploy (futuro):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

⚠️ **NUNCA** commite secrets no código!

---

## 🚀 Próximos Workflows (Futuro)

### CD (Continuous Deployment)
- Deploy automático após merge em `main`
- Deploy de preview para PRs
- Rollback automático em caso de falha

### Apify Integration
- Deploy automático de Actors
- Sync de scrapers com GitHub

---

## 📊 Status Badges

Adicione ao README.md:

```markdown
![CI](https://github.com/CrokoMedia/postexpress2/workflows/CI/badge.svg)
```

---

**Última atualização**: 2026-02-16
