module.exports = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
  if (req.user.tipoUsuario !== 'admin') return res.status(403).json({ error: 'Acesso negado — admin apenas' });
  next();
};
