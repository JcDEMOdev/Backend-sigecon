// SIGECON Authentication & Authorization Middleware
// Middleware para autenticação e autorização por sessão

import session from 'express-session';
import pool from '../db.js';

// Configuração de sessão
export const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'sigecon-backend-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    httpOnly: true, // previne acesso via JavaScript
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  },
  name: 'sigecon.sid' // nome personalizado do cookie
});

// Middleware de autenticação - verifica se usuário está logado
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ 
      error: 'Acesso negado. Autenticação necessária.',
      code: 'UNAUTHORIZED'
    });
  }
};

// Middleware de autorização - verifica permissões específicas
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        error: 'Acesso negado. Autenticação necessária.',
        code: 'UNAUTHORIZED'
      });
    }

    try {
      // Verifica permissões do usuário na base de dados
      const { rows } = await pool.query(
        'SELECT permissions FROM users WHERE id = $1',
        [req.session.userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado.',
          code: 'USER_NOT_FOUND'
        });
      }

      const userPermissions = rows[0].permissions || [];
      
      if (userPermissions.includes('admin') || userPermissions.includes(permission)) {
        return next();
      } else {
        return res.status(403).json({ 
          error: `Acesso negado. Permissão '${permission}' necessária.`,
          code: 'FORBIDDEN'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware para capturar informações do usuário autenticado
export const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const { rows } = await pool.query(
        'SELECT id, username, email, permissions FROM users WHERE id = $1',
        [req.session.userId]
      );

      if (rows.length > 0) {
        req.user = rows[0];
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }
  next();
};

// Middleware para logs de auditoria
export const auditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log da ação realizada
      const logData = {
        userId: req.session?.userId || null,
        action: action,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        method: req.method,
        url: req.originalUrl,
        body: req.method !== 'GET' ? req.body : null,
        statusCode: res.statusCode
      };

      // Async log - não bloqueia resposta
      pool.query(
        `INSERT INTO audit_logs (user_id, action, ip, user_agent, method, url, body, status_code, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [logData.userId, logData.action, logData.ip, logData.userAgent, 
         logData.method, logData.url, JSON.stringify(logData.body), 
         logData.statusCode, logData.timestamp]
      ).catch(err => console.error('Erro ao salvar log de auditoria:', err));

      originalSend.call(this, data);
    };

    next();
  };
};

// Rota de login (exemplo de implementação)
export const loginRoute = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username e password são obrigatórios.',
      code: 'MISSING_CREDENTIALS'
    });
  }

  try {
    // Aqui você implementaria a verificação de senha (hash)
    // Por simplicidade, assumindo que existe uma tabela users
    const { rows } = await pool.query(
      'SELECT id, username, email, permissions FROM users WHERE username = $1 AND password = crypt($2, password)',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Estabelece sessão
    req.session.userId = rows[0].id;
    req.session.username = rows[0].username;

    res.json({ 
      message: 'Login realizado com sucesso.',
      user: {
        id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email,
        permissions: rows[0].permissions
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor.',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Rota de logout
export const logoutRoute = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ 
        error: 'Erro ao fazer logout.',
        code: 'LOGOUT_ERROR'
      });
    }
    
    res.clearCookie('sigecon.sid');
    res.json({ message: 'Logout realizado com sucesso.' });
  });
};

// Middleware para desenvolvimento - bypass auth se em modo dev
export const devBypass = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    req.session = req.session || {};
    req.session.userId = 1; // usuário admin padrão para dev
    req.session.username = 'dev-admin';
  }
  next();
};