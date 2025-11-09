const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expirado ou inválido' });
  }
};
