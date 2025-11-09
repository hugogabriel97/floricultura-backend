import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // lê as variáveis do .env

// Conexão com o banco MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,      // nome do banco
  process.env.DB_USER,      // usuário
  process.env.DB_PASS,      // senha
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,   // mostra queries no console (pode desativar)
  }
);

export default sequelize;