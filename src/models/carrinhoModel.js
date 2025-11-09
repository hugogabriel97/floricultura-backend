// src/models/carrinhoModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Carrinho = sequelize.define('Carrinho', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  produtoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  }
}, {
  tableName: 'carrinho',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['usuarioId', 'produtoId'] },
    { fields: ['usuarioId'] }
  ]
});

export default Carrinho;
