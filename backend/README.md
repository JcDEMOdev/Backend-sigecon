# SIGECON Backend - Setup e Configuração

## Visão Geral
Backend modular para SIGECON com conexão eficiente ao NeonDB/PostgreSQL, sistema de autenticação por sessão e gestão de anexos para NC/NE.

## Estrutura de Arquivos Criados

### 1. `db.js` - Conexão com NeonDB
```javascript
// Configuração de Pool com SSL e variáveis de ambiente
// Fallback para credenciais explícitas do NeonDB
// Monitoramento de conexões e tratamento de erros
```

### 2. `middlewares/auth.js` - Autenticação e Autorização
```javascript
// Configuração de sessões com express-session
// Middleware de autenticação (requireAuth)
// Middleware de autorização por permissões (requirePermission)
// Logs de auditoria (auditLog)
// Rotas de login/logout
// Bypass para desenvolvimento
```

### 3. `routes/anexos.js` - Gestão de Arquivos
```javascript
// Upload de arquivos para NC e NE
// Listagem de anexos por entidade
// Download de arquivos
// Validação de tipos e tamanhos
// Controle de acesso por permissões
```

### 4. `sql/anexos.sql` - Schema do Banco
```sql
-- Tabela anexos (arquivos vinculados a NC/NE)
-- Tabela users (autenticação)
-- Tabela audit_logs (auditoria)
-- Usuários padrão (admin/operador)
-- Constraints e índices otimizados
```

### 5. `server.js` - Servidor Principal (Refatorado)
```javascript
// Importa e integra todos os módulos
// Configuração de sessões
// Middleware de autenticação nas rotas
// Mantém todas as funcionalidades existentes
```

## Configuração e Instalação

### 1. Dependências
```bash
cd backend
npm install express-session multer
```

### 2. Configuração de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite conforme necessário (as credenciais do NeonDB já estão incluídas)
nano .env
```

### 3. Setup do Banco de Dados
```bash
# Execute o script SQL para criar as tabelas
psql $DATABASE_URL -f sql/anexos.sql
```

### 4. Inicialização
```bash
# Desenvolvimento (com bypass de auth)
NODE_ENV=development BYPASS_AUTH=true npm start

# Produção
NODE_ENV=production npm start
```

## Credenciais NeonDB Fornecidas

```bash
Host: ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech
Database: neondb
User: neondb_owner
Password: npg_8cDPnmrpoJ4B
Port: 5432
SSL: Obrigatório
```

**Connection String:**
```
postgresql://neondb_owner:npg_8cDPnmrpoJ4B@ep-crimson-mode-aejyyt5m-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Funcionalidades Implementadas

### ✅ Conexão com Pool e SSL
- Pool de conexões otimizado (máx 20 conexões)
- SSL obrigatório para NeonDB
- Timeout e retry configurados
- Monitoramento de eventos do pool

### ✅ Sistema de Autenticação
- Sessões com express-session
- Middleware de autenticação (requireAuth)
- Sistema de permissões granular
- Logs de auditoria automáticos
- Bypass para desenvolvimento

### ✅ Gestão de Anexos
- Upload de arquivos (PDF, DOC, XLS, JPG, PNG, etc.)
- Validação de tipos e tamanhos (máx 10MB)
- Múltiplos arquivos por upload (máx 5)
- Download seguro com controle de acesso
- Metadados de arquivos no banco

### ✅ Segurança
- Validação de permissões por rota
- Logs de auditoria detalhados
- Sanitização de uploads
- Sessões seguras com cookies httpOnly

## Endpoints de Anexos

### Upload de Anexo para NC
```http
POST /api/anexos/nc/:nc_id/upload
Content-Type: multipart/form-data
Authorization: Session required

Body:
- files: arquivo(s) para upload
- description: descrição opcional
```

### Listar Anexos de NC
```http
GET /api/anexos/nc/:nc_id
Authorization: Session required
```

### Download de Anexo
```http
GET /api/anexos/download/:anexo_id
Authorization: Session required
```

### Autenticação
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

## Usuários Padrão

### Administrador
- **Username:** admin
- **Password:** admin123
- **Permissões:** Todas (admin, anexos_create, anexos_edit, anexos_delete, anexos_view)

### Operador
- **Username:** operador
- **Password:** operador123
- **Permissões:** Limitadas (anexos_create, anexos_view)

## Estrutura de Permissões

- `admin`: Acesso total ao sistema
- `anexos_create`: Criar anexos
- `anexos_edit`: Editar anexos
- `anexos_delete`: Excluir anexos
- `anexos_view`: Visualizar anexos

## Desenvolvimento

### Bypass de Autenticação
```bash
# No arquivo .env
NODE_ENV=development
BYPASS_AUTH=true
```

### Logs de Debug
O sistema gera logs automáticos de:
- Conexões com o banco
- Ações de usuários
- Uploads de arquivos
- Erros e exceções

## Produção

### Configurações Importantes
1. **Altere SESSION_SECRET** no arquivo .env
2. **Configure BYPASS_AUTH=false**
3. **Configure NODE_ENV=production**
4. **Use HTTPS** para sessões seguras
5. **Configure logs externos** para auditoria

### Otimizações
- Pool de conexões configurado para alta concorrência
- Índices otimizados nas tabelas
- Validação eficiente de arquivos
- Cleanup automático de arquivos órfãos

## Troubleshooting

### Erro de Conexão com NeonDB
```bash
# Verifique as credenciais
echo $DATABASE_URL

# Teste conexão direta
psql $DATABASE_URL -c "SELECT version();"
```

### Problemas de Upload
```bash
# Verifique permissões do diretório
chmod 755 uploads/

# Verifique espaço em disco
df -h
```

### Sessões não Funcionando
```bash
# Verifique se express-session está instalado
npm list express-session

# Verifique configuração de CORS
# Deve ter credentials: true
```

## Manutenção

### Cleanup de Anexos Órfãos
```sql
-- Execute periodicamente
SELECT cleanup_orphaned_attachments();
```

### Backup de Anexos
```bash
# Backup do diretório de uploads
tar -czf anexos-backup-$(date +%Y%m%d).tar.gz uploads/
```

### Monitoramento
- Logs de auditoria na tabela `audit_logs`
- Conexões do pool monitoradas no console
- Métricas de uploads disponíveis via queries

## Integração Completa

O sistema está totalmente integrado e pronto para uso:

1. ✅ **Database Connection**: Pool otimizado com SSL
2. ✅ **Authentication**: Sistema completo de sessões
3. ✅ **File Management**: Upload/download com validação
4. ✅ **Security**: Permissões e auditoria
5. ✅ **Environment Config**: Variáveis com fallbacks
6. ✅ **Modular Structure**: Arquitetura organizada
7. ✅ **Error Handling**: Tratamento robusto de erros
8. ✅ **Documentation**: Guia completo de uso