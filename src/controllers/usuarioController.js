// src/controllers/usuarioController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuarioModel.js';

const SALT_ROUNDS = 10;

const signToken = (payload, exp = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });

const getBaseUrl = (req) => {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
};

// ============ REGISTRAR ============
export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senhaHash,
      tipoUsuario: tipoUsuario || 'cliente',
    });

    const token = signToken({ id: novoUsuario.id, tipoUsuario: novoUsuario.tipoUsuario });

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
      message: 'Conta criada com sucesso.',
    });
  } catch (error) {
    console.error('❌ registrarUsuario error:', error);
    // Erro por violação de unique também pode cair aqui
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar usuário.' });
  }
};

// ============ LOGIN ============
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

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

    const token = signToken({ id: usuario.id, tipoUsuario: usuario.tipoUsuario });

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
      message: 'Login efetuado com sucesso.',
    });
  } catch (error) {
    console.error('❌ loginUsuario error:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao fazer login.' });
  }
};

// ============ SOLICITAR RECUPERAÇÃO ============
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ success: false, message: 'E-mail não encontrado.' });

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

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
    console.error('❌ solicitarRecuperacaoSenha error:', error);
    return res.status(500).json({ success: false, message: 'Erro ao solicitar recuperação de senha.' });
  }
};

// ============ REDEFINIR SENHA ============
export const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
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
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });

    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    usuario.senhaHash = senhaHash;
    await usuario.save();

    return res.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('❌ redefinirSenha error:', error);
    return res.status(500).json({ success: false, message: 'Erro ao redefinir senha.' });
  }
};
