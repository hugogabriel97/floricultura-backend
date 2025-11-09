import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  senhaHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoUsuario: {
    type: DataTypes.STRING,
    defaultValue: 'cliente',
  }
}, {
  tableName: 'usuarios',
  timestamps: false,
});

// Sincroniza automaticamente (desativar em produção)
sequelize.sync()
  .then(() => console.log('✅ Tabela Usuario sincronizada'))
  .catch(err => console.error('❌ Erro ao sincronizar Usuario:', err));

export default Usuario;
