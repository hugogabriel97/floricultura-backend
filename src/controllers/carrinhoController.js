// src/controllers/carrinhoController.js
import Carrinho from '../models/carrinhoModel.js';
import Produto from '../models/produtoModel.js';

// === Listar itens do carrinho ===
export const listarCarrinho = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!usuarioId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório.' });
    }

    const itens = await Carrinho.findAll({
      where: { usuarioId },
      include: [{
        model: Produto,
        as: 'Produto',
        attributes: ['id', 'nome', 'preco', 'imagemUrl', 'categoria']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ success: true, data: itens });
  } catch (error) {
    console.error('❌ Erro ao listar carrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao listar carrinho.' });
  }
};

// === Adicionar produto ao carrinho ===
export const adicionarAoCarrinho = async (req, res) => {
  try {
    const { usuarioId, produtoId, quantidade } = req.body;

    if (!usuarioId || !produtoId) {
      return res.status(400).json({ success: false, message: 'usuarioId e produtoId são obrigatórios.' });
    }

    const qtd = Math.max(1, parseInt(quantidade) || 1);

    // Verifica se o produto existe
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    // Busca item existente no carrinho
    let item = await Carrinho.findOne({ where: { usuarioId, produtoId } });

    if (item) {
      item.quantidade += qtd;
      await item.save();
    } else {
      item = await Carrinho.create({ usuarioId, produtoId, quantidade: qtd });
    }

    return res.status(201).json({
      success: true,
      message: 'Produto adicionado ao carrinho com sucesso.',
      data: item
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar ao carrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao adicionar ao carrinho.' });
  }
};

// === Atualizar quantidade ===
export const atualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;

    if (!quantidade || parseInt(quantidade) < 1) {
      return res.status(400).json({ success: false, message: 'Quantidade inválida.' });
    }

    const item = await Carrinho.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item não encontrado no carrinho.' });
    }

    item.quantidade = parseInt(quantidade);
    await item.save();

    return res.status(200).json({ success: true, message: 'Quantidade atualizada.', data: item });
  } catch (error) {
    console.error('❌ Erro ao atualizar item do carrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar item do carrinho.' });
  }
};

// === Remover item ===
export const removerItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Carrinho.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item não encontrado no carrinho.' });
    }

    await item.destroy();
    return res.status(200).json({ success: true, message: 'Item removido do carrinho.' });
  } catch (error) {
    console.error('❌ Erro ao remover item do carrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao remover item do carrinho.' });
  }
};

// === Limpar carrinho (após finalizar compra) ===
export const limparCarrinhoUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    if (!usuarioId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório.' });
    }

    const deletados = await Carrinho.destroy({ where: { usuarioId } });

    return res.status(200).json({
      success: true,
      message: `Carrinho do usuário ${usuarioId} limpo com sucesso.`,
      deletedCount: deletados
    });
  } catch (error) {
    console.error('❌ Erro ao limpar carrinho:', error);
    return res.status(500).json({ success: false, message: 'Erro ao limpar carrinho.' });
  }
};
