// ======================
// 🌐 SERVER.JS - versão otimizada e corrigida
// ======================
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sequelize from './config/db.js';

// === Rotas de API ===
import produtosRouter from './routes/produtoRoutes.js';
import usuariosRouter from './routes/usuarioRoutes.js';
import carrinhoRouter from './routes/carrinhoRoutes.js';

// === Modelos (registram tabelas no Sequelize) ===
import './models/produtoModel.js';
import './models/usuarioModel.js';
import './models/carrinhoModel.js';

// === Configuração de ambiente ===
dotenv.config();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Corrigir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// 🚀 Inicialização do Express
// ======================
const app = express();

// ======================
// 🧩 MIDDLEWARES GERAIS
// ======================
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://127.0.0.1:5500',
    'http://localhost:5500'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// 🗂️ FRONTEND E UPLOADS
// ======================
const FRONTEND_PATH = path.resolve(__dirname, '../../frontend');

// Servir arquivos estáticos (HTML, CSS, JS, imagens, etc.)
app.use(express.static(FRONTEND_PATH));

// Servir imagens enviadas (uploads)
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

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// Rotas “limpas” sem .html (melhor UX e compatível com ?token=XYZ)
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
  'sobre'
];

frontendRoutes.forEach(route => {
  app.get(`/${route}`, (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, `${route}.html`));
  });
});

// Caso alguém acesse manualmente com o .html (fallback)
app.get('/*.html', (req, res) => {
  const filePath = path.join(FRONTEND_PATH, req.path);
  res.sendFile(filePath, err => {
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
// 🚀 INICIALIZAÇÃO
// ======================
(async () => {
  try {
    console.log('⏳ Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🛠️ Banco de dados sincronizado (modo desenvolvimento).');
    }

    const server = app.listen(PORT, () => {
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

  } catch (err) {
    console.error('❌ Falha ao conectar ou sincronizar banco de dados:', err);
    process.exit(1);
  }
})();
