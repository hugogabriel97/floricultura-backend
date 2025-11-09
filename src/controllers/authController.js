// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

const SALT_ROUNDS = 10;

const signToken = (payload, exp = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });

export const register = async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const user = await Usuario.create({
      nome,
      email,
      senhaHash,
      tipoUsuario: tipoUsuario || 'cliente'
    });

    return res.status(201).json({
      success: true,
      data: { id: user.id, nome: user.nome, email: user.email, tipoUsuario: user.tipoUsuario }
    });
  } catch (err) {
    console.error('❌ register:', err);
    return res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });

    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });

    const token = signToken({ id: user.id, tipoUsuario: user.tipoUsuario, nome: user.nome });

    return res.json({
      success: true,
      data: {
        token,
        usuario: { id: user.id, nome: user.nome, email: user.email, tipoUsuario: user.tipoUsuario }
      }
    });
  } catch (err) {
    console.error('❌ login:', err);
    return res.status(500).json({ success: false, message: 'Erro interno.' });
  }
};
