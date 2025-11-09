// src/controllers/produtoController.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Produto } from '../models/indexModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const listarProdutos = async (_req, res) => {
  try {
    const produtos = await Produto.findAll({ order: [['id', 'DESC']] });
    return res.json(produtos); // mantive compatibilidade com frontend que espera array
  } catch (err) {
    console.error('❌ listarProdutos:', err);
    return res.status(500).json({ success: false, message: 'Erro ao listar produtos.' });
  }
};

export const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, quantidadeEstoque } = req.body;
    if (!nome || preco == null) {
      return res.status(400).json({ success: false, message: 'Nome e preço são obrigatórios.' });
    }

    let imagemUrl = '';
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowed.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Formato de imagem inválido.' });
      }
      imagemUrl = `/uploads/${req.file.filename}`;
    }

    const produto = await Produto.create({
      nome,
      descricao: descricao || null,
      preco: Number.parseFloat(preco),
      categoria: categoria || null,
      quantidadeEstoque: Number.isFinite(Number(quantidadeEstoque)) ? Number(quantidadeEstoque) : 0,
      imagemUrl
    });

    return res.status(201).json(produto);
  } catch (err) {
    console.error('❌ criarProduto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar produto.' });
  }
};

export const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    const { nome, descricao, preco, categoria, quantidadeEstoque } = req.body;

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowed.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Formato de imagem inválido.' });
      }

      // Remove a anterior se existir
      if (produto.imagemUrl) {
        const antigo = path.join(UPLOADS_DIR, path.basename(produto.imagemUrl));
        if (fs.existsSync(antigo)) fs.unlinkSync(antigo);
      }
      produto.imagemUrl = `/uploads/${req.file.filename}`;
    }

    if (nome) produto.nome = nome;
    if (descricao !== undefined) produto.descricao = descricao;
    if (preco !== undefined) produto.preco = Number.parseFloat(preco);
    if (categoria !== undefined) produto.categoria = categoria;
    if (quantidadeEstoque !== undefined) {
      const q = Number.parseInt(quantidadeEstoque, 10);
      if (Number.isFinite(q) && q >= 0) produto.quantidadeEstoque = q;
    }

    await produto.save();
    return res.json(produto);
  } catch (err) {
    console.error('❌ atualizarProduto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar produto.' });
  }
};

export const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    if (produto.imagemUrl) {
      const filePath = path.join(UPLOADS_DIR, path.basename(produto.imagemUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await produto.destroy();
    return res.json({ success: true, message: 'Produto deletado com sucesso.' });
  } catch (err) {
    console.error('❌ deletarProduto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao deletar produto.' });
  }
};
