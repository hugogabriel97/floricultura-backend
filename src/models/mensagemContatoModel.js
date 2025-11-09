// src/models/mensagemContatoModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const MensagemContato = sequelize.define('MensagemContato', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: true }, // opcional: visitante pode enviar
  nome: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, validate: { isEmail: true } },
  assunto: { type: DataTypes.STRING(160), allowNull: true },
  mensagem: { type: DataTypes.TEXT, allowNull: false },
  dataEnvio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'mensagens_contato',
  timestamps: false
});

export default MensagemContato;
