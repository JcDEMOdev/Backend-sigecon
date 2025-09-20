-- Tabela de anexos para NCs/NEs - Compatível com PostgreSQL/NeonDB
-- Script para criar a tabela de anexos no sistema SIGECON

CREATE TABLE IF NOT EXISTS anexos (
  id SERIAL PRIMARY KEY,
  id_nota INTEGER NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('NC', 'NE')),
  nome_arquivo VARCHAR(255) NOT NULL,
  url_cloudinary TEXT NOT NULL,
  data_upload TIMESTAMP NOT NULL DEFAULT NOW(),
  usuario_upload VARCHAR(100),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Índices para melhor performance
  CONSTRAINT anexos_id_nota_tipo_idx UNIQUE (id_nota, tipo, nome_arquivo)
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_anexos_id_nota ON anexos(id_nota);
CREATE INDEX IF NOT EXISTS idx_anexos_tipo ON anexos(tipo);
CREATE INDEX IF NOT EXISTS idx_anexos_data_upload ON anexos(data_upload);
CREATE INDEX IF NOT EXISTS idx_anexos_ativo ON anexos(ativo);

-- Comentários para documentação
COMMENT ON TABLE anexos IS 'Tabela para armazenar anexos de PDFs das Notas de Crédito (NC) e Notas de Empenho (NE)';
COMMENT ON COLUMN anexos.id_nota IS 'ID da nota (NC ou NE) à qual o anexo pertence';
COMMENT ON COLUMN anexos.tipo IS 'Tipo da nota: NC (Nota de Crédito) ou NE (Nota de Empenho)';
COMMENT ON COLUMN anexos.nome_arquivo IS 'Nome original do arquivo anexado';
COMMENT ON COLUMN anexos.url_cloudinary IS 'URL do arquivo armazenado no Cloudinary';
COMMENT ON COLUMN anexos.data_upload IS 'Data e hora do upload do anexo';
COMMENT ON COLUMN anexos.usuario_upload IS 'Usuário que fez o upload do anexo';
COMMENT ON COLUMN anexos.ativo IS 'Flag para soft delete - indica se o anexo está ativo';