const sequelize = require('../config/db');
const Usuario = require('./usuario');
const Produto = require('./produto');
const MensagemContato = require('./mensagemContato');

module.exports = { sequelize, Usuario, Produto, MensagemContato };
