import Usuario from '../models/usuarioModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * ===================================
 * AUTENTICAÇÃO DE USUÁRIO
 * ===================================
 */

// Registrar novo usuário
export const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senhaHash,
      tipoUsuario: tipoUsuario || 'cliente'
    });

    const token = jwt.sign(
      { id: novoUsuario.id, tipoUsuario: novoUsuario.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipoUsuario: novoUsuario.tipoUsuario
      },
      token
    });
  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
};

// Login de usuário
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, tipoUsuario: usuario.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario
      },
      token
    });
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
};

/**
 * ===================================
 * RECUPERAÇÃO DE SENHA
 * ===================================
 */

// (1) Solicitar recuperação de senha
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'E-mail não encontrado.' });
    }

    // Gera token JWT (expira em 15 min)
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const linkRecuperacao = `http://localhost:3000/redefinir_senha.html?token=${token}`;

    console.log(`📧 Link de recuperação simulado: ${linkRecuperacao}`);

    res.json({
      message: 'Link de recuperação gerado com sucesso (simulação de envio de e-mail).',
      link: linkRecuperacao
    });
  } catch (error) {
    console.error('❌ Erro ao solicitar recuperação:', error);
    res.status(500).json({ error: 'Erro ao solicitar recuperação de senha.' });
  }
};

// (2) Redefinir senha
export const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    usuario.senhaHash = senhaHash;
    await usuario.save();

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Token inválido ou expirado.' });
  }
};
