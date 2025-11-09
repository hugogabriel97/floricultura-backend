// src/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sequelize from './config/db.js';

// Rotas de API
import produtosRouter from './routes/produtoRoutes.js';
import usuariosRouter from './routes/usuarioRoutes.js';
import carrinhoRouter from './routes/carrinhoRoutes.js';

// Models (registram as tabelas no Sequelize)
import './models/produtoModel.js';
import './models/usuarioModel.js';
import './models/carrinhoModel.js';

// ===== Config =====
dotenv.config();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Corrigir __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do frontend (opcional: só serve se você estiver subindo o front junto)
const FRONTEND_PATH = path.resolve(__dirname, '../../frontend');

// ===== App =====
const app = express();

// Em plataformas como Railway, há proxy: habilite para pegar IP e protocolo corretos.
app.set('trust proxy', 1);

// ===== Middlewares =====
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: em produção, use CORS_ORIGIN com a(s) URL(s) do seu frontend (separadas por vírgula).
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length
      ? allowedOrigins
      : ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
  })
);

// ===== Static (opcional) =====
// Se você está hospedando o frontend separadamente (ex.: em Static do Railway), isso é opcional.
// Mantive pois você já tinha. Se não existir, não quebra nada.
app.use(express.static(FRONTEND_PATH));
// uploads locais (se usar upload no backend)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== Healthchecks (Railway/Load Balancer) =====
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
app.get('/api/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, db: 'connected' });
  } catch (e) {
    return res.status(500).json({ ok: false, db: 'disconnected', error: e?.message });
  }
});

// ===== Rotas de API =====
app.use('/api/produtos', produtosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/carrinho', carrinhoRouter);

// ===== Rotas do Frontend (opcional) =====
const frontendRoutes = [
  '/', 'login', 'registro', 'recuperar_senha', 'redefinir_senha',
  'admin_produtos', 'produtos', 'produto', 'carrinho', 'contato', 'sobre',
];

// Rotas “limpas”: /login, /produtos, etc.
frontendRoutes.forEach(route => {
  app.get(`/${route}`, (req, res) => {
    const file = route === '/' ? 'index' : route;
    res.sendFile(path.join(FRONTEND_PATH, `${file}.html`));
  });
});

// Fallback para acessos diretos com .html
app.get('/*.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, req.path), err => {
    if (err) res.status(404).send('Página não encontrada.');
  });
});

// ===== 404 & Error Handler =====
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, _req, res, _next) => {
  console.error('❌ Erro interno:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// ===== Bootstrap =====
(async () => {
  try {
    console.log('⏳ Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    // Em dev, sincroniza; em prod (Railway), normalmente não sincroniza automaticamente.
    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🛠️ Banco de dados sincronizado (dev).');
    }

    // Railway precisa bind em 0.0.0.0
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`🌐 Ambiente: ${NODE_ENV}`);
    });

    // Encerramento gracioso
    const shutdown = (signal) => {
      console.log(`\n📴 Recebido ${signal}. Encerrando servidor com segurança...`);
      server.close(() => {
        console.log('✅ Servidor finalizado com sucesso.');
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
})();
