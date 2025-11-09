// src/models/usuarioModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { len: [2, 120] }
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  senhaHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipoUsuario: {
    type: DataTypes.ENUM('cliente', 'admin'),
    defaultValue: 'cliente'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  indexes: [{ unique: true, fields: ['email'] }]
});

export default Usuario;
