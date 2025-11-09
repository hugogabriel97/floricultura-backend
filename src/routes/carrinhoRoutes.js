// src/routes/carrinhoRoutes.js
import express from 'express';
import {
  listarCarrinho,
  adicionarAoCarrinho,
  atualizarItem,
  removerItem,
  limparCarrinhoUsuario
} from '../controllers/carrinhoController.js';

const router = express.Router();

// ========================================================
// ✅ Middleware simples para validar ID numérico na rota
// ========================================================
const validarId = (req, res, next) => {
  const { id, usuarioId } = req.params;
  const alvo = id ?? usuarioId;

  if (!alvo || isNaN(alvo)) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido. O ID deve ser numérico.'
    });
  }
  next();
};


// ➤ Listar itens do carrinho de um usuário
router.get('/:usuarioId', validarId, listarCarrinho);

// ➤ Adicionar item ao carrinho
router.post('/', adicionarAoCarrinho);

// ➤ Atualizar quantidade de um item
router.put('/:id', validarId, atualizarItem);

// ➤ Remover item do carrinho
router.delete('/:id', validarId, removerItem);

// ➤ 🆕 Limpar todo o carrinho do usuário (Finalizar compra)
router.delete('/usuario/:usuarioId', validarId, limparCarrinhoUsuario);

export default router;
