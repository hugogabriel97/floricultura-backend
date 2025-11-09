const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const saltRounds = 10;

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Dados incompletos' });

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(senha, saltRounds);
    const user = await Usuario.create({ nome, email, senhaHash: hash, tipoUsuario: tipoUsuario || 'cliente' });
    return res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'Credenciais incompletas' });

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(senha, user.senhaHash);
    if (!match) return res.status(401).json({ error: 'Senha inválida' });

    const token = jwt.sign({ id: user.id, tipoUsuario: user.tipoUsuario, nome: user.nome }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, tipoUsuario: user.tipoUsuario } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Erro no servidor' });
  }
};
