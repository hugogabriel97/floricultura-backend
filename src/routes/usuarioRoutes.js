// src/routes/usuarioRoutes.js
import { Router } from 'express';
import {
  registrarUsuario,
  loginUsuario,
  solicitarRecuperacaoSenha,
  redefinirSenha,
} from '../controllers/usuarioController.js';

const router = Router();

// Autenticação
router.post('/registro', registrarUsuario);       // POST /api/usuarios/registro
router.post('/login', loginUsuario);              // POST /api/usuarios/login

// Recuperação de senha
router.post('/recuperar', solicitarRecuperacaoSenha); // POST /api/usuarios/recuperar
router.post('/redefinir', redefinirSenha);            // POST /api/usuarios/redefinir

export default router;
