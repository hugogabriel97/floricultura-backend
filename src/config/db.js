
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './db.js';

// === Rotas da API ===
import produtosRouter from './routes/produtoRoutes.js';
import usuariosRouter from './routes/usuarioRoutes.js';
import carrinhoRouter from './routes/carrinhoRoutes.js';

// === Modelos (registra tabelas no Sequelize) ===
import './models/produtoModel.js';
import './models/usuarioModel.js';
import './models/carrinhoModel.js';

// === Configurações de ambiente ===
dotenv.config();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Corrigir __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// 🚀 Inicialização do Express
// ======================
const app = express();

// ======================
// 🧩 MIDDLEWARES
// ======================
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
      ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// 🗂️ FRONTEND (arquivos estáticos)
// ======================
const FRONTEND_PATH = path.resolve(__dirname, '../../frontend');

// Servir frontend estático
app.use(express.static(FRONTEND_PATH));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ======================
// 🔗 ROTAS DE API
// ======================
app.use('/api/produtos', produtosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/carrinho', carrinhoRouter);

// ======================
// 🧭 ROTAS DO FRONTEND
// ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

const frontendRoutes = [
  'login',
  'registro',
  'recuperar_senha',
  'redefinir_senha',
  'admin_produtos',
  'produtos',
  'produto',
  'carrinho',
  'contato',
  'sobre',
];

frontendRoutes.forEach((route) => {
  app.get(`/${route}`, (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, `${route}.html`));
  });
});

// Fallback para arquivos .html diretos
app.get('/*.html', (req, res) => {
  const filePath = path.join(FRONTEND_PATH, req.path);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send('Página não encontrada.');
  });
});

// ======================
// ⚠️ TRATAMENTO DE ERROS
// ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// ======================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ======================
(async () => {
  try {
    console.log('⏳ Tentando conectar ao banco de dados...');
    await testConnection();

    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🛠️ Banco de dados sincronizado (modo dev).');
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n📴 Recebido ${signal}. Encerrando servidor...`);
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
