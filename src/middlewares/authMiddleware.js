// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

/**
 * Extrai o token do header Authorization: Bearer xxx,
 * ou do cookie "token". (Query string é opcional por segurança.)
 */
function extractToken(req) {
  // 1) Authorization header
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (auth && typeof auth === 'string') {
    const [scheme, token] = auth.split(' ');
    if (/^Bearer$/i.test(scheme) && token) return token.trim();
  }

  // 2) Cookie "token" (se você usa cookie-parser no server)
  if (req.cookies?.token) return String(req.cookies.token).trim();

  // 3) (Opcional) Query token — DESCOMENTE somente se necessário
  // if (req.query?.token) return String(req.query.token).trim();

  return null;
}

/**
 * Verifica se há JWT e o decodifica; em sucesso, popula req.user.
 * Em erro, retorna 401 com mensagem padronizada.
 */
export function requireAuth(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('⚠️ JWT_SECRET não definido no ambiente.');
      return res.status(500).json({ success: false, message: 'Configuração inválida de autenticação.' });
    }

    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token ausente.' });
    }

    // Validações opcionais: issuer/audience/leeway (se você quiser)
    const verifyOpts = {};
    if (process.env.JWT_ISSUER) verifyOpts.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE) verifyOpts.audience = process.env.JWT_AUDIENCE;

    const payload = jwt.verify(token, secret, verifyOpts);
    // Normaliza os campos mais usados
    req.user = {
      id: payload.id ?? payload.sub ?? null,
      nome: payload.nome ?? null,
      tipoUsuario: payload.tipoUsuario ?? payload.role ?? 'cliente',
      ...payload
    };

    return next();
  } catch (err) {
    // Diferencia erros comuns
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado.' });
    }
    if (err?.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
    console.error('❌ requireAuth error:', err);
    return res.status(401).json({ success: false, message: 'Não autorizado.' });
  }
}

/**
 * Igual ao requireAuth, mas não bloqueia a requisição se não houver token:
 * apenas segue sem `req.user`. Útil para rotas públicas que podem ter “estado”.
 */
export function optionalAuth(req, _res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    const token = extractToken(req);

    if (!token || !secret) {
      // sem token: segue sem user
      return next();
    }

    const verifyOpts = {};
    if (process.env.JWT_ISSUER) verifyOpts.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE) verifyOpts.audience = process.env.JWT_AUDIENCE;

    const payload = jwt.verify(token, secret, verifyOpts);
    req.user = {
      id: payload.id ?? payload.sub ?? null,
      nome: payload.nome ?? null,
      tipoUsuario: payload.tipoUsuario ?? payload.role ?? 'cliente',
      ...payload
    };

    return next();
  } catch (_err) {
    // Token inválido/expirado: ignora e segue sem user
    return next();
  }
}

/**
 * Middleware de autorização por papel. Use após requireAuth.
 * Ex: router.post('/admin', requireAuth, requireRoles('admin'), handler)
 */
export function requireRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const role = req.user?.tipoUsuario || req.user?.role;
    if (!role) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    if (!rolesPermitidos.includes(role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }

    return next();
  };
}

/**
 * Atalho específico para admin.
 * Use: router.post('/x', requireAuth, requireAdmin, handler)
 */
export function requireAdmin(req, res, next) {
  const role = req.user?.tipoUsuario || req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, message: 'Não autenticado.' });
  }
  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso negado — apenas administradores.' });
  }
  return next();
}
