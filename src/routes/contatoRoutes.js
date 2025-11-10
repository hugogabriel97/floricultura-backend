// src/routes/contatoRoutes.js
import { Router } from 'express';
import { send } from '../controllers/contatoController.js';

const router = Router();

// POST /api/contato/
router.post('/', send);

export default router;