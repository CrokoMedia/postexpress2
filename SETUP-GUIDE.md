# Setup Guide - Post Express Web App

Guia passo a passo para colocar a aplicação Next.js rodando do zero.

## Pré-requisitos

- Node.js 20+ instalado
- Conta no Supabase (grátis)
- Conta no Apify (grátis)
- API Keys: Anthropic, Google AI, Cloudinary

## Passo 1: Clone e Instale

```bash
# Já está no repositório
cd postexpress2

# Instalar dependências
npm install
```

## Passo 2: Criar Projeto Supabase

1. Acesse https://supabase.com
2. Crie novo projeto (escolha região mais próxima)
3. Aguarde provisionamento (~2 minutos)
4. Copie as credenciais:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## Passo 3: Configurar Banco de Dados

### Via Dashboard (Recomendado)

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `database/optimized-schema.sql`
4. Cole todo o conteúdo no editor
5. Clique em **Run** (▶️)
6. Aguarde execução (~10 segundos)
7. Verifique se as tabelas foram criadas em **Table Editor**

Você deve ver 6 tabelas:
- `profiles`
- `audits`
- `posts`
- `comments`
- `comparisons`
- `analysis_queue`

### Via CLI (Alternativa)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-ref

# Push schema
supabase db push
```

## Passo 4: Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz:

```bash
cp .env.example .env
```

Edite `.env`:

```env
# ========== SUPABASE (OBRIGATÓRIO) ==========
SUPABASE_URL=https://xxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js Public (mesmos valores acima)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ========== APIs EXTERNAS ==========
# Apify (web scraping)
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxx

# Anthropic Claude (auditores)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Google AI (OCR com Gemini)
GOOGLE_AI_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxx

# Cloudinary (imagens)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx

# ========== OPCIONAL ==========
NODE_ENV=development
```

### Onde encontrar as keys:

- **Supabase**: Dashboard > Settings > API
- **Apify**: https://console.apify.com/account/integrations
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google AI**: https://makersuite.google.com/app/apikey
- **Cloudinary**: https://console.cloudinary.com/settings

## Passo 5: Testar Conexão

```bash
# Type check
npm run typecheck

# Build (verifica se está tudo ok)
npm run build
```

Se não houver erros, está pronto!

## Passo 6: Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

Você deve ver:
1. Sidebar à esquerda
2. "Dashboard" no topo
3. Mensagem: "Nenhum perfil encontrado. Crie sua primeira análise!"

## Passo 7: Criar Primeira Análise

1. Clique em **"Nova Análise"**
2. Digite um username (ex: `frankcosta`)
3. Ajuste quantidade de posts (recomendado: 10)
4. Clique em **"Iniciar Análise"**

**IMPORTANTE**: Neste momento, a análise será criada na fila (`analysis_queue`), mas **não será processada** automaticamente porque o worker ainda não foi implementado (Task #8).

Para processar manualmente:

```bash
# Execute os scripts na ordem
node scripts/instagram-scraper-apify.js
node scripts/ocr-gemini-analyzer.js
node scripts/complete-post-analyzer.js
```

Depois disso, você precisará:
1. Criar manualmente o registro em `profiles`
2. Criar manualmente o registro em `audits`
3. Associar os posts

## Passo 8: Popular Banco de Dados (Mock Data)

Para testar a interface sem fazer scraping real, você pode inserir dados mock:

```sql
-- No SQL Editor do Supabase
-- Cole e execute: database/migrations/seeds/001_example_profile.sql
```

Ou crie manualmente via Table Editor.

## Verificação Final

Acesse cada página para garantir que está tudo funcionando:

- ✅ `/dashboard` - Dashboard Home
- ✅ `/dashboard/new` - Nova Análise
- ✅ `/dashboard/profiles/[id]` - Perfil (precisa ter dados)
- ✅ `/dashboard/audits/[id]` - Auditoria (precisa ter dados)

## Próximos Passos

Com a aplicação rodando, você pode:

1. **Implementar o Worker** (Task #8)
   - Criar `worker/analysis-worker.ts`
   - Integrar com scripts existentes
   - Processar fila automaticamente

2. **Adicionar Autenticação**
   - Supabase Auth
   - Login/Logout
   - Protected routes

3. **Deploy em Produção**
   - Vercel (recomendado)
   - Railway
   - Render

## Troubleshooting

### Erro: Cannot find module 'next'
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Connection refused (Supabase)
- Verifique se as URLs estão corretas (sem trailing slash)
- Confirme que o projeto Supabase está ativo
- Teste conexão no Supabase Dashboard

### Erro: Unauthorized
- Verifique se `SUPABASE_ANON_KEY` está correto
- Confirme que RLS policies estão configuradas (são criadas pelo schema)

### Página em branco
- Abra DevTools (F12) > Console
- Verifique erros
- Reinicie dev server

### Tailwind não funciona
```bash
rm -rf .next
npm run dev
```

## Suporte

Se encontrar problemas:
1. Verifique logs no terminal
2. Inspecione Network tab (DevTools)
3. Consulte documentação:
   - [Next.js](https://nextjs.org/docs)
   - [Supabase](https://supabase.com/docs)
   - [Tailwind](https://tailwindcss.com/docs)

---

**Setup completo!** 🎉

Agora você tem uma aplicação Next.js 15 completa rodando com:
- ✅ Banco de dados Supabase configurado
- ✅ Design system implementado
- ✅ API routes funcionais
- ✅ Páginas principais criadas
- ✅ Data fetching com SWR
- ✅ TypeScript strict mode

Próximo passo: implementar o worker para processar análises automaticamente.
