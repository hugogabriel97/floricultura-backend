// src/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs'; // ✅ AJUSTE 1: Importar o File System
import sequelize from './config/db.js';

import produtosRouter from './routes/produtoRoutes.js';
import usuariosRouter from './routes/usuarioRoutes.js';
import carrinhoRouter from './routes/carrinhoRoutes.js';

import './models/produtoModel.js';
import './models/usuarioModel.js';
import './models/carrinhoModel.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Configuração de CORS (Está correta)
const FRONTEND_URL = 'https://floricultura-frontend-production.up.railway.app';
app.use(
  cors({
    origin: [
      FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:5500',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// (Opcional) servir frontend estático (Está correto)
const FRONTEND_PATH = path.resolve(__dirname, '../../frontend');
app.use(express.static(FRONTEND_PATH));

// Servir a pasta de uploads (Está correto)
// O path.resolve garante que o caminho /uploads aponte para a pasta 'uploads' na raiz do projeto
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Healthcheck e debug
app.get('/health', (req, res) => res.json({ ok: true, env: NODE_ENV }));
app.get('/api/debug', (req, res) => {
  res.json({
    baseUrlGuess: `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.get('host')}`,
    nodeEnv: NODE_ENV,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
  });
});

// Rotas de API
app.use('/api/produtos', produtosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/carrinho', carrinhoRouter);

// Rotas do frontend (se o front estiver junto)
const frontendRoutes = ['/', 'login', 'registro', 'recuperar_senha', 'redefinir_senha', 'admin_produtos', 'produtos', 'produto', 'carrinho', 'contato', 'sobre'];
frontendRoutes.forEach((route) => {
  const p = route === '/' ? '/' : `/${route}`;
  const f = route === '/' ? 'index.html' : `${route}.html`;
  app.get(p, (req, res) => res.sendFile(path.join(FRONTEND_PATH, f)));
});
app.get('/*.html', (req, res) => {
  const filePath = path.join(FRONTEND_PATH, req.path);
  res.sendFile(filePath, (err) => (err ? res.status(404).send('Página não encontrada.') : null));
});

// 404 / 500
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// Boot
(async () => {
  try {
    // ✅ AJUSTE 2: Garantir que o diretório de uploads existe
    const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log(`📁 Diretório de uploads criado em: ${UPLOADS_DIR}`);
    }

    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida.');

    await sequelize.sync({ alter: true });
    console.log('🛠️ Modelos sincronizados com o banco de dados.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server on http://localhost:${PORT} — env: ${NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar:', err);
    process.exit(1);
  }
})();