import express from 'express';
import {
  registrarUsuario,
  loginUsuario,
  solicitarRecuperacaoSenha,
  redefinirSenha
} from '../controllers/usuarioController.js';

const router = express.Router();

// === Autenticação ===
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// === Recuperação de Senha ===
router.post('/recuperar', solicitarRecuperacaoSenha);
router.post('/redefinir', redefinirSenha);

export default router;