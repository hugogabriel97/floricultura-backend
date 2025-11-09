const { MensagemContato } = require('../models/indexModel');

exports.send = async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;
    if (!nome || !email || !mensagem) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    const m = await MensagemContato.create({ nome, email, assunto, mensagem });
    // opcional: enviar e-mail via nodemailer aqui
    res.status(201).json({ id: m.id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao enviar mensagem' }); }
};
