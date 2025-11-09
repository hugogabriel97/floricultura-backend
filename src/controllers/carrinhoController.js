// src/controllers/carrinhoController.js
import { Carrinho, Produto } from '../models/index.js';

// GET /api/carrinho/:usuarioId
export const listarCarrinho = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!usuarioId) return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório.' });

    const itens = await Carrinho.findAll({
      where: { usuarioId },
      include: [{ model: Produto, as: 'Produto', attributes: ['id', 'nome', 'preco', 'imagemUrl', 'categoria'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ success: true, data: itens });
  } catch (error) {
    console.error('❌ listarCarrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao listar carrinho.' });
  }
};

// POST /api/carrinho
export const adicionarAoCarrinho = async (req, res) => {
  try {
    const { usuarioId, produtoId } = req.body;
    let { quantidade } = req.body;

    if (!usuarioId || !produtoId) {
      return res.status(400).json({ success: false, message: 'usuarioId e produtoId são obrigatórios.' });
    }

    quantidade = Number.parseInt(quantidade, 10);
    if (!Number.isFinite(quantidade) || quantidade < 1) quantidade = 1;

    const produto = await Produto.findByPk(produtoId);
    if (!produto) return res.status(404).json({ success: false, message: 'Produto não encontrado.' });

    let item = await Carrinho.findOne({ where: { usuarioId, produtoId } });
    if (item) {
      item.quantidade += quantidade;
      await item.save();
    } else {
      item = await Carrinho.create({ usuarioId, produtoId, quantidade });
    }

    return res.status(201).json({
      success: true,
      message: 'Produto adicionado ao carrinho.',
      data: item
    });
  } catch (error) {
    console.error('❌ adicionarAoCarrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao adicionar ao carrinho.' });
  }
};

// PUT /api/carrinho/:id
export const atualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantidade } = req.body;

    quantidade = Number.parseInt(quantidade, 10);
    if (!Number.isFinite(quantidade) || quantidade < 1) {
      return res.status(400).json({ success: false, message: 'Quantidade inválida.' });
    }

    const item = await Carrinho.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item não encontrado.' });

    item.quantidade = quantidade;
    await item.save();

    return res.json({ success: true, message: 'Quantidade atualizada.', data: item });
  } catch (error) {
    console.error('❌ atualizarItem:', error);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar item do carrinho.' });
  }
};

// DELETE /api/carrinho/:id
export const removerItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Carrinho.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item não encontrado.' });

    await item.destroy();
    return res.json({ success: true, message: 'Item removido do carrinho.' });
  } catch (error) {
    console.error('❌ removerItem:', error);
    return res.status(500).json({ success: false, message: 'Erro ao remover item do carrinho.' });
  }
};

// DELETE /api/carrinho/usuario/:usuarioId
export const limparCarrinhoUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!usuarioId) return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório.' });

    const deleted = await Carrinho.destroy({ where: { usuarioId } });
    return res.json({
      success: true,
      message: 'Carrinho limpo com sucesso.',
      data: { deletedCount: deleted }
    });
  } catch (error) {
    console.error('❌ limparCarrinhoUsuario:', error);
    return res.status(500).json({ success: false, message: 'Erro ao limpar carrinho.' });
  }
};
