// src/models/usuarioModel.js
import { DataTypes, Sequelize } from 'sequelize'; // ✅ AJUSTE: Importar 'Sequelize'
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
    tipoUsuario: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cliente',
    },

    // ✅ AJUSTE CRÍTICO:
    // Adicionamos um valor padrão VÁLIDO para o MySQL em modo estrito.
    // Isso corrige o erro 'Incorrect datetime value: 0000-00-00...'
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: 'usuarios',
    // Mantenha 'timestamps: true' para que o Sequelize continue
    // atualizando 'updatedAt' automaticamente em updates futuros.
    timestamps: true,
    underscored: false,
  }
);

export default Usuario;