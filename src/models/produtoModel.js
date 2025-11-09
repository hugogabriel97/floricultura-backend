// src/models/produtoModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(160),
    allowNull: false,
    validate: { len: [2, 160] }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  categoria: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  quantidadeEstoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'quantidade_em_estoque',
    validate: { min: 0 }
  },
  imagemUrl: {
    type: DataTypes.STRING(255),
    field: 'imagem_url',
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'produtos',
  timestamps: true,
  indexes: [
    { fields: ['categoria'] },
    { fields: ['ativo'] }
  ]
});

export default Produto;
