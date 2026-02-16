-- ============================================
-- MIGRATION 004: Uploaded Documents
-- ============================================
-- Adiciona suporte para upload de documentos (PDF, DOCX, TXT, etc)
-- para alimentar análise de experts sem conteúdo suficiente

-- Tabela de documentos uploadados
CREATE TABLE uploaded_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Referência ao perfil (opcional - pode ser antes de criar perfil)
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username VARCHAR(100), -- Username associado (para criar perfil depois)

  -- Dados do arquivo
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, docx, txt, doc
  file_size INTEGER, -- em bytes
  file_url TEXT NOT NULL, -- URL no Supabase Storage
  storage_path TEXT NOT NULL, -- Path no bucket

  -- Conteúdo extraído
  extracted_text TEXT, -- Texto extraído do documento
  extraction_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  extraction_error TEXT, -- Mensagem de erro se falhar

  -- Metadados
  description TEXT, -- Descrição opcional do documento
  document_category VARCHAR(50), -- posicionamento, conteudo, biografia, outros

  -- Controle
  uploaded_by VARCHAR(100), -- Email/ID de quem fez upload (futuro auth)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Índices
CREATE INDEX idx_uploaded_documents_profile_id ON uploaded_documents(profile_id);
CREATE INDEX idx_uploaded_documents_username ON uploaded_documents(username);
CREATE INDEX idx_uploaded_documents_status ON uploaded_documents(extraction_status);
CREATE INDEX idx_uploaded_documents_deleted ON uploaded_documents(deleted_at);

-- Trigger para updated_at
CREATE TRIGGER update_uploaded_documents_updated_at
  BEFORE UPDATE ON uploaded_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Política pública de leitura (ajustar depois se precisar auth)
CREATE POLICY "Public read access" ON uploaded_documents
  FOR SELECT
  USING (deleted_at IS NULL);

-- Política pública de insert (ajustar depois se precisar auth)
CREATE POLICY "Public insert access" ON uploaded_documents
  FOR INSERT
  WITH CHECK (true);

-- Política pública de update (ajustar depois se precisar auth)
CREATE POLICY "Public update access" ON uploaded_documents
  FOR UPDATE
  USING (deleted_at IS NULL);

-- Política pública de delete (ajustar depois se precisar auth)
CREATE POLICY "Public delete access" ON uploaded_documents
  FOR DELETE
  USING (true);

-- Comentários
COMMENT ON TABLE uploaded_documents IS 'Documentos uploadados para alimentar análise de experts';
COMMENT ON COLUMN uploaded_documents.extracted_text IS 'Texto extraído automaticamente do documento';
COMMENT ON COLUMN uploaded_documents.extraction_status IS 'Status da extração: pending|processing|completed|failed';
COMMENT ON COLUMN uploaded_documents.document_category IS 'Categoria do documento: posicionamento|conteudo|biografia|outros';

-- Storage bucket (criar via Supabase Dashboard ou CLI)
-- Bucket name: 'documents'
-- Public: false (apenas authenticated users podem acessar)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain
