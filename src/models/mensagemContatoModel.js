const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./usuario');

const MensagemContato = sequelize.define('MensagemContato', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  assunto: { type: DataTypes.STRING },
  mensagem: { type: DataTypes.TEXT, allowNull: false },
  dataEnvio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'mensagens_contato',
  timestamps: false
});

MensagemContato.belongsTo(Usuario, { as: 'usuario', foreignKey: 'usuarioId' });
Usuario.hasMany(MensagemContato, { foreignKey: 'usuarioId' });

module.exports = MensagemContato;
