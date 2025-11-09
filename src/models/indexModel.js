// src/models/index.js
import sequelize from '../config/db.js';

import Usuario from './usuarioModel.js';
import Produto from './produtoModel.js';
import Carrinho from './carrinhoModel.js';
import MensagemContato from './mensagemContatoModel.js';

// ===== Associações centralizadas =====
// Usuário ↔ MensagemContato (opcional)
Usuario.hasMany(MensagemContato, { foreignKey: 'usuarioId', as: 'mensagens' });
MensagemContato.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Usuário ↔ Carrinho (1:N)
Usuario.hasMany(Carrinho, { foreignKey: 'usuarioId', as: 'itensCarrinho' });
Carrinho.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });

// Produto ↔ Carrinho (1:N)
Produto.hasMany(Carrinho, { foreignKey: 'produtoId', as: 'emCarrinhos' });
Carrinho.belongsTo(Produto, { foreignKey: 'produtoId', as: 'Produto' });

// Exporte tudo organizado
export {
  sequelize,
  Usuario,
  Produto,
  Carrinho,
  MensagemContato
};
