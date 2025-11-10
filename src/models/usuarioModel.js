// src/models/usuarioModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    senhaHash: { type: DataTypes.STRING, allowNull: false },
    tipoUsuario: { type: DataTypes.STRING, allowNull: false, defaultValue: 'cliente' },
  },
  {
    tableName: 'usuarios',
    timestamps: true, // útil para auditoria; se não quiser, pode colocar false
    underscored: false,
  }
);

export default Usuario;
