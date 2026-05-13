const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAuthMiddleware');

const produtoController = require('../controllers/productControllers');
const upload = require('../middlewares/uploadIMG');

// GET /produtos - listar todos (JSON)
router.get('/', produtoController.listarProdutos);

// POST /produtos - criar produto (até 5 imagens)
router.post('/', authMiddleware, upload.array('imagens', 5), produtoController.criarProduto);

// POST /produtos/:id/editar - editar produto via formulário (até 5 imagens)
router.post('/:id/editar', authMiddleware, upload.array('imagens', 5), produtoController.editarProdutoForm);

router.put('/:id', authMiddleware, produtoController.atualizarProduto);

router.delete('/:id', authMiddleware, produtoController.deletarProduto);

module.exports = router;