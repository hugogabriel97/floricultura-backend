import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  criarProduto,
  listarProdutos,
  atualizarProduto,
  deletarProduto
} from '../controllers/produtoController.js';

const router = express.Router();

// === Configuração do multer ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const tiposPermitidos = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  if (tiposPermitidos.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas.'));
  }
};

const upload = multer({ storage, fileFilter });

// === Rotas ===
router.get('/', listarProdutos);
router.post('/', upload.single('imagem'), criarProduto);
router.put('/:id', upload.single('imagem'), atualizarProduto);
router.delete('/:id', deletarProduto);

export default router;
