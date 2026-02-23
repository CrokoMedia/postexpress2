'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Badge } from '@/components/atoms/badge';

interface EditThemesModalProps {
  expert: {
    id: string;
    twitter_username: string;
    themes: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditThemesModal({ expert, isOpen, onClose, onSuccess }: EditThemesModalProps) {
  const [themes, setThemes] = useState<string[]>([...expert.themes]);
  const [themeInput, setThemeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleAddTheme() {
    const trimmed = themeInput.trim().toLowerCase();

    if (!trimmed) {
      return;
    }

    if (themes.includes(trimmed)) {
      setError('Tema já existe');
      return;
    }

    if (themes.length >= 30) {
      setError('Máximo de 30 temas (limite do Twitter API)');
      return;
    }

    setThemes([...themes, trimmed]);
    setThemeInput('');
    setError('');
  }

  function handleRemoveTheme(theme: string) {
    setThemes(themes.filter(t => t !== theme));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (themes.length === 0) {
      setError('Pelo menos 1 tema é obrigatório');
      return;
    }

    // Verificar se houve mudanças
    const themesChanged = JSON.stringify(themes.sort()) !== JSON.stringify(expert.themes.sort());

    if (!themesChanged) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Atualizar via API (usa service_role - bypass RLS)
      const response = await fetch(`/api/twitter/experts/${expert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.details || 'Falha ao atualizar temas');
      }

      onSuccess();

    } catch (error: any) {
      console.error('Error updating themes:', error);
      setError(error.message || 'Erro ao atualizar temas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Temas - @{expert.twitter_username}</DialogTitle>
          <DialogDescription>
            Configure os temas de interesse para monitorar tweets relevantes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Temas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temas de Interesse ({themes.length}/30)
            </label>

            {/* Input para adicionar */}
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                placeholder="Ex: marketing"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTheme();
                  }
                }}
                disabled={loading}
              />
              <Button type="button" onClick={handleAddTheme} disabled={loading}>
                + Add
              </Button>
            </div>

            {/* Lista de temas */}
            {themes.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[80px]">
                {themes.map(theme => (
                  <Badge key={theme} variant="neutral">
                    {theme}
                    <button
                      type="button"
                      onClick={() => handleRemoveTheme(theme)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                Nenhum tema configurado
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Ao salvar, a regra do Twitter será atualizada automaticamente.
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
