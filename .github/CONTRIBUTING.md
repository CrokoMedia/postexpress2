# 🤝 Guia de Contribuição - Post Express

## 🔒 Boas Práticas de Branch

### Proteção da Branch Main

⚠️ **IMPORTANTE**: Nunca faça push direto para `main`!

### Workflow Recomendado

1. **Crie uma branch de feature**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Faça suas alterações e commit**
   ```bash
   git add .
   git commit -m "feat: descrição da feature"
   ```

3. **Push para o GitHub**
   ```bash
   git push origin feature/nome-da-feature
   ```

4. **Abra um Pull Request**
   ```bash
   gh pr create --title "Feature: Nome" --body "Descrição"
   ```

5. **Aguarde revisão e aprovação**

6. **Merge após aprovação**

## 📝 Convenção de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção

### Exemplos:

```bash
feat: adicionar Squad Auditores
fix: corrigir integração com Apify
docs: atualizar README com instruções
```

## 🔐 Segurança

### Nunca commite:
- ❌ Arquivo `.env` com chaves de API
- ❌ Credenciais ou tokens
- ❌ Dados sensíveis de clientes

### Sempre use:
- ✅ `.env.example` como template
- ✅ `.gitignore` para arquivos sensíveis
- ✅ Secrets do GitHub para CI/CD

## 🧪 Antes de Commitar

```bash
# Verificar se .env não está sendo rastreado
git status | grep .env

# Se aparecer, remova:
git rm --cached .env
```

## 📊 Pull Request

### Checklist:
- [ ] Código testado localmente
- [ ] Sem credenciais no código
- [ ] README atualizado (se necessário)
- [ ] Commit messages seguem convenção

## 🚀 Deploy

Deploy é feito apenas pela branch `main` após merge de PR aprovado.

---

**Dúvidas?** Entre em contato com o time Pazos Media.
