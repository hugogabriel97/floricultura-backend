import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING
  },
  quantidadeEstoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'quantidade_em_estoque'
  },
  imagemUrl: {
    type: DataTypes.STRING,
    field: 'imagem_url'
  }
}, {
  tableName: 'produtos',
  timestamps: true
});

export default Produto;
