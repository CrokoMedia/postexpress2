# Migrations do Supabase

Este diretório contém as migrations do banco de dados Supabase.

## Ordem de Execução

Execute as migrations na ordem numérica:

1. **001_initial_schema.sql** - Schema inicial
2. **002_add_indexes.sql** - Índices para performance
3. **003_add_materialized_views.sql** - Views materializadas
4. **004_add_uploaded_documents.sql** - ✨ **NOVA** - Tabela de documentos uploadados
5. **005_add_soft_delete_to_profiles.sql** - ✨ **NOVA** - Soft delete para perfis

## Como Aplicar

### Via Supabase Dashboard
1. Acesse SQL Editor
2. Copie e execute cada migration na ordem

### Via Supabase CLI
```bash
supabase db push --file database/migrations/004_add_uploaded_documents.sql
supabase db push --file database/migrations/005_add_soft_delete_to_profiles.sql
```

## Migration 004: Uploaded Documents

Cria tabela para armazenar PDFs, DOCX, TXT com extração de texto.

**Storage Bucket necessário:** `documents` (10MB max, private)

## Migration 005: Soft Delete

Adiciona `deleted_at` para soft delete de perfis.

---

**Data:** 2026-02-16 | **Dev:** Dex
