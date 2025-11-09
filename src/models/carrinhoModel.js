// src/models/carrinhoModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Usuario from './usuarioModel.js';
import Produto from './produtoModel.js';

const Carrinho = sequelize.define('Carrinho', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' },
    onDelete: 'CASCADE'
  },
  produtoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'produtos', key: 'id' },
    onDelete: 'CASCADE'
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  }
}, {
  tableName: 'carrinho',
  timestamps: true
});

// 🔗 Associações
Carrinho.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });
Carrinho.belongsTo(Produto, { foreignKey: 'produtoId', as: 'Produto' });

export default Carrinho;
