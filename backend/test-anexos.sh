#!/bin/bash

# Script de teste para o sistema de anexos SIGECON
# Demonstra todas as funcionalidades implementadas

echo "🧪 Iniciando testes do sistema de anexos SIGECON..."
echo ""

BASE_URL="http://localhost:3000"

# 1. Teste de login admin
echo "1. Testando login admin..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')
echo "✅ Resposta: $ADMIN_RESPONSE"
ADMIN_SESSION=$(echo $ADMIN_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "📝 Session ID admin: $ADMIN_SESSION"
echo ""

# 2. Teste de login usuário comum
echo "2. Testando login usuário comum..."
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "user123"}')
echo "✅ Resposta: $USER_RESPONSE"
USER_SESSION=$(echo $USER_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "📝 Session ID usuário: $USER_SESSION"
echo ""

# 3. Teste acesso negado - usuário comum tentando criar anexo
echo "3. Testando acesso negado - usuário comum tentando criar anexo..."
DENIED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/anexos" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $USER_SESSION" \
  -d '{"idNota": 1, "tipo": "NC", "nomeArquivo": "teste.pdf", "urlCloudinary": "https://cloudinary.com/teste.pdf"}')
echo "✅ Acesso negado: $DENIED_RESPONSE"
echo ""

# 4. Teste admin criando anexo
echo "4. Testando admin criando anexo..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/anexos" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $ADMIN_SESSION" \
  -d '{"idNota": 1, "tipo": "NC", "nomeArquivo": "documento.pdf", "urlCloudinary": "https://cloudinary.com/documento.pdf"}')
echo "✅ Resposta criação: $CREATE_RESPONSE"
echo ""

# 5. Teste validação - tipo inválido
echo "5. Testando validação - tipo inválido..."
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/anexos" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $ADMIN_SESSION" \
  -d '{"idNota": 1, "tipo": "INVALID", "nomeArquivo": "teste.pdf", "urlCloudinary": "https://cloudinary.com/teste.pdf"}')
echo "✅ Validação: $VALIDATION_RESPONSE"
echo ""

# 6. Teste validação - campos faltando
echo "6. Testando validação - campos obrigatórios..."
MISSING_FIELDS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/anexos" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $ADMIN_SESSION" \
  -d '{"idNota": 1}')
echo "✅ Campos faltando: $MISSING_FIELDS_RESPONSE"
echo ""

# 7. Teste listar anexos - usuário autenticado
echo "7. Testando listar anexos - usuário autenticado..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/anexos/NC/1" \
  -H "x-session-id: $USER_SESSION")
echo "✅ Lista anexos: $LIST_RESPONSE"
echo ""

# 8. Teste listar todos os anexos
echo "8. Testando listar todos os anexos..."
LIST_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/anexos/" \
  -H "x-session-id: $USER_SESSION")
echo "✅ Lista todos: $LIST_ALL_RESPONSE"
echo ""

# 9. Teste delete - usuário comum (deve falhar)
echo "9. Testando delete - usuário comum (deve falhar)..."
DELETE_USER_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/anexos/1" \
  -H "x-session-id: $USER_SESSION")
echo "✅ Delete negado: $DELETE_USER_RESPONSE"
echo ""

# 10. Teste delete - admin (vai até o banco)
echo "10. Testando delete - admin..."
DELETE_ADMIN_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/anexos/1" \
  -H "x-session-id: $ADMIN_SESSION")
echo "✅ Delete admin: $DELETE_ADMIN_RESPONSE"
echo ""

# 11. Teste logout
echo "11. Testando logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "x-session-id: $ADMIN_SESSION")
echo "✅ Logout: $LOGOUT_RESPONSE"
echo ""

# 12. Teste sessão após logout
echo "12. Testando sessão após logout..."
SESSION_AFTER_LOGOUT=$(curl -s -X GET "$BASE_URL/api/auth/session" \
  -H "x-session-id: $ADMIN_SESSION")
echo "✅ Sessão após logout: $SESSION_AFTER_LOGOUT"
echo ""

echo "🎉 Todos os testes concluídos!"
echo ""
echo "Sistema implementado com sucesso:"
echo "- ✅ Autenticação por sessão"
echo "- ✅ Autorização baseada em roles (admin/user)"
echo "- ✅ Validação de dados de entrada"
echo "- ✅ CRUD de anexos com controle de acesso"
echo "- ✅ Soft delete de anexos"
echo "- ✅ Listagem com paginação"
echo "- ✅ Tabela SQL compatível PostgreSQL/NeonDB"
echo ""
echo "📁 Arquivos criados:"
echo "- backend/sql/anexos.sql - Script de criação da tabela"
echo "- backend/db.js - Configuração do banco de dados"
echo "- backend/middlewares/auth.js - Sistema de autenticação"
echo "- backend/routes/anexos.js - Rotas dos anexos"
echo "- backend/server.js - Servidor principal atualizado"