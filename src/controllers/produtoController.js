import Produto from '../models/produtoModel.js';
import path from 'path';
import fs from 'fs';

// === Listar todos os produtos ===
export const listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.findAll({ order: [['id', 'DESC']] });
    res.status(200).json(produtos);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ error: 'Erro interno ao listar produtos.' });
  }
};

// === Criar novo produto ===
export const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, quantidadeEstoque } = req.body;

    // Validação básica
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
    }

    let imagemUrl = '';
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Formato de imagem inválido.' });
      }
      imagemUrl = `/uploads/${req.file.filename}`;
    }

    const produto = await Produto.create({
      nome,
      descricao,
      preco: parseFloat(preco),
      categoria,
      quantidadeEstoque: quantidadeEstoque ? parseInt(quantidadeEstoque) : 0,
      imagemUrl
    });

    res.status(201).json(produto); // retorna o produto direto (padrão)
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro interno ao criar produto.' });
  }
};

// === Atualizar produto existente ===
export const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, categoria, quantidadeEstoque } = req.body;

    const produto = await Produto.findByPk(id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Formato de imagem inválido.' });
      }

      // remove imagem anterior se existir
      if (produto.imagemUrl) {
        const antigo = path.join('uploads', path.basename(produto.imagemUrl));
        if (fs.existsSync(antigo)) fs.unlinkSync(antigo);
      }

      produto.imagemUrl = `/uploads/${req.file.filename}`;
    }

    produto.nome = nome || produto.nome;
    produto.descricao = descricao || produto.descricao;
    produto.preco = preco || produto.preco;
    produto.categoria = categoria || produto.categoria;
    produto.quantidadeEstoque = quantidadeEstoque || produto.quantidadeEstoque;

    await produto.save();

    res.status(200).json(produto);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
  }
};

// === Deletar produto ===
export const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    // remove imagem associada se existir
    if (produto.imagemUrl) {
      const filePath = path.join('uploads', path.basename(produto.imagemUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await produto.destroy();
    res.status(200).json({ message: 'Produto deletado com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ error: 'Erro interno ao deletar produto.' });
  }
};
