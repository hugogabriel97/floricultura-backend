const { Usuario, sequelize } = require('./models');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@floricultura.com';
    const adminPass = process.env.ADMIN_PASS || 'admin123';
    const exists = await Usuario.findOne({ where: { email: adminEmail } });
    if (exists) {
      console.log('Admin já existe:', adminEmail);
      process.exit(0);
    }
    const hash = await bcrypt.hash(adminPass, 10);
    await Usuario.create({ nome: 'Admin', email: adminEmail, senhaHash: hash, tipoUsuario: 'admin' });
    console.log('Admin criado:', adminEmail, 'senha:', adminPass);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
