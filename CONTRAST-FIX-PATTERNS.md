# 🎨 Padrões de Correção de Contraste

## Problemas Encontrados

**85 ocorrências** de baixo contraste em 13 arquivos do dashboard.

---

## 🔧 Padrões de Correção

### 1. Borders (20 ocorrências)

**Problema:**
```tsx
border border-neutral-200
```

**Correção:**
```tsx
border-2 border-neutral-300 dark:border-neutral-600
```

---

### 2. Backgrounds Claros (65 ocorrências)

**Problema:**
```tsx
bg-neutral-50
```

**Correção (Cards):**
```tsx
bg-card
```

**Correção (Áreas de fundo):**
```tsx
bg-neutral-100 dark:bg-neutral-800
```

---

### 3. Textos Secundários

**Problema:**
```tsx
text-neutral-600
text-neutral-500
```

**Correção:**
```tsx
text-muted-foreground
```

---

### 4. Inputs e Textareas

**Problema:**
```tsx
className="... bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 ..."
```

**Correção:**
```tsx
className="... bg-card border-2 border-neutral-300 dark:border-neutral-600 ..."
```

---

## 📊 Arquivos Prioritários

### Alto Impacto (33+ problemas)
1. ✅ `/dashboard/audits/[id]/create-content/page.tsx` - 33 problemas

### Médio Impacto (7-14 problemas)
2. ⏳ `/dashboard/templatesPro/page.tsx` - 14 problemas
3. ⏳ `/dashboard/audits/[id]/page.tsx` - 8 problemas
4. ⏳ `/dashboard/profiles/[id]/reels/page.tsx` - 7 problemas

### Baixo Impacto (1-3 problemas)
- `/dashboard/new/page.tsx` - 3 problemas
- `/dashboard/comparisons/page.tsx` - 2 problemas
- `/dashboard/audits/[id]/compare/page.tsx` - 2 problemas
- `/dashboard/bau/page.tsx` - 1 problema
- `/dashboard/page.tsx` - 1 problema
- `/dashboard/reels/page.tsx` - 1 problema
- `/dashboard/audits/[id]/slides/page.tsx` - 1 problema
- `/dashboard/profiles/[id]/slides/page.tsx` - 1 problema

---

## ✅ Status

- [x] Padrões identificados
- [ ] Correções aplicadas
- [ ] Testes visuais
- [ ] Validação WCAG AA

---

*Gerado em: 2025-02-20*
