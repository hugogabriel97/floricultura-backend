const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const contatoRoutes = require('./routes/contatoRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/contato', contatoRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function init() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync({ alter: true });
    console.log('Models synced');
  } catch (err) {
    console.error('DB error', err);
    process.exit(1);
  }
}
init();

module.exports = app;
