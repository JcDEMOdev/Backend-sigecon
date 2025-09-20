// Middleware de autenticação e autorização baseado em sessão
// Sistema simples de autenticação para o SIGECON

// Simulação de sessões (em produção, usar express-session com store)
const sessions = new Map();

// Usuários do sistema (em produção, buscar do banco de dados)
const usuarios = {
  'admin': { password: 'admin123', role: 'admin', nome: 'Administrador' },
  'user': { password: 'user123', role: 'user', nome: 'Usuário' }
};

// Middleware para verificar se o usuário está autenticado
export const requireAuth = (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ 
      error: 'Acesso negado. Usuário não autenticado.',
      code: 'UNAUTHORIZED'
    });
  }
  
  const session = sessions.get(sessionId);
  req.user = session.user;
  next();
};

// Middleware para verificar se o usuário é admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Privilégios de administrador necessários.',
      code: 'FORBIDDEN'
    });
  }
  next();
};

// Função para login (retorna sessionId)
export const login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username e password são obrigatórios.',
      code: 'MISSING_CREDENTIALS'
    });
  }
  
  const user = usuarios[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ 
      error: 'Credenciais inválidas.',
      code: 'INVALID_CREDENTIALS'
    });
  }
  
  // Gerar sessionId único
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Armazenar sessão
  sessions.set(sessionId, {
    user: {
      username: username,
      role: user.role,
      nome: user.nome
    },
    createdAt: new Date(),
    lastAccess: new Date()
  });
  
  res.json({
    message: 'Login realizado com sucesso',
    sessionId: sessionId,
    user: {
      username: username,
      role: user.role,
      nome: user.nome
    }
  });
};

// Função para logout
export const logout = (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId);
  }
  
  res.json({ message: 'Logout realizado com sucesso' });
};

// Função para verificar status da sessão
export const checkSession = (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ 
      authenticated: false,
      message: 'Sessão inválida ou expirada'
    });
  }
  
  const session = sessions.get(sessionId);
  // Atualizar último acesso
  session.lastAccess = new Date();
  
  res.json({
    authenticated: true,
    user: session.user,
    lastAccess: session.lastAccess
  });
};

// Limpar sessões expiradas (executar periodicamente)
export const cleanExpiredSessions = () => {
  const now = new Date();
  const expirationTime = 24 * 60 * 60 * 1000; // 24 horas
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastAccess > expirationTime) {
      sessions.delete(sessionId);
    }
  }
};

// Executar limpeza a cada hora
setInterval(cleanExpiredSessions, 60 * 60 * 1000);