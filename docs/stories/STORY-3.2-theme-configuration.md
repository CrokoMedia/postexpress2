# Story 3.2: Interface de Configuração de Temas

**Epic:** EPIC-001 | **Status:** 📋 To Do | **Priority:** P1 | **Estimate:** 3h
**Sprint:** Sprint 2 - Semana 1 | **Depends On:** Story 3.1

---

## 📋 Descrição

Modal de edição de temas com preview da regra gerada, validação (max 30 temas) e aplicação automática ao Twitter Stream.

---

## 🎯 Acceptance Criteria

- [ ] Modal `EditThemesModal` funcionando
- [ ] Input de tags (adicionar/remover)
- [ ] Preview da regra Twitter gerada
- [ ] Validação: max 30 temas, max 512 chars na regra
- [ ] Salvar atualiza Supabase + Twitter API
- [ ] Loading states e error feedback

---

## 🔧 Implementação

```typescript
// components/twitter/EditThemesModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/molecules/Modal';
import { Button, Input, Badge } from '@/components/atoms';

export function EditThemesModal({ expert, onClose, onSuccess }) {
  const [themes, setThemes] = useState<string[]>(expert.themes);
  const [input, setInput] = useState('');
  const [rulePreview, setRulePreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Gerar preview da regra
  useEffect(() => {
    const themesQuery = themes.map(t => `"${t}"`).join(' OR ');
    const rule = `from:${expert.twitter_username} (${themesQuery}) -is:retweet -is:reply`;
    setRulePreview(rule);
  }, [themes, expert.twitter_username]);

  function handleAdd() {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !themes.includes(trimmed) && themes.length < 30) {
      setThemes([...themes, trimmed]);
      setInput('');
    }
  }

  function handleRemove(theme: string) {
    setThemes(themes.filter(t => t !== theme));
  }

  async function handleSave() {
    if (themes.length === 0) {
      alert('Adicione pelo menos 1 tema');
      return;
    }

    if (rulePreview.length > 512) {
      alert('Regra muito longa (max 512 caracteres)');
      return;
    }

    setLoading(true);

    try {
      // 1. Atualizar Supabase
      const { error } = await fetch(`/api/twitter/experts/${expert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themes })
      });

      if (error) throw error;

      // 2. Atualizar regra no Twitter API (remove antiga + cria nova)
      await fetch('/api/twitter/rules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expertId: expert.id, themes })
      });

      onSuccess();
    } catch (error) {
      alert('Erro ao salvar temas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Editar Temas" onClose={onClose}>
      {/* Input de temas */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ex: marketing"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button onClick={handleAdd} disabled={themes.length >= 30}>
            + Add
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 min-h-[60px]">
          {themes.map(t => (
            <Badge key={t} onRemove={() => handleRemove(t)}>
              {t}
            </Badge>
          ))}
        </div>

        {/* Preview */}
        <div>
          <label className="text-sm font-medium">Preview da Regra:</label>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            {rulePreview}
          </pre>
          <p className="text-xs text-gray-500 mt-1">
            {rulePreview.length}/512 caracteres · {themes.length}/30 temas
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

```typescript
// app/api/twitter/experts/[id]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { themes } = await req.json();
  const { error } = await supabase
    .from('twitter_experts')
    .update({ themes, updated_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({ success: !error, error });
}
```

---

## 📁 Arquivos

- `components/twitter/EditThemesModal.tsx` - CRIADO
- `app/api/twitter/experts/[id]/route.ts` - CRIADO
- `app/api/twitter/rules/update/route.ts` - CRIADO

---

## ✅ Definition of Done

- [ ] Modal funcionando com input de tags
- [ ] Preview da regra em tempo real
- [ ] Validação (30 temas, 512 chars)
- [ ] Salvar atualiza Supabase + Twitter
- [ ] Error handling robusto
