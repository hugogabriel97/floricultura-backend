// src/controllers/usuarioController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

const SALT_ROUNDS = 10;

const signToken = (payload, exp = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });

/**
 * Retorna a base URL do frontend.
 * - Em produção, use BASE_URL (ex.: https://seu-front.app)
 * - Em dev, tenta montar via proxy/host da requisição
 */
const getBaseUrl = (req) => {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
};

// === Registrar ===
export const registrarUsuario = async (req, res) => {
  try {
    let { nome, email, senha, tipoUsuario } = req.body || {};
    nome = (nome || '').trim();
    email = (email || '').trim().toLowerCase();
    senha = String(senha || '');

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senhaHash,
      tipoUsuario: tipoUsuario || 'cliente',
    });

    const token = signToken({ id: novoUsuario.id, tipoUsuario: novoUsuario.tipoUsuario, nome: novoUsuario.nome });

    return res.status(201).json({
      success: true,
      data: {
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          tipoUsuario: novoUsuario.tipoUsuario,
        },
        token,
      },
      message: 'Usuário registrado com sucesso.',
    });
  } catch (error) {
    console.error('❌ registrarUsuario:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar usuário.' });
  }
};

// === Login ===
export const loginUsuario = async (req, res) => {
  try {
    let { email, senha } = req.body || {};
    email = (email || '').trim().toLowerCase();
    senha = String(senha || '');

    if (!email || !senha) {
      return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    const ok = await bcrypt.compare(senha, usuario.senhaHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    const token = signToken({ id: usuario.id, tipoUsuario: usuario.tipoUsuario, nome: usuario.nome });

    return res.json({
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario,
        },
        token,
      },
      message: 'Login realizado com sucesso.',
    });
  } catch (error) {
    console.error('❌ loginUsuario:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao fazer login.' });
  }
};

// === Solicitar recuperação ===
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    let { email } = req.body || {};
    email = (email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'E-mail não encontrado.' });
    }

    // Token curto para reset
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Link aponta para a página do frontend (sem .html se você usa rotas limpas)
    const base = getBaseUrl(req);
    const resetPath = process.env.RESET_PATH || '/redefinir_senha';
    const linkRecuperacao = `${base}${resetPath}?token=${token}`;

    console.log(`📧 Link de recuperação (simulado): ${linkRecuperacao}`);

    return res.json({
      success: true,
      data: { link: linkRecuperacao },
      message: 'Link de recuperação gerado com sucesso.',
    });
  } catch (error) {
    console.error('❌ solicitarRecuperacaoSenha:', error);
    return res.status(500).json({ success: false, message: 'Erro ao solicitar recuperação de senha.' });
  }
};

// === Redefinir senha ===
export const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body || {};
    if (!token || !novaSenha) {
      return res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const senhaHash = await bcrypt.hash(String(novaSenha), SALT_ROUNDS);
    usuario.senhaHash = senhaHash;
    await usuario.save();

    return res.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('❌ redefinirSenha:', error);
    return res.status(500).json({ success: false, message: 'Erro ao redefinir senha.' });
  }
};
