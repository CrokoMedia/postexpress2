# Sistema de Importação de Contexto de Perfis

> Como adicionar contexto completo de qualquer perfil no Croko Labs

---

## 📋 Visão Geral

O Croko Labs usa um sistema de **contexto rico** para gerar conteúdo personalizado. Cada perfil tem 7 categorias de contexto:

| Categoria | O que contém |
|-----------|--------------|
| **identity** | Nome, posicionamento, nicho, avatar, tom de voz |
| **credibility** | Experiência, conquistas, expertise |
| **philosophy** | Valores, crenças, defende, rejeita |
| **content_style** | Formatos preferidos, estrutura, linguagem |
| **content_pillars** | Pilares de conteúdo (temas principais) |
| **business** | Produtos, lead magnets, funil |
| **dna** | Energia, voz única, transformação, frameworks |

---

## 🚀 Processo de Importação

### Passo 1: Buscar o Profile ID

Antes de criar o contexto, você precisa do UUID do perfil:

```sql
-- No SQL Editor do Supabase:
SELECT id, username FROM profiles WHERE username = 'nome_do_perfil';
```

**Copie o UUID retornado** (ex: `9ebce906-35c4-408c-a73b-c5211a927ad9`)

---

### Passo 2: Copiar o Template

```bash
cp database/template-profile-context.json database/contexto-{username}.json
```

Exemplo:
```bash
cp database/template-profile-context.json database/contexto-garyvee.json
```

---

### Passo 3: Preencher o JSON

Abra o arquivo criado e preencha todos os campos:

```json
{
  "profile_id": "COLE_O_UUID_AQUI",

  "identity": {
    "fullName": "Gary Vaynerchuk",
    "displayName": "GaryVee",
    "positioning": "Ajudo empreendedores a construírem marcas autênticas através de marketing digital e trabalho duro",
    "niche": ["Marketing Digital", "Empreendedorismo", "Personal Branding"],
    "avatar": "Empreendedores que querem construir marcas pessoais fortes",
    "toneOfVoice": "Direto, enérgico, motivacional, sem papas na língua"
  },

  "credibility": {
    "experience": "30+ anos em marketing e empreendedorismo. Fundador da VaynerMedia (agência de $200M+).",
    "achievements": [
      "Fundador da VaynerMedia",
      "5x NYT Best Selling Author",
      "Investidor em Uber, Twitter, Tumblr",
      "1M+ seguidores em múltiplas plataformas"
    ],
    "expertise": [
      "Marketing digital",
      "Personal branding",
      "Social media marketing",
      "Investimentos angel"
    ]
  },

  // ... continue preenchendo todas as seções
}
```

**Dicas de preenchimento:**

- ✅ **Delete todas as linhas que começam com `_`** (são apenas instruções)
- ✅ Use **aspas duplas** para strings
- ✅ Use **vírgula** entre itens de array (exceto o último)
- ✅ Use **vírgula** entre propriedades de objeto (exceto a última)
- ✅ Valide o JSON em [jsonlint.com](https://jsonlint.com) antes de importar

---

### Passo 4: Importar para o Banco

```bash
node scripts/import-profile-context.js database/contexto-{username}.json
```

Exemplo:
```bash
node scripts/import-profile-context.js database/contexto-garyvee.json
```

**Saída esperada:**

```
🚀 Iniciando importação de contexto de perfil...

📁 Arquivo: /path/to/contexto-garyvee.json

Profile ID: abc-123-def-456
Nome: GaryVee

✅ Contexto importado com sucesso!

📊 Dados inseridos:
   - Nome: GaryVee
   - Posicionamento: Ajudo empreendedores a construírem marcas autênticas...
   - Pilares de conteúdo: 4
   - Produtos: 2
   - Frameworks: 8

✨ Perfil completo atualizado no Croko Labs!
```

---

## ✅ Checklist de Validação

Antes de importar, verifique:

- [ ] Profile ID é um UUID válido do Supabase
- [ ] JSON está sintaticamente correto (sem erros de vírgula, aspas)
- [ ] Todos os campos obrigatórios preenchidos:
  - [ ] `profile_id`
  - [ ] `identity.displayName`
  - [ ] `identity.positioning`
  - [ ] Pelo menos 1 pilar em `content_pillars`
- [ ] Arrays de strings usam aspas duplas
- [ ] Não há linhas com `_exemplo` ou `_INSTRUCOES` no JSON final

---

## 🔧 Troubleshooting

### Erro: "Campo obrigatório profile_id não encontrado"
- Verifique se você preencheu o campo `profile_id` com o UUID correto

### Erro: "Arquivo não encontrado"
- Verifique o caminho do arquivo JSON
- Use caminho relativo a partir da raiz do projeto

### Erro: "Erro ao parsear JSON"
- Valide o JSON em [jsonlint.com](https://jsonlint.com)
- Verifique vírgulas faltando ou sobrando
- Certifique-se de usar aspas duplas (não simples)

### Erro: "SUPABASE_URL não encontrado"
- Certifique-se de ter o arquivo `.env` na raiz do projeto
- Verifique se as variáveis estão configuradas:
  ```env
  SUPABASE_URL=https://...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

---

## 📚 Exemplos Disponíveis

| Perfil | Arquivo | Status |
|--------|---------|--------|
| Karla Pazos | `database/update-karla-profile-context.sql` | ✅ Importado |
| Template | `database/template-profile-context.json` | 📝 Template vazio |

---

## 🎯 Próximos Passos Após Importação

Depois de importar o contexto:

1. **Teste a geração de conteúdo** no Croko Labs
2. **Valide o tom de voz** - veja se o sistema está gerando conteúdo autêntico
3. **Ajuste se necessário** - você pode re-importar quantas vezes quiser (upsert atualiza)

---

## 💡 Dicas de Coleta de Dados

Para preencher o contexto de forma rica:

### Identity
- Busque bio do Instagram/LinkedIn
- Analise como a pessoa se apresenta
- Identifique o nicho pelos posts

### Credibility
- Busque conquistas em entrevistas, sobre-páginas
- Liste certificações, prêmios, números impressionantes

### Philosophy
- Analise posts polêmicos, manifestos
- O que a pessoa critica ou defende?
- Quais valores repete constantemente?

### Content Style
- Analise 10-20 posts recentes
- Identifique padrões: usa emojis? Caps? Storytelling?
- Qual o comprimento típico?

### Content Pillars
- Agrupe posts por tema
- Identifique os 3-5 temas que mais aparecem
- Liste mensagens-chave que repete

### Business
- Busque produtos na bio, links
- Identifique lead magnets (materiais gratuitos)
- Mapeie o funil (como leva de gratuito → pago)

### DNA
- Como pessoas descrevem essa pessoa? (busque comentários)
- Qual a energia característica?
- Frameworks que menciona ou usa?

---

*Última atualização: 2026-02-22*
*Versão: 1.0*
