// ======================
// 💾 DB.JS — Conexão MySQL (Railway Ready)
// ======================

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// --- Preferir variáveis do Railway se existirem ---
const DB_NAME = process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DB || '';
const DB_USER = process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || '';
const DB_PASS = process.env.DB_PASS || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306);
const DIALECT  = (process.env.DB_DIALECT || 'mysql').toLowerCase();

// --- SSL somente quando necessário ---
// 1) Forçar com DB_SSL=true
// 2) OU auto-ativar se host do Railway Proxy (termina com .proxy.rlwy.net)
const shouldUseSSL =
  String(process.env.DB_SSL || '').toLowerCase() === 'true' ||
  /\.proxy\.rlwy\.net$/i.test(DB_HOST);

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DIALECT,
  // Em produção, deixe silencioso; em dev, mostre queries
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // Timezone para consistência (escrita/leitura em UTC)
  timezone: '+00:00',

  dialectOptions: {
    // No MySQL, este 'timezone' dentro de dialectOptions é ignorado pelo driver,
    // mas deixamos aqui por compatibilidade futura.
    timezone: 'Z',
    ssl: shouldUseSSL
      ? {
          require: true,
          rejectUnauthorized: false, // proxies do Railway não têm CA pública
        }
      : undefined,
  },

  // Pool recomendado para ambientes serverless/PaaS
  pool: {
    max: 10,
    min: 0,
    acquire: 30_000, // tempo máx esperando conexão
    idle: 10_000,    // fecha conexões ociosas
  },

  // Evita deprecações do mysql2 com big numbers
  define: {
    underscored: false,
    freezeTableName: false,
  },
});

// Log resumido (sem senha) — útil em deploys
if (process.env.NODE_ENV !== 'test') {
  const safeHost = DB_HOST;
  console.log(
    `🔗 Sequelize: ${DIALECT}://${DB_USER || '(no-user)'}@${safeHost}:${DB_PORT}/${DB_NAME || '(no-db)'} ` +
    `(ssl=${shouldUseSSL ? 'on' : 'off'})`
  );
}

export default sequelize;
