# Sistema de Anexos SIGECON

## Visão Geral

Sistema completo de anexos para Notas de Crédito (NC) e Notas de Empenho (NE) com autenticação baseada em sessão e controle de acesso.

## Funcionalidades

### Autenticação
- **Login**: `POST /api/auth/login`
- **Logout**: `POST /api/auth/logout`
- **Verificar Sessão**: `GET /api/auth/session`

### Usuários do Sistema
- **Admin**: `admin/admin123` - Pode anexar e visualizar
- **User**: `user/user123` - Apenas visualizar

### Anexos
- **Anexar arquivo (Admin)**: `POST /api/anexos`
- **Listar por nota**: `GET /api/anexos/:tipo/:idNota`
- **Listar todos**: `GET /api/anexos`
- **Excluir (Admin)**: `DELETE /api/anexos/:id`

## Instalação e Configuração

### 1. Criar tabela no banco
```sql
-- Execute o script SQL no NeonDB/PostgreSQL
\i backend/sql/anexos.sql
```

### 2. Iniciar servidor
```bash
cd backend
npm start
```

### 3. Testar sistema
```bash
# Executar testes automatizados
./test-anexos.sh
```

## Uso da API

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "sessionId": "sess_1234567890_abcdef",
  "user": {
    "username": "admin",
    "role": "admin",
    "nome": "Administrador"
  }
}
```

### 2. Anexar Arquivo (Admin)
```bash
curl -X POST http://localhost:3000/api/anexos \
  -H "Content-Type: application/json" \
  -H "x-session-id: sess_1234567890_abcdef" \
  -d '{
    "idNota": 1,
    "tipo": "NC",
    "nomeArquivo": "documento.pdf",
    "urlCloudinary": "https://cloudinary.com/documento.pdf"
  }'
```

### 3. Listar Anexos
```bash
curl -X GET http://localhost:3000/api/anexos/NC/1 \
  -H "x-session-id: sess_1234567890_abcdef"
```

## Estrutura de Dados

### Anexo
```json
{
  "idNota": 1,
  "tipo": "NC",
  "nomeArquivo": "documento.pdf",
  "urlCloudinary": "https://cloudinary.com/documento.pdf"
}
```

### Tipos Suportados
- `NC` - Nota de Crédito
- `NE` - Nota de Empenho

## Controle de Acesso

| Ação | Admin | User |
|------|-------|------|
| Anexar arquivo | ✅ | ❌ |
| Visualizar lista | ✅ | ✅ |
| Excluir anexo | ✅ | ❌ |

## Validações

- Campos obrigatórios: `idNota`, `tipo`, `nomeArquivo`, `urlCloudinary`
- Tipo deve ser `NC` ou `NE`
- ID da nota deve ser numérico
- Autenticação obrigatória para todas as operações
- Autorização específica para criação e exclusão

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `UNAUTHORIZED` | Usuário não autenticado |
| `FORBIDDEN` | Acesso negado (não é admin) |
| `MISSING_FIELDS` | Campos obrigatórios ausentes |
| `INVALID_TYPE` | Tipo inválido (deve ser NC ou NE) |
| `NOTE_NOT_FOUND` | Nota não encontrada |
| `DUPLICATE_ATTACHMENT` | Anexo duplicado |
| `ATTACHMENT_NOT_FOUND` | Anexo não encontrado |
| `INTERNAL_ERROR` | Erro interno do servidor |

## Arquivos Criados

- `backend/sql/anexos.sql` - Script de criação da tabela
- `backend/db.js` - Configuração do banco de dados
- `backend/middlewares/auth.js` - Sistema de autenticação
- `backend/routes/anexos.js` - Rotas dos anexos
- `backend/server.js` - Servidor principal (atualizado)
- `backend/test-anexos.sh` - Script de testes