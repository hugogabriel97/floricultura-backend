// src/controllers/usuarioController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuarioModel.js';

const SALT_ROUNDS = 10;

// Helper para assinar o token
const signToken = (payload, exp = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });

// Helper (não mais usado para recuperação, mas pode ser útil em outros lugares)
const getBaseUrl = (req) => {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
};

// ============ REGISTRAR (Sem alterações) ============
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
    return res.status(500).json({ success: false, message: 'Erro interno ao registrar usuário.' });
  }
};

// ============ LOGIN (Sem alterações) ============
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

// ============ SOLICITAR RECUPERAÇÃO (CORRIGIDO E MELHORADO) ============
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });

    const usuario = await Usuario.findOne({ where: { email } });

    // ✅ MELHORIA DE SEGURANÇA:
    // Mesmo se o usuário NÃO for encontrado, retorne uma mensagem de sucesso genérica.
    // Isso impede que atacantes descubram (enumerem) quais e-mails estão cadastrados.
    if (!usuario) {
      console.log(`[INFO] Solicitação de recuperação para e-mail inexistente: ${email}`);
      return res.json({ 
        success: true, 
        message: 'Se este e-mail estiver cadastrado, um link de recuperação será gerado.' 
      });
    }

    // O usuário existe, então geramos o token
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // ✅ CORREÇÃO CRÍTICA: Usar a URL do FRONTEND, não do backend.
    const base = process.env.FRONTEND_URL;

    // Checagem de segurança para garantir que a variável de ambiente existe
    if (!base) {
      console.error("❌ ERRO DE CONFIGURAÇÃO: FRONTEND_URL não está definida nas variáveis de ambiente do backend!");
      return res.status(500).json({ success: false, message: 'Erro interno de configuração do servidor.' });
    }

    // Aponta para a página .html correta no seu frontend
    const resetPath = '/redefinir_senha.html';
    const linkRecuperacao = `${base.replace(/\/+$/, '')}${resetPath}?token=${token}`;

    // Em um app real, você enviaria o 'linkRecuperacao' por e-mail.
    // Para este projeto, o log no console simula o envio.
    console.log(`📧 Link de recuperação (simulado): ${linkRecuperacao}`);

    // Retorna o link na 'data' para que o seu modal (do recuperar_senha.html) possa exibi-lo.
    return res.json({
      success: true,
      data: { link: linkRecuperacao },
      message: 'Link de recuperação gerado com sucesso (simulado).',
    });
  } catch (error) {
    console.error('❌ solicitarRecuperacaoSenha error:', error);
    return res.status(500).json({ success: false, message: 'Erro ao solicitar recuperação de senha.' });
  }
};

// ============ REDEFINIR SENHA (Sem alterações) ============
export const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) {
      return res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios.' });
    }

    let decoded;
    try {
      // Verifica se o token é válido e não expirou
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
    }

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });

    // Atualiza a senha
    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    usuario.senhaHash = senhaHash;
    await usuario.save();

    return res.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('❌ redefinirSenha error:', error);
    return res.status(500).json({ success: false, message: 'Erro ao redefinir senha.' });
  }
};