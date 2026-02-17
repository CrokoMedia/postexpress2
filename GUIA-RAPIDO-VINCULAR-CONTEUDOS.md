# 🚀 GUIA RÁPIDO: Vincular Conteúdos Entre Perfis

## 📦 Instalação (5 minutos)

### Passo 1: Aplicar Migrations

1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Cole e execute **nesta ordem**:

```sql
-- Migration 006 (se ainda não aplicou)
-- Cole o conteúdo de: database/migrations/006_add_soft_delete_all_tables.sql

-- Migration 007 (vinculação de conteúdos)
-- Cole o conteúdo de: database/migrations/007_content_profile_links.sql
```

### Passo 2: Testar Instalação

```bash
npm run test:linking
```

Se tudo estiver OK, verá:
```
✅ TODOS OS TESTES PASSARAM!
🎉 Sistema de vinculação está funcionando corretamente!
```

## 🎯 Como Usar

### Cenário: Reutilizar carrossel em outro perfil

**Exemplo:** Você criou um carrossel educacional para `@karlapazos` e quer usar no `@rodrigogunter_`.

#### 1. Acessar Conteúdos

```
http://localhost:3000/dashboard/profiles/{id}/content
```

Ou clique em "Conteúdos" no perfil desejado.

#### 2. Vincular Conteúdo

1. Veja a lista de carrosséis gerados
2. Clique no botão **"🔗 Vincular"** no conteúdo desejado
3. Modal abre com lista de perfis

#### 3. Selecionar Perfil

1. Use a busca para encontrar o perfil
2. Clique em **"Vincular"** ao lado do perfil desejado
3. Pronto! ✅

#### 4. Verificar Vinculação

1. Vá para o perfil de destino
2. Acesse "Conteúdos"
3. Verá o conteúdo com badge **"De @username_original"**

## 🏷️ Badges Explicados

### Badge "Original"
- Conteúdo foi **criado originalmente** para este perfil
- Você é o "dono" do conteúdo

### Badge "De @username"
- Conteúdo foi **compartilhado** de outro perfil
- Pode usar normalmente, mas não é o criador original

## 🔄 Desvincular Conteúdo

1. Clique em **"🔗 Vincular"** novamente
2. Perfis vinculados terão badge verde **"✓ Vinculado"**
3. Clique em **"✕ Desvincular"**
4. Confirme

O conteúdo **não será deletado**, apenas o vínculo é removido.

## 💡 Casos de Uso

### 1. Gerenciar Múltiplas Marcas
```
Criou carrossel para Marca A
→ Vincula para Marcas B, C, D
→ Economiza tempo, mantém consistência
```

### 2. Testes A/B
```
Mesmo conteúdo em perfis diferentes
→ Compara performance
→ Otimiza estratégia
```

### 3. Reaproveitar Conteúdo Bom
```
Carrossel performou bem em @perfil1
→ Vincula para @perfil2 (público similar)
→ Replica sucesso
```

## ⚡ Atalhos de Teclado (futuro)

- `Ctrl + L` - Abrir modal de vinculação
- `Esc` - Fechar modal
- `/` - Focar busca de perfis

## 🐛 Problemas Comuns

### "Content already linked to this profile"
**Solução:** Conteúdo já vinculado. Verifique a lista de vínculos.

### Conteúdo não aparece após vincular
**Solução:**
1. Recarregue a página (F5)
2. Limpe cache do navegador
3. Verifique se migration foi aplicada

### Badge não aparece
**Solução:**
1. Verifique console (F12) por erros
2. Confirme que API retorna `is_original` e `original_profile`

## 📊 Estatísticas

Na página de conteúdos, veja:
- **Total de conteúdos**
- **Breakdown:** Original vs Compartilhado

Exemplo:
```
15 conteúdos gerados
• 10 originais
• 5 compartilhados
```

## 🎨 Interface

### Botões
- **🔗 Vincular** - Abre modal de vinculação
- **✓ Vinculado** (verde) - Já vinculado
- **✕ Desvincular** - Remove vínculo

### Modal de Vinculação
- **Busca** - Filtrar perfis por username ou nome
- **Lista de perfis** - Todos os perfis disponíveis
- **Badge "Vinculado"** - Perfis já vinculados em verde

## 📱 Compatibilidade

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile (responsivo)

## ⚙️ APIs (para desenvolvedores)

### Vincular
```bash
POST /api/content/{id}/link
{"profile_id": "uuid", "link_type": "shared"}
```

### Desvincular
```bash
DELETE /api/content/{id}/link?profile_id={uuid}
```

### Listar vínculos
```bash
GET /api/content/{id}/link
```

## ✅ Checklist Pós-Instalação

- [ ] Migration 006 aplicada
- [ ] Migration 007 aplicada
- [ ] `npm run test:linking` passou
- [ ] Testei vincular conteúdo na interface
- [ ] Testei desvincular conteúdo
- [ ] Badges aparecem corretamente
- [ ] Conteúdos compartilhados aparecem em ambos os perfis

---

**Dúvidas?** Veja documentação completa em `FEATURE-VINCULAR-CONTEUDOS.md`

**Problemas?** Execute `npm run test:linking` para diagnóstico
