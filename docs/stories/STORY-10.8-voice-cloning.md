# Story 10.8: Voice Cloning

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P3 (Low)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 3 - Differentiators
**Depende de:** Story 10.1 (ElevenLabs provider implementado)

---

## Descrição

Permitir que o creator clone sua própria voz via ElevenLabs. O creator grava 30 segundos de áudio, faz upload, e todos os reels são narrados com a voz dele. Diferencial competitivo absurdo — "seus reels, com SUA voz, gerados em 3 minutos".

---

## Acceptance Criteria

- [ ] Upload de sample de voz (mín 30s, máx 2min)
- [ ] Clonagem via ElevenLabs Instant Voice Clone API
- [ ] Voz clonada salva e associada ao perfil
- [ ] Seleção "Minha Voz" ao lado das vozes padrão
- [ ] Narração com voz clonada funcional no reel
- [ ] Aviso legal sobre uso de voice cloning
- [ ] Delete da voz clonada a qualquer momento

---

## Tarefas Técnicas

### 1. API — Upload de Sample
- [ ] Criar `app/api/profiles/[id]/voice-clone/route.ts`
- [ ] POST: receber arquivo de áudio (mp3/wav/m4a)
- [ ] Validar: duração mínima 30s, máxima 2min
- [ ] Upload para Cloudinary (armazenamento)
- [ ] Chamar ElevenLabs Instant Voice Clone:
  ```
  POST https://api.elevenlabs.io/v1/voices/add
  Body: FormData { name, files, description }
  ```
- [ ] Salvar `voice_id` no Supabase (campo `cloned_voice_id` em `profiles`)
- [ ] DELETE: remover voz do ElevenLabs e limpar campo no Supabase

### 2. Atualizar Schema do Banco
- [ ] Adicionar `cloned_voice_id` (nullable) à tabela `profiles`
- [ ] Migration SQL

### 3. Integrar com TTS
- [ ] Modificar `lib/tts.ts` para aceitar `voiceId` customizado
- [ ] Se `voiceId` fornecido e provider=elevenlabs, usar esse voice_id
- [ ] Fallback: vozes padrão

### 4. UI — Upload de Voz
- [ ] Componente de gravação/upload de áudio
- [ ] Opção 1: Upload de arquivo (mp3/wav)
- [ ] Opção 2: Gravar direto no browser (MediaRecorder API) — nice to have
- [ ] Status: "Clonando voz..." → "Voz clonada com sucesso!"
- [ ] Na seleção de vozes, adicionar "Minha Voz" no topo (se disponível)
- [ ] Botão "Remover minha voz" com confirmação

### 5. Aviso Legal
- [ ] Disclaimer: "Voice cloning cria uma réplica da sua voz. Só use com sua própria voz."
- [ ] Checkbox de aceite antes de iniciar clonagem

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `app/api/profiles/[id]/voice-clone/route.ts` | Upload + clone API |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `lib/tts.ts` | Suporte a voiceId customizado |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | "Minha Voz" na seleção |
| `database/` | Migration para cloned_voice_id |

---

## Definition of Done

- [ ] Upload e clonagem de voz funcional
- [ ] Narração com voz clonada no reel
- [ ] "Minha Voz" disponível no seletor
- [ ] Delete funcional
- [ ] Aviso legal implementado
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
