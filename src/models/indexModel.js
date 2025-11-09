// src/models/indexModel.js
import sequelize from '../config/db.js';
import Usuario from './usuarioModel.js';
import Produto from './produtoModel.js';
import Carrinho from './carrinhoModel.js';
import MensagemContato from './mensagemContatoModel.js';

/**
 * Centralize todas as associações aqui para evitar conflitos de alias.
 * Mantemos aliases esperados pelos controllers:
 *  - Carrinho -> belongsTo Usuario as 'Usuario'
 *  - Carrinho -> belongsTo Produto as 'Produto'
 */

// Usuario x Carrinho
Usuario.hasMany(Carrinho, {
  foreignKey: 'usuarioId',
  as: 'Carrinhos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Carrinho.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'Usuario'
});

// Produto x Carrinho
Produto.hasMany(Carrinho, {
  foreignKey: 'produtoId',
  as: 'ItensCarrinho',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Carrinho.belongsTo(Produto, {
  foreignKey: 'produtoId',
  as: 'Produto'
});

// Usuario x MensagemContato (opcional)
Usuario.hasMany(MensagemContato, {
  foreignKey: 'usuarioId',
  as: 'Mensagens'
});
MensagemContato.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'Usuario'
});

export {
  sequelize,
  Usuario,
  Produto,
  Carrinho,
  MensagemContato
};
