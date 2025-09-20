-- SIGECON - Script SQL para criação da tabela de anexos
-- Tabela para armazenar anexos/arquivos vinculados a NC (Notas de Crédito) e NE (Notas de Empenho)

-- Criação da tabela anexos
CREATE TABLE IF NOT EXISTS anexos (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(10) NOT NULL CHECK (entity_type IN ('NC', 'NE')),
    entity_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL, -- nome do arquivo no sistema
    original_name VARCHAR(255) NOT NULL, -- nome original do arquivo
    file_path TEXT NOT NULL, -- caminho completo do arquivo
    file_size BIGINT NOT NULL, -- tamanho do arquivo em bytes
    mime_type VARCHAR(100) NOT NULL, -- tipo MIME do arquivo
    description TEXT, -- descrição opcional do anexo
    uploaded_by INTEGER, -- ID do usuário que fez upload (referência à tabela users)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_anexos_entity ON anexos(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_anexos_uploaded_by ON anexos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_anexos_created_at ON anexos(created_at DESC);

-- Tabela de usuários (se não existir) - necessária para autenticação
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- hash da senha usando crypt()
    permissions TEXT[] DEFAULT '{}', -- array de permissões
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    ip INET,
    user_agent TEXT,
    method VARCHAR(10),
    url TEXT,
    body JSONB,
    status_code INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Inserir usuário administrador padrão (senha: admin123)
-- A senha é hasheada usando a função crypt() do PostgreSQL
INSERT INTO users (username, email, password, permissions)
VALUES (
    'admin',
    'admin@sigecon.gov.br',
    crypt('admin123', gen_salt('bf')),
    ARRAY['admin', 'anexos_create', 'anexos_edit', 'anexos_delete', 'anexos_view']
) ON CONFLICT (username) DO NOTHING;

-- Inserir usuário operador padrão (senha: operador123)
INSERT INTO users (username, email, password, permissions)
VALUES (
    'operador',
    'operador@sigecon.gov.br',
    crypt('operador123', gen_salt('bf')),
    ARRAY['anexos_create', 'anexos_view']
) ON CONFLICT (username) DO NOTHING;

-- Adicionar constraints de foreign key se as tabelas NC e NE existirem
-- Nota: Estas constraints serão criadas apenas se as tabelas referenciadas existirem

DO $$
BEGIN
    -- Verifica se tabela nota_credito existe antes de criar constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nota_credito') THEN
        -- Adiciona constraint para NC se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_anexos_nota_credito'
        ) THEN
            ALTER TABLE anexos 
            ADD CONSTRAINT fk_anexos_nota_credito 
            FOREIGN KEY (entity_id) REFERENCES nota_credito(id) ON DELETE CASCADE
            NOT VALID;
            
            -- Valida constraint apenas para registros NC
            ALTER TABLE anexos VALIDATE CONSTRAINT fk_anexos_nota_credito;
        END IF;
    END IF;

    -- Verifica se tabela nota_empenhos existe antes de criar constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nota_empenhos') THEN
        -- Adiciona constraint para NE se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_anexos_nota_empenhos'
        ) THEN
            ALTER TABLE anexos 
            ADD CONSTRAINT fk_anexos_nota_empenhos 
            FOREIGN KEY (entity_id) REFERENCES nota_empenhos(id) ON DELETE CASCADE
            NOT VALID;
            
            -- Valida constraint apenas para registros NE
            ALTER TABLE anexos VALIDATE CONSTRAINT fk_anexos_nota_empenhos;
        END IF;
    END IF;
    
    -- Foreign key para usuários
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_anexos_users'
    ) THEN
        ALTER TABLE anexos 
        ADD CONSTRAINT fk_anexos_users 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Função para limpeza automática de arquivos órfãos (opcional)
CREATE OR REPLACE FUNCTION cleanup_orphaned_attachments()
RETURNS void AS $$
BEGIN
    -- Remove registros de anexos onde as entidades não existem mais
    DELETE FROM anexos 
    WHERE entity_type = 'NC' 
    AND entity_id NOT IN (SELECT id FROM nota_credito);
    
    DELETE FROM anexos 
    WHERE entity_type = 'NE' 
    AND entity_id NOT IN (SELECT id FROM nota_empenhos);
    
    RAISE NOTICE 'Limpeza de anexos órfãos concluída.';
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas e colunas
COMMENT ON TABLE anexos IS 'Tabela para armazenar anexos/arquivos vinculados a NC e NE';
COMMENT ON COLUMN anexos.entity_type IS 'Tipo da entidade: NC (Nota de Crédito) ou NE (Nota de Empenho)';
COMMENT ON COLUMN anexos.entity_id IS 'ID da entidade (NC ou NE) à qual o anexo está vinculado';
COMMENT ON COLUMN anexos.filename IS 'Nome único do arquivo no sistema de arquivos';
COMMENT ON COLUMN anexos.original_name IS 'Nome original do arquivo conforme enviado pelo usuário';
COMMENT ON COLUMN anexos.file_path IS 'Caminho completo do arquivo no servidor';
COMMENT ON COLUMN anexos.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN anexos.mime_type IS 'Tipo MIME do arquivo (application/pdf, image/jpeg, etc.)';
COMMENT ON COLUMN anexos.description IS 'Descrição opcional do anexo fornecida pelo usuário';
COMMENT ON COLUMN anexos.uploaded_by IS 'ID do usuário que fez o upload do arquivo';

COMMENT ON TABLE users IS 'Tabela de usuários para autenticação e autorização';
COMMENT ON COLUMN users.permissions IS 'Array de permissões do usuário (admin, anexos_create, etc.)';

COMMENT ON TABLE audit_logs IS 'Tabela de logs de auditoria para rastreamento de ações';

-- Concluído
SELECT 'Tabelas e estrutura de anexos criadas com sucesso!' AS resultado;