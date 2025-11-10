// src/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
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

// ✅ AJUSTE FEITO: Configuração de CORS explícita
// Isso garante que seu backend aceite requisições do seu frontend
const FRONTEND_URL = 'https://floricultura-frontend-production.up.railway.app';

app.use(
  cors({
    origin: [
      FRONTEND_URL,
      'http://localhost:3000', // Para seu dev local do backend
      'http://127.0.0.1:5500', // Para seu dev local do frontend (Live Server)
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// (Opcional) servir frontend estático se estiver no mesmo serviço
const FRONTEND_PATH = path.resolve(__dirname, '../../frontend');
app.use(express.static(FRONTEND_PATH));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
    // ✅ AJUSTE: Log de conexão removido daqui. O 'db.js' já faz um log melhor.
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida.');

    // ✅ AJUSTE CRÍTICO:
    // Isso garante que suas tabelas sejam criadas/atualizadas no Railway (produção)
    // A lógica antiga `if (NODE_ENV === 'development')` impedia isso.
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