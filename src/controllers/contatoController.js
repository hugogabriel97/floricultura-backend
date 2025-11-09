// src/controllers/contatoController.js
import { MensagemContato } from '../models/index.js';

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const send = async (req, res) => {
  try {
    const { nome, email, assunto, mensagem, usuarioId } = req.body;

    if (!nome || !email || !mensagem) {
      return res.status(400).json({ success: false, message: 'Nome, e-mail e mensagem são obrigatórios.' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: 'E-mail inválido.' });
    }

    const registro = await MensagemContato.create({
      nome: nome.trim(),
      email: email.trim(),
      assunto: (assunto || '').trim() || null,
      mensagem: mensagem.trim(),
      usuarioId: usuarioId || null
    });

    // TODO: opcional -> envio de e-mail via Nodemailer

    return res.status(201).json({ success: true, data: { id: registro.id } });
  } catch (err) {
    console.error('❌ contato.send:', err);
    return res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' });
  }
};
